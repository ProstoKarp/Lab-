import { API_BASE_URL } from "./config.js";
import type {
  ApiErrorDto,
  ApiResponse,
  CreateEventDto,
  CreateRegistrationDto,
  CreateUserDto,
  EventDto,
  EventWithAuthorDto,
  RegistrationDto,
  RegistrationStatsDto,
  RegistrationWithDetailsDto,
  UpdateEventDto,
  UpdateRegistrationDto,
  UpdateUserDto,
  UserDto
} from "./dtos.js";

const activeControllers = new Set<AbortController>();

function toQuery(params: Record<string, string | number | undefined | null>): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") search.set(key, String(value));
  });
  const query = search.toString();
  return query ? `?${query}` : "";
}

async function request<T>(path: string, options: RequestInit = {}, timeoutMs = 15000): Promise<T> {
  const controller = new AbortController();
  activeControllers.add(controller);
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...options, signal: controller.signal });
  } catch (e) {
    const err = e as Error;
    const apiError: ApiErrorDto = {
      status: 0,
      message: err.name === "AbortError" ? "Запит скасовано вручну або перевищено таймаут 15 секунд" : "Помилка мережі або CORS",
      details: err.message
    };
    throw apiError;
  } finally {
    window.clearTimeout(timer);
    activeControllers.delete(controller);
  }

  if (response.status === 204) return null as T;
  const rawText = await response.text();

  if (response.ok) {
    if (!rawText) return null as T;
    return JSON.parse(rawText) as T;
  }

  let payload: any = null;
  try { payload = rawText ? JSON.parse(rawText) : null; } catch { payload = null; }
  const apiError: ApiErrorDto = {
    status: response.status,
    message: payload?.error?.message || payload?.message || "HTTP помилка",
    details: payload?.error?.details || rawText || `HTTP ${response.status}`,
    errors: payload?.error?.errors || null
  };
  throw apiError;
}

export function cancelActiveRequest(): void {
  activeControllers.forEach((controller) => controller.abort());
  activeControllers.clear();
}
export const unwrap = <T>(response: ApiResponse<T>): T => response.data;

function withUserHeader(method: "GET" | "POST" | "PUT" | "DELETE", currentUserId: number, body?: unknown): RequestInit {
  const headers: Record<string, string> = { "X-Demo-UserId": String(currentUserId) };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  return { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined };
}

export const api = {
  health: () => request<ApiResponse<{ status: string; timestamp: string; uptime: number }>>("/health"),
  users: {
    list: () => request<ApiResponse<UserDto[]>>("/users?sort=id&order=ASC&limit=100"),
    getById: (id: number) => request<ApiResponse<UserDto>>(`/users/${encodeURIComponent(id)}`),
    create: (dto: CreateUserDto) => request<ApiResponse<UserDto>>("/users", json("POST", dto)),
    update: (id: number, dto: UpdateUserDto) => request<ApiResponse<UserDto>>(`/users/${encodeURIComponent(id)}`, json("PUT", dto)),
    remove: (id: number) => request<null>(`/users/${encodeURIComponent(id)}`, { method: "DELETE" })
  },
  events: {
    list: (params: { category?: string; sort?: string; order?: string; limit?: number } = {}) => request<ApiResponse<EventDto[]>>(`/events${toQuery({ limit: 50, ...params })}`),
    detailsWithAuthors: (params: { category?: string; sort?: string; order?: string; limit?: number } = {}) => request<ApiResponse<EventWithAuthorDto[]>>(`/events/details/with-authors${toQuery({ limit: 50, ...params })}`),
    getById: (id: number, currentUserId: number) => request<ApiResponse<EventDto>>(`/events/${encodeURIComponent(id)}`, withUserHeader("GET", currentUserId)),
    create: (dto: CreateEventDto, currentUserId: number) => request<ApiResponse<EventDto>>("/events", withUserHeader("POST", currentUserId, dto)),
    update: (id: number, dto: UpdateEventDto, currentUserId: number) => request<ApiResponse<EventDto>>(`/events/${encodeURIComponent(id)}`, withUserHeader("PUT", currentUserId, dto)),
    remove: (id: number, currentUserId: number) => request<null>(`/events/${encodeURIComponent(id)}`, withUserHeader("DELETE", currentUserId))
  },
  registrations: {
    list: () => request<ApiResponse<RegistrationDto[]>>("/registrations?sort=createdAt&order=DESC&limit=100"),
    detailsAll: () => request<ApiResponse<RegistrationWithDetailsDto[]>>("/registrations/details/all?sort=createdAt&order=DESC&limit=100"),
    getById: (id: number, currentUserId: number) => request<ApiResponse<RegistrationDto>>(`/registrations/${encodeURIComponent(id)}`, withUserHeader("GET", currentUserId)),
    create: (dto: CreateRegistrationDto, currentUserId: number) => request<ApiResponse<RegistrationDto>>("/registrations", withUserHeader("POST", currentUserId, dto)),
    update: (id: number, dto: UpdateRegistrationDto, currentUserId: number) => request<ApiResponse<RegistrationDto>>(`/registrations/${encodeURIComponent(id)}`, withUserHeader("PUT", currentUserId, dto)),
    remove: (id: number, currentUserId: number) => request<null>(`/registrations/${encodeURIComponent(id)}`, withUserHeader("DELETE", currentUserId)),
    stats: () => request<ApiResponse<RegistrationStatsDto[]>>("/registrations/stats/per-event")
  }
};

function json(method: "POST" | "PUT" | "PATCH", body: unknown): RequestInit {
  return { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) };
}
