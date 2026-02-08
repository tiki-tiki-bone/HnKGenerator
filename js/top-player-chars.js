(() => {
    const API_BASE = window.API_BASE || "https://hnk-match-db-api.tikibone.workers.dev";
    const IMAGE_BASE = "../images/";
    const IS_MOBILE = window.matchMedia("(max-width: 600px)").matches;

    const tableBody = document.getElementById("topBody");
    const errorEl = document.getElementById("topError");
    const noteEl = document.getElementById("statsNote");
    const tabButtons = document.querySelectorAll(".tab-btn");
    const charFilterWrap = document.getElementById("charFilterWrap");
    const charFilterGroup = document.getElementById("charFilterGroup");
    const rankingTable = document.querySelector('table[aria-label="勝率ランキング"]');
    const rankingNameCol =
        rankingTable && rankingTable.querySelector("colgroup col:nth-child(2)");
    const rankingMatchesCol =
        rankingTable && rankingTable.querySelector("colgroup col:nth-child(3)");
    const rankingWinsCol =
        rankingTable && rankingTable.querySelector("colgroup col:nth-child(4)");
    const rankingLossesCol =
        rankingTable && rankingTable.querySelector("colgroup col:nth-child(5)");
    const rankingRateCol =
        rankingTable && rankingTable.querySelector("colgroup col:nth-child(6)");
    if (!tableBody) return;

    const bodyData = document.body.dataset || {};
    const noteBase = noteEl ? noteEl.textContent.trim() : "";
    const dbErrorMsg = bodyData.dbError || "Failed to query DB.";
    const noteFailed = bodyData.noteFailed || "";
    const noteStale = bodyData.noteStale || "";
    const noteUpdatedPrefix = bodyData.noteUpdatedPrefix || "";
    const noteUpdatedSuffix = bodyData.noteUpdatedSuffix || "";
    const winRateLabel = bodyData.winrateLabel || "Win rate";
    const unknownKeys = new Set(
        String(bodyData.unknownKeys || "unknown,0")
            .split(",")
            .map((value) => value.trim().toLowerCase())
            .filter(Boolean),
    );

    let currentTab = "player";
    let activeCharId = "";
    let playerRows = [];
    let pairRows = [];
    let charList = [];
    let charNameMap = new Map();
    let charSortMap = new Map();
    let playerNameMap = new Map();
    let charRowsCache = new Map();
    let charRequestToken = 0;
    let lastNoteText = noteBase;
    let lastNoteMeta = null;
    let topPlayersMeta = null;
    let topPairsMeta = null;
    const MAX_RANK_ROWS = 20;

    function normalizeKey(value) {
        return String(value || "").trim().toLowerCase();
    }

    function isUnknown(value) {
        const key = normalizeKey(value);
        return key && unknownKeys.has(key);
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
            if (noteBase) lastNoteText = noteBase;
            return;
        }
        let text = noteBase;
        const updated = formatUpdatedAt(meta.updated_at);
        if (updated) text += `${noteUpdatedPrefix}${updated}${noteUpdatedSuffix}`;
        if (meta.is_dirty) text += noteStale;
        if (!text) {
            if (lastNoteText) {
                noteEl.textContent = lastNoteText;
                return;
            }
            noteEl.textContent = "";
            return;
        }
        noteEl.textContent = text;
        lastNoteText = text;
        lastNoteMeta = meta;
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

    function buildSmallPortrait(charId, charName) {
        const cleanId = String(charId || "").trim();
        const img = document.createElement("img");
        img.className = "char-portrait";
        img.alt = charName || cleanId || "";
        img.loading = "lazy";
        if (!cleanId) {
            img.alt = "";
            return img;
        }
        img.src = `${IMAGE_BASE}small_portrait_${encodeURIComponent(cleanId)}.png`;
        img.addEventListener("error", () => {
            img.removeAttribute("src");
            img.alt = "";
        });
        return img;
    }

    function renderRows(rows, showChar) {
        tableBody.innerHTML = "";
        if (!rows.length) {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td class="rank">-</td>
                <td>-</td>
                <td class="num">0</td>
                <td class="num">-</td>
                <td class="num">-</td>
                <td class="num">-</td>
            `;
            tableBody.appendChild(tr);
            return;
        }

        function makeRowClickable(tr, href) {
            if (!href) return;
            tr.classList.add("row-link");
            tr.dataset.href = href;
            tr.tabIndex = 0;
            tr.addEventListener("click", (event) => {
                const target = event.target;
                if (target && target.closest && target.closest("a, button")) return;
                window.location.href = href;
            });
            tr.addEventListener("keydown", (event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    window.location.href = href;
                }
            });
        }

        function buildMatchSearchUrl(row, winnerFilter) {
            if (!row || !row.playerId) return "";
            const params = new URLSearchParams();
            params.set("mode", "player");
            params.set("p", row.playerId);
            const charId =
                currentTab === "pair"
                    ? row.charId
                    : currentTab === "character"
                      ? activeCharId
                      : "";
            if (charId) params.set("ch", charId);
            if (winnerFilter && winnerFilter !== "all") {
                params.set("w", winnerFilter);
            }
            return `./?${params.toString()}`;
        }

        function appendStatLink(cell, value, href) {
            const text = String(value);
            if (!href) {
                cell.textContent = text;
                return;
            }
            const link = document.createElement("a");
            link.className = "stat-link";
            link.href = href;
            link.textContent = text;
            cell.appendChild(link);
        }

        for (const row of rows) {
            const tr = document.createElement("tr");
            const rankCell = document.createElement("td");
            rankCell.className = "rank";
            rankCell.textContent = String(row.rank);

            const playerCell = document.createElement("td");
            const playerWrap = document.createElement("div");
            playerWrap.className = showChar ? "player-cell" : "player-cell no-portrait";
            const playerName = document.createElement("span");
            const nameText = row.playerName || row.playerId || "-";
            if (row.playerId) {
                const playerLink = document.createElement("a");
                playerLink.className = "player-link";
                playerLink.href = `player/?p=${encodeURIComponent(row.playerId)}`;
                playerLink.textContent = nameText;
                playerName.appendChild(playerLink);
            } else {
                playerName.textContent = nameText;
            }
            playerWrap.appendChild(playerName);
            if (showChar) {
                const charImg = buildPortrait(row.charId, row.charName);
                if (!charImg.classList.contains("empty")) {
                    playerWrap.appendChild(charImg);
                }
            }
            playerCell.appendChild(playerWrap);

            const matchesCell = document.createElement("td");
            matchesCell.className = "num";
            appendStatLink(matchesCell, row.matches, buildMatchSearchUrl(row, "all"));

            const winsCell = document.createElement("td");
            winsCell.className = "num";
            appendStatLink(winsCell, row.wins, buildMatchSearchUrl(row, "p1"));

            const lossesCell = document.createElement("td");
            lossesCell.className = "num";
            appendStatLink(lossesCell, row.losses, buildMatchSearchUrl(row, "p2"));

            const rateCell = document.createElement("td");
            rateCell.className = "num";
            rateCell.textContent = fmtPercent(row.winRate);
            const rateBar = createRateBar(row.winRate, winRateLabel);
            if (rateBar) rateCell.appendChild(rateBar);

            tr.append(rankCell, playerCell, matchesCell, winsCell, lossesCell, rateCell);
            if (currentTab === "pair") {
                makeRowClickable(tr, buildMatchSearchUrl(row, "all"));
            }
            tableBody.appendChild(tr);
        }
    }

    async function refreshStats() {
        const res = await fetch(`${API_BASE}/api/stats/refresh`, { method: "POST" });
        if (!res.ok) throw new Error("refresh");
        return res.json();
    }

    async function fetchTopPlayers() {
        const res = await fetch(`${API_BASE}/api/stats/top_players`);
        if (!res.ok) throw new Error("top_players");
        return res.json();
    }

    async function fetchTopPlayerChars() {
        const res = await fetch(`${API_BASE}/api/stats/top_player_chars`);
        if (!res.ok) throw new Error("top_player_chars");
        return res.json();
    }

    async function fetchTopPlayersByChar(charId) {
        const url = `${API_BASE}/api/stats/top_players_by_char?char_id=${encodeURIComponent(
            String(charId || "").trim(),
        )}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("top_players_by_char");
        return res.json();
    }

    async function loadCharacters() {
        const nameMap = new Map();
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
                const name = String(
                    item.char_disp_name || item.display_name || item.name || "",
                ).trim();
                const sortIndex = Number(item.sort_index ?? item.sortIndex);
                if (id && !isUnknown(name || id)) {
                    nameMap.set(id, name || id);
                    if (Number.isFinite(sortIndex)) sortMap.set(id, sortIndex);
                }
            }
        } catch {
            // ignore
        }
        return { nameMap, sortMap };
    }

    async function loadPlayers() {
        const map = new Map();
        try {
            const res = await fetch(
                `${API_BASE}/api/players?limit=2000&sort=player_id&order=asc`,
            );
            if (!res.ok) throw new Error("players");
            const data = await res.json();
            const items = Array.isArray(data.items) ? data.items : [];
            for (const item of items) {
                const id = String(item.player_id || item.id || "").trim();
                const name = String(
                    item.display_name || item.canonical_name || item.name || "",
                ).trim();
                if (id && !isUnknown(name || id)) {
                    map.set(id, name || id);
                }
            }
        } catch {
            // ignore
        }
        return map;
    }

    function normalizeRows(rows) {
        const filtered = rows.filter(Boolean);
        filtered.forEach((row, index) => {
            if (!Number.isFinite(row.rank) || row.rank <= 0) {
                row.rank = index + 1;
            }
        });
        return filtered;
    }

    function limitRows(rows, limit) {
        if (!Number.isFinite(limit) || limit <= 0) return rows;
        return rows.slice(0, limit);
    }

    function mapTopPlayers(items) {
        return limitRows(
            normalizeRows(
                items.map((item, index) => {
                    const playerId = String(item.player_id ?? item.playerId ?? "").trim();
                    const playerName = playerNameMap.get(playerId) || item.player_name || playerId;
                    if (!playerId || isUnknown(playerId) || isUnknown(playerName)) return null;
                    return {
                        rank: Number(item.rank) || index + 1,
                        playerId,
                        playerName,
                        matches: Number(item.matches) || 0,
                        wins: Number(item.wins) || 0,
                        losses: Number(item.losses) || 0,
                        winRate: Number(item.win_rate),
                    };
                }),
            ),
            MAX_RANK_ROWS,
        );
    }

    function mapTopPlayerChars(items) {
        return limitRows(
            normalizeRows(
                items.map((item, index) => {
                    const playerId = String(item.player_id ?? item.playerId ?? "").trim();
                    const playerName = playerNameMap.get(playerId) || item.player_name || playerId;
                    const charId = String(item.char_id ?? item.charId ?? "").trim();
                    const charName = charNameMap.get(charId) || item.char_name || charId;
                    if (!playerId || isUnknown(playerId) || isUnknown(playerName)) return null;
                    return {
                        rank: Number(item.rank) || index + 1,
                        playerId,
                        playerName,
                        charId,
                        charName,
                        matches: Number(item.matches) || 0,
                        wins: Number(item.wins) || 0,
                        losses: Number(item.losses) || 0,
                        winRate: Number(item.win_rate),
                    };
                }),
            ),
            MAX_RANK_ROWS,
        );
    }

    function buildCharList() {
        charList = Array.from(charNameMap.keys());
        charList.sort((a, b) => {
            const aSort = charSortMap.has(a) ? charSortMap.get(a) : Number.POSITIVE_INFINITY;
            const bSort = charSortMap.has(b) ? charSortMap.get(b) : Number.POSITIVE_INFINITY;
            if (aSort !== bSort) return aSort - bSort;
            const aName = charNameMap.get(a) || a;
            const bName = charNameMap.get(b) || b;
            return aName.localeCompare(bName, "ja");
        });
    }

    function renderCharFilters() {
        if (!charFilterGroup) return;
        charFilterGroup.innerHTML = "";
        if (!charList.length) return;
        if (!activeCharId) activeCharId = charList[0];
        for (const charId of charList) {
            const name = charNameMap.get(charId) || charId;
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "char-chip char-filter";
            btn.dataset.charId = charId;
            btn.title = name;
            btn.appendChild(buildSmallPortrait(charId, name));
            if (charId === activeCharId) {
                btn.classList.add("is-active");
            }
            btn.addEventListener("click", () => {
                activeCharId = charId;
                renderCharFilters();
                renderCurrentTab();
            });
            charFilterGroup.appendChild(btn);
        }
    }

    async function renderCharacterTab() {
        if (!activeCharId) {
            renderRows([], false);
            return;
        }
        if (errorEl) errorEl.textContent = "";
        const cached = charRowsCache.get(activeCharId);
        if (cached) {
            renderRows(cached, false);
            syncTableLayout();
            if (lastNoteMeta) setNote(lastNoteMeta);
            return;
        }
        const token = ++charRequestToken;
        try {
            const stats = await fetchTopPlayersByChar(activeCharId);
            if (token !== charRequestToken) return;
            const rows = mapTopPlayers(Array.isArray(stats.items) ? stats.items : []);
            charRowsCache.set(activeCharId, rows);
            if (currentTab === "character" && activeCharId) {
                renderRows(rows, false);
                syncTableLayout();
            }
            setNote(stats);
        } catch {
            if (token !== charRequestToken) return;
            if (errorEl) errorEl.textContent = dbErrorMsg;
            if (noteEl) noteEl.textContent = noteFailed || noteBase;
        }
    }

    function renderCurrentTab() {
        if (charFilterWrap) {
            charFilterWrap.hidden = currentTab !== "character";
        }
        if (currentTab === "player") {
            renderRows(playerRows, false);
            return;
        }
        if (currentTab === "pair") {
            renderRows(pairRows, true);
            return;
        }
        if (!activeCharId && charList.length) activeCharId = charList[0];
        renderCharacterTab();
    }

    function setTab(tab) {
        currentTab = tab;
        syncTableLayout();
        tabButtons.forEach((btn) => {
            const isActive = btn.dataset.tab === tab;
            btn.classList.toggle("is-active", isActive);
            btn.setAttribute("aria-selected", isActive ? "true" : "false");
        });
        if (tab === "player" && topPlayersMeta) setNote(topPlayersMeta);
        if (tab === "pair" && topPairsMeta) setNote(topPairsMeta);
        renderCurrentTab();
    }

    function estimateNameWidthMobile(rows) {
        if (!IS_MOBILE) return 180;
        const list = Array.isArray(rows) ? rows : [];
        if (!list.length) return 112;
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return 112;
        const sampleEl = tableBody.querySelector(".player-cell span");
        const cs = window.getComputedStyle(sampleEl || document.body);
        const fontWeight = cs.fontWeight || "700";
        const fontSize = cs.fontSize || "14px";
        const fontFamily = cs.fontFamily || "sans-serif";
        ctx.font = `${fontWeight} ${fontSize} ${fontFamily}`;

        let maxTextWidth = 0;
        for (const row of list) {
            const label = String(row?.playerName || row?.playerId || "-");
            maxTextWidth = Math.max(maxTextWidth, ctx.measureText(label).width);
        }
        // text width + name cell paddings/margins
        return Math.ceil(maxTextWidth + 18);
    }

    function estimateRateWidthMobile(rows) {
        if (!IS_MOBILE) return 170;
        const list = Array.isArray(rows) ? rows : [];
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return 78;
        const sampleEl = tableBody.querySelector("td.num");
        const cs = window.getComputedStyle(sampleEl || document.body);
        const fontWeight = cs.fontWeight || "400";
        const fontSize = cs.fontSize || "13px";
        const fontFamily = cs.fontFamily || "sans-serif";
        ctx.font = `${fontWeight} ${fontSize} ${fontFamily}`;

        let maxTextWidth = ctx.measureText("100.0%").width;
        for (const row of list) {
            const label = fmtPercent(Number(row?.winRate));
            maxTextWidth = Math.max(maxTextWidth, ctx.measureText(label).width);
        }
        // text width + cell paddings + small room for the bar
        return Math.max(72, Math.min(98, Math.ceil(maxTextWidth + 24)));
    }

    function syncTableLayout() {
        if (rankingTable) rankingTable.dataset.tab = currentTab;
        if (!rankingNameCol) return;
        const rowsForWidth =
            currentTab === "player"
                ? playerRows
                : currentTab === "character"
                  ? charRowsCache.get(activeCharId) || []
                  : pairRows;
        let width;
        if (currentTab === "pair") {
            width = IS_MOBILE ? 180 : 240;
        } else if (IS_MOBILE) {
            width = estimateNameWidthMobile(rowsForWidth);
        } else {
            width = 180;
        }
        rankingNameCol.style.width = `${width}px`;
        if (rankingMatchesCol) rankingMatchesCol.style.width = IS_MOBILE ? "50px" : "80px";
        if (rankingWinsCol) rankingWinsCol.style.width = IS_MOBILE ? "44px" : "70px";
        if (rankingLossesCol) rankingLossesCol.style.width = IS_MOBILE ? "44px" : "70px";
        if (rankingRateCol)
            rankingRateCol.style.width = IS_MOBILE
                ? `${estimateRateWidthMobile(rowsForWidth)}px`
                : "170px";
    }

    async function init() {
        if (errorEl) errorEl.textContent = "";
        try {
            try {
                await refreshStats();
            } catch {
                // ignore refresh errors
            }
            const [charData, players, topPlayers, topPairs] = await Promise.all([
                loadCharacters(),
                loadPlayers(),
                fetchTopPlayers(),
                fetchTopPlayerChars(),
            ]);
            charNameMap = charData.nameMap || new Map();
            charSortMap = charData.sortMap || new Map();
            playerNameMap = players || new Map();

            playerRows = mapTopPlayers(Array.isArray(topPlayers.items) ? topPlayers.items : []);
            pairRows = mapTopPlayerChars(Array.isArray(topPairs.items) ? topPairs.items : []);
            topPlayersMeta = topPlayers;
            topPairsMeta = topPairs;

            buildCharList();
            renderCharFilters();
            setNote(topPlayers.updated_at ? topPlayers : topPairs);
            syncTableLayout();
            renderCurrentTab();
        } catch {
            if (errorEl) errorEl.textContent = dbErrorMsg;
            if (noteEl) noteEl.textContent = noteFailed || noteBase;
        }
    }

    tabButtons.forEach((btn) => {
        btn.addEventListener("click", () => setTab(btn.dataset.tab || "player"));
    });

    init();
})();
