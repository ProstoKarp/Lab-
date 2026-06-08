import { api, cancelActiveRequest, unwrap } from "./apiClient.js";
import type { ApiErrorDto, CreateEventDto, EventCategory, EventWithAuthorDto, RegistrationStatsDto, RegistrationStatus, RegistrationWithDetailsDto, UserDto } from "./dtos.js";

type LoadStatus = "idle" | "loading" | "success" | "empty" | "error";

type AppState = {
  users: UserDto[];
  events: EventWithAuthorDto[];
  registrations: RegistrationWithDetailsDto[];
  stats: RegistrationStatsDto[];
  editingEventId: number | null;
  sortBy: "author_name" | "category" | "createdAt";
  sortDirection: "ASC" | "DESC";
};

const state: AppState = {
  users: [],
  events: [],
  registrations: [],
  stats: [],
  editingEventId: null,
  sortBy: "createdAt",
  sortDirection: "DESC"
};

const form = must<HTMLFormElement>("messageForm");
const tableBody = must<HTMLTableSectionElement>("messageTableBody");
const usersTableBody = must<HTMLTableSectionElement>("usersTableBody");
const registrationsTableBody = must<HTMLTableSectionElement>("registrationsTableBody");
const statsTableBody = must<HTMLTableSectionElement>("statsTableBody");
const formTitle = must<HTMLElement>("formTitle");
const submitBtn = must<HTMLButtonElement>("submitBtn");
const resetBtn = must<HTMLButtonElement>("resetBtn");
const registrationForm = must<HTMLFormElement>("registrationForm");
const registrationBtn = must<HTMLButtonElement>("registrationBtn");
const registrationUser = must<HTMLSelectElement>("registrationUser");
const registrationEvent = must<HTMLSelectElement>("registrationEvent");
const registrationStatus = must<HTMLSelectElement>("registrationStatus");
const authorInput = must<HTMLSelectElement>("authorInput");
const userForm = must<HTMLFormElement>("userForm");
const newUserName = must<HTMLInputElement>("newUserName");
const createUserBtn = must<HTMLButtonElement>("createUserBtn");
const categorySelect = must<HTMLSelectElement>("categorySelect");
const textInput = must<HTMLTextAreaElement>("textInput");
const filterCategory = must<HTMLSelectElement>("filterCategory");
const notice = must<HTMLElement>("notice");

attachHandlers();
void init();

function must<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Element not found: ${id}`);
  return el as T;
}

function attachHandlers(): void {
  form.addEventListener("submit", onEventSubmit);
  userForm.addEventListener("submit", onUserSubmit);
  registrationForm.addEventListener("submit", onRegistrationSubmit);
  tableBody.addEventListener("click", onEventsTableClick);
  usersTableBody.addEventListener("click", onUsersTableClick);
  registrationsTableBody.addEventListener("click", onRegistrationsTableClick);
  resetBtn.addEventListener("click", resetForm);
  must<HTMLButtonElement>("reloadBtn").addEventListener("click", () => void loadAll());
  must<HTMLButtonElement>("cancelBtn").addEventListener("click", () => {
    cancelActiveRequest();
    showNotice("Запит скасовано.");
  });
  filterCategory.addEventListener("change", () => void loadEvents());
  authorInput.addEventListener("change", () => { renderEvents(); });

  const tableHead = document.querySelector("thead");
  tableHead?.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    const colName = target.closest("th")?.getAttribute("data-colname") as AppState["sortBy"] | null;
    if (!colName) return;
    if (state.sortBy === colName) state.sortDirection = state.sortDirection === "ASC" ? "DESC" : "ASC";
    else {
      state.sortBy = colName;
      state.sortDirection = "ASC";
    }
    void loadEvents();
  });
}

async function init(): Promise<void> {
  try {
    const health = unwrap(await api.health());
    showNotice(`Бекенд доступний: ${health.status}.`);
  } catch (e) {
    showApiError("Бекенд недоступний. Запусти npm run dev:be у першому терміналі.", e);
  }
  await loadAll();
}

async function loadAll(): Promise<void> {
  await Promise.allSettled([loadUsers(), loadEvents(), loadRegistrations(), loadStats()]);
  fillSelects();
  renderEvents();
}

async function loadUsers(): Promise<void> {
  setStatus("usersStatus", "loading", "Завантаження користувачів...");
  try {
    state.users = unwrap(await api.users.list());
    renderUsers();
    setStatus("usersStatus", state.users.length ? "success" : "empty", state.users.length ? "Користувачі завантажені." : "Поки немає користувачів.");
  } catch (e) {
    state.users = [];
    renderUsers();
    setStatus("usersStatus", "error", errorText(e));
  }
}

async function loadEvents(): Promise<void> {
  setStatus("listStatus", "loading", "Завантаження оголошень...");
  try {
    state.events = unwrap(await api.events.detailsWithAuthors({ category: filterCategory.value, sort: state.sortBy, order: state.sortDirection, limit: 50 }));
    renderEvents();
    setStatus("listStatus", state.events.length ? "success" : "empty", state.events.length ? "Оголошення завантажені." : "Поки немає оголошень.");
  } catch (e) {
    state.events = [];
    renderEvents();
    setStatus("listStatus", "error", errorText(e));
  }
}

async function loadRegistrations(): Promise<void> {
  setStatus("registrationsStatus", "loading", "Завантаження реєстрацій...");
  try {
    state.registrations = unwrap(await api.registrations.detailsAll());
    renderRegistrations();
    setStatus("registrationsStatus", state.registrations.length ? "success" : "empty", state.registrations.length ? "Реєстрації завантажені." : "Поки немає реєстрацій.");
  } catch (e) {
    state.registrations = [];
    renderRegistrations();
    setStatus("registrationsStatus", "error", errorText(e));
  }
}

async function loadStats(): Promise<void> {
  setStatus("statsStatus", "loading", "Завантаження статистики...");
  try {
    state.stats = unwrap(await api.registrations.stats());
    renderStats();
    setStatus("statsStatus", state.stats.length ? "success" : "empty", state.stats.length ? "Статистика завантажена." : "Поки немає статистики.");
  } catch (e) {
    state.stats = [];
    renderStats();
    setStatus("statsStatus", "error", errorText(e));
  }
}

async function onEventSubmit(e: Event): Promise<void> {
  e.preventDefault();
  if (!validateEventForm()) return;
  setFormEnabled(false);
  try {
    const authorId = Number(authorInput.value);
    const dto: CreateEventDto = {
      title: textInput.value.trim().slice(0, 120),
      description: textInput.value.trim(),
      category: categorySelect.value as EventCategory,
      author_id: authorId
    };
    if (state.editingEventId) {
      await api.events.update(state.editingEventId, { title: dto.title, description: dto.description, category: dto.category }, authorId);
      showNotice("Оголошення оновлено.");
    } else {
      await api.events.create(dto);
      showNotice("Оголошення створено.");
    }
    resetForm();
    await loadAll();
  } catch (e) {
    showApiError("Не вдалося зберегти оголошення", e);
  } finally {
    setFormEnabled(true);
  }
}

async function onUserSubmit(e: Event): Promise<void> {
  e.preventDefault();
  clearErrors();
  let valid = true;
  const name = newUserName.value.trim();
  if (name.length < 3) { showFieldError("newUserName", "newUserNameError", "Ім'я має бути не менше 3 символів"); valid = false; }
  if (!valid) return;
  createUserBtn.disabled = true;
  try {
    const created = unwrap(await api.users.create({ name }));
    showNotice("Користувача створено.");
    userForm.reset();
    await loadUsers();
    authorInput.value = String(created.id);
    fillSelects();
    renderEvents();
  } catch (e) {
    showApiError("Не вдалося створити користувача", e);
  } finally {
    createUserBtn.disabled = false;
  }
}

async function onRegistrationSubmit(e: Event): Promise<void> {
  e.preventDefault();
  registrationBtn.disabled = true;
  try {
    const user_id = Number(registrationUser.value);
    const event_id = Number(registrationEvent.value);
    const status = registrationStatus.value as RegistrationStatus;
    if (!user_id || !event_id) throw { status: 400, message: "Оберіть користувача і подію" } as ApiErrorDto;
    await api.registrations.create({ user_id, event_id, status }, user_id);
    showNotice("Реєстрацію додано.");
    await loadRegistrations();
    await loadStats();
  } catch (e) {
    showApiError("Не вдалося додати реєстрацію", e);
  } finally {
    registrationBtn.disabled = false;
  }
}

function onEventsTableClick(e: Event): void {
  const target = e.target as HTMLElement;
  const id = Number(target.dataset.id);
  const action = target.dataset.action;
  if (!id || !action) return;
  if (action === "details") void showEventDetails(id);
  if (action === "edit") startEdit(id);
  if (action === "delete") void deleteEvent(id);
}

function onUsersTableClick(e: Event): void {
  const target = e.target as HTMLElement;
  const id = Number(target.dataset.id);
  const action = target.dataset.action;
  if (!id || !action) return;
  if (action === "details") void showUserDetails(id);
  if (action === "edit") void editUser(id);
  if (action === "delete") void deleteUser(id);
}

function onRegistrationsTableClick(e: Event): void {
  const target = e.target as HTMLElement;
  const id = Number(target.dataset.id);
  const action = target.dataset.action;
  if (!id || !action) return;
  if (action === "details") void showRegistrationDetails(id);
  if (action === "status") void changeRegistrationStatus(id);
  if (action === "delete") void deleteRegistration(id);
}

async function showEventDetails(id: number): Promise<void> {
  try {
    const event = unwrap(await api.events.getById(id));
    showNotice(`Деталі події #${event.id}: ${event.title} / ${categoryLabel(event.category)}.`);
  } catch (e) { showApiError("Не вдалося отримати деталі події", e); }
}

async function showUserDetails(id: number): Promise<void> {
  try {
    const user = unwrap(await api.users.getById(id));
    showNotice(`Користувач #${user.id}: ${user.name}.`);
  } catch (e) { showApiError("Не вдалося отримати користувача", e); }
}

async function showRegistrationDetails(id: number): Promise<void> {
  try {
    const registration = unwrap(await api.registrations.getById(id));
    showNotice(`Реєстрація #${registration.id}: user_id=${registration.user_id}, event_id=${registration.event_id}, status=${registration.status}.`);
  } catch (e) { showApiError("Не вдалося отримати реєстрацію", e); }
}

async function editUser(id: number): Promise<void> {
  const current = state.users.find((u) => u.id === id);
  if (!current) return;
  const name = prompt("Нове ім'я", current.name)?.trim();
  if (!name) return;
  try {
    await api.users.update(id, { name });
    showNotice("Користувача оновлено.");
    await loadAll();
  } catch (e) { showApiError("Не вдалося оновити користувача", e); }
}

async function deleteUser(id: number): Promise<void> {
  if (!confirm("Видалити користувача? Його оголошення та реєстрації теж видаляться.")) return;
  try {
    await api.users.remove(id);
    showNotice("Користувача видалено.");
    await loadAll();
  } catch (e) { showApiError("Не вдалося видалити користувача", e); }
}

async function deleteEvent(id: number): Promise<void> {
  if (!confirm("Видалити оголошення?")) return;
  try {
    await api.events.remove(id, Number(authorInput.value));
    showNotice("Оголошення видалено.");
    await loadAll();
  } catch (e) { showApiError("Не вдалося видалити оголошення", e); }
}

async function changeRegistrationStatus(id: number): Promise<void> {
  const next = prompt("Новий статус: registered, attended або cancelled", "registered") as RegistrationStatus | null;
  if (!next) return;
  try {
    const registration = state.registrations.find((x) => x.id === id);
    if (!registration) return;
    await api.registrations.update(id, { status: next }, Number(registration.user_id));
    showNotice("Статус реєстрації оновлено.");
    await loadRegistrations();
    await loadStats();
  } catch (e) { showApiError("Не вдалося оновити реєстрацію", e); }
}

async function deleteRegistration(id: number): Promise<void> {
  if (!confirm("Видалити реєстрацію?")) return;
  try {
    const registration = state.registrations.find((x) => x.id === id);
    if (!registration) return;
    await api.registrations.remove(id, Number(registration.user_id));
    showNotice("Реєстрацію видалено.");
    await loadRegistrations();
    await loadStats();
  } catch (e) { showApiError("Не вдалося видалити реєстрацію", e); }
}

function startEdit(id: number): void {
  const item = state.events.find((x) => x.id === id);
  if (!item) return;
  state.editingEventId = id;
  authorInput.value = String(item.author_id);
  categorySelect.value = item.category;
  textInput.value = item.description;
  formTitle.textContent = "Редагування оголошення";
  submitBtn.textContent = "Зберегти зміни";
  authorInput.disabled = true;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function resetForm(): void {
  state.editingEventId = null;
  form.reset();
  clearErrors();
  formTitle.textContent = "Написати оголошення";
  submitBtn.textContent = "Опублікувати";
  authorInput.disabled = false;
}

function renderEvents(): void {
  tableBody.innerHTML = "";
  const currentUserId = Number(authorInput.value);
  for (const item of state.events) {
    const isOwner = currentUserId === Number(item.author_id);
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(item.author_name || "Анонім")}</td>
      <td>${escapeHtml(categoryLabel(item.category))}</td>
      <td>${escapeHtml(item.description)}</td>
      <td>${formatDate(item.createdAt)}</td>
      <td>
        <button type="button" data-action="details" data-id="${item.id}">👁</button>
        <button type="button" class="edit-btn" data-action="edit" data-id="${item.id}" ${isOwner ? "" : "disabled title=\"Редагувати може лише автор\""}>✎</button>
        <button type="button" class="delete-btn" data-action="delete" data-id="${item.id}" ${isOwner ? "" : "disabled title=\"Видалити може лише автор\""}>🗑</button>
      </td>`;
    tableBody.appendChild(tr);
  }
}

function renderUsers(): void {
  usersTableBody.innerHTML = "";
  for (const user of state.users) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${user.id}</td>
      <td>${escapeHtml(user.name)}</td>
      <td>
        <button type="button" data-action="details" data-id="${user.id}">👁</button>
        <button type="button" class="edit-btn" data-action="edit" data-id="${user.id}">✎</button>
        <button type="button" class="delete-btn" data-action="delete" data-id="${user.id}">🗑</button>
      </td>`;
    usersTableBody.appendChild(tr);
  }
}

function renderRegistrations(): void {
  registrationsTableBody.innerHTML = "";
  for (const registration of state.registrations) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${registration.id}</td>
      <td>${escapeHtml(registration.user_name)}</td>
      <td>${escapeHtml(registration.event_title)}</td>
      <td>${escapeHtml(statusLabel(registration.status))}</td>
      <td>
        <button type="button" data-action="details" data-id="${registration.id}">👁</button>
        <button type="button" class="edit-btn" data-action="status" data-id="${registration.id}">Статус</button>
        <button type="button" class="delete-btn" data-action="delete" data-id="${registration.id}">🗑</button>
      </td>`;
    registrationsTableBody.appendChild(tr);
  }
}

function renderStats(): void {
  statsTableBody.innerHTML = "";
  for (const row of state.stats) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(row.event_title)}</td>
      <td>${Number(row.total_registrations || 0)}</td>
      <td>${Number(row.registered || 0)}</td>
      <td>${Number(row.attended || 0)}</td>
      <td>${Number(row.cancelled || 0)}</td>`;
    statsTableBody.appendChild(tr);
  }
}

function fillSelects(): void {
  const selectedAuthor = authorInput.value;
  authorInput.innerHTML = state.users.length
    ? state.users.map((u) => `<option value="${u.id}">${escapeHtml(u.name)}</option>`).join("")
    : `<option value="">Спочатку створіть користувача</option>`;
  if (selectedAuthor && state.users.some((u) => String(u.id) === selectedAuthor)) authorInput.value = selectedAuthor;
  registrationUser.innerHTML = state.users.length
    ? state.users.map((u) => `<option value="${u.id}">${escapeHtml(u.name)}</option>`).join("")
    : `<option value="">Спочатку створіть користувача</option>`;
  registrationEvent.innerHTML = state.events.length
    ? state.events.map((e) => `<option value="${e.id}">${escapeHtml(e.title)}</option>`).join("")
    : `<option value="">Немає подій</option>`;
}

function validateEventForm(): boolean {
  clearErrors();
  let valid = true;
  if (!Number(authorInput.value)) { showFieldError("authorInput", "authorError", "Спочатку створіть і оберіть користувача"); valid = false; }
  if (!categorySelect.value) { showFieldError("categorySelect", "categoryError", "Оберіть категорію"); valid = false; }
  if (textInput.value.trim().length === 0) { showFieldError("textInput", "textError", "Оголошення не може бути порожнім"); valid = false; }
  return valid;
}

function setFormEnabled(isEnabled: boolean): void {
  submitBtn.disabled = !isEnabled;
  resetBtn.disabled = !isEnabled;
}

function setStatus(id: string, status: LoadStatus, message: string): void {
  const el = must<HTMLElement>(id);
  el.className = `status ${status}`;
  el.textContent = message;
}

function showNotice(message: string): void {
  notice.className = "notice";
  notice.textContent = message;
}

function showApiError(prefix: string, error: unknown): void {
  notice.className = "notice error";
  notice.textContent = `${prefix}: ${errorText(error)}`;
}

function errorText(error: unknown): string {
  const e = error as Partial<ApiErrorDto>;
  return `Помилка${e.status !== undefined ? ` (${e.status})` : ""}: ${e.message || "невідома"}${e.details ? ` — ${String(e.details)}` : ""}`;
}

function showFieldError(inputId: string, errorId: string, message: string): void {
  must<HTMLElement>(inputId).classList.add("invalid");
  must<HTMLElement>(errorId).textContent = message;
}

function clearErrors(): void {
  document.querySelectorAll(".invalid").forEach((el) => el.classList.remove("invalid"));
  document.querySelectorAll(".error-text").forEach((el) => { el.textContent = ""; });
}

function categoryLabel(category: string): string {
  const map: Record<string, string> = { announcement: "Оголошення", workshop: "Навчання", meeting: "Дозвілля", conference: "Конференція" };
  return map[category] || category || "—";
}

function statusLabel(status: string): string {
  const map: Record<string, string> = { registered: "Зареєстровано", attended: "Відвідав/відвідала", cancelled: "Скасовано" };
  return map[status] || status || "—";
}

function formatDate(value: string): string {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date.toLocaleString("uk-UA") : "—";
}

function escapeHtml(str: string): string {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
