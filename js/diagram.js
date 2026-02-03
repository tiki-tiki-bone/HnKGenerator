(() => {
    const API_BASE = window.API_BASE || "https://hnk-match-db-api.tikibone.workers.dev";
const IMAGE_BASE = "/images/";

    const tableEl = document.getElementById("diagramTable");
    const errorEl = document.getElementById("diagramError");
    const noteEl = document.getElementById("statsNote");
    if (!tableEl) return;

    const bodyData = document.body.dataset || {};
    const mode = (bodyData.scope || "").trim() === "upper" ? "upper" : "";
    const noteBase = noteEl ? noteEl.textContent.trim() : "";
    const dbErrorMsg = bodyData.dbError || "Failed to query DB.";
    const noteFailed = bodyData.noteFailed || "";
    const noteStale = bodyData.noteStale || "";
    const noteUpdatedPrefix = bodyData.noteUpdatedPrefix || "";
    const noteUpdatedSuffix = bodyData.noteUpdatedSuffix || "";
    const totalLabel = bodyData.totalLabel || "Total";
    const unknownKeys = new Set(
        String(bodyData.unknownKeys || "unknown,0")
            .split(",")
            .map((value) => value.trim().toLowerCase())
            .filter(Boolean),
    );

    const FALLBACK_CHARACTERS = [
        "KENSHIRO",
        "RAOH",
        "TOKI",
        "JAGI",
        "SHIN",
        "REI",
        "JUDA",
        "THOUTHER",
        "MAMIYA",
        "HEART",
    ].map((id) => ({ id, name: id }));

    function getColumnSize() {
        const raw = getComputedStyle(tableEl).getPropertyValue("--diag-col-size").trim();
        const parsed = Number.parseFloat(raw);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : 36;
    }

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

    function buildPortrait(charId, charName) {
        const cleanId = String(charId || "").trim();
        const img = document.createElement("img");
        img.className = "diag-portrait";
        img.alt = charName || cleanId || "";
        img.loading = "lazy";
        if (!cleanId) {
            img.classList.add("empty");
            img.alt = "";
            return img;
        }
        img.src = `${IMAGE_BASE}small_portrait_${encodeURIComponent(cleanId)}.png`;
        img.addEventListener("error", () => {
            img.classList.add("empty");
            img.removeAttribute("src");
            img.alt = "";
        });
        return img;
    }

    function buildHeaderCell(char) {
        const th = document.createElement("th");
        th.className = "diag-header";
        th.title = char.name || char.id;
        const img = buildPortrait(char.id, char.name);
        th.appendChild(img);
        return th;
    }

    function buildMatchupLink(leftId, rightId) {
        const params = new URLSearchParams();
        params.set("mode", "card");
        params.set("ch1", String(leftId || "").trim());
        params.set("ch2", String(rightId || "").trim());
        return `./?${params.toString()}`;
    }

    function formatRate(rate) {
        if (!Number.isFinite(rate)) return "-";
        return (rate * 10).toFixed(2);
    }

    function buildRateMap(items) {
        const map = new Map();
        for (const item of items) {
            const c1 = String(item.char_1 || item.char1 || "").trim();
            const c2 = String(item.char_2 || item.char2 || "").trim();
            if (!c1 || !c2) continue;
            map.set(`${c1}|${c2}`, {
                win1: Number(item.win_rate_1),
                win2: Number(item.win_rate_2),
            });
        }
        return map;
    }

    function getRate(rateMap, rowId, colId) {
        const direct = rateMap.get(`${rowId}|${colId}`);
        if (direct && Number.isFinite(direct.win1)) return direct.win1;
        const reverse = rateMap.get(`${colId}|${rowId}`);
        if (reverse && Number.isFinite(reverse.win2)) return reverse.win2;
        return NaN;
    }

    async function fetchDiagramStats() {
        const url = mode
            ? `${API_BASE}/api/stats/diagram?mode=${encodeURIComponent(mode)}`
            : `${API_BASE}/api/stats/diagram`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("stats");
        return res.json();
    }

    async function refreshStats() {
        const res = await fetch(`${API_BASE}/api/stats/refresh`, { method: "POST" });
        if (!res.ok) throw new Error("refresh");
        return res.json();
    }

    async function loadCharacters(statsItems) {
        try {
            const res = await fetch(
                `${API_BASE}/api/characters?limit=200&sort=sort_index&order=asc`,
            );
            if (!res.ok) throw new Error("characters");
            const data = await res.json();
            const items = Array.isArray(data.items) ? data.items : [];
            const mapped = items
                .map((item) => {
                    const id = String(item.char_id || item.id || "").trim();
                    const name = String(
                        item.char_disp_name || item.display_name || item.name || "",
                    ).trim();
                    const display = name || id;
                    return { id, name: display };
                })
                .filter((item) => item.id && !isUnknownCharacter(item.name, item.id));
            if (mapped.length) return mapped;
        } catch {
            // fallback below
        }

        const fallbackMap = new Map();
        for (const item of statsItems || []) {
            const c1 = String(item.char_1 || item.char1 || "").trim();
            const c2 = String(item.char_2 || item.char2 || "").trim();
            if (c1 && !fallbackMap.has(c1)) fallbackMap.set(c1, { id: c1, name: c1 });
            if (c2 && !fallbackMap.has(c2)) fallbackMap.set(c2, { id: c2, name: c2 });
        }
        const fallback = Array.from(fallbackMap.values()).filter(
            (item) => !isUnknownCharacter(item.name, item.id),
        );
        if (fallback.length) {
            fallback.sort((a, b) =>
                String(a.name || a.id).localeCompare(String(b.name || b.id), "ja"),
            );
            return fallback;
        }
        return FALLBACK_CHARACTERS;
    }

    function renderTable(chars, items) {
        const rateMap = buildRateMap(items);
        const avgMap = new Map();
        for (const rowChar of chars) {
            let sum = 0;
            let count = 0;
            for (const colChar of chars) {
                if (rowChar.id === colChar.id) continue;
                const rate = getRate(rateMap, rowChar.id, colChar.id);
                if (Number.isFinite(rate)) {
                    sum += rate;
                    count += 1;
                }
            }
            avgMap.set(rowChar.id, count ? sum / count : NaN);
        }

        const sorted = [...chars].sort((a, b) => {
            const av = avgMap.get(a.id);
            const bv = avgMap.get(b.id);
            const aKey = Number.isFinite(av) ? av : -1;
            const bKey = Number.isFinite(bv) ? bv : -1;
            if (bKey !== aKey) return bKey - aKey;
            return String(a.name || a.id).localeCompare(String(b.name || b.id), "ja");
        });

        tableEl.innerHTML = "<thead></thead><tbody></tbody>";
        const thead = tableEl.querySelector("thead");
        const tbody = tableEl.querySelector("tbody");
        if (!thead || !tbody) return;

        const headRow = document.createElement("tr");
        const corner = document.createElement("th");
        corner.className = "diag-corner";
        headRow.appendChild(corner);
        const totalHeader = document.createElement("th");
        totalHeader.className = "diag-total-col diag-total-header";
        totalHeader.textContent = totalLabel;
        headRow.appendChild(totalHeader);
        for (const char of sorted) {
            headRow.appendChild(buildHeaderCell(char));
        }
        thead.appendChild(headRow);

        sorted.forEach((rowChar) => {
            const tr = document.createElement("tr");
            const rowHeader = buildHeaderCell(rowChar);
            rowHeader.classList.add("row-header");
            tr.appendChild(rowHeader);

            const totalCell = document.createElement("td");
            totalCell.className = "diag-total-col";
            totalCell.textContent = formatRate(avgMap.get(rowChar.id));
            tr.appendChild(totalCell);

            sorted.forEach((colChar) => {
                const td = document.createElement("td");
                const link = document.createElement("a");
                link.className = "diag-link";
                link.href = buildMatchupLink(rowChar.id, colChar.id);
                if (rowChar.id === colChar.id) {
                    td.className = "diag-self";
                    link.textContent = "-";
                } else {
                    const rate = getRate(rateMap, rowChar.id, colChar.id);
                    link.textContent = formatRate(rate);
                }
                td.appendChild(link);
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });

        const minWidth = (sorted.length + 2) * getColumnSize();
        tableEl.style.minWidth = `${minWidth}px`;
    }

    async function init() {
        if (errorEl) errorEl.textContent = "";
        try {
            try {
                await refreshStats();
            } catch {
                // ignore refresh errors
            }
            const stats = await fetchDiagramStats();
            const items = Array.isArray(stats.items) ? stats.items : [];
            const chars = await loadCharacters(items);
            setNote(stats);
            renderTable(chars, items);
        } catch {
            if (errorEl) errorEl.textContent = dbErrorMsg;
            if (noteEl) noteEl.textContent = noteFailed || noteBase;
        }
    }

    init();
})();
