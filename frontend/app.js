
const API_URL = "http://localhost:3000/api";

const state = {
    events: [],
    editingId: null,
    sortBy: "date",      
    sortDirection: "asc" 
};

const form = document.getElementById("messageForm");
const tableBody = document.getElementById("messageTableBody");
const formTitle = document.getElementById("formTitle");
const submitBtn = document.getElementById("submitBtn");
const resetBtn = document.getElementById("resetBtn");

const authorInput = document.getElementById("authorInput");
const categorySelect = document.getElementById("categorySelect");
const textInput = document.getElementById("textInput");

(async function init() {
    attachHandlers();
    await fetchEvents();
    render();
})();

function attachHandlers() {
    form.addEventListener("submit", onSubmit);
    tableBody.addEventListener("click", onTableClick);
    resetBtn.addEventListener("click", resetForm);

    const tableHead = document.querySelector("thead");
    if (tableHead) {
        tableHead.addEventListener("click", (e) => {
            const colName = e.target.closest("th")?.dataset.colname;
            if (!colName) return; 

            if (state.sortBy === colName) {
                state.sortDirection = state.sortDirection === "asc" ? "desc" : "asc";
            } else {
                state.sortBy = colName;
                state.sortDirection = "asc";
            }

            render(); 
        });
    }
}

async function fetchEvents() {
    try {
        const res = await fetch(`${API_URL}/events`);
        const result = await res.json();
        const rawEvents = result.data || [];

        const usersRes = await fetch(`${API_URL}/users`);
        const usersResult = await usersRes.json();
        
        const users = usersResult.data || usersResult.items || (Array.isArray(usersResult) ? usersResult : []);

        state.events = rawEvents.map(event => {
            const foundUser = users.find(u => u.id === event.author_id);
            
            return {
                ...event,
                author: foundUser ? foundUser.name : `Користувач (ID: ${event.author_id})`
            };
        });

    } catch (err) {
        console.error("Помилка завантаження подій", err);
    }
}

async function onSubmit(e) {
    e.preventDefault();

    if (!validate()) return;

    const dto = await prepareDto();
    if (!dto) return;

    if (state.editingId) {
        await updateEvent(state.editingId, dto);
    } else {
        await createEvent(dto);
    }

    await fetchEvents();
    render();
    resetForm();
}

function onTableClick(e) {
    const deleteId = e.target.dataset.delete;
    const editId = e.target.dataset.edit;

    if (deleteId) {
        if (confirm("Ви впевнені, що хочете видалити оголошення?")) {
            deleteEvent(deleteId);
        }
    }

    if (editId) {
        startEdit(editId);
    }
}

async function createEvent(dto) {
    try {
        const res = await fetch(`${API_URL}/events`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dto)
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error?.message || "Failed to create event");
        }
    } catch (err) {
        console.error("Помилка створення події", err);
        alert("Помилка при збереженні: " + err.message);
    }
}

async function updateEvent(id, dto) {
    try {
        const res = await fetch(`${API_URL}/events/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dto)
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error?.message || "Failed to update event");
        }
    } catch (err) {
        console.error("Помилка оновлення події", err);
        alert("Помилка при оновленні: " + err.message);
    }
}

async function deleteEvent(id) {
    try {
        const res = await fetch(`${API_URL}/events/${id}`, {
            method: "DELETE"
        });

        if (!res.ok) {
            throw new Error("Failed to delete event");
        }

        await fetchEvents();
        render();
    } catch (err) {
        console.error("Помилка видалення події", err);
        alert("Помилка при видаленні: " + err.message);
    }
}

async function prepareDto() {
    const categoryMap = {
        "Оголошення": "announcement",
        "Навчання": "workshop",
        "Дозвілля": "meeting"
    };

    const backendCategory =
        categoryMap[categorySelect.value] || categorySelect.value;

    const authorName = authorInput.value.trim();
    let authorId = null;

    try {
        const usersResponse = await fetch(`${API_URL}/users`);
        const usersResult = await usersResponse.json();
        const users = usersResult.data || [];

        const foundUser = users.find(
            (u) => u.name.toLowerCase() === authorName.toLowerCase()
        );

        if (foundUser) {
            authorId = foundUser.id;
        } else {
            const createUserResponse = await fetch(`${API_URL}/users`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: authorName,
                    email: `${authorName
                        .toLowerCase()
                        .replace(/\s+/g, "")}_${Date.now()}@example.com`
                })
            });

            const newUser = await createUserResponse.json();
            authorId = newUser.id || newUser.data?.id;
        }
    } catch (err) {
        console.error("Помилка обработки автора", err);
        authorId = 1;
    }

    return {
        title: textInput.value.substring(0, 50),
        description: textInput.value.trim(),
        category: backendCategory,
        author_id: Number(authorId || 1)
    };
}
function render() {
    tableBody.innerHTML = "";

    let sortedEvents = [...state.events];

    sortedEvents.sort((a, b) => {
        let result = 0;

        switch (state.sortBy) {
            case "author":
                const authorA = a.author || "Анонім";
                const authorB = b.author || "Анонім";
                result = authorA.localeCompare(authorB, "uk-UA");
                break;

            case "category":
                const catA = a.category || "";
                const catB = b.category || "";
                result = catA.localeCompare(catB, "uk-UA");
                break;

            case "date":
            default:
                const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
                const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
                result = dateA - dateB;
                break;
        }

        return state.sortDirection === "asc" ? result : -result;
    });

    sortedEvents.forEach((item) => {
        const dateStr = item.createdAt
            ? new Date(item.createdAt).toLocaleString("uk-UA")
            : "---";

        const authorDisplay = item.author || "Анонім";

        const displayCategoryMap = {
            "announcement": "Оголошення",
            "workshop": "Навчання",
            "meeting": "Дозвілля"
        };
        const categoryDisplay = displayCategoryMap[item.category] || item.category;

        tableBody.innerHTML += `
            <tr>
                <td>${escapeHtml(String(authorDisplay))}</td>
                <td>${escapeHtml(categoryDisplay)}</td>
                <td>${escapeHtml(item.description)}</td>
                <td>${dateStr}</td>
                <td>
                    <button type="button" data-edit="${item.id}">✎</button>
                    <button type="button" data-delete="${item.id}">🗑</button>
                </td>
            </tr>
        `;
    });
}


function startEdit(id) {
    const item = state.events.find(
        (x) => String(x.id) === String(id)
    );

    if (!item) return;

    state.editingId = id;

    const reverseCategoryMap = {
        announcement: "Оголошення",
        workshop: "Навчання",
        meeting: "Дозвілля"
    };

    authorInput.value =
        item.author || `ID: ${item.author_id}`;
    categorySelect.value =
        reverseCategoryMap[item.category] || item.category;
    textInput.value = item.description;

    formTitle.textContent = "Редагування оголошення";
    submitBtn.textContent = "Зберегти зміни";
}

function resetForm() {
    state.editingId = null;
    form.reset();
    clearErrors();

    formTitle.textContent = "Нове оголошення";
    submitBtn.textContent = "Додати";
    authorInput.focus();
}

function validate() {
    clearErrors();
    let valid = true;

    if (authorInput.value.trim().length < 3) {
        showError(
            "authorInput",
            "authorError",
            "Ім'я має бути не менше 3 символів"
        );
        valid = false;
    }

    if (!categorySelect.value) {
        showError(
            "categorySelect",
            "categoryError",
            "Оберіть категорію"
        );
        valid = false;
    }

    if (textInput.value.trim().length === 0) {
        showError(
            "textInput",
            "textError",
            "Оголошення не може бути порожнім"
        );
        valid = false;
    }

    return valid;
}

function showError(inputId, errorId, message) {
    const inputEl = document.getElementById(inputId);

    if (inputEl) {
        inputEl.classList.add("invalid");
    }

    const errorEl = document.getElementById(errorId);

    if (errorEl) {
        errorEl.textContent = message;
    }
}

function clearErrors() {
    document
        .querySelectorAll(".invalid")
        .forEach((el) => el.classList.remove("invalid"));

    document
        .querySelectorAll(".error-text")
        .forEach((el) => (el.textContent = ""));
}

function escapeHtml(str) {
    if (!str) return "";

    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

