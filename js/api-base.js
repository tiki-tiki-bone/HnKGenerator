(() => {
    const DEV_BASE = "http://127.0.0.1:8787";
    const PROD_BASE = "https://hnk-match-db-api.tikibone.workers.dev";
    let base = "";

    const override = window.API_BASE_OVERRIDE || window.API_BASE;
    if (typeof override === "string" && override.trim()) {
        base = override.trim();
    }

    if (!base) {
        base = PROD_BASE;
    }

    window.API_BASE = base;
})();
