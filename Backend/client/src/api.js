export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

const TOKEN_KEY = 'token';

export function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
    if (token) {
        localStorage.setItem(TOKEN_KEY, token);
    } else {
        localStorage.removeItem(TOKEN_KEY);
    }
}

export function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
}

/**
 * @param {string} path - ścieżka od root API, np. "/api/animals"
 * @param {RequestInit} [options]
 */
export async function authFetch(path, options = {}) {
    const headers = { ...(options.headers || {}) };
    const token = getToken();
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }
    if (options.body && typeof options.body === 'string' && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }
    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    if (res.status === 401 || res.status === 403) {
        clearToken();
        if (!window.location.pathname.includes('/login')) {
            window.location.assign('/login');
        }
    }
    return res;
}
