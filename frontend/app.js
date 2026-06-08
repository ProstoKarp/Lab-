
/**
 * Event Board Application
 * Client-side application for managing events and announcements
 * Migrated from vanilla JavaScript to modern ES6+ with TypeScript-like structure
 */

class EventBoard {
    constructor() {
        // DOM Elements
        this.messageForm = document.getElementById('messageForm');
        this.tableBody = document.getElementById('messageTableBody');
        this.editIdInput = document.getElementById('editId');
        this.submitBtn = document.getElementById('submitBtn');
        this.formTitle = document.getElementById('formTitle');
        this.authorInput = document.getElementById('authorInput');
        this.categorySelect = document.getElementById('categorySelect');
        this.textInput = document.getElementById('textInput');
        this.resetBtn = document.getElementById('resetBtn');

        // State
        this.events = [];
        this.editingId = null;
        this.API_URL = 'http://localhost:3000/api';

        this.setupEventListeners();
        this.loadEvents();
    }

    /**
     * Setup event listeners for form submission and reset
     */
    setupEventListeners() {
        this.messageForm.addEventListener('submit', (event) => this.handleFormSubmit(event));
        this.resetBtn.addEventListener('click', () => this.resetForm());
    }

    /**
     * Handle form submission - create or update event
     */
    async handleFormSubmit(event) {
        event.preventDefault();

        if (!this.validateForm()) {
            return;
        }

        const formData = this.getFormData();

        try {
            if (this.editingId) {
                await this.updateEvent(this.editingId, formData);
            } else {
                await this.createEvent(formData);
            }

            this.resetForm();
            await this.loadEvents();
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('Помилка при збереженні: ' + error.message);
        }
    }

    /**
     * Create a new event via API
     */
    async createEvent(data) {
        const response = await fetch(`${this.API_URL}/events`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: data.title || data.description,
                description: data.description,
                category: data.category,
                author: data.author,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Failed to create event');
        }
    }

    /**
     * Update an existing event via API
     */
    async updateEvent(id, data) {
        const response = await fetch(`${this.API_URL}/events/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: data.title || data.description,
                description: data.description,
                category: data.category,
                author: data.author,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Failed to update event');
        }
    }

    /**
     * Delete an event via API
     */
    async deleteEvent(id) {
        if (!confirm('Видалити це оголошення?')) {
            return;
        }

        try {
            const response = await fetch(`${this.API_URL}/events/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete event');
            }

            if (this.editingId === id) {
                this.resetForm();
            }

            await this.loadEvents();
        } catch (error) {
            console.error('Error deleting event:', error);
            alert('Помилка при видаленні: ' + error.message);
        }
    }

    /**
     * Load events from API, with fallback to localStorage
     */
    async loadEvents() {
        try {
            const response = await fetch(`${this.API_URL}/events`);
            if (!response.ok) {
                throw new Error('Failed to load events');
            }

            this.events = await response.json();
            this.renderTable();
        } catch (error) {
            console.error('Error loading events:', error);
            console.log('Fallback: Trying to load from localStorage...');
            // Fallback to localStorage if API is not available
            this.loadFromStorage();
            this.renderTable();
        }
    }

    /**
     * Load events from browser's localStorage (fallback)
     */
    loadFromStorage() {
        try {
            const stored = localStorage.getItem('events');
            this.events = stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading from storage:', error);
            this.events = [];
        }
    }

    /**
     * Render events table
     */
    renderTable() {
        this.tableBody.innerHTML = '';

        this.events.forEach((event) => {
            const row = document.createElement('tr');
            const createdAt = new Date(event.createdAt).toLocaleString('uk-UA');

            row.innerHTML = `
                <td>${this.escapeHtml(event.author)}</td>
                <td>${this.escapeHtml(event.category)}</td>
                <td>${this.escapeHtml(event.description)}</td>
                <td>${createdAt}</td>
                <td>
                    <button class="edit-btn" onclick="window.eventBoard.prepareEdit('${event.id}')">✎</button>
                    <button class="delete-btn" onclick="window.eventBoard.deleteEventHandler('${event.id}')">🗑</button>
                </td>
            `;
            this.tableBody.appendChild(row);
        });
    }

    /**
     * Prepare form for editing an existing event
     */
    prepareEdit(id) {
        const event = this.events.find((e) => e.id === id);
        if (!event) return;

        this.authorInput.value = event.author;
        this.categorySelect.value = event.category;
        this.textInput.value = event.description;
        this.editIdInput.value = event.id;
        this.editingId = id;

        this.submitBtn.textContent = 'Зберегти зміни';
        this.formTitle.textContent = 'Редагування';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    /**
     * Public method for delete handler (called from HTML onclick)
     */
    deleteEventHandler(id) {
        this.deleteEvent(id).catch((error) => {
            console.error('Error in delete handler:', error);
        });
    }

    /**
     * Validate form input
     */
    validateForm() {
        let isValid = true;
        this.clearErrors();

        const author = this.authorInput.value.trim();
        const category = this.categorySelect.value;
        const text = this.textInput.value.trim();

        if (author.length < 3) {
            this.showError('authorInput', 'authorError', ' ім`я має бути не менше 3 символів');
            isValid = false;
        }

        if (!category) {
            this.showError('categorySelect', 'categoryError', ' Оберіть категорію');
            isValid = false;
        }

        if (text.length === 0) {
            this.showError('textInput', 'textError', 'Оголошення не може бути порожнім');
            isValid = false;
        }

        return isValid;
    }

    /**
     * Display validation error
     */
    showError(inputId, errorId, message) {
        const input = document.getElementById(inputId);
        const errorElement = document.getElementById(errorId);

        if (input) {
            input.classList.add('invalid');
        }
        if (errorElement) {
            errorElement.textContent = message;
        }
    }

    /**
     * Clear all validation errors
     */
    clearErrors() {
        const inputs = ['authorInput', 'categorySelect', 'textInput'];
        const errors = ['authorError', 'categoryError', 'textError'];

        inputs.forEach((id) => {
            const input = document.getElementById(id);
            if (input) {
                input.classList.remove('invalid');
            }
        });

        errors.forEach((id) => {
            const error = document.getElementById(id);
            if (error) {
                error.textContent = '';
            }
        });
    }

    /**
     * Reset form to initial state
     */
    resetForm() {
        this.messageForm.reset();
        this.editIdInput.value = '';
        this.editingId = null;
        this.submitBtn.textContent = 'Опублікувати';
        this.formTitle.textContent = 'Написати оголошення';
        this.clearErrors();
    }

    /**
     * Get form data
     */
    getFormData() {
        return {
            author: this.authorInput.value,
            category: this.categorySelect.value,
            description: this.textInput.value,
            title: this.textInput.value.substring(0, 50), // Use first 50 chars as title
        };
    }

    /**
     * Escape HTML characters to prevent XSS
     */
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;',
        };
        return text.replace(/[&<>"']/g, (char) => map[char]);
    }
}

/**
 * Initialize the application when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
    window.eventBoard = new EventBoard();
});