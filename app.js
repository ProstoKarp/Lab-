
let messages = [];

function loadMessages() {
    const stored = localStorage.getItem('messages');
    messages = stored ? JSON.parse(stored) : [];
}

function saveMessages() {
    localStorage.setItem('messages', JSON.stringify(messages));
}

const messageForm = document.getElementById('messageForm');
const tableBody = document.getElementById('messageTableBody');
const editIdInput = document.getElementById('editId');
const submitBtn = document.getElementById('submitBtn');
const formTitle = document.getElementById('formTitle');


messageForm.addEventListener('submit', (event) => {
    event.preventDefault();

    if (validateForm()) {
        const id = editIdInput.value;
        const authorValue = document.getElementById('authorInput').value;
        const categoryValue = document.getElementById('categorySelect').value;
        const textValue = document.getElementById('textInput').value;

        if (id) {
            const index = messages.findIndex(m => m.id == id);
            if (index !== -1) {
                messages[index].author = authorValue;
                messages[index].category = categoryValue;
                messages[index].text = textValue;
            }
        } else {
            const newMessage = {
                id: Date.now(),
                author: authorValue,
                category: categoryValue,
                text: textValue,
                date: new Date().toLocaleString('uk-UA')
            };
            messages.push(newMessage);
        }

        saveMessages();
        renderTable();
        resetForm();
    }
});




function validateForm() {
    let isValid = true;
    clearErrors();

    const author = document.getElementById('authorInput');
    const category = document.getElementById('categorySelect');
    const text = document.getElementById('textInput');

    if (author.value.trim().length < 3) {
        showError('authorInput', 'authorError',  ' ім`я має бути не менше 3 символів');
        isValid = false;
    }

    if (!category.value) {
        showError('categorySelect', 'categoryError', ' Оберіть категорію');
        isValid = false;
    }

    if (text.value.trim().length === 0) {
        showError('textInput', 'textError', 'Оголошення не може бути порожнім');
        isValid = false;
    }

    return isValid;
}

function showError(inputId, errorId, message) {
    document.getElementById(inputId).classList.add('invalid');
    document.getElementById(errorId).textContent = message;
}

function clearErrors() {
    const inputs = ['authorInput', 'categorySelect', 'textInput'];
    const errors = ['authorError', 'categoryError', 'textError'];
    inputs.forEach(id => document.getElementById(id).classList.remove('invalid'));
    errors.forEach(id => document.getElementById(id).textContent = '');
}

function resetForm() {
    messageForm.reset();
    editIdInput.value = '';
    submitBtn.textContent = 'Опублікувати';
    formTitle.textContent = 'Написати оголошення';
    clearErrors();
}

document.getElementById('resetBtn').addEventListener('click', resetForm);


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
                <button class="edit-btn" onclick="prepareEdit(${msg.id})">✎</button>
                <button class="delete-btn" onclick="deleteMessage(${msg.id})">🗑</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function prepareEdit(id) {
    const msg = messages.find(m => m.id == id);
    if (!msg) return;

    document.getElementById('authorInput').value = msg.author;
    document.getElementById('categorySelect').value = msg.category;
    document.getElementById('textInput').value = msg.text;
    editIdInput.value = msg.id;

    submitBtn.textContent = 'Зберегти зміни';
    formTitle.textContent = 'Редагування';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}


function deleteMessage(id) {
    if (confirm('Видалити це оголошення?')) {
        messages = messages.filter(m => m.id != id);
        saveMessages();
        renderTable();
        if (editIdInput.value == id) resetForm();
    }
}

window.addEventListener('DOMContentLoaded', () => {
    loadMessages();
    renderTable();
});