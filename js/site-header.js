(() => {
    const host = document.getElementById("siteHeader");
    if (!host) {
        return;
    }

    const scriptEl = document.currentScript || document.querySelector("script[data-site-header]");
    const scriptUrl = scriptEl ? new URL(scriptEl.src, window.location.href) : new URL(window.location.href);
    const headerUrl = new URL("../partials/site-header.html", scriptUrl);
    const path = window.location.pathname || "";
    const inMatchDb =
        path.includes("/match_db/") || path.endsWith("/match_db") || path.endsWith("/match_db/");
    const isMatchDbAbout =
        path.includes("/match_db/about/") ||
        path.endsWith("/match_db/about") ||
        path.endsWith("/match_db/about/index.html");
    const linkPrefix = inMatchDb ? "../" : "";
    const dbTopHref = `${linkPrefix}match_db/`;

    const applyHeaderTitle = (root) => {
        const titleTarget = root.querySelector("[data-site-header-title]");
        if (!titleTarget) {
            return;
        }
        const title = host.dataset.title || document.title || "";
        titleTarget.textContent = title;
        if (titleTarget.tagName === "A") {
            titleTarget.setAttribute("href", dbTopHref);
            titleTarget.setAttribute("aria-label", title);
        }
    };

    const wireHeaderMenu = (root) => {
        const menuToggle = root.querySelector("#menuToggle");
        const navMenu = root.querySelector("#navMenu");
        if (!menuToggle || !navMenu) {
            return;
        }

        const toggleMenu = () => {
            navMenu.classList.toggle("show");
        };

        menuToggle.addEventListener("click", toggleMenu);
        menuToggle.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleMenu();
            }
        });
    };

    const applyNavLinks = (root) => {
        const navLinks = root.querySelectorAll("[data-nav-href]");
        navLinks.forEach((link) => {
            link.setAttribute("href", `${linkPrefix}${link.dataset.navHref || ""}`);
        });
    };

    const ensureMatchDbAboutLink = () => {
        const existing = document.querySelector("main .site-db-about-link");
        if (!inMatchDb) {
            if (existing) existing.remove();
            return;
        }
        const shouldHideAbout = isMatchDbAbout;
        if (existing) {
            const aboutLink = existing.querySelector(".site-db-about-link-anchor.about-link");
            if (aboutLink) {
                aboutLink.style.display = shouldHideAbout ? "none" : "";
            }
            return;
        }
        const main = document.querySelector("main");
        if (!main) return;
        const wrap = document.createElement("div");
        wrap.className = "site-db-about-link";
        wrap.innerHTML = `
            <a href="${linkPrefix}match_db/" class="site-db-about-link-anchor home-link">DB HOME</a>
            <a href="${linkPrefix}match_db/about/" class="site-db-about-link-anchor about-link" ${shouldHideAbout ? 'style="display:none"' : ""}>
                <span class="site-db-about-icon" aria-hidden="true">i</span>
                対戦動画DBについて
            </a>
        `;
        main.insertAdjacentElement("afterbegin", wrap);
    };

    const ensureMatchDbAboutStyle = () => {
        if (document.getElementById("siteHeaderAboutStyle")) return;
        const style = document.createElement("style");
        style.id = "siteHeaderAboutStyle";
        style.textContent = `
            main .site-db-about-link {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 0.75rem;
                margin: 0 0 0.6rem;
                font-size: 0.9rem;
                line-height: 1.2;
            }
            main .site-db-about-link-anchor {
                display: inline-flex;
                align-items: center;
                gap: 0.15rem;
                color: #1f4d99;
                text-decoration: none;
                white-space: nowrap;
            }
            main .site-db-about-link-anchor.home-link {
                color: #6f7480;
            }
            main .site-db-about-link-anchor.about-link {
                color: #6f7480;
            }
            main .site-db-about-link-anchor:hover,
            main .site-db-about-link-anchor:focus {
                color: #0f244d;
                text-decoration: underline;
            }
            main .site-db-about-link-anchor.home-link:hover,
            main .site-db-about-link-anchor.home-link:focus {
                color: #545b68;
            }
            main .site-db-about-link-anchor.about-link:hover,
            main .site-db-about-link-anchor.about-link:focus {
                color: #545b68;
            }
            main .site-db-about-icon {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 1.1em;
                height: 1.1em;
                border: 1.5px solid currentColor;
                border-radius: 50%;
                font-size: 0.82em;
                font-weight: 700;
                line-height: 1;
            }
            @media (max-width: 600px) {
                main .site-db-about-link {
                    margin: 0 0 0.5rem;
                    font-size: 0.85rem;
                    gap: 0.5rem;
                }
            }
        `;
        document.head.appendChild(style);
    };

    const applyActiveNav = (root) => {
        const navLinks = root.querySelectorAll("[data-nav-href]");
        if (!navLinks.length) return;
        const currentPath = (window.location.pathname || "").replace(/\/+$/, "/");
        if (inMatchDb) {
            navLinks.forEach((link) => {
                const navHref = String(link.dataset.navHref || "");
                if (!navHref) return;
                if (!navHref.endsWith("match_db/")) return;
                link.classList.add("is-active");
                link.setAttribute("aria-current", "page");
                link.style.backgroundColor = "#ffb347";
                link.style.color = "#333";
                link.style.borderColor = "#ffb347";
            });
            return;
        }
        navLinks.forEach((link) => {
            const href = link.getAttribute("href") || "";
            const navHref = String(link.dataset.navHref || "");
            const isNavDir = navHref.endsWith("/");
            let linkPath = "";
            try {
                linkPath = new URL(href, window.location.href).pathname;
            } catch {
                linkPath = href;
            }
            if (!linkPath) return;
            let normalizedLink = linkPath.replace(/\/+$/, "");
            if (isNavDir) normalizedLink = `${normalizedLink}/`;
            const isActive = isNavDir
                ? currentPath.startsWith(normalizedLink)
                : currentPath.endsWith(linkPath);
            if (!isActive) return;
            link.classList.add("is-active");
            link.setAttribute("aria-current", "page");
            link.style.backgroundColor = "#ffb347";
            link.style.color = "#333";
            link.style.borderColor = "#ffb347";
        });
    };

    const injectHeader = async () => {
        try {
            const response = await fetch(headerUrl.toString(), { cache: "no-cache" });
            if (!response.ok) {
                return;
            }
            const html = await response.text();
            host.innerHTML = html;
            applyHeaderTitle(host);
            applyNavLinks(host);
            applyActiveNav(host);
            wireHeaderMenu(host);
            ensureMatchDbAboutStyle();
            ensureMatchDbAboutLink();
        } catch (err) {
            console.warn("Failed to load site header", err);
        }
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", injectHeader);
    } else {
        injectHeader();
    }
})();
