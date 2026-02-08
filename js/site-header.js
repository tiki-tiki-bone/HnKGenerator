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
