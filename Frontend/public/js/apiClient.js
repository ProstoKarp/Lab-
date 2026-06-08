import { API_BASE_URL } from "./config.js";
const activeControllers = new Set();
function toQuery(params) {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "")
            search.set(key, String(value));
    });
    const query = search.toString();
    return query ? `?${query}` : "";
}
async function request(path, options = {}, timeoutMs = 15000) {
    const controller = new AbortController();
    activeControllers.add(controller);
    const timer = window.setTimeout(() => controller.abort(), timeoutMs);
    let response;
    try {
        response = await fetch(`${API_BASE_URL}${path}`, { ...options, signal: controller.signal });
    }
    catch (e) {
        const err = e;
        const apiError = {
            status: 0,
            message: err.name === "AbortError" ? "Запит скасовано вручну або перевищено таймаут 15 секунд" : "Помилка мережі або CORS",
            details: err.message
        };
        throw apiError;
    }
    finally {
        window.clearTimeout(timer);
        activeControllers.delete(controller);
    }
    if (response.status === 204)
        return null;
    const rawText = await response.text();
    if (response.ok) {
        if (!rawText)
            return null;
        return JSON.parse(rawText);
    }
    let payload = null;
    try {
        payload = rawText ? JSON.parse(rawText) : null;
    }
    catch {
        payload = null;
    }
    const apiError = {
        status: response.status,
        message: payload?.error?.message || payload?.message || "HTTP помилка",
        details: payload?.error?.details || rawText || `HTTP ${response.status}`,
        errors: payload?.error?.errors || null
    };
    throw apiError;
}
export function cancelActiveRequest() {
    activeControllers.forEach((controller) => controller.abort());
    activeControllers.clear();
}
export const unwrap = (response) => response.data;
function withUserHeader(method, currentUserId, body) {
    const headers = { "X-Demo-UserId": String(currentUserId) };
    if (body !== undefined)
        headers["Content-Type"] = "application/json";
    return { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined };
}
export const api = {
    health: () => request("/health"),
    users: {
        list: () => request("/users?sort=id&order=ASC&limit=100"),
        getById: (id) => request(`/users/${encodeURIComponent(id)}`),
        create: (dto) => request("/users", json("POST", dto)),
        update: (id, dto) => request(`/users/${encodeURIComponent(id)}`, json("PUT", dto)),
        remove: (id) => request(`/users/${encodeURIComponent(id)}`, { method: "DELETE" })
    },
    events: {
        list: (params = {}) => request(`/events${toQuery({ limit: 50, ...params })}`),
        detailsWithAuthors: (params = {}) => request(`/events/details/with-authors${toQuery({ limit: 50, ...params })}`),
        getById: (id, currentUserId) => request(`/events/${encodeURIComponent(id)}`, withUserHeader("GET", currentUserId)),
        create: (dto, currentUserId) => request("/events", withUserHeader("POST", currentUserId, dto)),
        update: (id, dto, currentUserId) => request(`/events/${encodeURIComponent(id)}`, withUserHeader("PUT", currentUserId, dto)),
        remove: (id, currentUserId) => request(`/events/${encodeURIComponent(id)}`, withUserHeader("DELETE", currentUserId))
    },
    registrations: {
        list: () => request("/registrations?sort=createdAt&order=DESC&limit=100"),
        detailsAll: () => request("/registrations/details/all?sort=createdAt&order=DESC&limit=100"),
        getById: (id, currentUserId) => request(`/registrations/${encodeURIComponent(id)}`, withUserHeader("GET", currentUserId)),
        create: (dto, currentUserId) => request("/registrations", withUserHeader("POST", currentUserId, dto)),
        update: (id, dto, currentUserId) => request(`/registrations/${encodeURIComponent(id)}`, withUserHeader("PUT", currentUserId, dto)),
        remove: (id, currentUserId) => request(`/registrations/${encodeURIComponent(id)}`, withUserHeader("DELETE", currentUserId)),
        stats: () => request("/registrations/stats/per-event")
    }
};
function json(method, body) {
    return { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) };
}
