(() => {
    function defaultResolveCharacterName(charId, charName) {
        return String(charName || "");
    }

    function renderMatchCards(options) {
        if (!options) return;
        const container = options.container;
        if (!container) return;
        const items = Array.isArray(options.items) ? options.items : [];
        container.innerHTML = "";
        if (!items.length) {
            const empty = document.createElement("div");
            empty.className = "empty-state";
            empty.textContent = options.emptyText || "";
            container.appendChild(empty);
            return;
        }

        const normalizeMatch = options.normalizeMatch || ((row) => row);
        const normalizeWinnerSide = options.normalizeWinnerSide || (() => "");
        const ytUrl = options.ytUrl;
        const fmtRange = options.fmtRange || (() => "");
        const fmtSec = options.fmtSec;
        const fmtDuration = options.fmtDuration || (() => "");
        const datePrefix = options.datePrefix || "";
        const videoLabel = options.videoLabel || "Video";
        const enableCardLink = options.enableCardLink !== false;
        const getCorrectionHref = options.getCorrectionHref;
        const correctionLabel = options.correctionLabel || "Correction";
        const hydrateVideoInfo = options.hydrateVideoInfo;
        const isInteractiveTarget = options.isInteractiveTarget || (() => false);
        const createTextLink = options.createTextLink;
        const buildCharImage = options.buildCharImage;
        const resolvePlayerName = options.resolvePlayerName || ((name) => String(name || "-"));
        const resolvePlayerLinkId = options.resolvePlayerLinkId || ((display, id) => id || "");
        const resolveCharacterId = options.resolveCharacterId || ((charId) => charId || "");
        const resolveCharacterName =
            options.resolveCharacterName || defaultResolveCharacterName;
        const getVideoLinkHref = options.getVideoLinkHref || (() => "");
        const getCharacterLinkHref = options.getCharacterLinkHref || (() => "");
        const getPlayerLinkHref = options.getPlayerLinkHref || (() => "");

        if (!createTextLink || !buildCharImage) return;

        const isMobile =
            typeof window !== "undefined" &&
            window.matchMedia &&
            window.matchMedia("(max-width: 600px)").matches;
        const openCardUrl = (url) => {
            if (!url) return;
            if (isMobile) {
                window.location.href = url;
            } else {
                window.open(url, "_blank", "noopener");
            }
        };

        const videoIds = [];
        for (const it of items) {
            const row = normalizeMatch(it);
            const winnerSide = normalizeWinnerSide(row.winner);
            const card = document.createElement("div");
            card.className = "match-card";
            card.setAttribute("role", "listitem");
            const cardUrl = row.videoId && ytUrl ? ytUrl(row.videoId, row.tStart) : "";
            if (cardUrl && enableCardLink) {
                card.classList.add("clickable");
                card.tabIndex = 0;
                card.addEventListener("click", (e) => {
                    if (isInteractiveTarget(e.target)) return;
                    openCardUrl(cardUrl);
                });
                card.addEventListener("keydown", (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openCardUrl(cardUrl);
                    }
                });
            }

            const meta = document.createElement("div");
            meta.className = "match-meta";

            const metaLeft = document.createElement("div");
            metaLeft.className = "match-meta-left";
            const range = fmtRange(row.tStart, row.tEnd);
            const duration = fmtDuration(row.tStart, row.tEnd);
            if (row.videoId) {
                const a = document.createElement("a");
                a.href = getVideoLinkHref(row.videoId);
                a.className = "match-video-link";
                a.textContent = row.videoTitle || videoLabel;
                a.title = row.videoTitle || row.videoId || "";
                a.setAttribute("data-video-id", row.videoId);
                metaLeft.appendChild(a);
                if (!row.videoTitle || !row.videoUploadedAt) {
                    videoIds.push(row.videoId);
                }
            } else {
                metaLeft.textContent = "-";
            }
            const rangeText = range ? (duration ? `${range} (${duration})` : range) : "";
            const metaRight = document.createElement("div");
            metaRight.className = "match-meta-right";
            const dateEl = document.createElement("span");
            dateEl.className = "match-video-date";
            const dateText = row.videoUploadedAt ? String(row.videoUploadedAt).trim() : "";
            if (dateText) {
                dateEl.textContent = `${datePrefix}${dateText}`;
                dateEl.title = `${datePrefix}${dateText}`;
            } else if (row.videoId) {
                dateEl.textContent = `${datePrefix}-`;
                dateEl.setAttribute("data-video-date-id", row.videoId);
            } else {
                dateEl.textContent = `${datePrefix}-`;
            }
            metaRight.appendChild(dateEl);

            meta.appendChild(metaLeft);
            meta.appendChild(metaRight);

            const left = document.createElement("div");
            left.className = "match-side left";
            const p1Display = resolvePlayerName(row.p1Name, row.p1Id);
            const p1CharId = resolveCharacterId(row.p1CharId, row.p1Char);
            const p1CharName = resolveCharacterName(p1CharId, row.p1Char);
            const leftImg = buildCharImage(p1CharId, p1CharName);
            leftImg.classList.add("left");
            if (winnerSide === "p2") {
                leftImg.classList.add("is-loss");
            }
            const p1LinkId = resolvePlayerLinkId(p1Display, row.p1Id);
            const leftName = createTextLink(
                p1Display,
                p1LinkId ? getPlayerLinkHref(p1LinkId) : "",
                "match-name",
            );
            left.appendChild(leftName);
            const leftCharLink = p1CharId ? getCharacterLinkHref(p1CharId) : "";
            const leftChar = createTextLink(p1CharName, leftCharLink, "match-char");
            if (!p1CharName) {
                leftChar.classList.add("empty");
                leftChar.textContent = " ";
            }
            left.appendChild(leftChar);

            const right = document.createElement("div");
            right.className = "match-side right";
            const p2Display = resolvePlayerName(row.p2Name, row.p2Id);
            const p2CharId = resolveCharacterId(row.p2CharId, row.p2Char);
            const p2CharName = resolveCharacterName(p2CharId, row.p2Char);
            const rightImg = buildCharImage(p2CharId, p2CharName);
            rightImg.classList.add("right");
            if (winnerSide === "p1") {
                rightImg.classList.add("is-loss");
            }
            const p2LinkId = resolvePlayerLinkId(p2Display, row.p2Id);
            const rightName = createTextLink(
                p2Display,
                p2LinkId ? getPlayerLinkHref(p2LinkId) : "",
                "match-name",
            );
            right.appendChild(rightName);
            const rightCharLink = p2CharId ? getCharacterLinkHref(p2CharId) : "";
            const rightChar = createTextLink(p2CharName, rightCharLink, "match-char");
            if (!p2CharName) {
                rightChar.classList.add("empty");
                rightChar.textContent = " ";
            }
            right.appendChild(rightChar);

            const center = document.createElement("div");
            center.className = "match-center";
            const leftResult = winnerSide === "p1" ? "WIN" : winnerSide === "p2" ? "LOSE" : "WIN";
            const rightResult =
                winnerSide === "p2" ? "WIN" : winnerSide === "p1" ? "LOSE" : "LOSE";

            const leftBadge = document.createElement("span");
            leftBadge.className = "match-result";
            if (!winnerSide) leftBadge.classList.add("empty");
            if (winnerSide === "p1") leftBadge.classList.add("win");
            if (winnerSide === "p2") leftBadge.classList.add("lose");
            leftBadge.textContent = leftResult;

            const vs = document.createElement("span");
            vs.className = "match-vs";
            vs.textContent = "VS";

            const rightBadge = document.createElement("span");
            rightBadge.className = "match-result";
            if (!winnerSide) rightBadge.classList.add("empty");
            if (winnerSide === "p2") rightBadge.classList.add("win");
            if (winnerSide === "p1") rightBadge.classList.add("lose");
            rightBadge.textContent = rightResult;

            const centerMain = document.createElement("div");
            centerMain.className = "match-center-main";
            centerMain.appendChild(leftBadge);
            centerMain.appendChild(vs);
            centerMain.appendChild(rightBadge);
            center.appendChild(centerMain);
            let centerTime = null;
            const startText = typeof fmtSec === "function" ? fmtSec(row.tStart) : "";
            const endText = typeof fmtSec === "function" ? fmtSec(row.tEnd) : "";
            if (rangeText || startText || endText) {
                centerTime = document.createElement("div");
                centerTime.className = "match-center-time";
                if (row.videoId && ytUrl && (startText || endText)) {
                    if (startText) {
                        const startLink = document.createElement("a");
                        startLink.href = ytUrl(row.videoId, row.tStart);
                        startLink.target = "_blank";
                        startLink.rel = "noopener";
                        startLink.textContent = startText;
                        centerTime.appendChild(startLink);
                    }
                    if (startText && endText) {
                        const sep = document.createElement("span");
                        sep.textContent = " - ";
                        centerTime.appendChild(sep);
                    }
                    if (endText) {
                        const endLink = document.createElement("a");
                        endLink.href = ytUrl(row.videoId, row.tEnd);
                        endLink.target = "_blank";
                        endLink.rel = "noopener";
                        endLink.textContent = endText;
                        centerTime.appendChild(endLink);
                    }
                    if (duration) {
                        if (isMobile) {
                            centerTime.appendChild(document.createElement("br"));
                        }
                        const dur = document.createElement("span");
                        dur.className = "match-time-duration";
                        dur.textContent = isMobile ? `(${duration})` : ` (${duration})`;
                        centerTime.appendChild(dur);
                    }
                } else {
                    if (isMobile && range && duration) {
                        centerTime.textContent = "";
                        centerTime.appendChild(document.createTextNode(range));
                        centerTime.appendChild(document.createElement("br"));
                        const dur = document.createElement("span");
                        dur.className = "match-time-duration";
                        dur.textContent = `(${duration})`;
                        centerTime.appendChild(dur);
                    } else {
                        centerTime.textContent = rangeText;
                    }
                }
            }

            let pendingImages = 0;
            let loadingOverlay = null;
            const trackImage = (imgEl) => {
                if (!imgEl || imgEl.classList.contains("empty") || !imgEl.src) return;
                if (imgEl.complete) return;
                pendingImages += 1;
                imgEl.addEventListener(
                    "load",
                    () => {
                        pendingImages -= 1;
                        if (pendingImages <= 0 && loadingOverlay) {
                            loadingOverlay.remove();
                            card.classList.remove("is-loading");
                        }
                    },
                    { once: true },
                );
                imgEl.addEventListener(
                    "error",
                    () => {
                        pendingImages -= 1;
                        if (pendingImages <= 0 && loadingOverlay) {
                            loadingOverlay.remove();
                            card.classList.remove("is-loading");
                        }
                    },
                    { once: true },
                );
            };

            trackImage(leftImg);
            trackImage(rightImg);

            if (pendingImages > 0) {
                loadingOverlay = document.createElement("div");
                loadingOverlay.className = "match-card-loading";
                loadingOverlay.innerHTML =
                    '<span class="loading-spinner" aria-hidden="true"></span>';
                card.classList.add("is-loading");
            }

            card.appendChild(meta);
            card.appendChild(left);
            card.appendChild(leftImg);
            card.appendChild(center);
            if (centerTime) {
                if (isMobile) {
                    center.appendChild(centerTime);
                } else {
                    card.appendChild(centerTime);
                }
            }
            card.appendChild(rightImg);
            card.appendChild(right);
            if (loadingOverlay) {
                card.appendChild(loadingOverlay);
            }

            if (typeof getCorrectionHref === "function") {
                const correctionHref = getCorrectionHref(row);
                if (correctionHref) {
                    const correction = document.createElement("a");
                    correction.className = "match-correction";
                    correction.href = correctionHref;
                    correction.setAttribute("aria-label", correctionLabel);
                    correction.title = correctionLabel;
                    correction.innerHTML =
                        '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
                        '<rect x="5" y="3" width="2" height="18" fill="currentColor"/>' +
                        '<path fill="currentColor" d="M7 4h10l-2.6 3.6 2.6 3.6H7z"/>' +
                        "</svg>";
                    card.appendChild(correction);
                }
            }
            container.appendChild(card);
        }

        if (videoIds.length && typeof hydrateVideoInfo === "function") {
            hydrateVideoInfo(videoIds);
        }
    }

    function renderLoadingCards(container, message) {
        if (!container) return;
        container.innerHTML = "";
        const card = document.createElement("div");
        card.className = "match-card loading";
        card.setAttribute("role", "status");
        card.setAttribute("aria-live", "polite");
        const text = message || "\u8AAD\u8FBC\u4E2D...";
        card.innerHTML =
            '<span class="loading-spinner" aria-hidden="true"></span>' +
            `<span class="loading-text">${text}</span>`;
        container.appendChild(card);
    }

    window.renderMatchCards = renderMatchCards;
    window.renderLoadingCards = renderLoadingCards;
})();
