document.addEventListener('DOMContentLoaded', function () {
    initApp();
    // setupDeleteButtons();
    setupDependentSelects();
    setupRangeInput();
    loadAirlines();
});

function initApp() {
    setupAddAirplaneForm();
    setupTableButtons();
}

function loadAirplanes() {
    fetch('/airplanes')
        .then(response => response.json())
        .then(data => {
            const tbody = document.querySelector('#airplanes-table tbody');
            tbody.innerHTML = ''; // Очищаем таблицу

            data.forEach(airplane => {
                addAirplaneRow(airplane);
            });
        })
        .catch(error => {
            showErrorDialog('Ошибка при загрузке данных: ' + error.message);
        });
}

function setupAddAirplaneForm() {
    const form = document.getElementById('add-airplane-form');
    if (form) {
        form.addEventListener('submit', async function (e) {
            e.preventDefault();

            if (!validateForm(this)) {
                return;
            }

            const formData = new FormData(this);
            const data = {
                model: formData.get('model'),
                brand: formData.get('brand'),
                airline: formData.get('company'),
                range: parseInt(formData.get('range')),
                numberOfPassages: parseInt(formData.get('aislesCount')),
                cabinStructures: [
                    {
                        serviceClass: 'First',
                        numberOfRows: parseInt(formData.get('firstClassRows')),
                        numberOfSeatsPerRow: parseInt(formData.get('firstClassSeatsPerRow'))
                    },
                    {
                        serviceClass: 'Business',
                        numberOfRows: parseInt(formData.get('businessClassRows')),
                        numberOfSeatsPerRow: parseInt(formData.get('businessClassSeatsPerRow'))
                    },
                    {
                        serviceClass: 'Comfort',
                        numberOfRows: parseInt(formData.get('comfortClassRows')),
                        numberOfSeatsPerRow: parseInt(formData.get('comfortClassSeatsPerRow'))
                    },
                    {
                        serviceClass: 'Economy',
                        numberOfRows: parseInt(formData.get('economyClassRows')),
                        numberOfSeatsPerRow: parseInt(formData.get('economyClassSeatsPerRow'))
                    }
                ]
            };

            try {
                const response = await fetch('/airplanes', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                if (!response.ok) {
                    throw new Error('Ошибка при добавлении самолета');
                }

                const airplane = await response.json();
                addAirplaneRow(airplane);

                showSuccessDialog('Самолет успешно добавлен');
                this.reset();
            } catch (error) {
                showErrorDialog('Ошибка при добавлении самолета: ' + error.message);
            }
        });
    }
}

function addAirplaneRow(airplane) {
    const tbody = document.querySelector('#airplanes-table tbody');
    const newRow = document.createElement('tr');

    // Функция для получения конфигурации класса
    const getClassConfig = (className) => {
        const cabin = airplane.cabinStructures.find(c => c.serviceClass === className) ||
            { numberOfRows: 0, numberOfSeatsPerRow: 0 };
        return `${cabin.numberOfSeatsPerRow}/${cabin.numberOfRows}`;
    };

    newRow.innerHTML = `
        <td>${airplane.model}</td>
        <td>${airplane.brand}</td>
        <td>${airplane.airline}</td>
        <td>${airplane.numberOfPassages}</td>
        <td>${airplane.range}</td>
        <td>${getClassConfig('First')}</td>
        <td>${getClassConfig('Business')}</td>
        <td>${getClassConfig('Comfort')}</td>
        <td>${getClassConfig('Economy')}</td>
        <td>
            <button class="edit-btn" data-id="${airplane.id}"><i class="fas fa-edit"></i></button>
            <button class="delete-btn" data-id="${airplane.id}"><i class="fas fa-trash"></i></button>
        </td>
    `;

    tbody.appendChild(newRow);
    setupTableButtons();
}

function validateForm(form) {
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');

    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.style.borderColor = 'red';
            isValid = false;
        } else {
            field.style.borderColor = '';
        }
    });

    return isValid;
}

function setupTableButtons() {
    document.querySelectorAll('.edit-btn, .delete-btn').forEach(button => {
        button.replaceWith(button.cloneNode(true));
    });

    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();
            const airplaneId = this.getAttribute('data-id');
            checkAirplaneBeforeEdit(airplaneId);
        });
    });

    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', function () {
            airplaneIdToDelete = this.getAttribute('data-id');
            rowToDelete = this.closest('tr');
            document.getElementById('delete-confirm-dialog').showModal();
        });
    });
}

async function checkAirplaneBeforeEdit(airplaneId) {
    try {
        const res = await fetch(`/api/airplanes/${airplaneId}/flights`);
        if (res.ok) {
            const data = await res.json();
            if (data.flights && Array.isArray(data.flights) && data.flights.length > 0) {
                let msg = 'Самолёт используется в рейсах: ' + data.flights.map(f => f.flightNumber || f).join(', ');
                showDialog('Ошибка', msg);
            } else {
                window.location.href = `/constructor/edit?airplaneId=${airplaneId}`;
            }
        } else {
            window.location.href = `/constructor/edit?airplaneId=${airplaneId}`;
        }
    } catch (err) {
        window.location.href = `/constructor/edit?airplaneId=${airplaneId}`;
    }
}

function setupDependentSelects() {
    const airlineSelect = document.getElementById('airplane-company');
    const brandSelect = document.getElementById('airplane-brand');
    const modelSelect = document.getElementById('airplane-model');

    brandSelect.disabled = true;
    modelSelect.disabled = true;

    airlineSelect.addEventListener('change', async function () {
        brandSelect.disabled = true;
        modelSelect.disabled = true;
        brandSelect.innerHTML = '<option value="">Выберите марку</option>';
        modelSelect.innerHTML = '<option value="">Сначала выберите марку</option>';
        if (this.value) {
            try {
                brandSelect.innerHTML = '<option value="">Загрузка марок...</option>';
                const response = await fetch(`/api/brands?airlineId=${this.value}`);
                if (response.ok) {
                    const brands = await response.json();
                    if (brands && brands.length > 0) {
                        brandSelect.innerHTML = '<option value="">Выберите марку</option>';
                        brands.forEach(brand => {
                            brandSelect.innerHTML += `<option value="${brand.brandId}">${brand.name}</option>`;
                        });
                        brandSelect.disabled = false;
                    } else {
                        brandSelect.innerHTML = '<option value="">Нет доступных марок</option>';
                    }
                } else {
                    brandSelect.innerHTML = '<option value="">Ошибка загрузки</option>';
                }
            } catch (error) {
                brandSelect.innerHTML = '<option value="">Ошибка загрузки</option>';
            }
        }
    });

    brandSelect.addEventListener('change', async function () {
        modelSelect.disabled = true;
        modelSelect.innerHTML = '<option value="">Сначала выберите марку</option>';
        if (this.value) {
            try {
                modelSelect.innerHTML = '<option value="">Загрузка моделей...</option>';
                const response = await fetch(`/api/models?brandId=${this.value}`);
                if (response.ok) {
                    const models = await response.json();
                    if (models && models.length > 0) {
                        modelSelect.innerHTML = '<option value="">Выберите модель</option>';
                        models.forEach(model => {
                            modelSelect.innerHTML += `<option value="${model.airplaneId}">${model.model}</option>`;
                        });
                        modelSelect.disabled = false;
                    } else {
                        modelSelect.innerHTML = '<option value="">Нет доступных моделей</option>';
                    }
                } else {
                    modelSelect.innerHTML = '<option value="">Ошибка загрузки</option>';
                }
            } catch (error) {
                modelSelect.innerHTML = '<option value="">Ошибка загрузки</option>';
            }
        }
    });
}

async function loadAirlines() {
    const airlineSelect = document.getElementById('airplane-company');
    try {
        const response = await fetch('/api/airlines');
        if (response.ok) {
            const airlines = await response.json();
            if (airlines && airlines.length > 0) {
                airlineSelect.innerHTML = '<option value="">Выберите авиакомпанию</option>';
                airlines.forEach(airline => {
                    airlineSelect.innerHTML += `<option value="${airline.airlineId}">${airline.name}</option>`;
                });
                airlineSelect.disabled = false;
            } else {
                airlineSelect.innerHTML = '<option value="">Нет доступных авиакомпаний</option>';
            }
        } else {
            airlineSelect.innerHTML = '<option value="">Ошибка загрузки</option>';
        }
    } catch (error) {
        airlineSelect.innerHTML = '<option value="">Ошибка загрузки</option>';
    }
}

function setupRangeInput() {
    const rangeInput = document.getElementById('airplane-range');
    rangeInput.addEventListener('input', function () {
        this.value = this.value.replace(/[^0-9]/g, '');
    });
}

function filterAirplanes() {
    const modelId = document.getElementById('airplane-model').value;
    const brandId = document.getElementById('airplane-brand').value;
    const companyId = document.getElementById('airplane-company').value;
    const aisles = document.getElementById('airplane-aisles').value;
    const range = document.getElementById('airplane-range').value;
    const firstClass = document.getElementById('airplane-first-class').value;
    const businessClass = document.getElementById('airplane-business-class').value;
    const comfortClass = document.getElementById('airplane-comfort-class').value;
    const economyClass = document.getElementById('airplane-economy-class').value;

    const tableRows = document.querySelectorAll('#airplanes-table tbody tr');

    tableRows.forEach(row => {
        const rowModel = row.cells[0].textContent.toLowerCase();
        const rowBrand = row.cells[1].textContent.toLowerCase();
        const rowCompany = row.cells[2].textContent.toLowerCase();
        const rowAisles = row.cells[3].textContent;
        const rowRange = row.cells[4].textContent.replace(/\D/g, '');
        const rowFirstClass = row.cells[5].textContent;
        const rowBusinessClass = row.cells[6].textContent;
        const rowComfortClass = row.cells[7].textContent;
        const rowEconomyClass = row.cells[8].textContent;

        // Для фильтрации сравниваем по name (тексту в таблице)
        const matchesModel = !modelId || rowModel === document.getElementById('airplane-model').selectedOptions[0].text.toLowerCase();
        const matchesBrand = !brandId || rowBrand === document.getElementById('airplane-brand').selectedOptions[0].text.toLowerCase();
        const matchesCompany = !companyId || rowCompany === document.getElementById('airplane-company').selectedOptions[0].text.toLowerCase();
        const matchesAisles = !aisles || rowAisles === aisles;
        const matchesRange = !range || (parseInt(rowRange) === parseInt(range));
        const matchesFirstClass = !firstClass || rowFirstClass === firstClass;
        const matchesBusinessClass = !businessClass || rowBusinessClass === businessClass;
        const matchesComfortClass = !comfortClass || rowComfortClass === comfortClass;
        const matchesEconomyClass = !economyClass || rowEconomyClass === economyClass;

        if (matchesModel && matchesBrand && matchesCompany && matchesAisles && matchesRange && matchesFirstClass && matchesBusinessClass && matchesComfortClass && matchesEconomyClass) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

function resetAirplaneFilters() {
    // Сброс input
    const filterInputs = document.querySelectorAll('.search-filter input');
    filterInputs.forEach(input => {
        input.value = '';
    });

    // Сброс select
    const selects = document.querySelectorAll('.search-filter select');
    selects.forEach(select => {
        select.selectedIndex = 0;
        // Блокируем зависимые селекты, кроме авиакомпании и проходов
        if (select.id === 'airplane-brand' || select.id === 'airplane-model') {
            select.disabled = true;
        }
    });

    // Показать все строки
    const tableRows = document.querySelectorAll('#airplanes-table tbody tr');
    tableRows.forEach(row => {
        row.style.display = '';
    });
}

// Вспомогательные функции для диалогов
function showSuccessDialog(message) {
    showDialog('Успешно', message);
}

function showErrorDialog(message) {
    showDialog('Ошибка', message);
}

function showConfirmationDialog(title, message, confirmCallback) {
    const dialog = document.createElement('dialog');
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
    });

    dialog.querySelector('.confirm-btn').addEventListener('click', () => {
        confirmCallback();
        dialog.close();
        dialog.remove();
    });
}

function showDialog(title, message) {
    const dialog = document.createElement('dialog');
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
    });
}

let airplaneIdToDelete = null;
let rowToDelete = null;

document.getElementById('cancel-delete-btn').onclick = function () {
    document.getElementById('delete-confirm-dialog').close();
};

document.getElementById('confirm-delete-btn').onclick = function () {
    if (airplaneIdToDelete) {
        deleteAirplane(airplaneIdToDelete, rowToDelete);
        document.getElementById('delete-confirm-dialog').close();
    }
};

document.getElementById('success-ok-btn').onclick = function () {
    document.getElementById('delete-success-dialog').close();
};

document.getElementById('error-ok-btn').onclick = function () {
    document.getElementById('delete-error-dialog').close();
};

function deleteAirplane(airplaneId, row) {
    fetch(`/api/airplanes/${airplaneId}`, { method: 'DELETE' })
        .then(res => {
            if (res.ok) {
                row.remove();
                document.getElementById('delete-success-dialog').showModal();
            } else {
                return res.json().then(data => {
                    let msg = 'Ошибка при удалении: ' + res.statusText;
                    if (data.flights && Array.isArray(data.flights)) {
                        msg = 'Самолёт используется в рейсах: ' + data.flights.map(f => f.flightNumber || f).join(', ');
                    }
                    document.getElementById('delete-error-message').textContent = msg;
                    document.getElementById('delete-error-dialog').showModal();
                });
            }
        })
        .catch(err => {
            document.getElementById('delete-error-message').textContent = 'Ошибка при удалении: ' + err.message;
            document.getElementById('delete-error-dialog').showModal();
        });
}

/*window.filterAirplanes = filterAirplanes;
window.resetAirplaneFilters = resetAirplaneFilters;*/