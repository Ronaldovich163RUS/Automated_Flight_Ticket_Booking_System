document.addEventListener("DOMContentLoaded", function () {
  // Основные элементы управления
  const flightDetails = document.getElementById("flight-details");
  const baggageOptions = document.getElementById("baggage-options");
  const bookFlightBtn = document.getElementById("book-flight");
  const selectSeatsBtn = document.getElementById("select-seats");
  const totalAmount = document.getElementById("total-amount");

  console.log(seatsInfo);
  // Счетчики пассажиров
  const adultsCountElement = document.getElementById("adults-count");
  const childrenCountElement = document.getElementById("children-count");
  const infantsCountElement = document.getElementById("infants-count");

  // Глобальный объект для хранения данных пассажиров
  let passengersData = {};

  // Безопасно получаем количество выбранных мест (багажа)
  const selectedSeatsCount =
    seatsInfo && seatsInfo.totalBaggageCount ? seatsInfo.totalBaggageCount : 0;
  console.log("selectedSeatsCount:", selectedSeatsCount);
  const priceForSeats = 2000; // ПОЛУЧАЕТСЯ ИЗ ПОЛУЧЕННЫХ ДАННЫХ СО СТРАНИЦЫ ВЫБОРА МЕСТ

  // Получаем количество пассажиров из localStorage или с сервера
  let passengersCount = 1;
  if (localStorage.getItem("passengers")) {
    passengersCount = parseInt(localStorage.getItem("passengers"), 10);
    localStorage.removeItem("passengers");
  } else if (
    typeof passengers !== "undefined" &&
    passengers !== null &&
    !isNaN(passengers) &&
    Number(passengers) > 0
  ) {
    passengersCount = Number(passengers);
  }
  let adults = 1;
  let children = 0;
  if (passengersCount > 1) {
    adults = 1;
    children = passengersCount - 1;
  }
  adultsCountElement.textContent = adults;
  childrenCountElement.textContent = children;
  // infantsCountElement оставляем 0

  // Контактная информация
  const contactEmail = document.getElementById("contact-email");
  const contactPhone = document.getElementById("contact-phone");

  console.log("isRoundTrip: " + isRoundTrip);
  if (isRoundTrip) {
    console.log("outboundFlight: " + JSON.stringify(outboundFlight));
    console.log("returnFlight: " + JSON.stringify(returnFlight));
    const outboundSelectSeat = document.getElementById("select-seats-outbound");
    const returnSelectSeat = document.getElementById("select-seats-return");
    outboundSelectSeat.addEventListener("click", async function () {
      const adults = parseInt(adultsCountElement.textContent);
      const children = parseInt(childrenCountElement.textContent);

      if (isNaN(adults)) {
        console.error("Количество взрослых не является числом");
        return;
      }
      if (isNaN(children)) {
        console.error("Количество детей не является числом");
        return;
      }

      const totalPassengers = adults + children;

      const response = await fetch("/booking/seat-selection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          flightId: outboundFlight.flightID,
          passengers: totalPassengers,
        }),
      });
      if (response.ok) {
        console.log("данные отправлены");
        window.location.href = "/seat-selection";
      }
    });
    returnSelectSeat.addEventListener("click", async function () {
      const adults = parseInt(adultsCountElement.textContent);
      const children = parseInt(childrenCountElement.textContent);

      if (isNaN(adults)) {
        console.error("Количество взрослых не является числом");
        return;
      }
      if (isNaN(children)) {
        console.error("Количество детей не является числом");
        return;
      }

      const totalPassengers = adults + children;
      const response = await fetch("/booking/seat-selection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          flightId: returnFlight.flightID,
          passengers: totalPassengers,
        }),
      });
      if (response.ok) {
        console.log("данные отправлены");
        window.location.href = "/seat-selection";
      }
    });
  } else {
    console.log("outboundFlight: " + JSON.stringify(outboundFlight));
    const selectSeat = document.getElementById("select-seats");
    selectSeat.addEventListener("click", async function () {
      const adults = parseInt(adultsCountElement.textContent);
      const children = parseInt(childrenCountElement.textContent);

      if (isNaN(adults)) {
        console.error("Количество взрослых не является числом");
        return;
      }
      if (isNaN(children)) {
        console.error("Количество детей не является числом");
        return;
      }

      const totalPassengers = adults + children;
      // Сохраняем данные пассажиров
      const forms = document.querySelectorAll(".passenger-form");
      const passengersArr = [];
      forms.forEach((form) => {
        passengersArr.push({
          lastName: form.querySelector('[name="surname"]').value,
          firstName: form.querySelector('[name="name"]').value,
          middleName: form.querySelector('[name="patronymic"]').value || null,
          sex: form.querySelector('[name="gender"]').value,
          dateOfBirth: form.querySelector('[name="birthdate"]').value,
          citizenship: form.querySelector('[name="citizenship"]').value,
          typeOfDocument: form.querySelector('[name="documentType"]').value,
          seriesOfDocument: form.querySelector('[name="documentSeries"]').value,
          numberOfDocument: form.querySelector('[name="documentNumber"]').value,
        });
      });
      localStorage.setItem("passengerForms", JSON.stringify(passengersArr));
      localStorage.setItem("passengers", totalPassengers);
      console.log(
        `Сумма ${adults} + ${children} = ${totalPassengers} сохранена`
      );
      const response = await fetch("/booking/seat-selection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          flightId: outboundFlight.flightID,
          passengers: totalPassengers,
        }),
      });
      if (response.ok) {
        console.log("данные отправлены");
        window.location.href = "/seat-selection";
      }
    });
  }

  // Состояние формы
  let state = {
    flight: null,
    passengers: {
      adult: 1,
      child: 0,
      infant: 0,
    },
    selectedBaggage: null,
    totalCost: 0,
    seats: [], // Пока используем моковые данные
    contact: {
      email: "",
      phone: "",
    },
    passengerForms: [],
    touchedFields: {},
  };

  // Инициализация страницы
  initPage();

  // Инициализация счетчиков пассажиров
  initPassengerCounters();

  // Инициализация форм пассажиров
  updatePassengerForms();

  // Обработчики событий для контактной информации
  if (contactEmail) {
    contactEmail.addEventListener("blur", validateEmail);
    contactEmail.addEventListener("input", () => {
      resetField(contactEmail);
      state.contact.email = contactEmail.value;
    });
  }

  if (contactPhone) {
    contactPhone.addEventListener("blur", validatePhone);
    contactPhone.addEventListener("input", () => {
      resetField(contactPhone);
      state.contact.phone = contactPhone.value;
    });
  }

  // Обработчик для кнопки бронирования
  if (bookFlightBtn) {
    bookFlightBtn.addEventListener("click", function (e) {
      if (!validateAllPassengerForms()) {
        // Валидация не пройдена, отменяем бронирование
        e.preventDefault();
        return;
      }

      // Если валидация пройдена, выполняем обработку бронирования
      handleBooking(e);
    });
  }

  // Обработчик для кнопки выбора мест
  if (selectSeatsBtn) {
    selectSeatsBtn.addEventListener("click", () => {
      const adults = parseInt(adultsCountElement.textContent);
      const children = parseInt(childrenCountElement.textContent);

      if (isNaN(adults)) {
        console.error("Количество взрослых не является числом");
        return;
      }
      if (isNaN(children)) {
        console.error("Количество детей не является числом");
        return;
      }

      const totalPassengers = adults + children;
      // Сохраняем данные пассажиров
      const forms = document.querySelectorAll(".passenger-form");
      const passengersArr = [];
      forms.forEach((form) => {
        passengersArr.push({
          lastName: form.querySelector('[name="surname"]').value,
          firstName: form.querySelector('[name="name"]').value,
          middleName: form.querySelector('[name="patronymic"]').value || null,
          sex: form.querySelector('[name="gender"]').value,
          dateOfBirth: form.querySelector('[name="birthdate"]').value,
          citizenship: form.querySelector('[name="citizenship"]').value,
          typeOfDocument: form.querySelector('[name="documentType"]').value,
          seriesOfDocument: form.querySelector('[name="documentSeries"]').value,
          numberOfDocument: form.querySelector('[name="documentNumber"]').value,
        });
      });
      localStorage.setItem("passengerForms", JSON.stringify(passengersArr));
      localStorage.setItem("passengers", totalPassengers);
      console.log(
        `Сумма ${adults} + ${children} = ${totalPassengers} сохранена`
      );
      window.location.href = "/seat-selection";
    });
  }

  function getPassengerData(form) {
    return {
      lastName: form.querySelector('[name="surname"]').value,
      firstName: form.querySelector('[name="name"]').value,
      middleName: form.querySelector('[name="patronymic"]').value || null,
      sex: form.querySelector('[name="gender"]').value,
      dateOfBirth: form.querySelector('[name="birthdate"]').value,
      citizenship: form.querySelector('[name="citizenship"]').value,
      typeOfDocument: form.querySelector('[name="documentType"]').value,
      seriesOfDocument: form.querySelector('[name="documentSeries"]').value,
      numberOfDocument: form.querySelector('[name="documentNumber"]').value,
    };
  }

  // Форматирование дат и времени для карточки билета (аналогично results.js)
  function formatTimeStr(timeStr) {
    // Ожидается формат HH:mm:ss или HH:mm
    if (!timeStr) return "";
    return timeStr.substring(0, 5);
  }
  function formatDateStr(dateStr) {
    // Ожидается формат yyyy-MM-dd или yyyy-MM-ddTHH:mm:ss
    if (!dateStr) return "";
    if (dateStr.includes("T")) dateStr = dateStr.split("T")[0];
    const [year, month, day] = dateStr.split("-");
    if (!year || !month || !day) return dateStr;
    return `${day}.${month}.${year}`;
  }
  const depTime = document.getElementById("departureTime");
  if (depTime && depTime.lastElementChild) {
    depTime.lastElementChild.textContent = formatTimeStr(
      depTime.lastElementChild.textContent
    );
  }
  const arrTime = document.getElementById("arrivalTime");
  if (arrTime && arrTime.lastElementChild) {
    arrTime.lastElementChild.textContent = formatTimeStr(
      arrTime.lastElementChild.textContent
    );
  }
  const depDate = document.getElementById("departureDate");
  if (depDate) {
    depDate.textContent = formatDateStr(depDate.textContent);
  }
  const arrDate = document.getElementById("arrivalDate");
  if (arrDate) {
    arrDate.textContent = formatDateStr(arrDate.textContent);
  }
  const durationElem = document.getElementById("flightDuration");
  if (durationElem) {
    durationElem.textContent = formatDuration(durationElem.textContent);
  }

  // Форматирование дат и времени для обратного билета (если есть)
  const returnDepTime = document.getElementById("returnDepartureTime");
  if (returnDepTime && returnDepTime.lastElementChild) {
    returnDepTime.lastElementChild.textContent = formatTimeStr(
      returnDepTime.lastElementChild.textContent
    );
  }
  const returnArrTime = document.getElementById("returnArrivalTime");
  if (returnArrTime && returnArrTime.lastElementChild) {
    returnArrTime.lastElementChild.textContent = formatTimeStr(
      returnArrTime.lastElementChild.textContent
    );
  }
  const returnDepDate = document.getElementById("returnDepartureDate");
  if (returnDepDate) {
    returnDepDate.textContent = formatDateStr(returnDepDate.textContent);
  }
  const returnArrDate = document.getElementById("returnArrivalDate");
  if (returnArrDate) {
    returnArrDate.textContent = formatDateStr(returnArrDate.textContent);
  }
  const returnDurationElem = document.getElementById("returnFlightDuration");
  if (returnDurationElem) {
    returnDurationElem.textContent = formatDuration(
      returnDurationElem.textContent
    );
  }

  // --- Логика счётчика багажа ---
  const baggageCountEl = document.getElementById("baggage-count");
  const decreaseBaggageBtn = document.getElementById("decrease-baggage");
  const increaseBaggageBtn = document.getElementById("increase-baggage");
  const maxBaggage = 5;
  if (baggageCountEl && decreaseBaggageBtn && increaseBaggageBtn) {
    function updateBaggageButtons() {
      const count = parseInt(baggageCountEl.textContent, 10) || 0;
      decreaseBaggageBtn.disabled = count <= 0;
      increaseBaggageBtn.disabled = count >= maxBaggage;
    }
    decreaseBaggageBtn.addEventListener("click", function () {
      let count = parseInt(baggageCountEl.textContent, 10) || 0;
      if (count > 0) {
        count--;
        baggageCountEl.textContent = count;
        updateBaggageButtons();
        updateTotalCost();
      }
    });
    increaseBaggageBtn.addEventListener("click", function () {
      let count = parseInt(baggageCountEl.textContent, 10) || 0;
      if (count < maxBaggage) {
        count++;
        baggageCountEl.textContent = count;
        updateBaggageButtons();
        updateTotalCost();
      }
    });
    updateBaggageButtons();
  }

  async function initPage() {
    try {
      // Получаем информацию о рейсе из URL
      const urlParams = new URLSearchParams(window.location.search);
      const flightId = urlParams.get("flightId");

      if (flightId) {
        // Загружаем информацию о рейсе
        const flightResponse = await fetch(`/api/flights/${flightId}`);
        if (!flightResponse.ok) {
          throw new Error("Не удалось загрузить информацию о рейсе");
        }

        state.flight = await flightResponse.json();
        populateFlightInfo(state.flight);

        // Инициализируем форму для первого пассажира
        updatePassengerForms();
        updateTotalCost();

        // Добавляем обработчики для выбора тарифа багажа
        document.querySelectorAll(".baggage-option").forEach((option) => {
          option.addEventListener("click", () => {
            document
              .querySelectorAll(".baggage-option")
              .forEach((opt) => opt.classList.remove("selected"));
            option.classList.add("selected");
            state.selectedBaggage = {
              baggageRateId: parseInt(option.dataset.id),
              price: parseFloat(option.querySelector(".price").textContent),
            };
            updateTotalCost();
          });
        });
      } else {
        throw new Error("Не указан ID рейса");
      }
    } catch (error) {
      showNotification(error.message, "error");
    }
  }

  function populateFlightInfo(flight) {
    // Format dates and times
    const departureDate = new Date(flight.departureTime);
    const arrivalDate = new Date(flight.arrivalTime);

    // Calculate duration
    const duration = Math.floor((arrivalDate - departureDate) / (1000 * 60)); // in minutes
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;

    // Update DOM elements
    document.getElementById("departureTime").textContent =
      departureDate.toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
      });
    document.getElementById("departureDate").textContent =
      departureDate.toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    document.getElementById("departureCity").textContent = flight.departureCity;

    document.getElementById("arrivalTime").textContent =
      arrivalDate.toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
      });
    document.getElementById("arrivalDate").textContent =
      arrivalDate.toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    document.getElementById("arrivalCity").textContent = flight.arrivalCity;

    document.getElementById("flightDuration").textContent =
      formatDuration(duration);
    document.getElementById("airlineName").textContent = flight.airline;
    document.getElementById("flightNumber").textContent = flight.flightNumber;
  }

  function displayFlightInfo(flight) {
    const departureDate = new Date(flight.departureDate);
    const departureTime = flight.departureTime.split(":");
    departureDate.setHours(departureTime[0], departureTime[1]);

    const arrivalDate = new Date(departureDate);
    const [hours, minutes] = flight.flightDuration.split(":");
    arrivalDate.setHours(
      arrivalDate.getHours() + parseInt(hours),
      arrivalDate.getMinutes() + parseInt(minutes)
    );

    flightDetails.innerHTML = `
            <div class="flight-route">
                <h3>${flight.departureCity} → ${flight.destinationCity}</h3>
                <p>Рейс ${flight.flightNumber}</p>
            </div>
            <div class="flight-schedule">
                <div class="departure">
                    <strong>Вылет:</strong>
                    <p>${formatDate(departureDate)}</p>
                    <p>${formatTime(departureDate)}</p>
                </div>
                <div class="arrival">
                    <strong>Прилет:</strong>
                    <p>${formatDate(arrivalDate)}</p>
                    <p>${formatTime(arrivalDate)}</p>
                </div>
            </div>
            <div class="flight-duration">
                <strong>Длительность:</strong>
                <p>${flight.flightDuration}</p>
            </div>
        `;
  }

  function displayBaggageOptions(rates) {
    baggageOptions.innerHTML = rates
      .map(
        (rate) => `
            <div class="baggage-option" data-id="${rate.baggageRateId}">
                <h3>${rate.name}</h3>
                <p class="price">${rate.price} ₽</p>
            </div>
        `
      )
      .join("");

    // Добавляем обработчики для выбора тарифа
    document.querySelectorAll(".baggage-option").forEach((option) => {
      option.addEventListener("click", () => {
        document
          .querySelectorAll(".baggage-option")
          .forEach((opt) => opt.classList.remove("selected"));
        option.classList.add("selected");
        state.selectedBaggage = rates.find(
          (r) => r.baggageRateId === parseInt(option.dataset.id)
        );
        updateTotalCost();
      });
    });
  }

  function initPassengerCounters() {
    const counters = document.querySelectorAll(".counter");

    counters.forEach((counter) => {
      const input = counter.querySelector("input");
      const decreaseBtn = counter.querySelector(".decrease");
      const increaseBtn = counter.querySelector(".increase");

      decreaseBtn.addEventListener("click", () => {
        if (parseInt(input.value) > parseInt(input.min)) {
          input.value = parseInt(input.value) - 1;
          updatePassengerCount();
          updatePassengerForms();
        }
      });

      increaseBtn.addEventListener("click", () => {
        if (parseInt(input.value) < parseInt(input.max)) {
          input.value = parseInt(input.value) + 1;
          updatePassengerCount();
          updatePassengerForms();
        }
      });

      input.addEventListener("change", () => {
        updatePassengerCount();
        updatePassengerForms();
      });
    });
  }

  function updatePassengerCount() {
    const adults = parseInt(adultsCountElement.textContent) || 1;
    const children = parseInt(childrenCountElement.textContent) || 0;
    const infants = parseInt(infantsCountElement.textContent) || 0;
    const totalMainPassengers = adults + children;

    // Обновление состояния кнопок
    document.querySelectorAll(".counter").forEach((counter) => {
      const input = counter.querySelector("input");
      const decreaseBtn = counter.querySelector(".decrease");
      const increaseBtn = counter.querySelector(".increase");

      if (!input || !decreaseBtn || !increaseBtn) return;

      if (input.id === "adult-count" || input.id === "child-count") {
        increaseBtn.disabled = totalMainPassengers >= 9;
        decreaseBtn.disabled = parseInt(input.value) <= parseInt(input.min);
      } else if (input.id === "infant-count") {
        increaseBtn.disabled = infants >= adults || infants >= 9;
        decreaseBtn.disabled = parseInt(input.value) <= 0;
      }
    });
  }

  function reindexPassengerData(oldIndexes, newIndexes) {
    const newData = {};
    newIndexes.forEach((oldIndex, newIndex) => {
      if (passengersData[oldIndex]) {
        newData[newIndex] = passengersData[oldIndex];
      }
    });
    passengersData = newData;
  }

  function updatePassengerForms() {
    const container = document.getElementById("passenger-forms-container");
    if (!container) return;

    // Сохраняем данные из текущих форм
    const currentForms = container.querySelectorAll(".passenger-form");
    currentForms.forEach((form, index) => {
      passengersData[index] = getPassengerData(form);
    });

    // Получаем актуальные количества
    const adults = parseInt(
      document.getElementById("adults-count")?.textContent || "1"
    );
    const children = parseInt(
      document.getElementById("children-count")?.textContent || "0"
    );
    const totalPassengers = adults + children;

    // Удаляем данные для удаленных пассажиров
    Object.keys(passengersData).forEach((key) => {
      if (parseInt(key) >= totalPassengers) {
        delete passengersData[key];
      }
    });

    container.innerHTML = "";

    // Создаем формы с сохраненными данными
    for (let i = 0; i < adults; i++) {
      container.appendChild(createPassengerForm("adult", i));
    }
    for (let i = 0; i < children; i++) {
      container.appendChild(createPassengerForm("child", adults + i));
    }

    updateTotalCost();

    // После создания форм пассажиров (после updatePassengerForms())
    setTimeout(() => {
      const savedPassengerForms = localStorage.getItem("passengerForms");
      if (savedPassengerForms) {
        const passengersArr = JSON.parse(savedPassengerForms);
        const forms = document.querySelectorAll(".passenger-form");
        forms.forEach((form, idx) => {
          if (passengersArr[idx]) {
            form.querySelector('[name="surname"]').value =
              passengersArr[idx].lastName || "";
            form.querySelector('[name="name"]').value =
              passengersArr[idx].firstName || "";
            form.querySelector('[name="patronymic"]').value =
              passengersArr[idx].middleName || "";
            form.querySelector('[name="gender"]').value =
              passengersArr[idx].sex || "";
            form.querySelector('[name="birthdate"]').value =
              passengersArr[idx].dateOfBirth || "";
            form.querySelector('[name="citizenship"]').value =
              passengersArr[idx].citizenship || "";
            form.querySelector('[name="documentType"]').value =
              passengersArr[idx].typeOfDocument || "";
            form.querySelector('[name="documentSeries"]').value =
              passengersArr[idx].seriesOfDocument || "";
            form.querySelector('[name="documentNumber"]').value =
              passengersArr[idx].numberOfDocument || "";
          }
        });
        // После восстановления можно удалить
        localStorage.removeItem("passengerForms");
      }
    }, 0);
  }

  function createPassengerForm(passengerType, index) {
    // Русские подписи и плейсхолдеры
    const typeLabel =
      passengerType === "adult"
        ? "Взрослый"
        : passengerType === "child"
        ? "Ребенок"
        : "Младенец (до 2 лет)";
    const idPrefix = `${passengerType}-${index}`;
    const form = document.createElement("div");
    form.className = "passenger-form";
    form.innerHTML = `
            <h3>Пассажир ${index + 1} (${typeLabel})</h3>
            <div class="form-row">
                <div class="data-group">
                    <label for="${idPrefix}-surname">Фамилия</label>
                    <input type="text" id="${idPrefix}-surname" name="surname" placeholder="Иванов" required maxlength="15" pattern="[А-Яа-яЁё]{1,15}">
                    <div class="error-message"></div>
                </div>
                <div class="data-group">
                    <label for="${idPrefix}-name">Имя</label>
                    <input type="text" id="${idPrefix}-name" name="name" placeholder="Иван" required maxlength="15" pattern="[А-Яа-яЁё]{1,15}">
                    <div class="error-message"></div>
                </div>
                <div class="data-group">
                    <label for="${idPrefix}-patronymic">Отчество</label>
                    <input type="text" id="${idPrefix}-patronymic" name="patronymic" placeholder="Иванович" maxlength="20" pattern="[А-Яа-яЁё ]{0,20}">
                    <div class="error-message"></div>
                </div>
            </div>
            <div class="form-row">
                <div class="data-group">
                    <label for="${idPrefix}-gender">Пол</label>
                    <select id="${idPrefix}-gender" name="gender" required>
                        <option value="">Выберите пол</option>
                        <option value="MALE">Мужской</option>
                        <option value="FEMALE">Женский</option>
                    </select>
                    <div class="error-message"></div>
                </div>
                <div class="data-group">
                    <label for="${idPrefix}-birthdate">Дата рождения</label>
                    <input type="date" id="${idPrefix}-birthdate" name="birthdate" placeholder="дд.мм.гггг" required>
                    <div class="error-message"></div>
                </div>
                <div class="data-group">
                    <label for="${idPrefix}-citizenship">Гражданство</label>
                    <select id="${idPrefix}-citizenship" name="citizenship" required>
                        <option value="">Выберите гражданство</option>
                        <option value="RUSSIA">Россия</option>
                        <option value="OTHER">Другое</option>
                    </select>
                    <div class="error-message"></div>
                </div>
            </div>
            <div class="form-row">
                <div class="data-group">
                    <label for="${idPrefix}-document-type">Тип документа</label>
                    <select id="${idPrefix}-document-type" name="documentType" required>
                        <option value="">Выберите тип документа</option>
                        <option value="PASSPORT">Паспорт РФ</option>
                        <option value="INTERNATIONAL_PASSPORT">Загранпаспорт</option>
                        <option value="BIRTH_CERTIFICATE">Свидетельство о рождении</option>
                    </select>
                    <div class="error-message"></div>
                </div>
                <div class="data-group">
                    <label for="${idPrefix}-document-series">Серия документа</label>
                    <input type="text" id="${idPrefix}-document-series" name="documentSeries" required maxlength="8">
                    <div class="error-message"></div>
                </div>
                <div class="data-group">
                    <label for="${idPrefix}-document-number">Номер документа</label>
                    <input type="text" id="${idPrefix}-document-number" name="documentNumber" required maxlength="7">
                    <div class="error-message"></div>
                </div>
            </div>
        `;
    if (passengersData[index]) {
      const data = passengersData[index];
      const fields = {
        surname: data.lastName,
        name: data.firstName,
        patronymic: data.middleName,
        gender: data.sex,
        birthdate: data.dateOfBirth,
        citizenship: data.citizenship,
        documentType: data.typeOfDocument,
        documentSeries: data.seriesOfDocument,
        documentNumber: data.numberOfDocument,
      };

      for (const [name, value] of Object.entries(fields)) {
        const input = form.querySelector(`[name="${name}"]`);
        if (input && value !== null && value !== undefined) {
          input.value = value;
        }
      }
    }
    setTimeout(() => {
      const fields = [
        "surname",
        "name",
        "patronymic",
        "gender",
        "birthdate",
        "citizenship",
        "documentType",
        "documentSeries",
        "documentNumber",
      ];
      // const fields = [
      //     `${idPrefix}-surname`, `${idPrefix}-name`, `${idPrefix}-patronymic`,
      //     `${idPrefix}-gender`, `${idPrefix}-birthdate`, `${idPrefix}-citizenship`,
      //     `${idPrefix}-document-type`, `${idPrefix}-document-series`, `${idPrefix}-document-number`
      // ];

      // fields.forEach(fid => {
      //     const el = document.getElementById(fid);
      //     if (!el) return;
      //     el.addEventListener('blur', () => validatePassengerField(el));
      //     el.addEventListener('focus', () => resetPassengerField(el));
      // });

      fields.forEach((field) => {
        const input = document.getElementById(`${idPrefix}-${field}`);
        if (input) {
          input.addEventListener("input", function () {
            if (!passengersData[index]) passengersData[index] = {};
            passengersData[index][field] = this.value;
          });
        }
      });

      // Установка max для даты рождения (сегодня)
      const birthdateInput = document.getElementById(`${idPrefix}-birthdate`);
      if (birthdateInput) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const dd = String(today.getDate()).padStart(2, "0");
        birthdateInput.max = `${yyyy}-${mm}-${dd}`;
      }
      // Ограничения на ввод для ФИО
      const surnameInput = document.getElementById(`${idPrefix}-surname`);
      const nameInput = document.getElementById(`${idPrefix}-name`);
      const patronymicInput = document.getElementById(`${idPrefix}-patronymic`);
      [surnameInput, nameInput, patronymicInput].forEach((input, idx) => {
        if (!input) return;
        input.addEventListener("input", (e) => {
          // Только русские буквы (и пробел для отчества)
          let val = input.value.replace(/[^А-Яа-яЁё ]/g, "");
          // Первая буква автоматически заглавная
          if (val.length > 0) {
            val = val[0].toUpperCase() + val.slice(1);
          }
          // Ограничение по длине
          if (idx === 2) val = val.slice(0, 20); // отчество
          else val = val.slice(0, 15);
          input.value = val;
        });
      });
      // Ограничения на ввод для серии и номера документа
      const docTypeSelect = document.getElementById(
        `${idPrefix}-document-type`
      );
      const docSeriesInput = document.getElementById(
        `${idPrefix}-document-series`
      );
      const docNumberInput = document.getElementById(
        `${idPrefix}-document-number`
      );
      if (docSeriesInput && docNumberInput && docTypeSelect) {
        function updateDocSeriesNumberMask() {
          const type = docTypeSelect.value;
          if (type === "PASSPORT" || type === "passport") {
            docSeriesInput.maxLength = 4;
            docSeriesInput.value = docSeriesInput.value
              .replace(/[^0-9]/g, "")
              .slice(0, 4);
            docSeriesInput.placeholder = "4 цифры";
            docNumberInput.maxLength = 6;
            docNumberInput.value = docNumberInput.value
              .replace(/[^0-9]/g, "")
              .slice(0, 6);
            docNumberInput.placeholder = "6 цифр";
          } else if (
            type === "INTERNATIONAL_PASSPORT" ||
            type === "international_passport"
          ) {
            docSeriesInput.maxLength = 2;
            docSeriesInput.value = docSeriesInput.value
              .replace(/[^0-9]/g, "")
              .slice(0, 2);
            docSeriesInput.placeholder = "2 цифры";
            docNumberInput.maxLength = 7;
            docNumberInput.value = docNumberInput.value
              .replace(/[^0-9]/g, "")
              .slice(0, 7);
            docNumberInput.placeholder = "7 цифр";
          } else if (
            type === "BIRTH_CERTIFICATE" ||
            type === "birth_certificate"
          ) {
            docSeriesInput.maxLength = 8;
            let val = docSeriesInput.value.replace(/[^А-ЯЁ0-9-]/gi, "");
            val = val.toUpperCase();
            docSeriesInput.value = val.slice(0, 8);
            docSeriesInput.placeholder = "IV-АБ";
            docNumberInput.maxLength = 6;
            docNumberInput.value = docNumberInput.value
              .replace(/[^0-9]/g, "")
              .slice(0, 6);
            docNumberInput.placeholder = "6 цифр";
          }

          // Добавьте эти строки для валидации после изменения
          // SeriesField(docSeriesInput, type);
          // validateDocNumberField(docNumberInput, type);
        }
        docTypeSelect.addEventListener("change", function () {
          updateDocSeriesNumberMask();
          validateDocSeriesField(docSeriesInput, docTypeSelect.value);
          validateDocNumberField(docNumberInput, docTypeSelect.value);
        });
        docSeriesInput.addEventListener("input", function () {
          updateDocSeriesNumberMask();
          // Добавьте эту строку
          // validateDocSeriesField(this, docTypeSelect.value);
        });

        docNumberInput.addEventListener("input", function () {
          // Только цифры для номера документа
          this.value = this.value
            .replace(/[^0-9]/g, "")
            .slice(0, this.maxLength);
          // Добавьте эту строку
          // validateDocNumberField(this, docTypeSelect.value);
        });
        setupFieldEventListeners(docSeriesInput);
        setupFieldEventListeners(docNumberInput);
        updateDocSeriesNumberMask();
      }
      // Добавляем кнопку после формы первого пассажира
      if (index === 0) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.id = "fill-from-account";
        btn.className = "btn-orange";
        btn.style =
          "display:block;margin:18px auto 0 auto;padding:0.5rem 1.2rem;font-size:1rem;min-width:unset;max-width:220px;border-radius:8px;";
        btn.textContent = "Заполнить из ЛК";
        btn.onclick = async function () {
          try {
            const response = await fetch("/booking/client-information", {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                "X-Requested-With": "XMLHttpRequest",
              },
            });
            const data = await response.json();
            console.log(data);

            if (!response.ok) {
              console.error("Ошибка сервера: ", data.error);
              showNotification(
                "Ошибка при получении данных из личного кабинета",
                "error"
              );
              return;
            }

            // Заполняем поля формы данными из ЛК
            const form = this.closest(".passenger-form");

            if (form) {
              // Заполняем ФИО
              const surnameInput = form.querySelector('[name="surname"]');
              const nameInput = form.querySelector('[name="name"]');
              const patronymicInput = form.querySelector('[name="patronymic"]');

              if (surnameInput) surnameInput.value = data.lastName || "";
              if (nameInput) nameInput.value = data.firstName || "";
              if (patronymicInput)
                patronymicInput.value = data.middleName || "";

              // Заполняем пол
              const genderSelect = form.querySelector('[name="gender"]');
              if (genderSelect && data.gender) {
                const genderValue = data.gender.toLowerCase();
                const option = Array.from(genderSelect.options).find(
                  (opt) => opt.value.toLowerCase() === genderValue
                );
                if (option) {
                  genderSelect.value = option.value;
                }
              }

              // Заполняем дату рождения
              const birthdateInput = form.querySelector('[name="birthdate"]');
              if (birthdateInput && data.dateOfBirth) {
                birthdateInput.value = data.dateOfBirth.split("T")[0];
              }

              // Заполняем гражданство
              const citizenshipSelect = form.querySelector(
                '[name="citizenship"]'
              );

              if (citizenshipSelect && data.citizenship) {
                let citizenshipValue = data.citizenship;
                console.log(citizenshipValue);
                if (
                  citizenshipValue === "RUSSIA" ||
                  citizenshipValue === "russia"
                ) {
                  citizenshipValue = "RUSSIA";
                } else if (
                  citizenshipValue === "OTHER" ||
                  citizenshipValue === "other"
                ) {
                  citizenshipValue = "OTHER";
                }

                const option = Array.from(citizenshipSelect.options).find(
                  (opt) => opt.value === citizenshipValue
                );

                if (option) {
                  citizenshipSelect.value = option.value;
                }
              }

              // Заполняем данные документа
              const docTypeSelect = form.querySelector('[name="documentType"]');
              const docSeriesInput = form.querySelector(
                '[name="documentSeries"]'
              );
              const docNumberInput = form.querySelector(
                '[name="documentNumber"]'
              );

              if (docTypeSelect && data.document) {
                const docTypeValue = data.document.toLowerCase();
                const option = Array.from(docTypeSelect.options).find(
                  (opt) => opt.value.toLowerCase() === docTypeValue
                );
                if (option) {
                  docTypeSelect.value = option.value;
                }
              }
              if (docSeriesInput)
                docSeriesInput.value = data.documentSeries || "";
              if (docNumberInput)
                docNumberInput.value = data.documentNumber || "";

              // Валидируем все заполненные поля
              const inputs = form.querySelectorAll("input, select");
              inputs.forEach((input) => {
                if (input.value) {
                  validatePassengerField(input);
                }
              });

              fields.forEach((field) => {
                const input = form.querySelector(`[name="${field}"]`);
                if (input) {
                  if (!passengersData[index]) passengersData[index] = {};
                  passengersData[index][field] = input.value;
                }
              });

              showNotification(
                "Данные успешно загружены из личного кабинета",
                "success"
              );
            }
          } catch (error) {
            console.error("Ошибка при загрузке данных:", error);
            showNotification(
              "Ошибка при загрузке данных из личного кабинета",
              "error"
            );
          }
        };
        form.appendChild(btn);
      }
    }, 0);
    return form;
  }

  // Универсальная валидация поля пассажира (blur)
  function validatePassengerField(input) {
    const group = input.closest(".data-group");
    if (!group) return true;
    const id = input.id;
    let valid = true;
    if (id.endsWith("-surname")) {
      valid = validateNameField(input, true);
    } else if (id.endsWith("-name")) {
      valid = validateNameField(input, true);
    } else if (id.endsWith("-patronymic")) {
      valid = validateNameField(input, false);
    } else if (id.endsWith("-gender")) {
      valid = validateSelectField(input);
    } else if (id.endsWith("-birthdate")) {
      const type = id.split("-")[0];
      valid = validateBirthdateField(input, type);
    } else if (id.endsWith("-citizenship")) {
      valid = validateSelectField(input);
    } else if (id.endsWith("-document-type")) {
      valid = validateSelectField(input);
    } else if (id.endsWith("-document-series")) {
      const prefix = id.replace("-document-series", "");
      const docTypeInput = document.getElementById(`${prefix}-document-type`);
      const docType = docTypeInput ? docTypeInput.value : "";
      valid = validateDocSeriesField(input, docType);
    } else if (id.endsWith("-document-number")) {
      const prefix = id.replace("-document-number", "");
      const docTypeInput = document.getElementById(`${prefix}-document-type`);
      const docType = docTypeInput ? docTypeInput.value : "";
      valid = validateDocNumberField(input, docType);
    }
    return valid;
  }

  // Универсальный сброс ошибки поля пассажира (focus)
  function resetPassengerField(input) {
    resetField(input);
  }

  // Универсальный показ/сброс ошибок
  function showError(input, message) {
    const group = input.closest(".data-group");
    const error = group?.querySelector(".error-message");
    group.classList.add("error");
    error.textContent = message;
    error.classList.add("visible");
  }
  function resetField(input) {
    const group = input.closest(".data-group");
    const error = group?.querySelector(".error-message");
    group.classList.remove("error");
    error.textContent = "";
    error.classList.remove("visible");
  }

  // Проверка имени/фамилии/отчества
  function validateNameField(input, required = true) {
    const value = input.value.trim();
    let fieldName = "Поле";
    if (input.name === "surname") fieldName = "Фамилия";
    else if (input.name === "name") fieldName = "Имя";
    else if (input.name === "patronymic") fieldName = "Отчество";
    if (required && value === "") {
      showError(input, "Необходимо заполнить поле");
      return false;
    }
    if (!required && value === "") {
      resetField(input);
      return true;
    }
    if (value.length < 2) {
      showError(input, "Минимум 2 символа");
      return false;
    }
    resetField(input);
    return true;
  }

  // Проверка даты рождения по типу пассажира
  function validateBirthdateField(input, passengerType) {
    const value = input.value;
    if (!value) {
      showError(input, "Укажите дату рождения");
      return false;
    }
    const birth = new Date(value);
    const today = new Date();
    let min, max;
    if (passengerType === "adult") {
      max = new Date(
        today.getFullYear() - 12,
        today.getMonth(),
        today.getDate()
      );
      min = new Date(
        today.getFullYear() - 120,
        today.getMonth(),
        today.getDate()
      );
      if (birth > max || birth < min) {
        showError(input, "Взрослый: 12+ лет");
        return false;
      }
    } else if (passengerType === "child") {
      max = new Date(
        today.getFullYear() - 2,
        today.getMonth(),
        today.getDate()
      );
      min = new Date(
        today.getFullYear() - 12,
        today.getMonth(),
        today.getDate()
      );
      if (birth > max || birth < min) {
        showError(input, "Ребёнок: 2-11 лет");
        return false;
      }
    } else if (passengerType === "infant") {
      max = today;
      min = new Date(
        today.getFullYear() - 2,
        today.getMonth(),
        today.getDate()
      );
      if (birth > max || birth < min) {
        showError(input, "Младенец: до 2 лет");
        return false;
      }
    }
    resetField(input);
    return true;
  }

  // Проверка серии документа
  function validateDocSeriesField(input, docType) {
    const value = input.value.trim();
    if (value === "" && !state.touchedFields[input.id]) {
      resetField(input);
      return false;
    }
    let isValid = true;
    switch (docType) {
      case "PASSPORT":
      case "passport":
        if (!/^\d{4}$/.test(value)) {
          showError(input, "У серии паспорта РФ 4 цифры");
          isValid = false;
        }
        break;
      case "INTERNATIONAL_PASSPORT":
      case "international_passport":
        if (!/^\d{2}$/.test(value)) {
          showError(input, "У серии загранпаспорта 2 цифры");
          isValid = false;
        }
        break;
      case "BIRTH_CERTIFICATE":
      case "birth_certificate":
        if (!/^[IVXLCDM]+-[А-ЯЁ]{2}$/.test(value)) {
          showError(
            input,
            "Неверный формат серии свидетельства о рождении (например: IV-АБ)"
          );
          isValid = false;
        }
        break;
    }
    if (isValid) resetField(input);
    return isValid;
  }

  // Проверка номера документа
  function validateDocNumberField(input, docType) {
    const value = input.value.trim();
    if (value === "" && !state.touchedFields[input.id]) {
      resetField(input);
      return false;
    }
    let isValid = true;
    switch (docType) {
      case "PASSPORT":
      case "passport":
        if (!/^\d{6}$/.test(value)) {
          showError(input, "У номера паспорта РФ 6 цифр");
          isValid = false;
        }
        break;
      case "INTERNATIONAL_PASSPORT":
      case "international_passport":
        if (!/^\d{7}$/.test(value)) {
          showError(input, "У номера загранпаспорта 7 цифр");
          isValid = false;
        }
        break;
      case "BIRTH_CERTIFICATE":
      case "birth_certificate":
        if (!/^\d{6}$/.test(value)) {
          showError(input, "У номера свидетельства о рождении 6 цифр");
          isValid = false;
        }
        break;
    }
    if (isValid) resetField(input);
    return isValid;
  }

  function setupFieldEventListeners(input) {
    input.addEventListener("focus", function () {
      // Помечаем поле как "тронутое"
      state.touchedFields[this.id] = true;
      resetField(this);
    });

    input.addEventListener("blur", function () {
      validatePassengerField(this);
    });
  }

  // Проверка select
  function validateSelectField(input) {
    if (!input.value) {
      showError(input, "Выберите значение");
      return false;
    }
    resetField(input);
    return true;
  }

  // Валидация всех пассажиров
  function validateAllPassengerForms() {
    let valid = true;
    const container = document.getElementById("passenger-forms-container");
    if (!container) return true;
    const forms = container.querySelectorAll(".passenger-form");
    forms.forEach((form, idx) => {
      // Определяем тип и индекс пассажира по h3
      const h3 = form.querySelector("h3");
      let type = "adult";
      if (h3.textContent.includes("Ребенок")) type = "child";
      if (h3.textContent.includes("Младенец")) type = "infant";
      const index = idx;
      if (!validatePassengerForm(type, index)) valid = false;
    });
    return valid;
  }

  // Скролл к первой ошибке
  function scrollToFirstPassengerError() {
    const firstError = document.querySelector(
      ".data-group.error input, .data-group.error select"
    );
    if (firstError) {
      firstError.scrollIntoView({ behavior: "smooth", block: "center" });
      firstError.focus();
    }
  }

  // Добавлено: функция для валидации всех полей одного пассажира
  function validatePassengerForm(type, index) {
    let valid = true;
    const prefix = `${type}-${index}`;
    const fields = [
      `${prefix}-surname`,
      `${prefix}-name`,
      `${prefix}-patronymic`,
      `${prefix}-gender`,
      `${prefix}-birthdate`,
      `${prefix}-citizenship`,
      `${prefix}-document-type`,
      `${prefix}-document-series`,
      `${prefix}-document-number`,
    ];
    fields.forEach((fid) => {
      const el = document.getElementById(fid);
      if (el && !validatePassengerField(el)) valid = false;
    });
    return valid;
  }

  // --- Переопределяю handleBooking ---
  async function handleBooking() {
    // Проверяем все формы на валидность
    if (!validateAllPassengerForms()) {
      scrollToFirstPassengerError();
      return;
    }

    const contactEmail = document.getElementById("contact-email").value;
    const contactPhone = document.getElementById("contact-phone").value;
    const adults = parseInt(
      document.getElementById("adults-count").textContent
    );
    const children = parseInt(
      document.getElementById("children-count").textContent
    );
    const baggagePerPassenger =
      parseInt(document.getElementById("baggage-count").textContent) || 0;

    // Добавляем обработку чекбокса 'Я лечу этим рейсом'
    const clientAsPassengerCheckbox = document.getElementById(
      "client-as-passenger"
    );

    // Итоговая стоимость: seatsInfo.price + стоимость багажа
    let totalCost = 0;
    if (seatsInfo && seatsInfo.price) {
      totalCost += Number(seatsInfo.price);
    }
    totalCost += 500 * baggagePerPassenger * (adults + children);

    // Формируем итоговые данные
    const bookingData = {
      passengers: [],
      baggageCount:
        selectedSeatsCount + baggagePerPassenger * (adults + children),
      hasClientAsPassenger: clientAsPassengerCheckbox
        ? clientAsPassengerCheckbox.checked
        : false,
      isRoundTrip: typeof isRoundTrip !== "undefined" ? isRoundTrip : false,
      outboundFlightId:
        outboundFlight && outboundFlight.flightID
          ? outboundFlight.flightID
          : null,
      returnFlightId:
        typeof returnFlight !== "undefined" &&
        returnFlight &&
        returnFlight.flightID
          ? returnFlight.flightID
          : null,
      seats: seatsInfo && seatsInfo.seats ? seatsInfo.seats : [],
      totalCost: totalCost,
    };

    const forms = document.querySelectorAll(".passenger-form");
    forms.forEach((form) => {
      bookingData.passengers.push({
        lastName: form.querySelector('[name="surname"]').value,
        firstName: form.querySelector('[name="name"]').value,
        middleName: form.querySelector('[name="patronymic"]').value || null,
        gender: form.querySelector('[name="gender"]').value.toLowerCase(),
        dateOfBirth: form.querySelector('[name="birthdate"]').value, // yyyy-MM-dd
        document: form
          .querySelector('[name="documentType"]')
          .value.toLowerCase(),
        documentSeries: form.querySelector('[name="documentSeries"]').value,
        documentNumber: parseInt(
          form.querySelector('[name="documentNumber"]').value,
          10
        ),
        citizenship: form
          .querySelector('[name="citizenship"]')
          .value.toLowerCase(),
      });
    });

    // Здесь будет отправка данных на сервер
    console.log("Данные для бронирования:", bookingData);

    try {
      const response = await fetch("/booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Ошибка при бронировании:", errorText);
        throw new Error("Ошибка при бронировании: " + errorText);
      }
      // Можно редиректить или показывать уведомление
      showNotification("Бронирование успешно завершено!", "success");
      setTimeout(() => {
        window.location.href = "/profile"; // или другая страница
      }, 2000);
    } catch (e) {
      showNotification(e.message, "error");
    }
  }

  function updateTotalCost() {
    let total = 0;
    const adults = parseInt(adultsCountElement.textContent);
    const children = parseInt(childrenCountElement.textContent);
    const countOfPassengers = adults + children;
    const bc = document.getElementById("baggage-count").textContent;
    const priceForOneBaggage = 500;
    // Стоимость багажа
    if (!isNaN(countOfPassengers) && !isNaN(bc)) {
      total += priceForOneBaggage * bc * countOfPassengers + priceForSeats;
    }

    state.totalCost = total;
    totalAmount.textContent = `${total.toFixed(2)} ₽`;
  }

  function calculateBasePrice(flight) {
    // Базовая стоимость зависит от расстояния и авиакомпании
    return flight.distance * flight.pricePerKm;
  }

  function formatDate(date) {
    return date.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  function formatTime(date) {
    return date.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatDateValue(date) {
    return date.toISOString().split("T")[0];
  }

  function validateEmail() {
    const email = contactEmail.value.trim();
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

    if (email === "") {
      showError(
        contactEmail,
        document.getElementById("email-error"),
        "Укажите email"
      );
      return false;
    }

    if (!emailRegex.test(email)) {
      showError(
        contactEmail,
        document.getElementById("email-error"),
        "Неверный формат email"
      );
      return false;
    }

    return true;
  }

  function validatePhone() {
    const phone = contactPhone.value.trim();
    const phoneRegex = /^\+7\d{10}$/;

    if (phone === "") {
      showError(
        contactPhone,
        document.getElementById("phone-error"),
        "Укажите номер телефона"
      );
      return false;
    }

    if (!phoneRegex.test(phone)) {
      showError(
        contactPhone,
        document.getElementById("phone-error"),
        "Неверный формат номера телефона"
      );
      return false;
    }

    return true;
  }

  function showNotification(message, type) {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Анимация появления
    setTimeout(() => {
      notification.classList.add("show");
    }, 100);

    // Автоматическое скрытие через 5 секунд
    setTimeout(() => {
      notification.classList.remove("show");
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 5000);
  }

  function getPassengerTypeLabel(type) {
    switch (type) {
      case "adult":
        return "Взрослый";
      case "child":
        return "Ребенок (2-11 лет)";
      case "infant":
        return "Младенец (до 2 лет)";
      default:
        return type;
    }
  }

  // Utility functions for formatting
  function formatTime(time) {
    return time.substring(0, 5); // HH:mm
  }

  function formatDate(date) {
    return new Date(date).toLocaleDateString("ru-RU");
  }

  function formatDuration(duration) {
    if (!duration) return "";
    // Если duration в формате HH:mm:ss или HH:mm
    if (typeof duration === "string") {
      const parts = duration.split(":");
      if (parts.length >= 2) {
        const hours = parseInt(parts[0], 10);
        const minutes = parseInt(parts[1], 10);
        if (!isNaN(hours) && !isNaN(minutes)) {
          return `${hours} ч ${minutes} мин`;
        }
      }
    }
    // Если duration в минутах (число)
    if (!isNaN(duration)) {
      const hours = Math.floor(duration / 60);
      const minutes = duration % 60;
      return `${hours} ч ${minutes} мин`;
    }
    return duration;
  }

  function formatPrice(price) {
    return price.toLocaleString("ru-RU");
  }

  // --- Новый блок пассажиров (как на results/figma) ---
  function updatePassengerBlock() {
    const adultsCount = document.getElementById("adults-count");
    const childrenCount = document.getElementById("children-count");
    const infantsCount = document.getElementById("infants-count");
    const decreaseAdults = document.getElementById("decrease-adults");
    const increaseAdults = document.getElementById("increase-adults");
    const decreaseChildren = document.getElementById("decrease-children");
    const increaseChildren = document.getElementById("increase-children");
    const decreaseInfants = document.getElementById("decrease-infants");
    const increaseInfants = document.getElementById("increase-infants");

    let adults = parseInt(adultsCount.textContent) || 1;
    let children = parseInt(childrenCount.textContent) || 0;
    let infants = parseInt(infantsCount.textContent) || 0;

    function updateButtons() {
      const totalMain = adults + children;
      decreaseAdults.disabled = adults <= 1;
      increaseAdults.disabled = totalMain >= 3;
      decreaseChildren.disabled = children <= 0;
      increaseChildren.disabled = totalMain >= 3;
      decreaseInfants.disabled = infants <= 0;
      increaseInfants.disabled = infants >= adults || infants >= 3;
    }

    function updateAll() {
      adultsCount.textContent = adults;
      childrenCount.textContent = children;
      infantsCount.textContent = infants;
      updateButtons();
      updatePassengerForms();
      updateTotalCost();
    }

    decreaseAdults.onclick = () => {
      if (adults > 1) {
        adults--;
        updateAll();
      }
    };
    increaseAdults.onclick = () => {
      if (adults + children < 9) {
        adults++;
        updateAll();
      }
    };
    decreaseChildren.onclick = () => {
      if (children > 0) {
        children--;
        updateAll();
      }
    };
    increaseChildren.onclick = () => {
      if (adults + children < 9) {
        children++;
        updateAll();
      }
    };
    decreaseInfants.onclick = () => {
      if (infants > 0) {
        infants--;
        updateAll();
      }
    };
    increaseInfants.onclick = () => {
      if (infants < adults && infants < 9) {
        infants++;
        updateAll();
      }
    };

    updateAll();
  }
  updatePassengerBlock();
});
