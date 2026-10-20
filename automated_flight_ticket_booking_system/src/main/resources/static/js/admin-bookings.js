document.addEventListener('DOMContentLoaded', function () {
    initApp();
});

function initApp() {
    setupAddBookingForm();
    setupTableButtons();
    // Инициализируем обработчики поиска
    setupSearchHandlers();
}

function setupSearchHandlers() {
    // Добавляем обработчики событий только для кнопок поиска и сброса
    const searchBtn = document.querySelector('.search-btn');
    const resetBtn = document.querySelector('.reset-btn');

    if (searchBtn) {
        searchBtn.addEventListener('click', filterBookings);
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', resetBookingFilters);
    }
}

function setupAddBookingForm() {
    const form = document.getElementById('addBookingForm');
    if (!form) return;

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        if (!this.checkValidity()) {
            this.reportValidity();
            return;
        }

        const formData = new FormData(this);
        const bookingData = Object.fromEntries(formData.entries());

        try {
            // Временное решение без сервера
            const dialog = document.createElement('dialog');
            dialog.innerHTML = `
                <h2 class="dialog-title">Успешно</h2>
                <div class="dialog-content">
                    Бронирование успешно добавлено
                </div>
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

            // Очищаем форму
            this.reset();

            // Добавляем новую строку в таблицу
            const tbody = document.querySelector('.data-table tbody');
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td>${bookingData.clientId}</td>
                <td>${bookingData.flightNumber}</td>
                <td>${bookingData.bookingDate}</td>
                <td>${bookingData.price}</td>
                <td>
                    <button class="edit-btn" onclick="window.location.href='edit-booking.html?id=${Date.now()}'">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-btn" onclick="deleteBooking(this)">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(newRow);
        } catch (error) {
            const dialog = document.createElement('dialog');
            dialog.innerHTML = `
                <h2 class="dialog-title">Ошибка</h2>
                <div class="dialog-content">
                    Ошибка при добавлении бронирования: ${error.message}
                </div>
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
    });
}

function setupTableButtons() {
    const table = document.querySelector('.data-table');
    if (!table) return;

    table.addEventListener('click', function (e) {
        if (e.target.closest('.delete-btn')) {
            const row = e.target.closest('tr');
            const dialog = document.createElement('dialog');
            dialog.innerHTML = `
                <h2 class="dialog-title">Подтверждение</h2>
                <div class="dialog-content">
                    Вы уверены, что хотите удалить это бронирование?
                </div>
                <div class="dialog-buttons">
                    <button class="cancel-btn">Отмена</button>
                    <button class="confirm-btn">Удалить</button>
                </div>
            `;
            document.body.appendChild(dialog);
            dialog.showModal();

            dialog.querySelector('.cancel-btn').addEventListener('click', () => {
                dialog.close();
                dialog.remove();
            });

            dialog.querySelector('.confirm-btn').addEventListener('click', async () => {
                try {
                    // Временное решение без сервера
                    row.remove();

                    const successDialog = document.createElement('dialog');
                    successDialog.innerHTML = `
                        <h2 class="dialog-title">Успешно</h2>
                        <div class="dialog-content">
                            Бронирование успешно удалено
                        </div>
                        <div class="dialog-buttons">
                            <button class="confirm-btn">OK</button>
                        </div>
                    `;
                    document.body.appendChild(successDialog);
                    successDialog.showModal();

                    successDialog.querySelector('.confirm-btn').addEventListener('click', () => {
                        successDialog.close();
                        successDialog.remove();
                    });
                } catch (error) {
                    const errorDialog = document.createElement('dialog');
                    errorDialog.innerHTML = `
                        <h2 class="dialog-title">Ошибка</h2>
                        <div class="dialog-content">
                            Ошибка при удалении бронирования: ${error.message}
                        </div>
                        <div class="dialog-buttons">
                            <button class="confirm-btn">OK</button>
                        </div>
                    `;
                    document.body.appendChild(errorDialog);
                    errorDialog.showModal();

                    errorDialog.querySelector('.confirm-btn').addEventListener('click', () => {
                        errorDialog.close();
                        errorDialog.remove();
                    });
                }
                dialog.close();
                dialog.remove();
            });
        }
    });
}

function filterBookings() {
    const bookingId = document.getElementById('booking-id').value.trim();
    const clientId = document.getElementById('client-id').value.trim();
    const flightNumber = document.getElementById('flight-number').value.trim().toLowerCase();
    const baggageType = document.getElementById('baggage-type').value;
    const price = document.getElementById('price').value.trim();

    const tableRows = document.querySelectorAll('tbody tr');
    tableRows.forEach(row => {
        const rowBookingId = row.cells[0].textContent.trim();
        const rowClientId = row.cells[1].textContent.trim();
        const rowFlightNumber = row.cells[2].textContent.trim().toLowerCase();
        const rowBaggageType = row.cells[3].textContent.trim();
        const rowPrice = row.cells[4].textContent.trim();

        const matchesBookingId = !bookingId || rowBookingId === bookingId;
        const matchesClientId = !clientId || rowClientId === clientId;
        const matchesFlightNumber = !flightNumber || rowFlightNumber.includes(flightNumber);
        const matchesBaggageType = !baggageType || rowBaggageType === baggageType;
        const matchesPrice = !price || rowPrice === price;

        if (matchesBookingId && matchesClientId && matchesFlightNumber && matchesBaggageType && matchesPrice) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
    setupViewClientsButtons();
}

function resetBookingFilters() {
    document.querySelectorAll('.search-filter input').forEach(input => {
        input.value = '';
    });
    document.querySelectorAll('.search-filter select').forEach(select => {
        select.selectedIndex = 0;
    });
    document.querySelectorAll('tbody tr').forEach(row => {
        row.style.display = '';
    });
    setupViewClientsButtons();
}

// Глобальные функции для вызова из HTML
window.filterBookings = filterBookings;
window.resetBookingFilters = resetBookingFilters;

document.addEventListener('DOMContentLoaded', function () {
    setupViewClientsButtons();
    document.getElementById('close-clients-info-btn').onclick = function () {
        document.getElementById('clients-info-dialog').close();
    };
});

function setupViewClientsButtons() {
    document.querySelectorAll('.view-clients-btn').forEach(btn => {
        btn.addEventListener('click', async function () {
            const bookingId = this.getAttribute('data-booking-id');
            const dialog = document.getElementById('clients-info-dialog');
            const content = document.getElementById('clients-info-content');
            content.innerHTML = 'Загрузка...';
            dialog.showModal();
            try {
                const res = await fetch(`/api/bookings/${bookingId}/clients`);
                if (!res.ok) throw new Error('Ошибка загрузки данных');
                const clients = await res.json();
                if (!clients.length) {
                    content.innerHTML = '<div>Нет данных о клиентах для этого бронирования</div>';
                    return;
                }
                content.innerHTML = formatClientTable(clients);
            } catch (e) {
                content.innerHTML = '<div>Ошибка загрузки данных</div>';
            }
        });
    });
}

function formatClientTable(clients) {
    if (!clients.length) {
        return '<div>Нет данных о клиентах для этого бронирования</div>';
    }
    let html = '<div style="overflow-x:auto"><table class="clients-table data-table" style="min-width:1400px"><thead><tr>' +
        '<th>Фамилия</th><th>Имя</th><th>Отчество</th><th>Тип документа</th><th>Дата рождения</th><th>Пол</th><th>Email</th><th>Гражданство</th><th>Телефон</th>' +
        '<th>Класс</th><th>Ряд</th><th>Место</th>' +
        '</tr></thead><tbody>';
    clients.forEach(c => {
        html += `<tr>` +
            `<td>${c.lastName || ''}</td>` +
            `<td>${c.firstName || ''}</td>` +
            `<td>${c.middleName || ''}</td>` +
            `<td>${formatDocumentType(c.document)}</td>` +
            `<td>${formatDate(c.birthDate)}</td>` +
            `<td>${formatGender(c.gender)}</td>` +
            `<td>${c.email || ''}</td>` +
            `<td>${formatCitizenship(c.citizenship)}</td>` +
            `<td>${c.phone || ''}</td>` +
            `<td>${c.serviceClass || ''}</td>` +
            //`<td>${c.absoluteRowNumber || ''}</td>` +
            `<td>${c.row || ''}</td>` +
            `<td>${c.seatLetter || ''}</td>` +
            `</tr>`;
    });
    html += '</tbody></table></div>';
    return html;
}

function formatDocumentType(doc) {
    if (!doc || doc === 'undefined') return '';
    if (doc === 'passport') return 'Паспорт';
    if (doc === 'birth_certificate') return 'Свидетельство о рождении';
    if (doc === 'international_passport') return 'Загранпаспорт';
    return doc;
}

function formatGender(g) {
    if (!g) return '';
    if (g === 'male') return 'Мужской';
    if (g === 'female') return 'Женский';
    return g;
}

function formatCitizenship(c) {
    if (!c) return '';
    if (c === 'russia') return 'Россия';
    if (c === 'other') return 'Другое';
    return c;
}

function formatDate(d) {
    if (!d) return '';
    if (/\d{4}-\d{2}-\d{2}/.test(d)) {
        const [y, m, day] = d.split('-');
        return `${day}.${m}.${y}`;
    }
    return d;
} 