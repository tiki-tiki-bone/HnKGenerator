const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");
if (menuToggle && navMenu) {
    function toggleMenu() {
        navMenu.classList.toggle("show");
    }
    menuToggle.addEventListener("click", toggleMenu);
    menuToggle.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleMenu();
        }
    });
}

const API_BASE = window.API_BASE || "https://hnk-match-db-api.tikibone.workers.dev";
const IMAGE_BASE = "/images/";
const IS_MOBILE = window.matchMedia("(max-width: 600px)").matches;
const DATE_PREFIX = "\u6295\u7a3f\u65e5\uff1a";
const DB_ERROR_MSG = "DB\u3078\u306e\u554f\u3044\u5408\u308f\u305b\u306b\u5931\u6557\u3057\u307e\u3057\u305f\u3002\u7ba1\u7406\u8005\u306b\u304a\u554f\u3044\u5408\u308f\u305b\u304f\u3060\u3055\u3044\u3002";
const NOT_FOUND_MSG = "\u8a02\u6b63\u60c5\u5831\u304c\u898b\u3064\u304b\u308a\u307e\u305b\u3093\u3067\u3057\u305f\u3002";
const MATCH_NOT_FOUND_MSG = "\u8a66\u5408\u60c5\u5831\u304c\u898b\u3064\u304b\u308a\u307e\u305b\u3093\u3067\u3057\u305f\u3002";
const UNKNOWN_KEYS = new Set([
    "\u4e0d\u660e",
    "unknown",
    "?",
    "??",
    "\uff1f\uff1f",
    "???",
    "\u672a\u8a2d\u5b9a",
    "\u672a\u6307\u5b9a",
    "none",
    "n/a",
    "na",
]);

const matchStatusEl = document.getElementById("matchStatus");
const matchErrorEl = document.getElementById("matchError");
const matchSummaryEl = document.getElementById("matchSummary");

const correctionForm = document.getElementById("correctionForm");
const correctionStatusEl = document.getElementById("correctionStatus");
const correctionErrorEl = document.getElementById("correctionError");
const submitBtn = document.getElementById("submitBtn");

const p1IdEl = document.getElementById("p1Id");
const p2IdEl = document.getElementById("p2Id");
const p1CharIdEl = document.getElementById("p1CharId");
const p2CharIdEl = document.getElementById("p2CharId");
const winnerEl = document.getElementById("winner");
const tStartEl = document.getElementById("tStart");
const tEndEl = document.getElementById("tEnd");
const reasonEl = document.getElementById("reason");

let currentMatchId = "";
let currentCorrectionId = "";

const charNameToId = new Map();
const charIdToName = new Map();
const videoInfoCache = new Map();
const videoInfoPending = new Set();

function setMatchError(msg) {
    if (!msg) {
        matchErrorEl.style.display = "none";
        matchErrorEl.textContent = "";
        return;
    }
    matchErrorEl.style.display = "block";
    matchErrorEl.textContent = msg;
}

function setMatchStatus(msg) {
    if (!matchStatusEl) return;
    matchStatusEl.textContent = msg || "";
}


function setCorrectionError(msg) {
    if (!msg) {
        correctionErrorEl.style.display = "none";
        correctionErrorEl.textContent = "";
        return;
    }
    correctionErrorEl.style.display = "block";
    correctionErrorEl.textContent = msg;
}

function setCorrectionStatus(msg) {
    correctionStatusEl.textContent = msg || "";
}

function renderCorrectionLoading() {
    if (!correctionForm) return;
    const overlay = document.createElement("div");
    overlay.className = "correction-loading";
    overlay.setAttribute("role", "status");
    overlay.setAttribute("aria-live", "polite");
    overlay.innerHTML =
        '<span class="loading-spinner" aria-hidden="true"></span>' +
        '<span class="loading-text">\u8aad\u8fbc\u4e2d...</span>';
    correctionForm.appendChild(overlay);
}

function clearCorrectionLoading() {
    if (!correctionForm) return;
    const overlay = correctionForm.querySelector(".correction-loading");
    if (overlay) overlay.remove();
}

function normalizeKey(value) {
    return String(value || "")
        .trim()
        .toLowerCase();
}

function disableForm() {
    [p1IdEl, p2IdEl, p1CharIdEl, p2CharIdEl, winnerEl, tStartEl, tEndEl, reasonEl].forEach(
        (el) => {
            if (el) el.disabled = true;
        },
    );
    if (submitBtn) submitBtn.disabled = true;
}

function isUnknownCharacter(name, id) {
    const n = normalizeKey(name);
    const i = normalizeKey(id);
    return UNKNOWN_KEYS.has(n) || UNKNOWN_KEYS.has(i);
}

function resolveCharacterInput(raw) {
    const key = normalizeKey(raw);
    if (!key) return "";
    return charNameToId.get(key) || String(raw || "").trim();
}

function resolveCharacterName(charId, charName) {
    const id = String(charId || "").trim();
    const name = String(charName || "").trim();
    if (id && charIdToName.has(id)) return charIdToName.get(id);
    return name || id || "";
}

function resolvePlayerName(name, id) {
    const raw = String(name || "").trim();
    if (raw && raw !== "-") return raw;
    const fallback = String(id || "").trim();
    return fallback || "-";
}

function createTextLink(text, href, className) {
    const hasLink = Boolean(href);
    const el = document.createElement(hasLink ? "a" : "div");
    if (className) el.className = className;
    if (hasLink) {
        el.href = href;
        el.classList.add("match-link");
    }
    if (text) {
        el.textContent = text;
        el.title = text;
    }
    return el;
}

function isInteractiveTarget(target) {
    return Boolean(target && target.closest("a, button, input, select, textarea, label"));
}

function normalizeWinnerSide(raw) {
    const v = String(raw ?? "")
        .trim()
        .toLowerCase();
    if (v === "p1" || v === "player1" || v === "1" || v === "left") return "p1";
    if (v === "p2" || v === "player2" || v === "2" || v === "right") return "p2";
    return "";
}

function setSelectValue(select, value) {
    if (!select) return;
    const next = String(value || "");
    if (next) {
        select.value = next;
        if (select.value !== next && select.options.length) {
            select.selectedIndex = 0;
        }
        return;
    }
    if (select.options.length) {
        select.selectedIndex = 0;
    }
}

function normalizeWinnerValue(raw) {
    const v = String(raw ?? "")
        .trim()
        .toLowerCase();
    if (!v) return "";
    if (v === "unknown") return "UNKNOWN";
    if (v === "p1" || v === "player1" || v === "1" || v === "left") return "P1";
    if (v === "p2" || v === "player2" || v === "2" || v === "right") return "P2";
    return "";
}

function parseTimeInput(raw) {
    const text = String(raw || "").trim();
    if (!text) return null;
    if (!/^\d{2}:\d{2}(:\d{2})?$/.test(text)) return NaN;
    const parts = text.split(":").map((p) => Number(p));
    if (parts.some((n) => !Number.isFinite(n) || n < 0)) return NaN;
    if (parts.length === 2) {
        const [m, s] = parts;
        if (m >= 60 || s >= 60) return NaN;
        return m * 60 + s;
    }
    const [h, m, s] = parts;
    if (m >= 60 || s >= 60) return NaN;
    return h * 3600 + m * 60 + s;
}

function fmtSec(sec) {
    const n = Number(sec);
    if (!Number.isFinite(n)) return "";
    const s = Math.max(0, Math.trunc(n));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const ss = s % 60;
    const pad2 = (x) => String(x).padStart(2, "0");
    if (h > 0) return `${h}:${pad2(m)}:${pad2(ss)}`;
    return `${m}:${pad2(ss)}`;
}

function fmtInputTime(sec) {
    const n = Number(sec);
    if (!Number.isFinite(n)) return "";
    const s = Math.max(0, Math.trunc(n));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const ss = s % 60;
    const pad2 = (x) => String(x).padStart(2, "0");
    if (h > 0) return `${pad2(h)}:${pad2(m)}:${pad2(ss)}`;
    return `${pad2(m)}:${pad2(ss)}`;
}

function fmtRange(startSec, endSec) {
    const start = fmtSec(startSec);
    const end = fmtSec(endSec);
    if (start && end) return `${start} - ${end}`;
    return start || end || "";
}

function fmtDuration(startSec, endSec) {
    const start = Number(startSec);
    const end = Number(endSec);
    if (!Number.isFinite(start) || !Number.isFinite(end)) return "";
    const diff = Math.max(0, Math.trunc(end - start));
    if (!diff) return "";
    return fmtSec(diff);
}

function ytUrl(videoId, startSec) {
    const t = Math.max(0, Math.trunc(Number(startSec) || 0));
    return `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}&t=${t}s`;
}

function buildCharImage(charId, charName) {
    const cleanId = String(charId || "").trim();
    const img = document.createElement("img");
    img.className = "match-char-img";
    img.decoding = "async";
    img.loading = "lazy";
    if (!cleanId) {
        img.classList.add("empty");
        img.alt = "";
        return img;
    }
    const portraitPrefix = "match_card";
    img.src = `${IMAGE_BASE}${portraitPrefix}_${encodeURIComponent(cleanId)}.png`;
    img.alt = charName ? String(charName) : cleanId;
    img.addEventListener("error", () => {
        img.classList.add("empty");
        img.removeAttribute("src");
    });
    return img;
}

function normalizeMatch(it) {
    const p1 = it.p1 || {};
    const p2 = it.p2 || {};
    return {
        id: it.match_id ?? it.id,
        videoId: it.video_id || it.videoId || it.video || "",
        videoTitle: it.video_title || it.videoTitle || it.video_name || it.videoName || "",
        videoUploadedAt: it.video_uploaded_at || it.display_uploaded_at || it.displayUploadedAt || "",
        tStart: it.t_start ?? it.start_sec ?? it.start ?? "",
        tEnd: it.t_end ?? it.end_sec ?? it.end ?? "",
        p1Id: it.p1_player_id || it.p1_id || p1.player_id || p1.id || "",
        p1Name:
            it.p1_player ||
            p1.player_name ||
            p1.name ||
            p1.display_name ||
            it.p1_name ||
            p1.player_raw ||
            "",
        p1CharId: it.p1_char_id || p1.char_id || "",
        p1Char: it.p1_char || p1.char_name || p1.char || p1.char_raw || "",
        p2Id: it.p2_player_id || it.p2_id || p2.player_id || p2.id || "",
        p2Name:
            it.p2_player ||
            p2.player_name ||
            p2.name ||
            p2.display_name ||
            it.p2_name ||
            p2.player_raw ||
            "",
        p2CharId: it.p2_char_id || p2.char_id || "",
        p2Char: it.p2_char || p2.char_name || p2.char || p2.char_raw || "",
        winner: it.winner || it.result || it.win || "",
    };
}

async function fetchVideoInfo(videoId) {
    const cleanId = String(videoId || "").trim();
    if (!cleanId) return;
    if (videoInfoCache.has(cleanId) || videoInfoPending.has(cleanId)) return;
    videoInfoPending.add(cleanId);
    try {
        const url = `${API_BASE}/api/videos?vid=${encodeURIComponent(cleanId)}&limit=5`;
        const res = await fetch(url);
        if (!res.ok) return;
        const data = await res.json();
        const items = Array.isArray(data.items) ? data.items : Array.isArray(data) ? data : [];
        const exact = items.find((it) => String(it.video_id) === cleanId);
        const picked = exact || items[0];
        if (!picked) return;
        const title = picked.title ? String(picked.title) : "";
        let dateText = "";
        const displayDate =
            picked.display_uploaded_at || picked.displayUploadedAt || "";
        if (displayDate) {
            dateText = String(displayDate);
        } else {
            const epoch = Number(picked.uploaded_at ?? picked.uploadedAt);
            if (Number.isFinite(epoch) && epoch > 0) {
                const d = new Date(epoch * 1000);
                const y = d.getFullYear();
                const m = String(d.getMonth() + 1).padStart(2, "0");
                const day = String(d.getDate()).padStart(2, "0");
                dateText = `${y}-${m}-${day}`;
            }
        }
        videoInfoCache.set(cleanId, { title, date: dateText });
    } catch {
        // ignore
    } finally {
        videoInfoPending.delete(cleanId);
    }
}

function updateVideoInfoElements() {
    document.querySelectorAll("[data-video-id]").forEach((el) => {
        const id = el.getAttribute("data-video-id") || "";
        if (!id) return;
        const info = videoInfoCache.get(id);
        if (info && info.title) {
            el.textContent = info.title;
            el.title = info.title;
        }
    });
    document.querySelectorAll("[data-video-date-id]").forEach((el) => {
        const id = el.getAttribute("data-video-date-id") || "";
        if (!id) return;
        const info = videoInfoCache.get(id);
        if (info && info.date) {
            el.textContent = `${DATE_PREFIX}${info.date}`;
            el.title = `${DATE_PREFIX}${info.date}`;
        }
    });
}

async function hydrateVideoInfo(videoIds) {
    const unique = Array.from(new Set(videoIds.filter(Boolean)));
    if (!unique.length) return;
    await Promise.all(unique.map((id) => fetchVideoInfo(id)));
    updateVideoInfoElements();
}

async function loadCharacters() {
    const url = `${API_BASE}/api/characters?limit=200`;
    const res = await fetch(url);
    if (!res.ok) return;
    const data = await res.json();
    const items = Array.isArray(data.items) ? data.items : Array.isArray(data) ? data : [];
    const normalized = [];
    charNameToId.clear();
    charIdToName.clear();
    for (const it of items) {
        const id = String(it.char_id || it.id || it.canonical_id || it.canonical_name || "").trim();
        const name = String(it.display_name || it.char_disp_name || it.canonical_name || it.name || "").trim();
        const sortIndexRaw = Number(it.sort_index ?? it.sortIndex);
        const sortIndex = Number.isFinite(sortIndexRaw) ? sortIndexRaw : Number.POSITIVE_INFINITY;
        if (isUnknownCharacter(name, id)) continue;
        if (id) {
            charNameToId.set(normalizeKey(id), id);
            charIdToName.set(id, name || id);
        }
        if (name) {
            charNameToId.set(normalizeKey(name), id || name);
        }
        if (id || name) {
            normalized.push({ id: id || name, name: name || id || name, sortIndex });
        }
    }
    normalized.sort((a, b) => {
        if (a.sortIndex !== b.sortIndex) return a.sortIndex - b.sortIndex;
        return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" });
    });
    const selects = [p1CharIdEl, p2CharIdEl].filter(Boolean);
    for (const select of selects) {
        select.innerHTML = "";
        for (const item of normalized) {
            const opt = document.createElement("option");
            opt.value = item.id;
            opt.textContent = item.name;
            select.appendChild(opt);
        }
    }
}

function fillDefaults(match) {
    const p1Display = resolvePlayerName(match.p1Name, match.p1Id);
    const p2Display = resolvePlayerName(match.p2Name, match.p2Id);
    if (p1IdEl) p1IdEl.value = p1Display && p1Display !== "-" ? p1Display : "";
    if (p2IdEl) p2IdEl.value = p2Display && p2Display !== "-" ? p2Display : "";
    if (tStartEl && match.tStart !== "" && match.tStart !== null) {
        tStartEl.value = fmtInputTime(match.tStart);
    }
    if (tEndEl && match.tEnd !== "" && match.tEnd !== null) {
        tEndEl.value = fmtInputTime(match.tEnd);
    }
    const p1Char = resolveCharacterInput(match.p1CharId || match.p1Char);
    const p2Char = resolveCharacterInput(match.p2CharId || match.p2Char);
    setSelectValue(p1CharIdEl, p1Char);
    setSelectValue(p2CharIdEl, p2Char);
    if (winnerEl) {
        const winnerVal = normalizeWinnerValue(match.winner);
        if (winnerVal) winnerEl.value = winnerVal;
    }
}

function renderMatchCard(match) {
    if (!matchSummaryEl) return;
    renderMatchCards({
        items: [match],
        container: matchSummaryEl,
        emptyText: NOT_FOUND_MSG,
        normalizeMatch: (row) => row,
        normalizeWinnerSide,
        ytUrl,
        fmtRange,
        fmtSec,
        fmtDuration,
        datePrefix: DATE_PREFIX,
        videoLabel: "\u52d5\u753b",
        enableCardLink: false,
        hydrateVideoInfo,
        isInteractiveTarget,
        createTextLink,
        buildCharImage,
        resolvePlayerName,
        resolvePlayerLinkId: () => "",
        resolveCharacterId: (charId, charName) => charId || resolveCharacterInput(charName),
        resolveCharacterName: (charId, charName) => resolveCharacterName(charId, charName),
        getVideoLinkHref: () => "",
        getCharacterLinkHref: () => "",
        getPlayerLinkHref: () => "",
    });
}

async function fetchMatch(matchId) {
    const url = `${API_BASE}/api/matches?match_id=${encodeURIComponent(matchId)}&limit=1&expand=names`;
    try {
        const res = await fetch(url);
        const isJson = (res.headers.get("content-type") || "").includes("application/json");
        const payload = isJson ? await res.json() : { error: await res.text() };
        if (!res.ok) throw new Error(DB_ERROR_MSG);
        const item =
            payload.item ||
            payload.match ||
            (Array.isArray(payload.items) ? payload.items[0] : null) ||
            (Array.isArray(payload) ? payload[0] : null);
        if (item) return item;
        throw new Error(NOT_FOUND_MSG);
    } catch (e) {
        const msg = e instanceof Error && e.message ? e.message : DB_ERROR_MSG;
        throw new Error(msg);
    }
}

async function fetchCorrection(correctionId) {
    const url = `${API_BASE}/api/correction?correction_id=${encodeURIComponent(correctionId)}`;
    try {
        const res = await fetch(url);
        const isJson = (res.headers.get("content-type") || "").includes("application/json");
        const payload = isJson ? await res.json() : { error: await res.text() };
        if (!res.ok) throw new Error(DB_ERROR_MSG);
        const items =
            (payload && Array.isArray(payload.items) ? payload.items : null) ||
            (Array.isArray(payload) ? payload : null) ||
            (payload && payload.item ? [payload.item] : []);
        const item = items[0];
        if (item) return item;
        throw new Error(NOT_FOUND_MSG);
    } catch (e) {
        const msg = e instanceof Error && e.message ? e.message : DB_ERROR_MSG;
        throw new Error(msg);
    }
}

function applyCorrection(correction) {
    const p1Player = String(correction.p1_player || correction.p1Player || "").trim();
    const p2Player = String(correction.p2_player || correction.p2Player || "").trim();
    const p1Char = String(correction.p1_char || correction.p1Char || "").trim();
    const p2Char = String(correction.p2_char || correction.p2Char || "").trim();
    const startSec = correction.start_sec ?? correction.startSec ?? correction.start ?? "";
    const endSec = correction.end_sec ?? correction.endSec ?? correction.end ?? "";
    const reasonText = String(correction.reason || "").trim();
    const winnerVal = normalizeWinnerValue(correction.winner);

    if (p1IdEl) p1IdEl.value = p1Player;
    if (p2IdEl) p2IdEl.value = p2Player;
    setSelectValue(p1CharIdEl, p1Char || resolveCharacterInput(p1Char));
    setSelectValue(p2CharIdEl, p2Char || resolveCharacterInput(p2Char));
    if (winnerEl) {
        if (winnerVal) {
            winnerEl.value = winnerVal;
        } else {
            winnerEl.selectedIndex = -1;
        }
    }
    if (tStartEl) tStartEl.value = fmtInputTime(startSec);
    if (tEndEl) tEndEl.value = fmtInputTime(endSec);
    if (reasonEl) reasonEl.value = reasonText;
}

async function init() {
    const params = new URLSearchParams(window.location.search);
    const correctionId = (params.get("correction_id") || "").trim();
    if (!correctionId) {
        setCorrectionError("correction_result/?correction_id=<correction_id> \u3092\u6307\u5b9a\u3057\u3066\u304f\u3060\u3055\u3044\u3002");
        disableForm();
        return;
    }

    currentCorrectionId = correctionId;
    setMatchStatus("\u8aad\u307f\u8fbc\u307f\u4e2d...");
    setCorrectionStatus("\u8aad\u307f\u8fbc\u307f\u4e2d...");
    if (window.renderLoadingCards) {
        window.renderLoadingCards(matchSummaryEl);
    }
    renderCorrectionLoading();
    disableForm();

    try {
        await loadCharacters();
        const correction = await fetchCorrection(correctionId);
        applyCorrection(correction);
        setCorrectionStatus("");

        const matchId = correction.match_id || correction.matchId || "";
        if (matchId) {
            currentMatchId = String(matchId);
            const raw = await fetchMatch(matchId);
            const match = normalizeMatch(raw);
            renderMatchCard(match);
            setMatchStatus("");
        } else {
            setMatchStatus("");
            setMatchError(MATCH_NOT_FOUND_MSG);
        }
        clearCorrectionLoading();
    } catch (e) {
        const msg = e instanceof Error && e.message ? e.message : DB_ERROR_MSG;
        setCorrectionStatus("");
        setCorrectionError(msg);
        setMatchStatus("");
        clearCorrectionLoading();
    }
}

init();
