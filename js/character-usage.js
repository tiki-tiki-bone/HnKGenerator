(() => {
    const API_BASE = window.API_BASE || "https://hnk-match-db-api.tikibone.workers.dev";
const IMAGE_BASE = "../images/";
const IS_MOBILE = window.matchMedia("(max-width: 600px)").matches;

    const tableBody = document.getElementById("usageBody");
    const errorEl = document.getElementById("usageError");
    const noteEl = document.getElementById("statsNote");
    if (!tableBody) return;

    const bodyData = document.body.dataset || {};
    const mode = (bodyData.scope || "").trim() === "upper" ? "upper" : "";
    const noteBase = noteEl ? noteEl.textContent.trim() : "";
    const dbErrorMsg = bodyData.dbError || "Failed to query DB.";
    const noteFailed = bodyData.noteFailed || "";
    const noteStale = bodyData.noteStale || "";
    const noteUpdatedPrefix = bodyData.noteUpdatedPrefix || "";
    const noteUpdatedSuffix = bodyData.noteUpdatedSuffix || "";
    const usageLabel = bodyData.usageLabel || "Usage rate";
    const unknownKeys = new Set(
        String(bodyData.unknownKeys || "unknown,0")
            .split(",")
            .map((value) => value.trim().toLowerCase())
            .filter(Boolean),
    );

    function normalizeKey(value) {
        return String(value || "").trim();
    }

    function isUnknownCharacter(name, id) {
        const n = normalizeKey(name).toLowerCase();
        const i = normalizeKey(id).toLowerCase();
        return (n && unknownKeys.has(n)) || (i && unknownKeys.has(i));
    }

    function formatUpdatedAt(value) {
        const raw = String(value || "").trim();
        if (!raw) return "";
        const date = new Date(raw);
        if (Number.isNaN(date.getTime())) return raw;
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
    }

    function setNote(meta) {
        if (!noteEl) return;
        if (!meta) {
            if (noteBase) noteEl.textContent = noteBase;
            return;
        }
        let text = noteBase;
        const updated = formatUpdatedAt(meta.updated_at);
        if (updated) text += `${noteUpdatedPrefix}${updated}${noteUpdatedSuffix}`;
        if (meta.is_dirty) text += noteStale;
        noteEl.textContent = text;
    }

    function fmtPercent(rate) {
        if (!Number.isFinite(rate)) return "-";
        return `${(rate * 100).toFixed(1)}%`;
    }

    function createRateBar(rate, label) {
        if (!Number.isFinite(rate)) return null;
        const percent = Math.max(0, Math.min(100, Math.round(rate * 100)));
        const bar = document.createElement("div");
        bar.className = "rate-bar";
        bar.setAttribute("role", "progressbar");
        bar.setAttribute("aria-valuemin", "0");
        bar.setAttribute("aria-valuemax", "100");
        bar.setAttribute("aria-valuenow", String(percent));
        if (label) bar.setAttribute("aria-label", label);
        const fill = document.createElement("div");
        fill.className = "rate-bar-fill";
        fill.style.width = `${percent}%`;
        bar.appendChild(fill);
        return bar;
    }

    function buildPortrait(charId, charName) {
        const cleanId = String(charId || "").trim();
        const img = document.createElement("img");
        img.className = "table-portrait";
        img.alt = charName || cleanId || "";
        img.loading = "lazy";
        if (!cleanId) {
            img.classList.add("empty");
            img.alt = "";
            return img;
        }
        const portraitPrefix = IS_MOBILE ? "medium_portrait_mobile" : "medium_portrait";
        img.src = `${IMAGE_BASE}${portraitPrefix}_${encodeURIComponent(cleanId)}.png`;
        img.addEventListener("error", () => {
            img.classList.add("empty");
            img.removeAttribute("src");
            img.alt = "";
        });
        return img;
    }

    async function fetchCharacterUsage() {
        const url = mode
            ? `${API_BASE}/api/stats/character_usage?mode=${encodeURIComponent(mode)}`
            : `${API_BASE}/api/stats/character_usage`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("stats");
        return res.json();
    }

    async function refreshStats() {
        const res = await fetch(`${API_BASE}/api/stats/refresh`, { method: "POST" });
        if (!res.ok) throw new Error("refresh");
        return res.json();
    }

    async function loadCharacters() {
        const map = new Map();
        const sortMap = new Map();
        try {
            const res = await fetch(
                `${API_BASE}/api/characters?limit=200&sort=sort_index&order=asc`,
            );
            if (!res.ok) throw new Error("characters");
            const data = await res.json();
            const items = Array.isArray(data.items) ? data.items : [];
            for (const item of items) {
                const id = String(item.char_id || item.id || "").trim();
                const name = String(item.char_disp_name || item.display_name || item.name || "").trim();
                const sortIndexRaw = Number(item.sort_index ?? item.sortIndex);
                const sortIndex = Number.isFinite(sortIndexRaw)
                    ? sortIndexRaw
                    : Number.POSITIVE_INFINITY;
                if (id && !isUnknownCharacter(name || id, id)) {
                    map.set(id, name || id);
                    sortMap.set(id, sortIndex);
                }
            }
        } catch {
            // ignore
        }
        return { map, sortMap };
    }

    function renderTable(rows, totalAppearances) {
        tableBody.innerHTML = "";
        if (!rows.length) {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td class="icon-col">-</td>
                <td class="num">0</td>
                <td class="num">-</td>
            `;
            tableBody.appendChild(tr);
            return;
        }

        for (const row of rows) {
            const tr = document.createElement("tr");
            const iconCell = document.createElement("td");
            iconCell.className = "icon-col";
            const iconImg = buildPortrait(row.id, row.name);
            if (iconImg.classList.contains("empty")) {
                iconCell.textContent = "-";
            } else {
                iconCell.appendChild(iconImg);
            }

            const usageCell = document.createElement("td");
            usageCell.className = "num";
            const usageRate = Number.isFinite(row.usage_rate)
                ? row.usage_rate
                : Number.isFinite(totalAppearances) && totalAppearances > 0
                  ? row.matches / totalAppearances
                  : NaN;
            usageCell.textContent = fmtPercent(usageRate);
            const usageBar = createRateBar(usageRate, usageLabel);
            if (usageBar) usageCell.appendChild(usageBar);

            const matchesCell = document.createElement("td");
            matchesCell.className = "num";
            matchesCell.textContent = String(row.matches);

            tr.append(iconCell, usageCell, matchesCell);
            tableBody.appendChild(tr);
        }
    }

    async function init() {
        if (errorEl) errorEl.textContent = "";
        try {
            const charMetaPromise = loadCharacters();
            try {
                await refreshStats();
            } catch {
                // ignore refresh errors
            }
            const stats = await fetchCharacterUsage();
            const charMeta = await charMetaPromise;
            const items = Array.isArray(stats.items) ? stats.items : [];
            const totalAppearances = Number(stats.total_appearances);
            const statsMap = new Map();
            for (const item of items) {
                const id = String(item.char_id || item.charId || "").trim();
                if (!id) continue;
                statsMap.set(id, item);
            }
            const allIds = charMeta.map.size
                ? Array.from(charMeta.map.keys())
                : Array.from(statsMap.keys());
            const rows = allIds
                .map((id) => {
                    const raw = statsMap.get(id) || {};
                    const name = charMeta.map.get(id) || String(raw.char_name || raw.name || id);
                    if (!id || isUnknownCharacter(name, id)) return null;
                    return {
                        id,
                        name,
                        matches: Number(raw.matches) || 0,
                        wins: Number(raw.wins) || 0,
                        losses: Number(raw.losses) || 0,
                        usage_rate: Number(raw.usage_rate),
                        win_rate: Number(raw.win_rate),
                        sortIndex: charMeta.sortMap.has(id)
                            ? charMeta.sortMap.get(id)
                            : Number.POSITIVE_INFINITY,
                    };
                })
                .filter(Boolean);
            rows.sort((a, b) => {
                if (b.matches !== a.matches) return b.matches - a.matches;
                if (a.sortIndex !== b.sortIndex) return a.sortIndex - b.sortIndex;
                return String(a.name || a.id).localeCompare(String(b.name || b.id), "ja");
            });
            setNote(stats);
            renderTable(rows, totalAppearances);
        } catch {
            if (errorEl) errorEl.textContent = dbErrorMsg;
            if (noteEl) noteEl.textContent = noteFailed || noteBase;
        }
    }

    init();
})();
