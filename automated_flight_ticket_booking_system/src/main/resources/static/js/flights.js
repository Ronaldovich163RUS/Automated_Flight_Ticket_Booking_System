document.addEventListener('DOMContentLoaded', function () {
    // Основные элементы интерфейса
    const addFlightForm = document.getElementById('add-flight-form');
    const editButtons = document.querySelectorAll('.edit-btn');
    const deleteButtons = document.querySelectorAll('.delete-btn');
    const airlineSelect = document.getElementById('new-flight-airline');
    const brandSelect = document.getElementById('new-flight-brand');
    const modelSelect = document.getElementById('new-flight-model');
    const departureCitySelect = document.getElementById('new-flight-departure');
    const destinationCitySelect = document.getElementById('new-flight-destination');

    // Функция валидации даты и времени
    function validateDateTime(date, time) {
        const now = new Date();
        const flightDateTime = new Date(date + 'T' + time);

        // Проверяем, что дата и время в будущем
        if (flightDateTime <= now) {
            return {
                isValid: false,
                message: 'Дата и время вылета должны быть в будущем'
            };
        }

        return {
            isValid: true,
            message: ''
        };
    }

    // Инициализация приложения
    function initApp() {
        setupAddFlightForm();
        setupTableButtons();
        setupFilterFlights();
        setupResetFilters();
        setupDependentSelects();
        setupCitySelects();
    }

    // Настройка зависимых выпадающих списков
    function setupDependentSelects() {
        // Изначально блокируем зависимые списки
        brandSelect.disabled = true;
        modelSelect.disabled = true;

        if (airlineSelect) {
            airlineSelect.addEventListener('change', async function () {
                // Блокируем списки при любом изменении
                brandSelect.disabled = true;
                modelSelect.disabled = true;

                // Очищаем зависимые списки
                brandSelect.innerHTML = '<option value="">Выберите марку</option>';
                modelSelect.innerHTML = '<option value="">Сначала выберите марку</option>';

                // Проверяем, что выбрана авиакомпания (значение не пустое)
                if (this.value && this.value !== "") {
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
                                brandSelect.disabled = false; // Разблокируем только если есть данные
                            } else {
                                brandSelect.innerHTML = '<option value="">Нет доступных марок</option>';
                            }
                        } else {
                            brandSelect.innerHTML = '<option value="">Ошибка загрузки</option>';
                        }
                    } catch (error) {
                        console.error('Ошибка при загрузке марок:', error);
                        brandSelect.innerHTML = '<option value="">Ошибка загрузки</option>';
                    }
                } else {
                    // Если авиакомпания не выбрана
                    brandSelect.innerHTML = '<option value="">Сначала выберите авиакомпанию</option>';
                }
            });
        }

        if (brandSelect) {
            brandSelect.addEventListener('change', async function () {
                // Блокируем список моделей при любом изменении
                modelSelect.disabled = true;
                modelSelect.innerHTML = '<option value="">Сначала выберите марку</option>';

                // Проверяем, что выбрана марка (значение не пустое)
                if (this.value && this.value !== "") {
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
                                modelSelect.disabled = false; // Разблокируем только если есть данные
                            } else {
                                modelSelect.innerHTML = '<option value="">Нет доступных моделей</option>';
                            }
                        } else {
                            modelSelect.innerHTML = '<option value="">Ошибка загрузки</option>';
                        }
                    } catch (error) {
                        console.error('Ошибка при загрузке моделей:', error);
                        modelSelect.innerHTML = '<option value="">Ошибка загрузки</option>';
                    }
                }
            });
        }
    }

    // Настройка логики выбора городов
    function setupCitySelects() {
        if (departureCitySelect && destinationCitySelect) {
            // Сохраняем изначальные опции для списка назначения
            const originalDestinationOptions = Array.from(destinationCitySelect.options);

            departureCitySelect.addEventListener('change', function () {
                const selectedDepartureCity = this.value;

                if (selectedDepartureCity) {
                    if (selectedDepartureCity !== 'Самара') {
                        // Если выбран город отправления не Самара,
                        // показываем только Самару в списке назначения
                        destinationCitySelect.innerHTML = '';
                        const samaraOption = originalDestinationOptions.find(opt => opt.value === 'Самара');
                        if (samaraOption) {
                            destinationCitySelect.add(new Option(samaraOption.text, samaraOption.value));
                            destinationCitySelect.value = 'Самара';
                        }
                    } else {
                        // Если выбрана Самара как город отправления,
                        // восстанавливаем все города в списке назначения
                        destinationCitySelect.innerHTML = '';
                        originalDestinationOptions.forEach(option => {
                            if (option.value !== 'Самара') {
                                destinationCitySelect.add(new Option(option.text, option.value));
                            }
                        });
                        // Сбрасываем выбор
                        destinationCitySelect.value = '';
                    }
                }
            });

            // Инициализация начального состояния
            if (departureCitySelect.value) {
                departureCitySelect.dispatchEvent(new Event('change'));
            }
        }
    }

    // Обработчик формы добавления рейса
    function setupAddFlightForm() {
        const form = document.getElementById('add-flight-form');
        if (form) {
            form.addEventListener('submit', async function (e) {
                e.preventDefault();

                const formData = new FormData(this);
                const departureDate = formData.get('departureDate');
                const departureTime = formData.get('departureTime');

                // Валидация даты и времени
                const validation = validateDateTime(departureDate, departureTime);
                if (!validation.isValid) {
                    await showDialog('Ошибка', validation.message, 'error');
                    return;
                }

                const data = {
                    flightNumber: formData.get('flightNumber'),
                    departureDate: departureDate,
                    departureTime: departureTime,
                    departureCity: formData.get('departureCity'),
                    destinationCity: formData.get('destinationCity'),
                    airplaneId: parseInt(formData.get('airplaneId')),
                    flightDuration: formData.get('flightDuration')
                };

                try {
                    const response = await fetch('/flights', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(data)
                    });

                    if (response.ok) {
                        window.location.reload();
                    } else {
                        const errorText = await response.text();
                        await showDialog('Ошибка', 'Ошибка при добавлении рейса: ' + errorText, 'error');
                    }
                } catch (error) {
                    console.error('Ошибка при отправке запроса:', error);
                    await showDialog('Ошибка', 'Ошибка при отправке запроса: ' + error.message, 'error');
                }
            });
        }
    }

    // Обработчики для кнопок редактирования
    function setupTableButtons() {
        document.querySelectorAll('.edit-btn, .delete-btn').forEach(button => {
            button.replaceWith(button.cloneNode(true));
        });

        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', function (e) {
                e.preventDefault();
                const flightId = this.getAttribute('data-id');
                openEditDialog(flightId);
            });
        });

        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', async function (e) {
                e.preventDefault();
                const flightId = this.getAttribute('data-id');
                const confirmed = await showConfirmDialog('Подтверждение', 'Вы уверены, что хотите удалить этот рейс?');
                if (!confirmed) return;
                try {
                    const response = await fetch(`/flights/${flightId}`, { method: 'DELETE' });
                    if (response.ok) {
                        await showDialog('Успешно', 'Рейс успешно удалён.', 'success');
                        window.location.reload();
                    } else {
                        let msg = 'Ошибка при удалении рейса';
                        try {
                            const err = await response.json();
                            msg = err.message || msg;
                        } catch { msg = await response.text(); }
                        await showDialog('Ошибка', msg, 'error');
                    }
                } catch (error) {
                    await showDialog('Ошибка', error.message, 'error');
                }
            });
        });
    }

    // Фильтрация рейсов
    function setupFilterFlights() {
        const depSel = document.getElementById('flight-departure');
        const destSel = document.getElementById('flight-destination');
        if (depSel && destSel) {
            const origDestOptions = Array.from(destSel.options);
            depSel.addEventListener('change', function () {
                const selectedDep = this.value;
                destSel.innerHTML = '';
                if (selectedDep && selectedDep !== 'Самара') {
                    // Только Самара, заблокировано
                    destSel.add(new Option('Самара', 'Самара'));
                    destSel.value = 'Самара';
                    destSel.disabled = true;
                } else {
                    // Все города кроме Самары
                    origDestOptions.forEach(function (opt) {
                        if (opt.value !== 'Самара') destSel.add(new Option(opt.text, opt.value));
                    });
                    destSel.value = '';
                    destSel.disabled = false;
                }
            });
            // Инициализация состояния при загрузке
            if (depSel.value && depSel.value !== 'Самара') {
                destSel.innerHTML = '';
                destSel.add(new Option('Самара', 'Самара'));
                destSel.value = 'Самара';
                destSel.disabled = true;
            } else {
                destSel.innerHTML = '';
                origDestOptions.forEach(function (opt) {
                    if (opt.value !== 'Самара') destSel.add(new Option(opt.text, opt.value));
                });
                destSel.value = '';
                destSel.disabled = false;
            }
        }
        const searchBtn = document.querySelector('.search-btn');
        if (searchBtn) {
            searchBtn.addEventListener('click', filterFlights);
        }
    }

    function filterFlights() {
        const flightNumber = document.getElementById('flight-number').value.trim().toUpperCase();
        const flightDate = document.getElementById('flight-date').value;
        const depCity = document.getElementById('flight-departure').value;
        const destCity = document.getElementById('flight-destination').value;
        const rows = document.querySelectorAll('#flights-table tbody tr');
        rows.forEach(row => {
            const [num, date, , , , , dep, dest] = Array.from(row.cells).map(td => td.textContent.trim());
            let show = true;
            if (flightNumber && !num.includes(flightNumber)) show = false;
            if (flightDate && date !== formatDate(flightDate)) show = false;
            if (depCity && dep !== depCity) show = false;
            if (destCity && dest !== destCity) show = false;
            row.style.display = show ? '' : 'none';
        });
    }

    function formatDate(dateStr) {
        // yyyy-MM-dd -> dd.MM.yyyy
        const [y, m, d] = dateStr.split('-');
        return `${d}.${m}.${y}`;
    }

    // Сброс фильтров рейсов
    function setupResetFilters() {
        const resetBtn = document.querySelector('.reset-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', resetFlightFilters);
        }
    }

    function resetFlightFilters() {
        document.getElementById('flight-number').value = '';
        document.getElementById('flight-date').value = '';
        document.getElementById('flight-departure').value = '';
        const destSel = document.getElementById('flight-destination');
        destSel.value = '';
        destSel.disabled = false;
        // Восстанавливаем все опции пункта назначения
        const origDestOptions = Array.from(destSel.querySelectorAll('option'));
        destSel.innerHTML = '';
        origDestOptions.forEach(opt => destSel.add(opt.cloneNode(true)));
        // Показываем все строки таблицы
        document.querySelectorAll('#flights-table tbody tr').forEach(row => row.style.display = '');
    }

    // Инициализация приложения
    initApp();

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

    function openEditDialog(flightId) {
        // Находим строку и значения
        const row = document.querySelector(`button.edit-btn[data-id='${flightId}']`).closest('tr');
        const editBtn = document.querySelector(`button.edit-btn[data-id='${flightId}']`);
        const airplaneId = editBtn.getAttribute('data-airplane-id');
        const cells = row.querySelectorAll('td');
        // Получаем значения
        const [flightNumber, departureDate, airlineName, brandName, airplaneModel, departureTime, departureCity, destinationCity, flightDuration] = [
            cells[0].textContent.trim(),
            cells[1].textContent.trim().split('.').reverse().join('-'),
            cells[2].textContent.trim(),
            cells[3].textContent.trim(),
            cells[4].textContent.trim(),
            cells[5].textContent.trim(),
            cells[6].textContent.trim(),
            cells[7].textContent.trim(),
            cells[8].textContent.trim()
        ];
        const cities = window.cities || [];
        const dialog = document.createElement('dialog');
        dialog.className = 'dialog';
        dialog.innerHTML = `
            <h2 class="dialog-title">Редактировать рейс</h2>
            <form id="edit-flight-form">
                <input type="hidden" name="flightId" value="${flightId}">
                <div class="dialog-content">
                    <label>Номер рейса <input type="text" name="flightNumber" value="${flightNumber}" maxlength="6" required pattern="[A-Z0-9]+" style="text-transform:uppercase" oninput="this.value=this.value.replace(/[^A-Za-z0-9]/g,'').toUpperCase();if(this.value.length>6)this.value=this.value.slice(0,6);"></label>
                    <label>Дата отправления <input type="date" name="departureDate" value="${departureDate}" required min="${new Date().toISOString().split('T')[0]}"></label>
                    <label>Время отправления <input type="time" name="departureTime" value="${departureTime}" required></label>
                    <label>Авиакомпания <select name="airlineId" id="edit-airline"></select></label>
                    <label>Марка <select name="brandId" id="edit-brand"></select></label>
                    <label>Модель <select name="airplaneId" id="edit-model"></select></label>
                    <label>Пункт отправления <select name="departureCity" id="edit-dep-city">${cities.map(c => `<option value='${c}' ${c === departureCity ? 'selected' : ''}>${c}</option>`).join('')}</select></label>
                    <label>Пункт назначения <select name="destinationCity" id="edit-dest-city"></select></label>
                    <label>Время полета <input type="time" name="flightDuration" value="${flightDuration}" required></label>
                </div>
                <div class="dialog-actions">
                    <button type="button" class="btn secondary" id="cancel-edit-btn">Отмена</button>
                    <button type="submit" class="btn">Сохранить</button>
                </div>
            </form>
        `;
        document.body.appendChild(dialog);
        // --- Подгрузка авиакомпаний, марок, моделей ---
        const airlineSel = dialog.querySelector('#edit-airline');
        const brandSel = dialog.querySelector('#edit-brand');
        const modelSel = dialog.querySelector('#edit-model');
        airlineSel.innerHTML = '<option value="">Загрузка...</option>';
        fetch('/api/airlines').then(r => r.json()).then(airlines => {
            airlineSel.innerHTML = '<option value="">Выберите авиакомпанию</option>';
            airlines.forEach(a => {
                airlineSel.innerHTML += `<option value="${a.airlineId}"${a.name === airlineName ? ' selected' : ''}>${a.name}</option>`;
            });
            if (airlineSel.value) loadBrands();
        });
        airlineSel.addEventListener('change', loadBrands);
        function loadBrands() {
            brandSel.innerHTML = '<option value="">Загрузка...</option>';
            modelSel.innerHTML = '<option value="">Сначала выберите марку</option>';
            if (!airlineSel.value) { brandSel.innerHTML = '<option value="">Сначала выберите авиакомпанию</option>'; return; }
            fetch(`/api/brands?airlineId=${airlineSel.value}`).then(r => r.json()).then(brands => {
                brandSel.innerHTML = '<option value="">Выберите марку</option>';
                brands.forEach(b => {
                    brandSel.innerHTML += `<option value="${b.brandId}"${b.name === brandName ? ' selected' : ''}>${b.name}</option>`;
                });
                if (brandSel.value) loadModels();
            });
        }
        brandSel.addEventListener('change', loadModels);
        function loadModels() {
            modelSel.innerHTML = '<option value="">Загрузка...</option>';
            if (!brandSel.value) { modelSel.innerHTML = '<option value="">Сначала выберите марку</option>'; return; }
            fetch(`/api/models?brandId=${brandSel.value}`).then(r => r.json()).then(models => {
                modelSel.innerHTML = '<option value="">Выберите модель</option>';
                models.forEach(m => {
                    modelSel.innerHTML += `<option value="${m.airplaneId}"${m.model == airplaneModel ? ' selected' : ''}>${m.model}</option>`;
                });
            });
        }
        // --- Восстановление селектора пункта назначения ---
        const depSel = dialog.querySelector('#edit-dep-city');
        const destSel = dialog.querySelector('#edit-dest-city');
        function updateDestOptions() {
            destSel.innerHTML = '';
            if (depSel.value && depSel.value !== 'Самара') {
                // Только Самара, заблокировано
                destSel.add(new Option('Самара', 'Самара'));
                destSel.value = 'Самара';
                destSel.disabled = true;
            } else {
                // Все города кроме Самары
                cities.forEach(c => { if (c !== 'Самара') destSel.add(new Option(c, c)); });
                // Выставляем текущее значение, если оно не Самара
                if (destinationCity && destinationCity !== 'Самара') {
                    destSel.value = destinationCity;
                } else {
                    destSel.value = '';
                }
                destSel.disabled = false;
            }
        }
        depSel.addEventListener('change', updateDestOptions);
        updateDestOptions();
        // ---
        dialog.showModal();
        dialog.querySelector('#cancel-edit-btn').onclick = () => { dialog.close(); dialog.remove(); };
        dialog.querySelector('#edit-flight-form').onsubmit = async function (e) {
            e.preventDefault();
            // Если селект назначения был заблокирован, временно снимаем disabled
            const wasDisabled = destSel.disabled;
            if (wasDisabled) destSel.disabled = false;

            // Корректно выставляем пункт назначения
            if (depSel.value !== 'Самара') {
                destSel.value = 'Самара';
            }
            if (!destSel.value) {
                await showDialog('Ошибка', 'Выберите пункт назначения.', 'error');
                if (wasDisabled) destSel.disabled = true;
                return;
            }
            const formData = new FormData(this);
            const data = Object.fromEntries(formData.entries());

            if (wasDisabled) destSel.disabled = true;

            // Валидация номера рейса
            if (!/^[A-Z0-9]{1,6}$/.test(data.flightNumber)) {
                await showDialog('Ошибка', 'Номер рейса: только латинские буквы и цифры, максимум 6 символов.', 'error');
                return;
            }
            // Валидация даты (не в прошлом)
            const today = new Date();
            const date = new Date(data.departureDate);
            if (date < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
                await showDialog('Ошибка', 'Дата отправления не может быть в прошлом.', 'error');
                return;
            }

            // Validate that all required fields are selected
            if (!data.airlineId || !data.brandId || !data.airplaneId) {
                await showDialog('Ошибка', 'Пожалуйста, выберите авиакомпанию, марку и модель самолета.', 'error');
                return;
            }

            // PUT-запрос
            try {
                const resp = await fetch(`/flights/${flightId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                if (!resp.ok) throw new Error(await resp.text());
                // Обновляем строку полностью (номер, даты, авиакомпания, марка, модель, время, города, длительность)
                cells[0].textContent = data.flightNumber;
                cells[1].textContent = data.departureDate.split('-').reverse().join('.');
                // Получаем текст выбранных опций
                cells[2].textContent = airlineSel.selectedOptions[0]?.textContent || '';
                cells[3].textContent = brandSel.selectedOptions[0]?.textContent || '';
                cells[4].textContent = modelSel.selectedOptions[0]?.textContent || '';
                cells[5].textContent = data.departureTime;
                cells[6].textContent = data.departureCity;
                cells[7].textContent = data.destinationCity;
                cells[8].textContent = data.flightDuration;
                // Обновляем количество свободных мест
                try {
                    const flightResp = await fetch(`/flights/${flightId}`);
                    if (flightResp.ok) {
                        const flight = await flightResp.json();
                        cells[9].textContent = flight.availableSeats;
                    }
                } catch (e) { /* ignore */ }
                dialog.close();
                dialog.remove();
                await showDialog('Успех', 'Данные рейса обновлены.', 'success');
            } catch (err) {
                await showDialog('Ошибка', err.message, 'error');
            }
        };
    }

    function showConfirmDialog(title, message) {
        return new Promise((resolve) => {
            const dialog = document.createElement('dialog');
            dialog.className = 'dialog confirm';
            dialog.innerHTML = `
                <h2 class="dialog-title">${title}</h2>
                <div class="dialog-content">${message}</div>
                <div class="dialog-buttons">
                    <button class="confirm-btn btn danger">OK</button>
                    <button class="cancel-btn btn">Отмена</button>
                </div>
            `;
            document.body.appendChild(dialog);
            dialog.showModal();
            dialog.querySelector('.confirm-btn').addEventListener('click', () => {
                dialog.close();
                dialog.remove();
                resolve(true);
            });
            dialog.querySelector('.cancel-btn').addEventListener('click', () => {
                dialog.close();
                dialog.remove();
                resolve(false);
            });
        });
    }
}); 