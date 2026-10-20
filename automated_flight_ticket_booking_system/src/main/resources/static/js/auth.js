document.getElementById('login').addEventListener('input', function (e) {
    const input = e.target;
    const value = input.value.replace(/\D/g, ''); // Удаляем всё, кроме цифр

    // Форматируем как телефон, если начинается с +7 или 8
    if (/^(\+7|8)/.test(value)) {
        let formatted = '+7';
        if (value.length > 1) {
            formatted += ' (' + value.substring(1, 4);
        }
        if (value.length > 4) {
            formatted += ') ' + value.substring(4, 7);
        }
        if (value.length > 7) {
            formatted += '-' + value.substring(7, 9);
        }
        if (value.length > 9) {
            formatted += '-' + value.substring(9, 11);
        }
        input.value = formatted;
    }
});

/*
// Добавляем обработчик для кнопки авторизации
document.querySelector('.auth-btn').addEventListener('click', function () {
    //e.preventDefault();

    const loginInput = document.getElementById('login');
    const passwordInput = document.getElementById('password');
    const loginError = document.getElementById('loginError');
    const passwordError = document.getElementById('passwordError');

    // Сбрасываем предыдущие ошибки
    loginError.textContent = '';
    passwordError.textContent = '';
    loginInput.classList.remove('input-error');
    passwordInput.classList.remove('input-error');

    let isValid = true;

    // Проверяем валидность email или телефона
    const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    const phonePattern = /^(\+7|8)[\s\-]?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}$/;

    if (!emailPattern.test(loginInput.value) && !phonePattern.test(loginInput.value)) {
        loginError.textContent = 'Пожалуйста, введите корректный email или номер телефона';
        loginInput.classList.add('input-error');
        isValid = false;
    }

    // Проверяем, что пароль не пустой
    if (passwordInput.value.trim() === '') {
        passwordError.textContent = 'Пожалуйста, введите пароль';
        passwordInput.classList.add('input-error');
        isValid = false;
    }

    // Если клиентские проверки пройдены, отправляем на сервер
    if (isValid) {
        // Показываем состояние загрузки
        const submitBtn = e.target;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Вход...';

        // Здесь будет реальный запрос к серверу
        simulateServerRequest(loginInput.value, passwordInput.value)
            .then(response => {
                if (response.success) {
                    window.location.href = 'account.html';
                } else {
                    // Обработка ошибок сервера
                    if (response.errorType === 'login') {
                        loginError.textContent = 'Неверный номер телефона/e-mail';
                        loginInput.classList.add('input-error');
                    } else if (response.errorType === 'password') {
                        passwordError.textContent = 'Неверный пароль';
                        passwordInput.classList.add('input-error');
                    } else {
                        // Общая ошибка
                        loginError.textContent = response.message || 'Ошибка авторизации';
                    }
                }
            })
            .catch(error => {
                console.error('Ошибка:', error);
                loginError.textContent = 'Произошла ошибка при авторизации';
            })
            .finally(() => {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Войти';
            });
    }
});

// Функция для имитации запроса к серверу (в реальном приложении заменить на fetch)
function simulateServerRequest(login, password) {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Имитация ответа сервера
            // В реальном приложении здесь будет fetch-запрос:
            /*
            fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ login, password })
            })
            .then(response => response.json())
            

            // Пример неудачной авторизации (для демонстрации)
            // const mockResponses = [
            //     { success: false, errorType: 'login', message: 'Неверный номер телефона/e-mail' },
            //     { success: false, errorType: 'password', message: 'Неверный пароль' }
            // ];

            // Случайный выбор ошибки для демонстрации
            // resolve(mockResponses[Math.floor(Math.random() * mockResponses.length)]);

            // Для успешной авторизации использовать:

            resolve({ success: true });
        }, 1000);
    });
}
*/

document.getElementById('auth-btn').addEventListener('click', async function (e) {
    e.preventDefault();

    const loginInput = document.getElementById('login');
    const passwordInput = document.getElementById('password');
    const loginError = document.getElementById('loginError');
    const passwordError = document.getElementById('passwordError');

    // Сбрасываем предыдущие ошибки
    loginError.textContent = '';
    passwordError.textContent = '';
    loginInput.classList.remove('input-error');
    passwordInput.classList.remove('input-error');

    let isValid = true;

    // Проверяем валидность email или телефона
    const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    const phonePattern = /^(\+7|8)[\s\-]?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}$/;

    if (!emailPattern.test(loginInput.value) && !phonePattern.test(loginInput.value)) {
        loginError.textContent = 'Пожалуйста, введите корректный email или номер телефона';
        loginInput.classList.add('input-error');
        isValid = false;
    }

    // Проверяем, что пароль не пустой
    if (passwordInput.value.trim() === '') {
        passwordError.textContent = 'Пожалуйста, введите пароль';
        passwordInput.classList.add('input-error');
        isValid = false;
    }

    // Если клиентские проверки пройдены, отправляем на сервер
    if (isValid) {
        /*
        const request = await fetch('/account', { // Используем относительный URL
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                login: loginInput.value,
                password: passwordInput.value
            })
        })

        //const response = await request.json()

        if (!request.ok) {
            if (request.errorType == 'loginError'){
                loginError.textContent = request.errorMessage
            }
            else{
                passwordError.textContent = request.errorMessage
            }
        }

        //window.location.href = request.redirectUrl
        */
        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({
                    login: loginInput.value,
                    password: passwordInput.value
                })
            });

            // Проверка типа контента
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Неверный формат ответа сервера');
            }

            const responseData = await response.json();

            if (!response.ok) {
                if (responseData.errorType === 'loginError') {
                    loginError.textContent = responseData.message;
                    loginInput.classList.add('input-error');
                } else {
                    passwordError.textContent = responseData.message;
                    passwordInput.classList.add('input-error');
                }
                return;
            }

            window.location.href = responseData.redirectUrl;
        } catch (error) {
            passwordError.textContent = 'Ошибка сервера: ' + error.message;
        }
    }

})

// Сбрасываем ошибки при фокусе на поля
document.getElementById('login').addEventListener('focus', function () {
    this.classList.remove('input-error');
    document.getElementById('loginError').textContent = '';
});

document.getElementById('password').addEventListener('focus', function () {
    this.classList.remove('input-error');
    document.getElementById('passwordError').textContent = '';
});