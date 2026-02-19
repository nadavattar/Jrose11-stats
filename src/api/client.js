/**
 * Local API client — replaces @base44/sdk entirely.
 * All calls go directly to the local mock server at http://localhost:3001.
 */

/**
 * @typedef {Object} EntityHandler
 * @property {(sort?: string, limit?: number, skip?: number, fields?: string|string[]) => Promise<any[]>} list
 * @property {(query: object, sort?: string, limit?: number, skip?: number, fields?: string|string[]) => Promise<any[]>} filter
 * @property {(id: string) => Promise<any>} get
 * @property {(data: object) => Promise<any>} create
 * @property {(id: string, data: object) => Promise<any>} update
 * @property {(id: string) => Promise<any>} delete
 * @property {(data: object[]) => Promise<any>} bulkCreate
 */

/**
 * @typedef {Object} Entities
 * @property {EntityHandler} Pokemon
 * @property {EntityHandler} RunStatistics
 * @property {EntityHandler} TierPlacement
 * @property {EntityHandler} Move
 * @property {EntityHandler} RulesContent
 * @property {EntityHandler} User
 */

// Fallback to 'test' so URLs never contain 'undefined'
const APP_ID = import.meta.env.VITE_BASE44_APP_ID || 'test';
// Use relative path - works in Dev (via Vite proxy) and Prod (same origin)
const BASE_URL = `/api/apps/${APP_ID}/entities`;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildParams(obj) {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(obj)) {
        if (v !== undefined && v !== null) params.set(k, v);
    }
    return params.toString();
}

async function apiFetch(path, options = {}) {
    // If path starts with http, use it as is, otherwise prepend nothing (relative)
    const url = path.startsWith('http') ? path : path;

    const res = await fetch(url, {
        headers: { 'Content-Type': 'application/json', ...options.headers },
        ...options,
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }));
        throw Object.assign(new Error(err.message || res.statusText), { status: res.status, data: err });
    }
    return res.json();
}

// ---------------------------------------------------------------------------
// Entity factory — mirrors the SDK's entity handler interface
// ---------------------------------------------------------------------------

function createEntityHandler(entityName) {
    const base = `/api/apps/${APP_ID}/entities/${entityName}`;

    return {
        /** list(sort?, limit?, skip?, fields?) */
        list(sort, limit, skip, fields) {
            const q = buildParams({
                ...(sort && { sort }),
                ...(limit && { limit }),
                ...(skip && { skip }),
                ...(fields && { fields: Array.isArray(fields) ? fields.join(',') : fields }),
            });
            return apiFetch(`${base}${q ? `?${q}` : ''}`);
        },

        /** filter(query, sort?, limit?, skip?, fields?) */
        filter(query, sort, limit, skip, fields) {
            const q = buildParams({
                q: JSON.stringify(query),
                ...(sort && { sort }),
                ...(limit && { limit }),
                ...(skip && { skip }),
                ...(fields && { fields: Array.isArray(fields) ? fields.join(',') : fields }),
            });
            return apiFetch(`${base}?${q}`);
        },

        get(id) {
            return apiFetch(`${base}/${id}`);
        },

        create(data) {
            return apiFetch(base, { method: 'POST', body: JSON.stringify(data) });
        },

        update(id, data) {
            return apiFetch(`${base}/${id}`, { method: 'PUT', body: JSON.stringify(data) });
        },

        delete(id) {
            return apiFetch(`${base}/${id}`, { method: 'DELETE' });
        },

        bulkCreate(data) {
            return apiFetch(`${base}/bulk`, { method: 'POST', body: JSON.stringify(data) });
        },
    };
}

// ---------------------------------------------------------------------------
// entities — dynamic proxy, same interface as SDK
// ---------------------------------------------------------------------------

/** @type {Entities} */
export const entities = /** @type {any} */ (new Proxy({}, {
    get(_, entityName) {
        if (typeof entityName !== 'string' || entityName === 'then' || entityName.startsWith('_')) {
            return undefined;
        }
        return createEntityHandler(entityName);
    },
}));


// ---------------------------------------------------------------------------
// auth — local stubs (no real auth needed in local dev)
// ---------------------------------------------------------------------------

export const auth = {
    /** Returns a mock local user — always "authenticated" */
    async me() {
        return apiFetch(`/api/apps/${APP_ID}/entities/User/me`);
    },

    /** Login method for Admin panel protection */
    async login(password) {
        return apiFetch('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ password })
        });
    },

    logout() {
        // No-op locally — no tokens to clear
        console.info('[local auth] logout called (no-op in local dev)');
    },

    redirectToLogin() {
        // No-op locally — auth is bypassed
        console.info('[local auth] redirectToLogin called (no-op in local dev)');
    },

    setToken() { },
    isAuthenticated: async () => true,
};

// ---------------------------------------------------------------------------
// appLogs — no-op stub (was used for Base44 analytics)
// ---------------------------------------------------------------------------

export const appLogs = {
    logUserInApp() {
        return Promise.resolve(); // silently swallow
    },
};

// ---------------------------------------------------------------------------
// Default export — same shape as the old `base44` object
// ---------------------------------------------------------------------------

export const base44 = { entities, auth, appLogs };
export default base44;
