import { api, cancelActiveRequest, unwrap } from "./apiClient.js";
const state = {
    users: [],
    events: [],
    registrations: [],
    stats: [],
    editingEventId: null,
    sortBy: "createdAt",
    sortDirection: "DESC"
};
const form = must("messageForm");
const tableBody = must("messageTableBody");
const usersTableBody = must("usersTableBody");
const registrationsTableBody = must("registrationsTableBody");
const statsTableBody = must("statsTableBody");
const formTitle = must("formTitle");
const submitBtn = must("submitBtn");
const resetBtn = must("resetBtn");
const registrationForm = must("registrationForm");
const registrationBtn = must("registrationBtn");
const registrationUser = must("registrationUser");
const registrationEvent = must("registrationEvent");
const registrationStatus = must("registrationStatus");
const authorInput = must("authorInput");
const userForm = must("userForm");
const newUserName = must("newUserName");
const createUserBtn = must("createUserBtn");
const categorySelect = must("categorySelect");
const textInput = must("textInput");
const filterCategory = must("filterCategory");
const notice = must("notice");
attachHandlers();
void init();
function must(id) {
    const el = document.getElementById(id);
    if (!el)
        throw new Error(`Element not found: ${id}`);
    return el;
}
function attachHandlers() {
    form.addEventListener("submit", onEventSubmit);
    userForm.addEventListener("submit", onUserSubmit);
    registrationForm.addEventListener("submit", onRegistrationSubmit);
    tableBody.addEventListener("click", onEventsTableClick);
    usersTableBody.addEventListener("click", onUsersTableClick);
    registrationsTableBody.addEventListener("click", onRegistrationsTableClick);
    resetBtn.addEventListener("click", resetForm);
    must("reloadBtn").addEventListener("click", () => void loadAll());
    must("cancelBtn").addEventListener("click", () => {
        cancelActiveRequest();
        showNotice("Запит скасовано.");
    });
    filterCategory.addEventListener("change", () => void loadEvents());
    authorInput.addEventListener("change", () => { renderEvents(); });
    const tableHead = document.querySelector("thead");
    tableHead?.addEventListener("click", (e) => {
        const target = e.target;
        const colName = target.closest("th")?.getAttribute("data-colname");
        if (!colName)
            return;
        if (state.sortBy === colName)
            state.sortDirection = state.sortDirection === "ASC" ? "DESC" : "ASC";
        else {
            state.sortBy = colName;
            state.sortDirection = "ASC";
        }
        void loadEvents();
    });
}
async function init() {
    try {
        const health = unwrap(await api.health());
        showNotice(`Бекенд доступний: ${health.status}.`);
    }
    catch (e) {
        showApiError("Бекенд недоступний. Запусти npm run dev:be у першому терміналі.", e);
    }
    await loadAll();
}
async function loadAll() {
    await Promise.allSettled([loadUsers(), loadEvents(), loadRegistrations(), loadStats()]);
    fillSelects();
    renderEvents();
}
async function loadUsers() {
    setStatus("usersStatus", "loading", "Завантаження користувачів...");
    try {
        state.users = unwrap(await api.users.list());
        renderUsers();
        setStatus("usersStatus", state.users.length ? "success" : "empty", state.users.length ? "Користувачі завантажені." : "Поки немає користувачів.");
    }
    catch (e) {
        state.users = [];
        renderUsers();
        setStatus("usersStatus", "error", errorText(e));
    }
}
async function loadEvents() {
    setStatus("listStatus", "loading", "Завантаження оголошень...");
    try {
        state.events = unwrap(await api.events.detailsWithAuthors({ category: filterCategory.value, sort: state.sortBy, order: state.sortDirection, limit: 50 }));
        renderEvents();
        setStatus("listStatus", state.events.length ? "success" : "empty", state.events.length ? "Оголошення завантажені." : "Поки немає оголошень.");
    }
    catch (e) {
        state.events = [];
        renderEvents();
        setStatus("listStatus", "error", errorText(e));
    }
}
async function loadRegistrations() {
    setStatus("registrationsStatus", "loading", "Завантаження реєстрацій...");
    try {
        state.registrations = unwrap(await api.registrations.detailsAll());
        renderRegistrations();
        setStatus("registrationsStatus", state.registrations.length ? "success" : "empty", state.registrations.length ? "Реєстрації завантажені." : "Поки немає реєстрацій.");
    }
    catch (e) {
        state.registrations = [];
        renderRegistrations();
        setStatus("registrationsStatus", "error", errorText(e));
    }
}
async function loadStats() {
    setStatus("statsStatus", "loading", "Завантаження статистики...");
    try {
        state.stats = unwrap(await api.registrations.stats());
        renderStats();
        setStatus("statsStatus", state.stats.length ? "success" : "empty", state.stats.length ? "Статистика завантажена." : "Поки немає статистики.");
    }
    catch (e) {
        state.stats = [];
        renderStats();
        setStatus("statsStatus", "error", errorText(e));
    }
}
async function onEventSubmit(e) {
    e.preventDefault();
    if (!validateEventForm())
        return;
    setFormEnabled(false);
    try {
        const authorId = Number(authorInput.value);
        const dto = {
            title: textInput.value.trim().slice(0, 120),
            description: textInput.value.trim(),
            category: categorySelect.value,
            author_id: authorId
        };
        if (state.editingEventId) {
            await api.events.update(state.editingEventId, { title: dto.title, description: dto.description, category: dto.category }, authorId);
            showNotice("Оголошення оновлено.");
        }
        else {
            await api.events.create(dto, authorId);
            showNotice("Оголошення створено.");
        }
        resetForm();
        await loadAll();
    }
    catch (e) {
        showApiError("Не вдалося зберегти оголошення", e);
    }
    finally {
        setFormEnabled(true);
    }
}
async function onUserSubmit(e) {
    e.preventDefault();
    clearErrors();
    let valid = true;
    const name = newUserName.value.trim();
    if (name.length < 3) {
        showFieldError("newUserName", "newUserNameError", "Ім'я має бути не менше 3 символів");
        valid = false;
    }
    if (!valid)
        return;
    createUserBtn.disabled = true;
    try {
        const created = unwrap(await api.users.create({ name }));
        showNotice("Користувача створено.");
        userForm.reset();
        await loadUsers();
        authorInput.value = String(created.id);
        fillSelects();
        renderEvents();
    }
    catch (e) {
        showApiError("Не вдалося створити користувача", e);
    }
    finally {
        createUserBtn.disabled = false;
    }
}
async function onRegistrationSubmit(e) {
    e.preventDefault();
    registrationBtn.disabled = true;
    try {
        const user_id = Number(registrationUser.value);
        const event_id = Number(registrationEvent.value);
        const status = registrationStatus.value;
        if (!user_id || !event_id)
            throw { status: 400, message: "Оберіть користувача і подію" };
        await api.registrations.create({ user_id, event_id, status }, user_id);
        showNotice("Реєстрацію додано.");
        await loadRegistrations();
        await loadStats();
    }
    catch (e) {
        showApiError("Не вдалося додати реєстрацію", e);
    }
    finally {
        registrationBtn.disabled = false;
    }
}
function onEventsTableClick(e) {
    const target = e.target;
    const id = Number(target.dataset.id);
    const action = target.dataset.action;
    if (!id || !action)
        return;
    if (action === "details")
        void showEventDetails(id);
    if (action === "edit")
        startEdit(id);
    if (action === "delete")
        void deleteEvent(id);
}
function onUsersTableClick(e) {
    const target = e.target;
    const id = Number(target.dataset.id);
    const action = target.dataset.action;
    if (!id || !action)
        return;
    if (action === "details")
        void showUserDetails(id);
    if (action === "edit")
        void editUser(id);
    if (action === "delete")
        void deleteUser(id);
}
function onRegistrationsTableClick(e) {
    const target = e.target;
    const id = Number(target.dataset.id);
    const action = target.dataset.action;
    if (!id || !action)
        return;
    if (action === "details")
        void showRegistrationDetails(id);
    if (action === "status")
        void changeRegistrationStatus(id);
    if (action === "delete")
        void deleteRegistration(id);
}
async function showEventDetails(id) {
    try {
        const event = unwrap(await api.events.getById(id, Number(authorInput.value)));
        showNotice(`Деталі події #${event.id}: ${event.title} / ${categoryLabel(event.category)}.`);
    }
    catch (e) {
        showApiError("Не вдалося отримати деталі події", e);
    }
}
async function showUserDetails(id) {
    try {
        const user = unwrap(await api.users.getById(id));
        showNotice(`Користувач #${user.id}: ${user.name}.`);
    }
    catch (e) {
        showApiError("Не вдалося отримати користувача", e);
    }
}
async function showRegistrationDetails(id) {
    try {
        const registrationState = state.registrations.find((x) => x.id === id);
        if (!registrationState)
            return;
        const registration = unwrap(await api.registrations.getById(id, registrationState.user_id));
        showNotice(`Реєстрація #${registration.id}: user_id=${registration.user_id}, event_id=${registration.event_id}, status=${registration.status}.`);
    }
    catch (e) {
        showApiError("Не вдалося отримати реєстрацію", e);
    }
}
async function editUser(id) {
    const current = state.users.find((u) => u.id === id);
    if (!current)
        return;
    const name = prompt("Нове ім'я", current.name)?.trim();
    if (!name)
        return;
    try {
        await api.users.update(id, { name });
        showNotice("Користувача оновлено.");
        await loadAll();
    }
    catch (e) {
        showApiError("Не вдалося оновити користувача", e);
    }
}
async function deleteUser(id) {
    if (!confirm("Видалити користувача? Його оголошення та реєстрації теж видаляться."))
        return;
    try {
        await api.users.remove(id);
        showNotice("Користувача видалено.");
        await loadAll();
    }
    catch (e) {
        showApiError("Не вдалося видалити користувача", e);
    }
}
async function deleteEvent(id) {
    if (!confirm("Видалити оголошення?"))
        return;
    try {
        await api.events.remove(id, Number(authorInput.value));
        showNotice("Оголошення видалено.");
        await loadAll();
    }
    catch (e) {
        showApiError("Не вдалося видалити оголошення", e);
    }
}
async function changeRegistrationStatus(id) {
    const next = prompt("Новий статус: registered, attended або cancelled", "registered");
    if (!next)
        return;
    try {
        const registration = state.registrations.find((x) => x.id === id);
        if (!registration)
            return;
        await api.registrations.update(id, { status: next }, Number(registration.user_id));
        showNotice("Статус реєстрації оновлено.");
        await loadRegistrations();
        await loadStats();
    }
    catch (e) {
        showApiError("Не вдалося оновити реєстрацію", e);
    }
}
async function deleteRegistration(id) {
    if (!confirm("Видалити реєстрацію?"))
        return;
    try {
        const registration = state.registrations.find((x) => x.id === id);
        if (!registration)
            return;
        await api.registrations.remove(id, Number(registration.user_id));
        showNotice("Реєстрацію видалено.");
        await loadRegistrations();
        await loadStats();
    }
    catch (e) {
        showApiError("Не вдалося видалити реєстрацію", e);
    }
}
function startEdit(id) {
    const item = state.events.find((x) => x.id === id);
    if (!item)
        return;
    state.editingEventId = id;
    authorInput.value = String(item.author_id);
    categorySelect.value = item.category;
    textInput.value = item.description;
    formTitle.textContent = "Редагування оголошення";
    submitBtn.textContent = "Зберегти зміни";
    authorInput.disabled = true;
    window.scrollTo({ top: 0, behavior: "smooth" });
}
function resetForm() {
    state.editingEventId = null;
    form.reset();
    clearErrors();
    formTitle.textContent = "Написати оголошення";
    submitBtn.textContent = "Опублікувати";
    authorInput.disabled = false;
}
function renderEvents() {
    tableBody.replaceChildren();
    const currentUserId = Number(authorInput.value);
    for (const item of state.events) {
        const isOwner = currentUserId === Number(item.author_id);
        const tr = document.createElement("tr");
        appendCell(tr, item.author_name || "Анонім");
        appendCell(tr, categoryLabel(item.category));
        appendCell(tr, item.description);
        appendCell(tr, formatDate(item.createdAt));
        const actions = document.createElement("td");
        actions.append(actionButton("👁", "details", item.id, "", !isOwner, "Деталі через /events/:id доступні лише автору"), actionButton("✎", "edit", item.id, "edit-btn", !isOwner, "Редагувати може лише автор"), actionButton("🗑", "delete", item.id, "delete-btn", !isOwner, "Видалити може лише автор"));
        tr.appendChild(actions);
        tableBody.appendChild(tr);
    }
}
function renderUsers() {
    usersTableBody.replaceChildren();
    for (const user of state.users) {
        const tr = document.createElement("tr");
        appendCell(tr, String(user.id));
        appendCell(tr, user.name);
        const actions = document.createElement("td");
        actions.append(actionButton("👁", "details", user.id), actionButton("✎", "edit", user.id, "edit-btn"), actionButton("🗑", "delete", user.id, "delete-btn"));
        tr.appendChild(actions);
        usersTableBody.appendChild(tr);
    }
}
function renderRegistrations() {
    registrationsTableBody.replaceChildren();
    for (const registration of state.registrations) {
        const tr = document.createElement("tr");
        appendCell(tr, String(registration.id));
        appendCell(tr, registration.user_name);
        appendCell(tr, registration.event_title);
        appendCell(tr, statusLabel(registration.status));
        const actions = document.createElement("td");
        actions.append(actionButton("👁", "details", registration.id), actionButton("Статус", "status", registration.id, "edit-btn"), actionButton("🗑", "delete", registration.id, "delete-btn"));
        tr.appendChild(actions);
        registrationsTableBody.appendChild(tr);
    }
}
function renderStats() {
    statsTableBody.replaceChildren();
    for (const row of state.stats) {
        const tr = document.createElement("tr");
        appendCell(tr, row.event_title);
        appendCell(tr, String(Number(row.total_registrations || 0)));
        appendCell(tr, String(Number(row.registered || 0)));
        appendCell(tr, String(Number(row.attended || 0)));
        appendCell(tr, String(Number(row.cancelled || 0)));
        statsTableBody.appendChild(tr);
    }
}
function fillSelects() {
    const selectedAuthor = authorInput.value;
    fillSelect(authorInput, state.users.map((u) => ({ value: String(u.id), label: u.name })), "Спочатку створіть користувача");
    if (selectedAuthor && state.users.some((u) => String(u.id) === selectedAuthor))
        authorInput.value = selectedAuthor;
    fillSelect(registrationUser, state.users.map((u) => ({ value: String(u.id), label: u.name })), "Спочатку створіть користувача");
    fillSelect(registrationEvent, state.events.map((e) => ({ value: String(e.id), label: e.title })), "Немає подій");
}
function appendCell(row, text) {
    const td = document.createElement("td");
    td.textContent = text;
    row.appendChild(td);
    return td;
}
function actionButton(label, action, id, className = "", disabled = false, title = "") {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.action = action;
    button.dataset.id = String(id);
    button.textContent = label;
    if (className)
        button.className = className;
    if (disabled)
        button.disabled = true;
    if (title)
        button.title = title;
    return button;
}
function fillSelect(select, options, emptyLabel) {
    select.replaceChildren();
    if (!options.length) {
        const option = document.createElement("option");
        option.value = "";
        option.textContent = emptyLabel;
        select.appendChild(option);
        return;
    }
    for (const item of options) {
        const option = document.createElement("option");
        option.value = item.value;
        option.textContent = item.label;
        select.appendChild(option);
    }
}
function validateEventForm() {
    clearErrors();
    let valid = true;
    if (!Number(authorInput.value)) {
        showFieldError("authorInput", "authorError", "Спочатку створіть і оберіть користувача");
        valid = false;
    }
    if (!categorySelect.value) {
        showFieldError("categorySelect", "categoryError", "Оберіть категорію");
        valid = false;
    }
    if (textInput.value.trim().length === 0) {
        showFieldError("textInput", "textError", "Оголошення не може бути порожнім");
        valid = false;
    }
    return valid;
}
function setFormEnabled(isEnabled) {
    submitBtn.disabled = !isEnabled;
    resetBtn.disabled = !isEnabled;
}
function setStatus(id, status, message) {
    const el = must(id);
    el.className = `status ${status}`;
    el.textContent = message;
}
function showNotice(message) {
    notice.className = "notice";
    notice.textContent = message;
}
function showApiError(prefix, error) {
    notice.className = "notice error";
    notice.textContent = `${prefix}: ${errorText(error)}`;
}
function errorText(error) {
    const e = error;
    return `Помилка${e.status !== undefined ? ` (${e.status})` : ""}: ${e.message || "невідома"}${e.details ? ` — ${String(e.details)}` : ""}`;
}
function showFieldError(inputId, errorId, message) {
    must(inputId).classList.add("invalid");
    must(errorId).textContent = message;
}
function clearErrors() {
    document.querySelectorAll(".invalid").forEach((el) => el.classList.remove("invalid"));
    document.querySelectorAll(".error-text").forEach((el) => { el.textContent = ""; });
}
function categoryLabel(category) {
    const map = { announcement: "Оголошення", workshop: "Навчання", meeting: "Дозвілля", conference: "Конференція" };
    return map[category] || category || "—";
}
function statusLabel(status) {
    const map = { registered: "Зареєстровано", attended: "Відвідав/відвідала", cancelled: "Скасовано" };
    return map[status] || status || "—";
}
function formatDate(value) {
    const date = value ? new Date(value) : null;
    return date && !Number.isNaN(date.getTime()) ? date.toLocaleString("uk-UA") : "—";
}
