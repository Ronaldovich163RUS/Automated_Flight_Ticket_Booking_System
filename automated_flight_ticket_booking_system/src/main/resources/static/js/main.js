// Данные городов с координатами и ценами
const citiesData = [
    { name: "Москва", lng: 37.6176, lat: 55.7558, price: "5 000" },
    { name: "Санкт-Петербург", lng: 30.3086, lat: 59.9375, price: "6 500" },
    { name: "Казань", lng: 49.1088, lat: 55.7961, price: "7 200" },
    { name: "Сочи", lng: 39.7233, lat: 43.5855, price: "8 000" },
    { name: "Краснодар", lng: 38.9750, lat: 45.0355, price: "7 800" },
    { name: "Екатеринбург", lng: 60.5975, lat: 56.8380, price: "6 800" },
    { name: "Новосибирск", lng: 82.9256, lat: 55.0084, price: "9 500" },
    { name: "Владивосток", lng: 131.8856, lat: 43.1155, price: "15 000" }
];

// Класс для работы с датами и их валидации
class DateValidator {
    static isFutureDate(dateString) {
        if (!dateString) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const inputDate = new Date(dateString);
        inputDate.setHours(0, 0, 0, 0);
        return inputDate >= today;
    }

    static isAfter(dateString1, dateString2) {
        if (!dateString1 || !dateString2) return false;
        const date1 = new Date(dateString1);
        const date2 = new Date(dateString2);
        date1.setHours(0, 0, 0, 0);
        date2.setHours(0, 0, 0, 0);
        return date1 > date2;
    }

    static isSameOrAfter(dateString1, dateString2) {
        if (!dateString1 || !dateString2) return false;
        const date1 = new Date(dateString1);
        const date2 = new Date(dateString2);
        date1.setHours(0, 0, 0, 0);
        date2.setHours(0, 0, 0, 0);
        return date1 >= date2;
    }

    static getToday() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    static setMinReturnDate() {
        const departureDate = document.getElementById('departure-date').value;
        const returnDateInput = document.getElementById('return-date');
        if (returnDateInput) {
            returnDateInput.min = departureDate || DateValidator.getToday();
        }
    }
}

// Класс для валидации формы
class FormValidator {
    constructor(formId) {
        this.form = document.getElementById(formId);
        this.hasSubmitted = false;
        this.hasInteracted = {};
        this.setupValidationRules();
        this.setupEventListeners();
        this.initializeForm();
    }

    initializeForm() {
        // Устанавливаем "В одну сторону" по умолчанию
        const oneWayRadio = document.getElementById('one-way');
        const returnDateGroup = document.getElementById('return-date-group');
        const returnDateInput = document.getElementById('return-date');
        
        if (oneWayRadio) {
            oneWayRadio.checked = true;
        }
        
        if (returnDateGroup) {
            returnDateGroup.style.visibility = 'hidden';
        }
        
        if (returnDateInput) {
            returnDateInput.removeAttribute('required');
        }

        // Устанавливаем минимальную дату для поля вылета
        const departureDateInput = document.getElementById('departure-date');
        if (departureDateInput) {
            const today = DateValidator.getToday();
            departureDateInput.setAttribute('min', today);
        }
    }

    setupValidationRules() {
        this.rules = {
            'to': {
                required: true,
                message: 'Пожалуйста, выберите город назначения'
            },
            'departure-date': {
                required: true,
                message: 'Пожалуйста, укажите дату вылета',
                validate: (value) => DateValidator.isFutureDate(value),
                errorMessage: 'Дата вылета не может быть в прошлом'
            },
            'return-date': {
                required: () => document.getElementById('round-trip').checked,
                message: 'Пожалуйста, укажите дату возвращения',
                validate: (value) => {
                    const departureDate = document.getElementById('departure-date').value;
                    return DateValidator.isSameOrAfter(value, departureDate);
                },
                errorMessage: 'Дата возвращения должна быть не раньше даты вылета'
            }
        };
    }

    setupEventListeners() {
        Object.keys(this.rules).forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                // Отмечаем поле как "взаимодействованное" при фокусе или изменении
                field.addEventListener('focus', () => {
                    this.hasInteracted[fieldId] = true;
                });

                field.addEventListener('input', () => {
                    if (this.hasInteracted[fieldId]) {
                        this.validateField(fieldId);
                    }
                });

                field.addEventListener('blur', () => {
                    if (this.hasInteracted[fieldId]) {
                        this.validateField(fieldId);
                    }
                });
            }
        });

        // Обработчики для даты возвращения
        const returnDateInput = document.getElementById('return-date');
        const departureDateInput = document.getElementById('departure-date');

        if (returnDateInput) {
            returnDateInput.addEventListener('focus', () => {
                DateValidator.setMinReturnDate();
            });
        }

        if (departureDateInput) {
            departureDateInput.addEventListener('change', function () {
                const returnDateInput = document.getElementById('return-date');
                if (returnDateInput.value && returnDateInput.value < this.value) {
                    returnDateInput.value = '';
                }
                DateValidator.setMinReturnDate();
            });
        }

        document.getElementById('one-way')?.addEventListener('change', () => {
            this.clearError('return-date');
        });

        document.getElementById('round-trip')?.addEventListener('change', () => {
            if (this.hasInteracted['return-date']) {
                this.validateField('return-date');
            }
            DateValidator.setMinReturnDate();
        });
    }

    validateField(fieldId) {
        const field = document.getElementById(fieldId);
        const rule = this.rules[fieldId];
        
        if (!field || !rule) return true;

        // Очищаем предыдущую ошибку
        this.clearError(fieldId);

        // Проверяем обязательность поля
        const isRequired = typeof rule.required === 'function' ? rule.required() : rule.required;
        
        if (isRequired && !field.value.trim()) {
            this.showError(fieldId, rule.message);
            return false;
        }

        // Если есть дополнительная валидация
        if (rule.validate && field.value) {
            if (!rule.validate(field.value)) {
                this.showError(fieldId, rule.errorMessage);
                return false;
            }
        }

        return true;
    }

    validateForm() {
        this.hasSubmitted = true;
        let isValid = true;

        // Помечаем все поля как взаимодействованные при отправке формы
        Object.keys(this.rules).forEach(fieldId => {
            this.hasInteracted[fieldId] = true;
        });

        Object.keys(this.rules).forEach(fieldId => {
            if (!this.validateField(fieldId)) {
                isValid = false;
            }
        });

        return isValid;
    }

    showError(fieldId, message) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        const formGroup = field.closest('.form-group');
        if (!formGroup) return;

        formGroup.classList.add('error');
        
        let errorDiv = formGroup.querySelector('.error-message');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            formGroup.appendChild(errorDiv);
        }
        
        errorDiv.textContent = message;
    }

    clearError(fieldId) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        const formGroup = field.closest('.form-group');
        if (!formGroup) return;

        formGroup.classList.remove('error');
        
        const errorDiv = formGroup.querySelector('.error-message');
        if (errorDiv) {
            errorDiv.textContent = '';
        }
    }
}

// Функция для выбора города
window.selectCity = function (cityName) {
    const toInput = document.getElementById('to');
    if (toInput) {
        toInput.value = cityName;
        if (window.formValidator) {
            window.formValidator.clearError('to');
        }
        const map = document.getElementById('russia-map');
        if (map && map.balloon) {
            map.balloon.close();
        }
        document.querySelector('#search').scrollIntoView({
            behavior: 'smooth'
        });
    }
};

// Инициализация карты
function initMap() {
    if (typeof ymaps === 'undefined') return;

    const map = new ymaps.Map('russia-map', {
        center: [62, 94],
        zoom: 3,
        controls: ['zoomControl']
    });

    map.setBounds([[41.19, 19.25], [81.25, 190]]);

    citiesData.forEach(city => {
        const marker = new ymaps.Placemark(
            [city.lat, city.lng],
            {
                balloonContent: `
                    <div class="map-tooltip">
                        <div class="map-tooltip-title">${city.name}</div>
                        <div>Минимальная цена:</div>
                        <div class="map-tooltip-price">от ${city.price} ₽</div>
                        <button class="map-tooltip-button" onclick="selectCity('${city.name}')">Выбрать этот город</button>
                    </div>
                `,
                hintContent: city.name
            },
            {
                preset: 'islands#orangeDotIcon',
                iconColor: '#ff6b00'
            }
        );

        map.geoObjects.add(marker);
    });

    let resizeTimer;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            map.container.fitToViewport();
        }, 200);
    });
}

// Основной код
document.addEventListener('DOMContentLoaded', function () {
    if (document.getElementById('russia-map')) {
        ymaps.ready(initMap);
    }

    window.formValidator = new FormValidator('ticket-search-form');

    const oneWayRadio = document.getElementById('one-way');
    const roundTripRadio = document.getElementById('round-trip');
    const returnDateGroup = document.getElementById('return-date-group');
    const returnDateInput = document.getElementById('return-date');
    const departureDateInput = document.getElementById('departure-date');

    // Установка минимальной даты для вылета (сегодня)
    if (departureDateInput) {
        const today = DateValidator.getToday();
        departureDateInput.setAttribute('min', today);

        departureDateInput.addEventListener('change', function () {
            // При изменении даты вылета обновляем минимальную дату для возвращения
            if (returnDateInput) {
                returnDateInput.setAttribute('min', this.value);

                // Если дата возвращения уже выбрана и теперь она раньше новой даты вылета
                if (returnDateInput.value && returnDateInput.value < this.value) {
                    returnDateInput.value = '';
                    window.formValidator.clearError('return-date');
                }
            }
        });
    }

    oneWayRadio?.addEventListener('change', function () {
        if (this.checked) {
            returnDateGroup.style.visibility = 'hidden';
            returnDateInput.removeAttribute('required');
        }
    });

    roundTripRadio?.addEventListener('change', function () {
        if (this.checked) {
            returnDateGroup.style.visibility = 'visible';
            returnDateInput.setAttribute('required', '');
            DateValidator.setMinReturnDate();
        }
    });

    if (oneWayRadio?.checked) {
        returnDateGroup.style.visibility = 'hidden';
        returnDateInput.removeAttribute('required');
    }

    // Управление пассажирами
    const decreaseAdults = document.getElementById('decrease-adults');
    const increaseAdults = document.getElementById('increase-adults');
    const adultsCount = document.getElementById('adults-count');
    const decreaseChildren = document.getElementById('decrease-children');
    const increaseChildren = document.getElementById('increase-children');
    const childrenCount = document.getElementById('children-count');
    const decreaseInfants = document.getElementById('decrease-infants');
    const increaseInfants = document.getElementById('increase-infants');
    const infantsCount = document.getElementById('infants-count');
    const totalPassengers = document.getElementById('total-passengers');

    function updatePassengerCount() {
        const adults = parseInt(adultsCount.textContent);
        const children = parseInt(childrenCount.textContent);
        const infants = parseInt(infantsCount.textContent);
        const totalMainPassengers = adults + children;
        const totalAllPassengers = adults + children + infants;

        totalPassengers.textContent = totalAllPassengers;

        if (increaseAdults) increaseAdults.disabled = totalMainPassengers >= 3;
        if (increaseChildren) increaseChildren.disabled = totalMainPassengers >= 3;
        if (increaseInfants) increaseInfants.disabled = infants >= adults;
        if (decreaseAdults) decreaseAdults.disabled = adults <= 1;
        if (decreaseChildren) decreaseChildren.disabled = children <= 0;
        if (decreaseInfants) decreaseInfants.disabled = infants <= 0;
    }

    function changePassengerCount(element, increment) {
        let count = parseInt(element.textContent);
        const adults = parseInt(adultsCount.textContent);
        const children = parseInt(childrenCount.textContent);
        const infants = parseInt(infantsCount.textContent);
        const totalMainPassengers = adults + children;

        if ((element === adultsCount || element === childrenCount) && increment > 0) {
            if (totalMainPassengers >= 3) return;
        }

        if (element === infantsCount && increment > 0) {
            if (infants >= adults) return;
        }

        count += increment;

        if (count < 0) count = 0;
        if (element === adultsCount && count < 1) count = 1;

        element.textContent = count;

        if (element === adultsCount && increment < 0) {
            const newAdults = parseInt(adultsCount.textContent);
            const currentInfants = parseInt(infantsCount.textContent);
            if (currentInfants > newAdults) {
                infantsCount.textContent = newAdults;
            }
        }

        updatePassengerCount();
    }

    if (decreaseAdults) decreaseAdults.addEventListener('click', () => changePassengerCount(adultsCount, -1));
    if (increaseAdults) increaseAdults.addEventListener('click', () => changePassengerCount(adultsCount, 1));
    if (decreaseChildren) decreaseChildren.addEventListener('click', () => changePassengerCount(childrenCount, -1));
    if (increaseChildren) increaseChildren.addEventListener('click', () => changePassengerCount(childrenCount, 1));
    if (decreaseInfants) decreaseInfants.addEventListener('click', () => changePassengerCount(infantsCount, -1));
    if (increaseInfants) increaseInfants.addEventListener('click', () => changePassengerCount(infantsCount, 1));

    updatePassengerCount();

    // Плавная прокрутка
    document.querySelectorAll('nav a').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerHeight = document.querySelector('header').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Карусель отзывов
    const carousel = document.getElementById('carousel');
    const dots = document.querySelectorAll('.carousel-dot');
    let currentIndex = 0;
    let autoScrollInterval;

    if (carousel && dots.length > 0) {
        function updateCarousel(index) {
            const scrollPosition = index * 340;
            carousel.scrollTo({
                left: scrollPosition,
                behavior: 'smooth'
            });

            dots.forEach(dot => dot.classList.remove('active'));
            dots[index].classList.add('active');
            currentIndex = index;
        }

        dots.forEach((dot, index) => {
            dot.addEventListener('click', function () {
                updateCarousel(index);
                resetAutoScroll();
            });
        });

        function startAutoScroll() {
            autoScrollInterval = setInterval(() => {
                currentIndex = (currentIndex + 1) % dots.length;
                updateCarousel(currentIndex);
            }, 5000);
        }

        function resetAutoScroll() {
            clearInterval(autoScrollInterval);
            startAutoScroll();
        }

        startAutoScroll();

        carousel.addEventListener('mouseenter', () => clearInterval(autoScrollInterval));
        carousel.addEventListener('mouseleave', startAutoScroll);
    }

    function handleServerErrors(responseData) {
        // Сброс предыдущих ошибок
        document.querySelectorAll('.error-message').forEach(el => el.remove());

        // Обработка полевых ошибок
        if (responseData.fieldErrors) {
            Object.entries(responseData.fieldErrors).forEach(([field, message]) => {
                const input = document.getElementById(field);
                if (input) {
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'error-message';
                    errorDiv.textContent = message;
                    input.closest('.form-group').appendChild(errorDiv);
                }
            });
        }

        // Обработка глобальных ошибок (например, infants > adults)
        if (responseData.globalErrors) {
            responseData.globalErrors.forEach(message => {
                showErrorNotification(message);
            });
        }
    }

    document.getElementById('search-btn').addEventListener('click', async function() {
        if (window.formValidator.validateForm()) {
            const formData = {
                destinationCity: document.getElementById('to').value,
                tripType: document.querySelector('input[id="one-way"]').checked,
                departureDate: document.getElementById('departure-date').value,
                returnDate: document.getElementById('return-date').value || null,
                adults: parseInt(document.querySelector('span[id="adults-count"]').textContent),
                children: parseInt(document.querySelector('span[id="children-count"]').textContent),
                infants: parseInt(document.querySelector('span[id="infants-count"]').textContent)
            };
            
            try {
                const response = await fetch('/', {
                    method: 'POST',
                    body: JSON.stringify(formData),
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });

                const data = await response.json();
                if (!response.ok) {
                    handleServerErrors(data);
                    return;
                }
                else{
                    window.location.href = data.redirectUrl;
                }

            }
            catch (error) {
                console.error('Ошибка:', error);
            }
                
        }
        else {
            const firstError = document.querySelector('.error');
            if (firstError) {
                firstError.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        }
    });

    const searchForm = document.getElementById('ticket-search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', function (e) {
            e.preventDefault();
        });
    }
});