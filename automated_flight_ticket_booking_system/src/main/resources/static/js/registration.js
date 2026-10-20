(async () => {
    document.addEventListener('DOMContentLoaded', function () {
        const form = document.querySelector('.auth-form');
        const registrationBtn = document.getElementById('registration');

        // Элементы формы
        const phoneInput = document.getElementById('phone');
        const phoneError = document.getElementById('phone-error');
        const lastNameInput = document.getElementById('last-name');
        const lastNameError = document.getElementById('last-name-error');
        const firstNameInput = document.getElementById('first-name');
        const firstNameError = document.getElementById('first-name-error');
        const middleNameInput = document.getElementById('middle-name');
        const middleNameError = document.getElementById('middle-name-error');
        const emailInput = document.getElementById('email');
        const emailError = document.getElementById('email-error');
        const birthdateInput = document.getElementById('birthdate');
        const birthdateError = document.getElementById('birthdate-error');
        const passwordInput = document.getElementById('password');
        const passwordError = document.getElementById('password-error');
        const confirmPasswordInput = document.getElementById('confirm-password');
        const confirmPasswordError = document.getElementById('confirm-password-error');
        const agreeCheckbox = document.getElementById('agree');

        // Инициализация валидации
        initBirthdateValidation();

        // Обработчик клика по кнопке регистрации
        registrationBtn.addEventListener('click', async function (e) {
            e.preventDefault(); // Предотвращаем стандартное поведение формы
            await handleRegistration();
        });

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

        async function handleRegistration() {
            // Сбрасываем все ошибки перед новой проверкой
            resetAllErrors();

            // Проверяем валидацию всех полей
            if (!validateAllFields()) {
                showNotification('Исправьте ошибки перед отправкой', 'error');
                scrollToFirstError();
                return;
            }

            // Проверяем совпадение паролей
            if (passwordInput.value !== confirmPasswordInput.value) {
                showError(confirmPasswordInput, confirmPasswordError, 'Пароли не совпадают');
                return;
            }

            try {
                const response = await fetch('/registration', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        phoneNumber: phoneInput.value,
                        email: emailInput.value,
                        password: passwordInput.value,
                        confirmPassword: confirmPasswordInput.value,
                        lastName: lastNameInput.value,
                        firstName: firstNameInput.value,
                        middleName: middleNameInput.value,
                        dateOfBirth: birthdateInput.value
                    })
                });

                const responseData = await response.json();

                if (response.ok) {
                    // Если регистрация успешна, перенаправляем на страницу входа
                    window.location.href = responseData.redirectUrl;
                } else {
                    // Обработка ошибок от сервера
                    if (responseData.errorType === 'duplicateEmailError') {
                        showError(emailInput, emailError, responseData.message);
                    } else if (responseData.errorType === 'duplicatePhoneNumberError') {
                        showError(phoneInput, phoneError, responseData.message);
                    } else {
                        showNotification(responseData.message || 'Произошла ошибка при регистрации', 'error');
                    }
                }
            } catch (error) {
                showNotification('Произошла ошибка при отправке данных', 'error');
                console.error('Error:', error);
            }
        }

        function resetAllErrors() {
            const errorMessages = document.querySelectorAll('.error-message');
            errorMessages.forEach(msg => {
                msg.classList.remove('visible');
                msg.textContent = '';
            });

            const errorInputs = document.querySelectorAll('.form-group.error, .checkbox-group.error');
            errorInputs.forEach(group => {
                group.classList.remove('error');
            });

            const errorFields = document.querySelectorAll('input.error');
            errorFields.forEach(field => {
                field.classList.remove('error');
            });
        }

        function validateAllFields() {
            let isValid = true;

            // Проверка всех полей
            if (!validatePhone()) isValid = false;
            if (!validateName(lastNameInput, 'Фамилия')) isValid = false;
            if (!validateName(firstNameInput, 'Имя')) isValid = false;
            if (!validateName(middleNameInput, 'Отчество')) isValid = false;
            if (!validateEmail()) isValid = false;
            if (!validateBirthdate()) isValid = false;
            if (!validatePassword()) isValid = false;
            if (!validateConfirmPassword()) isValid = false;
            if (!validateAgreement()) isValid = false;

            return isValid;
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
            const password = passwordInput.value;

            // Проверка на пустое поле
            if (password === '') {
                showError(passwordInput, passwordError, 'Необходимо заполнить поле');
                return false;
            }

            // Проверка длины пароля
            if (password.length < 8) {
                showError(passwordInput, passwordError, 'Пароль должен содержать минимум 8 символов');
                return false;
            }

            // Проверка сложности пароля
            const hasUpperCase = /[A-Z]/.test(password);
            const hasLowerCase = /[a-z]/.test(password);
            const hasNumbers = /\d/.test(password);

            if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
                showError(passwordInput, passwordError, 'Пароль должен содержать буквы в верхнем и нижнем регистре и цифры');
                return false;
            }

            resetField(passwordInput);
            return true;
        }

        function validateConfirmPassword() {
            const password = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;

            // Проверка на пустое поле
            if (confirmPassword === '') {
                showError(confirmPasswordInput, confirmPasswordError, 'Необходимо заполнить поле');
                return false;
            }

            // Проверка совпадения паролей
            if (password !== confirmPassword) {
                showError(confirmPasswordInput, confirmPasswordError, 'Пароли не совпадают');
                return false;
            }

            resetField(confirmPasswordInput);
            return true;
        }

        function validateAgreement() {
            if (!agreeCheckbox.checked) {
                const errorElement = document.querySelector('.checkbox-group .error-message');
                showError(agreeCheckbox, errorElement, 'Необходимо согласие с условиями');
                return false;
            }
            resetField(agreeCheckbox);
            return true;
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

        function showError(input, errorElement, message) {
            const wrapper = input?.closest('.form-group') || input?.closest('.checkbox-group');
            if (!wrapper || !errorElement) return;

            wrapper.classList.add('error');
            if (input) input.classList.add('error');

            errorElement.textContent = message;
            errorElement.classList.add('visible');
        }

        function resetField(input) {
            if (!input) return;
            const wrapper = input.closest('.form-group') || input.closest('.checkbox-group');
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
    });
})();