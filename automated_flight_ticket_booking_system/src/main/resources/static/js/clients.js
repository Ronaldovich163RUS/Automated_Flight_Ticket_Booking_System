document.addEventListener('DOMContentLoaded', function () {
    initApp();
});

// Базовые настройки API
const API_BASE_URL = '/clients/api';
const DEFAULT_ERROR_MESSAGE = 'Произошла ошибка. Пожалуйста, попробуйте позже.';

// Инициализация приложения
function initApp() {
    setupAddClientForm();
    setupTableButtons();
    setupFilterHandlers();
    // Не загружаем данные через API, так как они уже загружены Thymeleaf
    setupInitialDataFromThymeleaf();
}

// Получение начальных данных из Thymeleaf
function setupInitialDataFromThymeleaf() {
    const tableBody = document.getElementById('clients-table-body');
    if (tableBody && tableBody.children.length > 0) {
        // Данные уже загружены сервером, просто настраиваем кнопки
        setupTableButtons();
    } else {
        // Если данных нет, загружаем через API
        loadInitialClients();
    }
}

// Настройка формы добавления клиента
function setupAddClientForm() {
    const form = document.getElementById('add-client-form');
    if (!form) return;

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        if (!validateForm(this)) {
            return;
        }

        const formData = new FormData(this);
        const clientData = {
            lastName: formData.get('lastName'),
            firstName: formData.get('firstName'),
            middleName: formData.get('middleName') || null,
            gender: formData.get('gender'),
            birthDate: formData.get('birthDate'),
            documentNumber: formData.get('documentNumber'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            citizenship: formData.get('citizenship') === 'RU' ? 'russia' : 'other',
            password: 'defaultPassword'
        };

        try {
            const response = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(clientData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || DEFAULT_ERROR_MESSAGE);
            }

            const newClient = await response.json();
            showSuccessDialog('Клиент успешно добавлен');
            form.reset();
            addClientToTable(newClient);
        } catch (error) {
            showErrorDialog(error.message || DEFAULT_ERROR_MESSAGE);
            console.error('Ошибка при добавлении клиента:', error);
        }
    });
}

// Валидация формы
function validateForm(form) {
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');

    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.classList.add('error');
            isValid = false;
        } else {
            field.classList.remove('error');
        }
    });

    if (!isValid) {
        showErrorDialog('Пожалуйста, заполните все обязательные поля');
    }

    return isValid;
}

// Настройка обработчиков фильтрации
function setupFilterHandlers() {
    const searchBtn = document.querySelector('.search-btn');
    const resetBtn = document.querySelector('.reset-btn');

    if (searchBtn) {
        searchBtn.addEventListener('click', filterClients);
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', resetClientFilters);
    }
}

// Фильтрация клиентов
function filterClients() {
    const filters = {
        lastName: document.getElementById('client-lastname').value.toLowerCase(),
        firstName: document.getElementById('client-firstname').value.toLowerCase(),
        middleName: document.getElementById('client-middlename').value.toLowerCase(),
        document: document.getElementById('client-doc').value,
        birthDate: document.getElementById('client-birthdate').value,
        gender: document.getElementById('client-gender').value,
        email: document.getElementById('client-email').value.toLowerCase(),
        citizenship: document.getElementById('client-citizenship').value,
        phone: document.getElementById('client-phone').value.toLowerCase()
    };
    const tableRows = document.querySelectorAll('#clients-table tbody tr');
    tableRows.forEach(row => {
        const documentCell = row.cells[3];
        const documentSpan = documentCell.querySelector('span:last-child');
        const documentValue = documentSpan ? documentSpan.textContent.trim() : documentCell.textContent.trim();
        const rowData = {
            lastName: row.cells[0].textContent.toLowerCase(),
            firstName: row.cells[1].textContent.toLowerCase(),
            middleName: row.cells[2].textContent.toLowerCase(),
            document: documentValue,
            birthDate: row.cells[4].textContent,
            gender: row.cells[5].textContent === 'Мужской' ? 'male' : (row.cells[5].textContent === 'Женский' ? 'female' : ''),
            email: row.cells[6].textContent.toLowerCase(),
            citizenship: row.cells[7].textContent === 'Россия' ? 'russia' : (row.cells[7].textContent === 'Другое' ? 'other' : ''),
            phone: row.cells[8].textContent.toLowerCase()
        };
        // Сравнение даты рождения
        let birthMatch = true;
        if (filters.birthDate) {
            const [d, m, y] = rowData.birthDate.split('.');
            const rowDate = y && m && d ? `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}` : '';
            birthMatch = rowDate === filters.birthDate;
        }
        const isVisible =
            (!filters.lastName || rowData.lastName.includes(filters.lastName)) &&
            (!filters.firstName || rowData.firstName.includes(filters.firstName)) &&
            (!filters.middleName || rowData.middleName.includes(filters.middleName)) &&
            (!filters.document || rowData.document === filters.document) &&
            birthMatch &&
            (!filters.gender || rowData.gender === filters.gender) &&
            (!filters.email || rowData.email.includes(filters.email)) &&
            (!filters.citizenship || rowData.citizenship === filters.citizenship) &&
            (!filters.phone || rowData.phone.includes(filters.phone));
        row.style.display = isVisible ? '' : 'none';
    });
}

// Функция для получения значения типа документа из отображаемого текста
function getDocumentValueFromDisplay(displayText) {
    const text = displayText.toLowerCase().trim();
    console.log('Converting document text:', text);

    switch (text) {
        case 'паспорт':
            return 'passport';
        case 'свидетельство о рождении':
            return 'birth_certificate';
        case 'загранпаспорт':
            return 'international_passport';
        default:
            console.warn('Unknown document type:', text);
            return '';
    }
}

// Сброс фильтров
function resetClientFilters() {
    document.querySelectorAll('.search-filter input').forEach(input => {
        input.value = '';
    });

    document.querySelectorAll('.search-filter select').forEach(select => {
        select.selectedIndex = 0;
    });

    document.querySelectorAll('#clients-table tbody tr').forEach(row => {
        row.style.display = '';
    });
}

// Настройка кнопок в таблице
function setupTableButtons() {
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', handleEditClient);
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', handleDeleteClient);
    });
}

// Обработка редактирования клиента
function handleEditClient(e) {
    e.preventDefault();
    const clientId = this.getAttribute('data-id');
    window.location.href = `/clients/edit/${clientId}`;
}

// Обработка удаления клиента
async function handleDeleteClient(e) {
    e.preventDefault();
    const clientId = this.getAttribute('data-id');
    const row = this.closest('tr');

    try {
        const confirmed = await showConfirmDialog(
            'Подтверждение удаления',
            'Вы уверены, что хотите удалить этого клиента?'
        );

        if (confirmed) {
            const response = await fetch(`${API_BASE_URL}/${clientId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Ошибка при удалении клиента');
            }

            row.remove();
            showSuccessDialog('Клиент успешно удален');
        }
    } catch (error) {
        showErrorDialog(error.message || DEFAULT_ERROR_MESSAGE);
    }
}

// Добавление клиента в таблицу
function addClientToTable(client) {
    const tbody = document.querySelector('#clients-table tbody');
    if (!tbody) return;

    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${client.lastName}</td>
        <td>${client.firstName}</td>
        <td>${client.middleName || ''}</td>
        <td>${getDocumentTypeDisplay(client.document)}</td>
        <td>${formatDate(client.birthDate)}</td>
        <td>${client.gender === 'male' ? 'Мужской' : 'Женский'}</td>
        <td>${client.email}</td>
        <td>${client.citizenship === 'russia' ? 'Россия' : 'Другое'}</td>
        <td>${client.phone}</td>
        <td>
            <button class="edit-btn" data-id="${client.id}">
                <i class="fas fa-edit"></i>
            </button>
            <button class="delete-btn" data-id="${client.id}">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;
    tbody.appendChild(row);
    setupTableButtons();
}

// Функция для отображения типа документа
function getDocumentTypeDisplay(documentType) {
    switch (documentType) {
        case 'passport':
            return 'Паспорт';
        case 'birth_certificate':
            return 'Свидетельство о рождении';
        case 'international_passport':
            return 'Загранпаспорт';
        default:
            return '';
    }
}

// Форматирование даты
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
}

// Диалоговые окна
function showSuccessDialog(message) {
    showDialog('Успех', message, 'success');
}

function showErrorDialog(message) {
    showDialog('Ошибка', message, 'error');
}

function showDialog(title, message, type = 'info') {
    return new Promise((resolve) => {
        const dialog = document.createElement('dialog');
        dialog.className = `dialog ${type}`;
        dialog.innerHTML = `
            <h2 class="dialog-title">${title}</h2>
            <div class="dialog-content">${message}</div>
            <div class="dialog-buttons">
                <button class="confirm-btn">OK</button>
            </div>
        `;
        document.body.appendChild(dialog);
        dialog.showModal();

        dialog.querySelector('.confirm-btn').addEventListener('click', () => {
            dialog.close();
            dialog.remove();
            resolve(true);
        });
    });
}

function showConfirmDialog(title, message) {
    return new Promise((resolve) => {
        const dialog = document.createElement('dialog');
        dialog.className = 'dialog confirm';
        dialog.innerHTML = `
            <h2 class="dialog-title">${title}</h2>
            <div class="dialog-content">${message}</div>
            <div class="dialog-buttons">
                <button class="cancel-btn">Отмена</button>
                <button class="confirm-btn">Подтвердить</button>
            </div>
        `;
        document.body.appendChild(dialog);
        dialog.showModal();

        dialog.querySelector('.cancel-btn').addEventListener('click', () => {
            dialog.close();
            dialog.remove();
            resolve(false);
        });

        dialog.querySelector('.confirm-btn').addEventListener('click', () => {
            dialog.close();
            dialog.remove();
            resolve(true);
        });
    });
}

// Глобальные функции для вызова из HTML
window.filterClients = filterClients;
window.resetClientFilters = resetClientFilters;