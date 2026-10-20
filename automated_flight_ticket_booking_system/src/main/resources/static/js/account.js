document.addEventListener('DOMContentLoaded', function () {
    // Основные элементы управления
    const form = document.querySelector('.account-data');
    const editBtn = document.getElementById('edit-data');
    const saveBtn = document.getElementById('save-data');
    const deleteBtn = document.getElementById('delete-account');
    const logoutBtn = document.getElementById('logout');

    // Элементы формы
    const docSeriesInput = document.getElementById('doc-series');
    const docNumberInput = document.getElementById('doc-number');
    const docTypeSelect = document.getElementById('doc-type');
    const seriesError = document.getElementById('series-error');
    const numberError = document.getElementById('number-error');
    const lastNameInput = document.getElementById('lastname');
    const lastNameError = document.getElementById('lastname-error');
    const firstNameInput = document.getElementById('firstname');
    const firstNameError = document.getElementById('firstname-error');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const emailError = document.getElementById('email-error');
    const phoneError = document.getElementById('phone-error');
    const middleNameInput = document.getElementById('middlename');
    const middleNameError = document.getElementById('middlename-error');
    const birthdateInput = document.getElementById('birthdate');
    const birthdateError = document.getElementById('birthdate-error');
    const genderSelect = document.getElementById('gender');
    const citizenshipSelect = document.getElementById('citizenship');
    const passwordInput = document.getElementById('password');
    const passwordError = document.getElementById('password-error');
    const togglePasswordBtn = document.getElementById('toggle-password');
    const passwordWrapper = document.querySelector('.password-wrapper');
    const bookingsLink = document.getElementById('bookings');
    const historyLink = document.getElementById('history');

    updateDocumentPlaceholders();
    if (docTypeSelect) {
        docTypeSelect.addEventListener('change', updateDocumentPlaceholders);
    }

    document.addEventListener('focus', function (e) {
        if ((e.target.readOnly || e.target.disabled) && e.target.tagName !== 'BUTTON') {
            e.target.blur();

            // Переводим фокус на следующую доступную кнопку
            const focusable = ['button:not([disabled])', '[tabindex="0"]'].join(', ');
            const focusableElements = document.querySelectorAll(focusable);
            const currentIndex = Array.from(focusableElements).indexOf(e.target);

            if (focusableElements.length > 0) {
                const nextIndex = (currentIndex + 1) % focusableElements.length;
                focusableElements[nextIndex].focus();
            }
        }
    }, true);

    // Инициализация
    initHotkeys();
    initResizeObserver();
    initValidation();
    initEventHandlers();
    initBirthdateValidation();

    let originalValues = {};
    let isEditMode = false;
    let isSaving = false;

    function initHotkeys() {
        document.addEventListener('keydown', function (e) {
            // Проверяем, находится ли фокус на элементе ввода
            const activeElement = document.activeElement;
            const isInputElement = activeElement.tagName === 'INPUT' || 
                                 activeElement.tagName === 'SELECT' || 
                                 activeElement.tagName === 'TEXTAREA';

            // Escape работает всегда
            if (e.key === 'Escape' && isEditMode) {
                e.preventDefault();
                cancelEdit();
                return;
            }

            // Если фокус на элементе ввода, игнорируем все остальные горячие клавиши
            if (isInputElement) return;

            // Обрабатываем только Shift + клавиша
            if (!e.shiftKey) return;

            e.preventDefault(); // Блокируем действие браузера

            switch (e.code) {
                case 'KeyE': // E (английская) или Е (русская)
                    if (!isEditMode) editBtn.click();
                    break;
                case 'KeyS': // S (английская) или Ы (русская)
                    if (isEditMode) saveBtn.click();
                    break;
                case 'KeyL': // L (английская) или Д (русская)
                    logoutBtn.click();
                    break;
                case 'KeyD': // D (английская) или В (русская)
                    deleteBtn.click();
                    break;
                case 'KeyB': // B (английская) или И (русская)
                    bookingsLink.click();
                    break;
                case 'KeyH': // H (английская) или Р (русская)
                    historyLink.click();
                    break;
                case 'KeyI': // I (английская) или Ш (русская)
                    openHotkeysInfo();
                    break;
            }
        });
    }

    function openHotkeysInfo() {
        const modal = document.getElementById('hotkeys-dialog');
        if (modal) {
            modal.showModal();
        }
    }

    function cancelEdit() {
        // Восстановление значений
        Object.keys(originalValues).forEach(id => {
            const element = document.getElementById(id);
            if (element) element.value = originalValues[id];
        });

        // Валидация всех полей
        if (validateAllFields()) {
            lockForm();
            showNotification('Изменения отменены', 'info');
        }
        else {
            showNotification('Не все поля заполнены', 'error');
        }
    }

    function initResizeObserver() {
        if (form) {
            const resizeObserver = new ResizeObserver(() => {
                form.style.height = `${form.scrollHeight}px`;
            });
            resizeObserver.observe(form);
        }
    }

    function initEventHandlers() {
        if (editBtn) {
            editBtn.addEventListener('click', function (e) {
                e.preventDefault();
                // Сохраняем исходные значения перед редактированием
                originalValues = {
                    'lastname': lastNameInput.value,
                    'firstname': firstNameInput.value,
                    'middlename': middleNameInput.value,
                    'email': emailInput.value,
                    'phone': phoneInput.value,
                    'doc-type': docTypeSelect.value,
                    'doc-series': docSeriesInput.value,
                    'doc-number': docNumberInput.value,
                    'birthdate': birthdateInput.value,
                    'gender': genderSelect.value,
                    'citizenship': citizenshipSelect.value,
                    'password': passwordInput.value
                };
                activateEditMode();
            });
        }

        if (saveBtn) saveBtn.addEventListener('click', handleSave);
        if (deleteBtn) deleteBtn.addEventListener('click', confirmAccountDeletion);
        if (logoutBtn) logoutBtn.addEventListener('click', logout);

        // Обработчик для переключения видимости пароля
        if (togglePasswordBtn) {
            togglePasswordBtn.addEventListener('click', togglePasswordVisibility);
        }

        // Обработчики для серии и номера документа
        if (docTypeSelect) {
            docTypeSelect.addEventListener('change', function () {
                validateDocSeries();
                validateDocNumber();
                updateDocumentPlaceholders();
            });
        }

        if (docSeriesInput) {
            docSeriesInput.addEventListener('blur', validateDocSeries);
            docSeriesInput.addEventListener('focus', () => resetField(docSeriesInput));
        }

        if (docNumberInput) {
            docNumberInput.addEventListener('blur', validateDocNumber);
            docNumberInput.addEventListener('focus', () => resetField(docNumberInput));
        }

        // Обработчик для очистки даты рождения
        if (birthdateInput) {
            birthdateInput.addEventListener('change', validateBirthdate);
            birthdateInput.addEventListener('blur', validateBirthdate);
            birthdateInput.addEventListener('focus', () => resetField(birthdateInput));
        }

        if (passwordInput) {
            passwordInput.addEventListener('blur', validatePassword);
            passwordInput.addEventListener('focus', () => resetField(passwordInput));
        }
    }

    function initValidation() {
        setupFieldValidation(emailInput, emailError, validateEmail, 'Необходимо заполнить поле');
        setupFieldValidation(phoneInput, phoneError, validatePhone, 'Необходимо заполнить поле');
        setupFieldValidation(lastNameInput, lastNameError, () => validateName(lastNameInput, 'Фамилия'), 'Необходимо заполнить поле');
        setupFieldValidation(firstNameInput, firstNameError, () => validateName(firstNameInput, 'Имя'), 'Необходимо заполнить поле');
        setupFieldValidation(middleNameInput, middleNameError, () => validateName(middleNameInput, 'Отчество'), '');
        setupFieldValidation(docSeriesInput, seriesError, validateDocSeries, 'Необходимо заполнить поле');
        setupFieldValidation(docNumberInput, numberError, validateDocNumber, 'Необходимо заполнить поле');
        setupFieldValidation(passwordInput, passwordError, validatePassword, 'Необходимо заполнить поле');
    }

    function initBirthdateValidation() {
        // Установка максимальной даты (ровно 12 лет назад от текущей даты)
        const today = new Date();
        const minDate = new Date(today.getFullYear() - 12, today.getMonth(), today.getDate());
        birthdateInput.max = formatDate(minDate);
    }

    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function setupFieldValidation(input, errorElement, validationFn, requiredMessage) {
        if (!input) return;
        let timeoutId = null;

        const validate = () => {
            if (input.required && input.value.trim() === '') {
                showError(input, errorElement, requiredMessage);
                return false;
            }
            return validationFn();
        };

        input.addEventListener('blur', function () {
            clearTimeout(timeoutId);
            validate();
        });

        input.addEventListener('focus', function () {
            clearTimeout(timeoutId);
            resetField(input);
            if (errorElement) hideError(errorElement);
        });
    }

    function validateEmail() {
        const email = emailInput.value.trim();

        // Проверка на пустое поле
        if (email === '') {
            showError(emailInput, emailError, 'Необходимо заполнить поле');
            return false;
        }

        // Проверка формата email
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showError(emailInput, emailError, 'Введите корректный email');
            return false;
        }

        // Проверка длины email
        if (email.length < 7) {
            showError(emailInput, emailError, 'Минимум 7 символов');
            return false;
        }

        if (email.length > 50) {
            showError(emailInput, emailError, 'Максимум 50 символов');
            return false;
        }

        resetField(emailInput);
        return true;
    }

    function validatePhone() {
        const tel = phoneInput.value.trim();

        // Проверка на пустое поле
        if (tel === '') {
            showError(phoneInput, phoneError, 'Необходимо заполнить поле');
            return false;
        }

        // Проверка строгого формата +7XXXXXXXXXX (ровно 11 цифр)
        if (!/^\+7\d{10}$/.test(tel)) {
            showError(phoneInput, phoneError, 'Введите номер в формате +7XXXXXXXXXX');
            return false;
        }

        resetField(phoneInput);
        return true;
    }

    function validateName(input, fieldName) {
        const errorElement = input === lastNameInput ? lastNameError :
            input === firstNameInput ? firstNameError : middleNameError;
        const value = input.value.trim();

        // Проверка на обязательность для фамилии и имени
        if ((input === lastNameInput || input === firstNameInput) && value === '') {
            showError(input, errorElement, 'Необходимо заполнить поле');
            return false;
        }

        // Для отчества проверка не требуется, если поле пустое
        if (input === middleNameInput && value === '') {
            resetField(input);
            return true;
        }

        // Проверка на минимальную длину
        if (value.length < 2 && value.length > 0) {
            showError(input, errorElement, 'Минимум 2 символа');
            return false;
        }

        // Проверка на заглавную первую букву
        if (value.length > 0 && value[0] !== value[0].toUpperCase()) {
            showError(input, errorElement, `${fieldName} пишется с заглавной буквы`);
            return false;
        }

        resetField(input);
        return true;
    }

    function validateDocSeries() {
        const docType = docTypeSelect.value;
        const series = docSeriesInput.value.trim();

        if (series === '') {
            showError(docSeriesInput, seriesError, 'Необходимо заполнить поле');
            return false;
        }

        let isValid = true;

        switch (docType) {
            case 'passport':
                if (!/^\d{4}$/.test(series)) {
                    showError(docSeriesInput, seriesError, 'У серии паспорта РФ 4 цифры');
                    isValid = false;
                }
                break;

            case 'international_passport':
                if (!/^\d{2}$/.test(series)) {
                    showError(docSeriesInput, seriesError, 'У серии загранпаспорта 2 цифры');
                    isValid = false;
                }
                break;

            case 'birth_certificate':
                if (!/^[IVXLCDM]+-[А-ЯЁ]{2}$/.test(series)) {
                    showError(docSeriesInput, seriesError, 'Неверный формат серии свидетельства о рождении');
                    isValid = false;
                }
                break;
        }

        if (isValid) resetField(docSeriesInput);
        return isValid;
    }

    function validateDocNumber() {
        const docType = docTypeSelect.value;
        const number = docNumberInput.value.trim();

        if (number === '') {
            showError(docNumberInput, numberError, 'Необходимо заполнить поле');
            return false;
        }

        let isValid = true;

        switch (docType) {
            case 'passport':
                if (!/^\d{6}$/.test(number)) {
                    showError(docNumberInput, numberError, 'У номера паспорта РФ 6 цифр');
                    isValid = false;
                }
                break;

            case 'international_passport':
                if (!/^\d{7}$/.test(number)) {
                    showError(docNumberInput, numberError, 'У номера загранпаспорта 7 цифр');
                    isValid = false;
                }
                break;

            case 'birth_certificate':
                if (!/^\d{6}$/.test(number)) {
                    showError(docNumberInput, numberError, 'У номера свидетельства о рождении 6 цифр');
                    isValid = false;
                }
                break;
        }

        if (isValid) resetField(docNumberInput);
        return isValid;
    }

    function validateBirthdate() {
        const value = birthdateInput.value;

        // Проверка на пустое поле
        if (value === '') {
            showError(birthdateInput, birthdateError, 'Необходимо заполнить поле');
            return false;
        }

        // Проверка возраста (не менее 12 лет)
        const birthDate = new Date(value);
        const today = new Date();
        const minDate = new Date(today.getFullYear() - 12, today.getMonth(), today.getDate());

        if (birthDate > minDate) {
            showError(birthdateInput, birthdateError, 'Возраст должен быть не менее 12 лет');
            return false;
        }

        resetField(birthdateInput);
        return true;
    }

    function validatePassword() {
        const password = passwordInput.value.trim();

        // Проверка на пустое поле
        if (password === '') {
            showError(passwordInput, passwordError, 'Необходимо заполнить поле');
            return false;
        }

        // Проверка длины пароля
        if (password.length < 8) {
            showError(passwordInput, passwordError, 'Минимум 8 символов');
            return false;
        }

        if (password.length > 50) {
            showError(passwordInput, passwordError, 'Максимум 50 символов');
            return false;
        }

        resetField(passwordInput);
        return true;
    }

    function updateDocumentPlaceholders() {
        const docType = docTypeSelect.value;

        switch (docType) {
            case 'passport':
                docSeriesInput.placeholder = '4 цифры (например: 1234)';
                docNumberInput.placeholder = '6 цифр (например: 567890)';
                break;
            case 'international_passport':
                docSeriesInput.placeholder = '2 цифры (например: 12)';
                docNumberInput.placeholder = '7 цифр (например: 3456789)';
                break;
            case 'birth_certificate':
                docSeriesInput.placeholder = 'Например: IV-АБ';
                docNumberInput.placeholder = '6 цифр (например: 123456)';
                break;
        }
    }

    function activateEditMode(e) {
        if (e) e.preventDefault();

        // Сохраняем исходные значения
        originalValues = {
            'lastname': lastNameInput.value,
            'firstname': firstNameInput.value,
            'middlename': middleNameInput.value,
            'email': emailInput.value,
            'phone': phoneInput.value,
            'doc-type': docTypeSelect.value,
            'doc-series': docSeriesInput.value,
            'doc-number': docNumberInput.value,
            'birthdate': birthdateInput.value,
            'gender': genderSelect.value,
            'citizenship': citizenshipSelect.value,
            'password': passwordInput.value
        };

        // Активация полей
        [emailInput, lastNameInput, firstNameInput, phoneInput, passwordInput,
            docTypeSelect, docSeriesInput, docNumberInput, birthdateInput, genderSelect, citizenshipSelect].forEach(field => {
                if (!field) return;

                if (field.tagName === 'INPUT') {
                    field.readOnly = false;
                    field.tabIndex = 0; // Разрешаем фокусировку
                } else if (field.tagName === 'SELECT') {
                    field.disabled = false;
                    field.tabIndex = 0; // Разрешаем фокусировку
                }
                field.style.backgroundColor = '#fff';
                field.style.borderColor = '#ff6b00';
            });

        if (middleNameInput) {
            middleNameInput.readOnly = false;
            middleNameInput.tabIndex = 0;
            middleNameInput.style.backgroundColor = '#fff';
            middleNameInput.style.borderColor = '#ff6b00';
        }

        // Активируем кнопку переключения видимости пароля
        if (togglePasswordBtn) {
            togglePasswordBtn.disabled = false;
        }

        // Настраиваем доступность кнопок
        saveBtn.tabIndex = 0;
        editBtn.tabIndex = -1;

        saveBtn.disabled = false;
        editBtn.disabled = true;
        isEditMode = true;
        showNotification('Режим редактирования. Esc - отмена, Shift+S - сохранить', 'success');
    }

    async function handleSave(e) {
        if (e) e.preventDefault();
        if (isSaving) return;

        if (!validateAllFields()) {
            showNotification('Исправьте ошибки перед сохранением', 'error');
            return;
        }

        try {
            const response = await fetch('/account', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({
                    lastName: lastNameInput.value,
                    firstName: firstNameInput.value,
                    middleName: middleNameInput.value,
                    email: emailInput.value,
                    phoneNumber: phoneInput.value,
                    password: passwordInput.value,
                    document: docTypeSelect.value,
                    documentSeries: docSeriesInput.value,
                    documentNumber: docNumberInput.value,
                    dateOfBirth: birthdateInput.value,
                    gender: genderSelect.value,
                    citizenship: citizenshipSelect.value
                })
            });

            // Проверка типа контента
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Неверный формат ответа сервера');
            }

            const responseData = await response.json();

            if (!response.ok) {
                if (responseData.errorType == 'duplicateEmailError') {
                    emailError.textContent = responseData.message;
                    //loginInput.classList.add('input-error');
                } else {
                    phoneError.textContent = responseData.message;
                    //passwordInput.classList.add('input-error');
                }
                return;
            }
            //window.location.href = responseData.redirectUrl;
        } catch (error) {
            emailError.textContent = 'Ошибка сервера: ' + error.message;
        }

        isSaving = true;
        saveBtn.disabled = true;
        saveBtn.textContent = 'Сохранение...';


        setTimeout(() => {
            console.log("Data saved!");
            saveBtn.textContent = 'Сохранить изменения';
            showNotification('Данные успешно сохранены', 'success');
            lockForm();
            isSaving = false; // Сбрасываем флаг после завершения
        }, 1000);
    }

    function validateAllFields() {
        let isValid = true;

        const fields = [
            { input: emailInput, validator: validateEmail },
            { input: phoneInput, validator: validatePhone },
            { input: lastNameInput, validator: () => validateName(lastNameInput, 'Фамилия') },
            { input: firstNameInput, validator: () => validateName(firstNameInput, 'Имя') },
            { input: middleNameInput, validator: () => validateName(middleNameInput, 'Отчество') },
            { input: docSeriesInput, validator: validateDocSeries },
            { input: docNumberInput, validator: validateDocNumber },
            { input: birthdateInput, validator: validateBirthdate },
            { input: passwordInput, validator: validatePassword }
        ];

        fields.forEach(({ input, validator }) => {
            if (!validator()) {
                isValid = false;
            }
        });

        return isValid;
    }

    function scrollToFirstError() {
        const firstError = document.querySelector('.error input, .error select');
        if (firstError) {
            firstError.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }

    function lockForm() {
        document.querySelectorAll('.account-data input, .account-data select').forEach(field => {
            if (field.tagName === 'INPUT') {
                field.readOnly = true;
                field.tabIndex = -1; // Запрещаем фокусировку через Tab
            } else if (field.tagName === 'SELECT') {
                field.disabled = true;
                field.tabIndex = -1; // Запрещаем фокусировку через Tab
            }

            field.style.backgroundColor = '#f5f5f5';
            field.style.borderColor = '#ddd';
            field.style.boxShadow = 'none';
            field.classList.remove('edit-mode', 'error');
        });

        // Деактивируем кнопку переключения видимости пароля
        if (togglePasswordBtn) {
            togglePasswordBtn.disabled = true;
            passwordWrapper.classList.remove('password-visible');
        }

        // Разрешаем фокусировку на кнопках
        editBtn.tabIndex = 0;
        saveBtn.tabIndex = -1; // Сохранить недоступна в locked режиме
        deleteBtn.tabIndex = 0;
        logoutBtn.tabIndex = 0;

        document.querySelectorAll('.error-message').forEach(el => {
            el.classList.remove('visible');
        });

        saveBtn.disabled = true;
        editBtn.disabled = false;
        isEditMode = false;
        editBtn.focus();
    }

    function showError(input, errorElement, message) {
        const wrapper = input?.closest('.data-group');
        if (!wrapper || !errorElement) return;

        wrapper.classList.add('error');
        input?.classList.add('error');

        errorElement.textContent = message;
        errorElement.classList.add('visible');
    }

    function resetField(input) {
        if (!input) return;
        const wrapper = input.closest('.data-group');
        if (wrapper) {
            wrapper.classList.remove('error');
            input.classList.remove('error');
            const errorElement = wrapper.querySelector('.error-message');
            if (errorElement) {
                errorElement.classList.remove('visible');
                setTimeout(() => errorElement.textContent = '', 300);
            }
        }
    }

    function hideError(errorElement) {
        if (!errorElement) return;
        errorElement.classList.remove('visible');
        setTimeout(() => errorElement.textContent = '', 300);
    }

    async function confirmAccountDeletion(e) {
        if (e) e.preventDefault();

        if (confirm('Вы уверены, что хотите удалить аккаунт? Это действие нельзя отменить.')) {
            try {
                const response = await fetch('/account/delete', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                });

                // Проверка типа контента
                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    throw new Error('Неверный формат ответа сервера');
                }

                const responseData = await response.json();

                /*
                if (!response.ok) {
                    if (responseData.errorType == 'duplicateEmailError') {
                        emailError.textContent = responseData.message;
                        //loginInput.classList.add('input-error');
                    } else {
                        phoneError.textContent = responseData.message;
                        //passwordInput.classList.add('input-error');
                    }
                    return;
                }
                //window.location.href = responseData.redirectUrl;
                */
                showNotification('Аккаунт удален', 'success');
                setTimeout(() => window.location.href = responseData.redirectUrl, 1500);
            } catch (error) {
                emailError.textContent = 'Ошибка сервера: ' + error.message;
            }
        }
    }

    async function logout(e) {
        if (e) e.preventDefault();

        try {
            const response = await fetch('/account/logout', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
            });


            // Проверка типа контента
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Неверный формат ответа сервера');
            }

            const responseData = await response.json();

            /*
            if (!response.ok) {
                if (responseData.errorType == 'duplicateEmailError') {
                    emailError.textContent = responseData.message;
                    //loginInput.classList.add('input-error');
                } else {
                    phoneError.textContent = responseData.message;
                    //passwordInput.classList.add('input-error');
                }
                return;
            }
            //window.location.href = responseData.redirectUrl;
            */
            showNotification('Выполняется выход...', 'success');
            setTimeout(() => window.location.href = responseData.redirectUrl, 1000);
        } catch (error) {
            emailError.textContent = 'Ошибка сервера: ' + error.message;
        }
    }

    function showNotification(message, type) {
        // Удаляем предыдущие уведомления
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    const hotkeysDialog = document.getElementById('hotkeys-dialog');
    const showHotkeysBtn = document.getElementById('show-hotkeys');
    const closeDialogBtn = document.getElementById('close-dialog');

    if (showHotkeysBtn && hotkeysDialog) {
        showHotkeysBtn.addEventListener('click', () => {
            hotkeysDialog.showModal();
        });
    }

    if (closeDialogBtn) {
        closeDialogBtn.addEventListener('click', () => {
            hotkeysDialog.close();
        });
    }

    // Закрытие по Esc (если не в режиме редактирования)
    hotkeysDialog?.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !isEditMode) {
            e.preventDefault();
            hotkeysDialog.close();
        }
    });

    function togglePasswordVisibility() {
        passwordWrapper.classList.toggle('password-visible');
    }
});