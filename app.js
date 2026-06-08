const API_URL = 'http://localhost:3000/api/messages';

let messages = [];

// Елементи DOM
const messageForm = document.getElementById('messageForm');
const tableBody = document.getElementById('messageTableBody');
const submitBtn = document.getElementById('submitBtn');
const authorInput = document.getElementById('authorInput');
const categorySelect = document.getElementById('categorySelect');
const textInput = document.getElementById('textInput');

// Елементи для відображення помилок
const authorError = document.getElementById('authorError');
const categoryError = document.getElementById('categoryError');
const textError = document.getElementById('textError');

// Функція валідації
function validateForm(data) {
    const errors = {};

    if (!data.author || data.author.trim().length < 3) {
        errors.author = 'Автор повинен містити мінімум 3 символи';
    }

    if (!data.category) {
        errors.category = 'Виберіть категорію';
    }

    if (!data.text || data.text.trim().length < 5) {
        errors.text = 'Текст повинен містити мінімум 5 символів';
    }

    return errors;
}

// Функція очищення повідомлень про помилки
function clearErrors() {
    authorError.textContent = '';
    categoryError.textContent = '';
    textError.textContent = '';
}

// Функція відображення помилок
function displayErrors(errors) {
    clearErrors();
    if (errors.author) authorError.textContent = errors.author;
    if (errors.category) categoryError.textContent = errors.category;
    if (errors.text) textError.textContent = errors.text;
}

// 1. Функція завантаження даних з сервера (GET)
async function fetchMessages() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Помилка завантаження');
        messages = await response.json();
        renderTable();
    } catch (error) {
        console.error('Помилка:', error);
    }
}

// 2. Функція створення повідомлення (POST)
messageForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const messageData = {
        author: authorInput.value.trim(),
        category: categorySelect.value,
        text: textInput.value.trim()
    };

    // Валідація перед відправкою
    const errors = validateForm(messageData);
    if (Object.keys(errors).length > 0) {
        displayErrors(errors);
        return;
    }

    clearErrors();

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(messageData)
        });

        if (response.ok) {
            messageForm.reset();
            clearErrors();
            await fetchMessages(); // Оновлюємо список
        } else {
            const err = await response.json();
            alert('Помилка: ' + err.message);
        }
    } catch (error) {
        console.error('Помилка при відправці:', error);
        alert('Помилка при відправці повідомлення');
    }
});

// 3. Функція видалення (DELETE)
async function deleteMessage(id) {
    if (!confirm('Видалити це повідомлення?')) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (response.status === 204) {
            await fetchMessages();
        }
    } catch (error) {
        console.error('Помилка при видаленні:', error);
    }
}

// 4. Рендеринг таблиці
function renderTable() {
    tableBody.innerHTML = '';
    messages.forEach(msg => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${msg.author}</td>
            <td>${msg.category}</td>
            <td>${msg.text}</td>
            <td>${msg.date}</td>
            <td>
                <button class="delete-btn" onclick="deleteMessage(${msg.id})">🗑</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Очищення помилок при введенні
authorInput.addEventListener('input', () => {
    authorError.textContent = '';
});

categorySelect.addEventListener('change', () => {
    categoryError.textContent = '';
});

textInput.addEventListener('input', () => {
    textError.textContent = '';
});

// Кнопка очищення форми
document.getElementById('resetBtn').addEventListener('click', () => {
    messageForm.reset();
    clearErrors();
});

// Початкове завантаження
fetchMessages();