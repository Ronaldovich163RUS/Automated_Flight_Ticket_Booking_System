// Цвета классов
const CLASS_COLORS = {
  first: "#d6b24c",
  business: "#4a90e2",
  comfort: "#7be3e0",
  eco: "#7be37b",
};

const ICON_PATHS = {
  handLuggage:
    "M320 336c0 8.84-7.16 16-16 16h-96c-8.84 0-16-7.16-16-16v-48H0v144c0 25.6 22.4 48 48 48h416c25.6 0 48-22.4 48-48V288H320v48zm144-208h-80V80c0-25.6-22.4-48-48-48H176c-25.6 0-48 22.4-48 48v48H48c-25.6 0-48 22.4-48 48v80h512v-80c0-25.6-22.4-48-48-48zm-144 0H192V96h128v32z",
  baggage:
    "M128 80v48h256V80c0-26.51-21.49-48-48-48H176c-26.51 0-48 21.49-48 48zM96 80c0-44.11 35.89-80 80-80h80c44.11 0 80 35.89 80 80v48h16c17.67 0 32 14.33 32 32v256c0 17.67-14.33 32-32 32H80c-17.67 0-32-14.33-32-32V160c0-17.67 14.33-32 32-32h16V80zM80 160v256h352V160H80zm176 216c0 4.42-3.58 8-8 8s-8-3.58-8-8v-96c0-4.42 3.58-8 8-8s8 3.58 8 8v96z",
  exchange:
    "M0 168v-16c0-13.255 10.745-24 24-24h360V80c0-21.367 25.899-32.042 40.971-16.971l80 80c9.372 9.373 9.372 24.569 0 33.941l-80 80C409.956 271.982 384 261.456 384 240v-48H24c-13.255 0-24-10.745-24-24zm488 152H128v-48c0-21.314-25.862-32.08-40.971-16.971l-80 80c-9.372 9.373-9.372 24.569 0 33.941l80 80C102.057 463.997 128 453.437 128 432v-48h360c13.255 0 24-10.745 24-24v-16c0-13.255-10.745-24-24-24z",
  refund:
    "M212.333 224.333H12c-6.627 0-12-5.373-12-12V12C0 5.373 5.373 0 12 0h48c6.627 0 12 5.373 12 12v78.112C117.773 39.279 184.26 7.47 258.175 8.007c136.906.994 246.448 111.623 246.157 248.532C504.041 393.258 393.12 504 256.333 504c-64.089 0-122.496-24.313-166.51-64.215-5.099-4.622-5.334-12.554-.467-17.42l33.967-33.967c4.474-4.474 11.662-4.717 16.401-.525C170.76 415.336 211.58 432 256.333 432c97.268 0 176-78.716 176-176 0-97.267-78.716-176-176-176-58.496 0-110.28 28.476-142.274 72.333h98.274c6.627 0 12 5.373 12 12v48c0 6.627-5.373 12-12 12z",
  boarding:
    "M480 192H365.71L260.61 8.06A16.014 16.014 0 0 0 246.71 0h-65.5c-10.63 0-18.3 10.17-15.38 20.39L214.86 192H112l-43.2-57.6c-3.02-4.03-7.77-6.4-12.8-6.4H16.01C5.6 128-2.04 137.78.49 147.88L32 256 .49 364.12C-2.04 374.22 5.6 384 16.01 384H56c5.04 0 9.78-2.37 12.8-6.4L112 320h102.86l-49.03 171.6c-2.92 10.22 4.75 20.4 15.38 20.4h65.5c5.74 0 11.04-3.08 13.89-8.06L365.71 320H480c35.35 0 96-28.65 96-64s-60.65-64-96-64z",
  food: "M458.4 64.3C400.6 15.7 311.3 23 256 79.3 200.7 23 111.4 15.6 53.6 64.3-21.6 127.6-10.6 230.8 43 285.5l175.4 178.7c10 10.2 23.4 15.9 37.6 15.9 14.3 0 27.6-5.6 37.6-15.8L469 285.6c53.5-54.7 64.7-157.9-10.6-221.3zm-23.6 187.5L259.4 430.5c-2.4 2.4-4.4 2.4-6.8 0L77.2 251.8c-36.5-37.2-43.9-107.6 7.3-150.7 38.9-32.7 98.9-27.8 136.5 10.5l35 35.7 35-35.7c37.8-38.5 97.8-43.2 136.5-10.6 51.1 43.1 43.5 113.9 7.3 150.8z",
  entertainment:
    "M256 32C114.52 32 0 146.496 0 288v48c0 17.673 14.327 32 32 32h64v-64H32v-16c0-123.712 100.288-224 224-224s224 100.288 224 224v16h-64v64h64c17.673 0 32-14.327 32-32v-48c0-141.479-114.496-256-256-256zm-64 320v64H96v-64h96zm224 0v64h-96v-64h96z",
};

const BAGGAGE_COUNT = {
  first: 2,
  business: 1,
  comfort: 1,
  eco: 0,
};

const CLASS_TYPE_MAPPING = {
  FIRST: "first",
  BUSINESS: "business",
  COMFORT: "comfort",
  ECONOMY: "eco",
};

const CLASS_DETAILS = {
  first: {
    handLuggage: "1 место, 12 кг, 55х40х25 см",
    baggage: "2 места, до 32 кг",
    exchange: "бесплатно",
    refund: "бесплатно",
    boarding: "приоритетная",
    food: "ресторанное меню, премиальные напитки",
    entertainment: "персональный экран, шумоподавляющие наушники",
  },
  business: {
    handLuggage: "1 место, 12 кг, 55х40х25 см",
    baggage: "1 место, до 32 кг",
    exchange: "платно (скидка 75%)",
    refund: "платно (скидка 75%)",
    boarding: "приоритетная",
    food: "ресторанное меню, напитки на выбор",
    entertainment: "персональный экран, набор для путешествия",
  },
  comfort: {
    handLuggage: "1 место, 10 кг, 55х40х25 см",
    baggage: "1 место, до 23 кг",
    exchange: "платно (скидка 30%)",
    refund: "платно (скидка 30%)",
    boarding: "приоритетная",
    food: "горячее питание, напитки",
    entertainment: "увеличенное пространство для ног",
  },
  eco: {
    handLuggage: "1 место, 8 кг, 55х40х25 см",
    baggage: "отсутствует",
    exchange: "недоступен",
    refund: "недоступен",
    boarding: "общая",
    food: "легкие закуски",
    entertainment: "недоступно",
  },
};

// Глобальные переменные
let planeData = null;
let occupiedSeatsMap = {};
let selectedSeats = [];
const visual = document.getElementById("plane-visual");
const selectedSeatElement = document.getElementById("selected-seat");
const seatPriceElement = document.getElementById("seat-price");
const confirmBtn = document.getElementById("confirmBtn");

// Получаем количество пассажиров
//const totalPassengersNum = parseInt(localStorage.getItem('passengers')) || 0;
const totalPassengersNum = passengers;
console.log("Количество пассажиров:", totalPassengersNum);

// Моковые данные для самолёта (резервные)
const MOCK_PLANE_DATA = {
  numberOfPassages: 1,
  classes: [
    {
      type: "first",
      rows: 0,
      seatsPerRow: 3,
      price: 50000,
    },
    {
      type: "business",
      rows: 10,
      seatsPerRow: 4,
      price: 30000,
    },
    {
      type: "comfort",
      rows: 14,
      seatsPerRow: 4,
      price: 20000,
    },
    {
      type: "eco",
      rows: 22,
      seatsPerRow: 5,
      price: 10000,
    },
  ],
};

// Функция для построения карты занятости мест
function buildOccupiedMap() {
  occupiedSeatsMap = {};
  if (!planeData || !planeData.classes) return;

  planeData.classes.forEach((cls) => {
    cls.seatStructure.forEach((seat) => {
      const key = `${seat.row}-${seat.seat}`;
      occupiedSeatsMap[key] = seat.taken;
    });
  });
}

// Получение данных о местах с сервера
async function getSeatStructure() {
  try {
    const response = await fetch("/seat-selection/get-seats", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
      body: JSON.stringify(flightId),
    });

    if (response.ok) {
      planeData = await response.json();

      // Преобразуем типы классов
      planeData.classes.forEach((cls) => {
        cls.type = CLASS_TYPE_MAPPING[cls.type] || cls.type.toLowerCase();
      });

      buildOccupiedMap();
      console.log("Структура мест получена");
      renderPlane();

      freeSeatsPerClass = {};
      planeData.classes.forEach((cls) => {
        const type = CLASS_TYPE_MAPPING[cls.type] || cls.type.toLowerCase();
        freeSeatsPerClass[type] = cls.seatStructure.filter(
          (seat) => !seat.taken
        ).length;
      });
    } else {
      console.error("Ошибка при получении структуры мест:", response.status);
      renderPlane();
    }
  } catch (error) {
    console.error("Ошибка при выполнении запроса:", error);
    renderPlane();
  }
}

function seatNumberToLetter(num) {
  let s = "";
  num--;
  do {
    s = String.fromCharCode(65 + (num % 26)) + s;
    num = Math.floor(num / 26) - 1;
  } while (num >= 0);
  return s;
}

function showErrorDialog(message) {
  const dialog = document.getElementById("seat-error-dialog");
  dialog.querySelector("p").textContent = message;
  dialog.showModal();
}

function renderPlane() {
  const data = planeData || MOCK_PLANE_DATA;
  let rows = [];
  const aisles = data.numberOfPassages;

  // Формируем ряды на основе данных
  data.classes.forEach((cls) => {
    const typeLower = cls.type.toLowerCase();
    for (let i = 0; i < cls.rows; i++) {
      rows.push({
        type: typeLower,
        seats: cls.seatsPerRow,
        price: cls.price,
      });
    }
  });

  // Вычисляем максимальное количество мест для секций
  let maxLeft = 0,
    maxCenter = 0,
    maxRight = 0;
  if (aisles === 1) {
    rows.forEach((row) => {
      const left = Math.ceil(row.seats / 2);
      const right = Math.floor(row.seats / 2);
      maxLeft = Math.max(maxLeft, left);
      maxRight = Math.max(maxRight, right);
    });
  } else {
    rows.forEach((row) => {
      const total = row.seats;
      const base = Math.floor(total / 3);
      const extra = total % 3;
      let left = base,
        center = base,
        right = base;
      if (extra === 1) center += 1;
      if (extra === 2) center += 2;
      maxLeft = Math.max(maxLeft, left);
      maxCenter = Math.max(maxCenter, center);
      maxRight = Math.max(maxRight, right);
    });
  }

  visual.classList.remove("fadein");
  void visual.offsetWidth;
  visual.innerHTML = "";
  const plane = document.createElement("div");
  plane.className = "plane";

  // --- Легенда с занятыми местами ---
  renderLegendWithOccupied();

  rows.forEach((row, idx) => {
    const rowDiv = document.createElement("div");
    rowDiv.className = "plane-row";

    // Номер ряда
    const rowNum = document.createElement("span");
    rowNum.className = "row-num";
    rowNum.textContent = idx + 1;
    rowDiv.appendChild(rowNum);

    if (aisles === 1) {
      const left = Math.ceil(row.seats / 2);
      const right = Math.floor(row.seats / 2);
      // Пустышки слева
      for (let i = 0; i < maxLeft - left; i++) {
        const empty = document.createElement("span");
        empty.className = "seat seat-empty";
        rowDiv.appendChild(empty);
      }
      // Левые места
      for (let i = 0; i < left; i++) {
        const seat = createSeatButton(row.type, idx + 1, i + 1, row.price);
        rowDiv.appendChild(seat);
      }
      // Проход
      const aisle = document.createElement("span");
      aisle.className = "aisle";
      rowDiv.appendChild(aisle);
      // Правые места
      for (let i = 0; i < right; i++) {
        const seat = createSeatButton(
          row.type,
          idx + 1,
          left + i + 1,
          row.price
        );
        rowDiv.appendChild(seat);
      }
      // Пустышки справа
      for (let i = 0; i < maxRight - right; i++) {
        const empty = document.createElement("span");
        empty.className = "seat seat-empty";
        rowDiv.appendChild(empty);
      }
      // Сетка
      rowDiv.style.gridTemplateColumns = `40px repeat(${maxLeft}, 22px) 18px repeat(${maxRight}, 22px)`;
    } else {
      // Динамическое распределение по секциям
      const total = row.seats;
      const base = Math.floor(total / 3);
      const extra = total % 3;
      let left = base,
        center = base,
        right = base;
      if (extra === 1) center += 1;
      if (extra === 2) center += 2;
      // Левая секция (выравнивание)
      for (let i = 0; i < maxLeft - left; i++) {
        const empty = document.createElement("span");
        empty.className = "seat seat-empty";
        rowDiv.appendChild(empty);
      }
      for (let i = 0; i < left; i++) {
        const seat = createSeatButton(row.type, idx + 1, i + 1, row.price);
        rowDiv.appendChild(seat);
      }
      // Первый проход
      const aisle1 = document.createElement("span");
      aisle1.className = "aisle";
      rowDiv.appendChild(aisle1);
      // Центр (выравнивание)
      const centerEmptyTotal = maxCenter - center;
      const centerEmptyLeft = Math.floor(centerEmptyTotal / 2);
      const centerEmptyRight = centerEmptyTotal - centerEmptyLeft;
      for (let i = 0; i < centerEmptyLeft; i++) {
        const empty = document.createElement("span");
        empty.className = "seat seat-empty";
        rowDiv.appendChild(empty);
      }
      for (let i = 0; i < center; i++) {
        const seat = createSeatButton(
          row.type,
          idx + 1,
          left + i + 1,
          row.price
        );
        rowDiv.appendChild(seat);
      }
      for (let i = 0; i < centerEmptyRight; i++) {
        const empty = document.createElement("span");
        empty.className = "seat seat-empty";
        rowDiv.appendChild(empty);
      }
      // Второй проход
      const aisle2 = document.createElement("span");
      aisle2.className = "aisle";
      rowDiv.appendChild(aisle2);
      // Правая секция (выравнивание)
      for (let i = 0; i < right; i++) {
        const seat = createSeatButton(
          row.type,
          idx + 1,
          left + center + i + 1,
          row.price
        );
        rowDiv.appendChild(seat);
      }
      for (let i = 0; i < maxRight - right; i++) {
        const empty = document.createElement("span");
        empty.className = "seat seat-empty";
        rowDiv.appendChild(empty);
      }
      // Сетка
      rowDiv.style.gridTemplateColumns = `40px repeat(${maxLeft}, 22px) 18px repeat(${maxCenter}, 22px) 18px repeat(${maxRight}, 22px)`;
    }

    plane.appendChild(rowDiv);
    if (idx < rows.length - 1 && row.type !== rows[idx + 1].type) {
      rowDiv.classList.add("class-gap");
    }
  });

  visual.appendChild(plane);
  setTimeout(() => visual.classList.add("fadein"), 10);

  // После visual.appendChild(plane):
  // Сбросить выбранные места и обновить блок
  selectedSeats = [];
  updateSelectedSeatsBlock();
  updateSeatClassLocks();
}

function renderLegendWithOccupied() {
  const legend = document.getElementById("legend");
  if (!legend) return;
  legend.innerHTML = "";
  const data = planeData || MOCK_PLANE_DATA;
  const classes = [
    { type: "first", label: "Первый класс", color: "first" },
    { type: "business", label: "Бизнес-класс", color: "business" },
    { type: "comfort", label: "Комфорт-класс", color: "comfort" },
    { type: "eco", label: "Эконом-класс", color: "eco" },
  ];

  // Фильтруем классы по наличию рядов
  const filtered = classes.filter((cls) => {
    const displayType = CLASS_TYPE_MAPPING[cls.type] || cls.type.toLowerCase();
    const found = data.classes.find((c) => c.type === displayType);
    return found && found.rows > 0;
  });

  // Левый столбец: классы и выбранные места
  const leftCol = document.createElement("div");
  leftCol.className = "legend-col";

  // Добавляем классы
  filtered.forEach((cls) => {
    const row = document.createElement("div");
    row.className = "legend-row";
    const color = document.createElement("span");
    color.className = `legend-color ${cls.color}`;
    const label = document.createElement("span");
    label.textContent = cls.label;
    row.appendChild(color);
    row.appendChild(label);
    leftCol.appendChild(row);
  });

  // Правый столбец: занятые и заблокированные
  const rightCol = document.createElement("div");
  rightCol.className = "legend-col-occupied";

  // Добавляем занятые места
  filtered.forEach((cls) => {
    const row = document.createElement("div");
    row.className = "legend-row";
    const color = document.createElement("span");
    color.className = `legend-color ${cls.color}`;
    color.style.opacity = "0.5";
    const label = document.createElement("span");
    label.textContent = "Занято";
    label.className = "legend-occupied-label";
    label.style.opacity = "1";
    label.style.color = "#333";
    row.appendChild(color);
    row.appendChild(label);
    rightCol.appendChild(row);
  });

  // Добавляем "Выбрано"
  const selectedRow = document.createElement("div");
  selectedRow.className = "legend-row";
  const selectedColor = document.createElement("span");
  selectedColor.className = "legend-color selected-seat-demo";
  const selectedLabel = document.createElement("span");
  selectedLabel.textContent = "Выбрано";
  selectedLabel.className = "legend-occupied-label";
  selectedLabel.style.opacity = "1";
  selectedLabel.style.color = "#333";
  selectedRow.appendChild(selectedColor);
  selectedRow.appendChild(selectedLabel);
  rightCol.appendChild(selectedRow);

  // Добавляем заблокированные места
  const lockedRow = document.createElement("div");
  lockedRow.className = "legend-row";
  const lockedColor = document.createElement("span");
  lockedColor.className = "legend-color locked";
  lockedColor.style.background = "#bdbdbd";
  lockedColor.style.opacity = "0.5";
  const lockedLabel = document.createElement("span");
  lockedLabel.textContent = "Заблокировано";
  lockedLabel.className = "legend-occupied-label";
  lockedLabel.style.opacity = "1";
  lockedLabel.style.color = "#333";
  lockedRow.appendChild(lockedColor);
  lockedRow.appendChild(lockedLabel);
  rightCol.appendChild(lockedRow);

  legend.appendChild(leftCol);
  legend.appendChild(rightCol);
}

function createSeatButton(type, row, seatIndex, price) {
  const button = document.createElement("button");
  const displayType = CLASS_TYPE_MAPPING[type] || type.toLowerCase();
  button.className = "seat";
  button.style.background = CLASS_COLORS[displayType];
  button.dataset.row = row;
  button.dataset.seat = seatIndex;
  button.dataset.type = displayType;
  button.dataset.price = price;

  // Преобразуем индекс места в букву
  const seatLetter = seatNumberToLetter(Number(seatIndex));
  const seatKey = `${row}-${seatLetter}`;

  // Проверяем занятость места через карту
  const isOccupied = occupiedSeatsMap[seatKey] === true;

  if (isOccupied) {
    button.classList.add("seat-occupied", type);
    button.dataset.occupied = "true";

    button.addEventListener("click", (e) => {
      e.preventDefault();
      showErrorDialog("Пожалуйста, выберите свободное место");
    });
  } else {
    button.addEventListener("click", () => handleSeatClick(button));
  }
  return button;
}

// Глобальная переменная для отслеживания свободных мест
let freeSeatsPerClass = {};

function handleSeatClick(button) {
  if (button.dataset.occupied === "true") return;
  const row = button.dataset.row;
  const seat = button.dataset.seat;
  const type = button.dataset.type;
  const price = button.dataset.price;
  //  const seatId = `${row}${seat}`;
  const displayType = CLASS_TYPE_MAPPING[type] || type.toLowerCase();

  if (selectedSeats.length === 0) {
    if (freeSeatsPerClass[displayType] < totalPassengersNum) {
      showErrorDialog(
        "Пожалуйста, выберите места в другом классе обслуживания. " +
          "В этом классе обслуживания недостаточно мест для Вас"
      );
      return;
    }
  }

  // Если уже выбрано — снять выбор
  const idx = selectedSeats.findIndex((s) => s.row === row && s.seat === seat);
  if (idx !== -1) {
    selectedSeats.splice(idx, 1);
    button.classList.remove("selected-seat");
  } else {
    // Если уже выбрано место в другом классе — не даём выбрать
    if (selectedSeats.length > 0 && selectedSeats[0].type !== type) return;
    // Проверяем лимит пассажиров
    if (selectedSeats.length >= totalPassengersNum) return;

    selectedSeats.push({ row, seat, type: displayType, price });
    button.classList.add("selected-seat");
  }
  updateSelectedSeatsBlock();
  updateSeatClassLocks();
}

function updateSelectedSeatsBlock() {
  const selectedSeatInfoBlock = document.querySelector(".selected-seat-info");
  const seatPriceInfoBlock = document.querySelector(".seat-price-info");

  if (!selectedSeatInfoBlock || !seatPriceInfoBlock) return;

  selectedSeatInfoBlock.innerHTML = "<h3>Выбранные места</h3>";
  seatPriceInfoBlock.innerHTML = "<h3>Стоимость</h3>";

  if (selectedSeats.length === 0) {
    selectedSeatInfoBlock.innerHTML += '<p id="selected-seat">Не выбрано</p>';
    seatPriceInfoBlock.innerHTML += '<p id="seat-price">0 ₽</p>';
  } else {
    const groupedSeats = selectedSeats.reduce((acc, seat) => {
      if (!acc[seat.type]) {
        acc[seat.type] = [];
      }
      acc[seat.type].push(seat);
      return acc;
    }, {});

    for (const type in groupedSeats) {
      const displayType = CLASS_TYPE_MAPPING[type] || type.toLowerCase();
      const seatsInClass = groupedSeats[type];
      const seatNumbers = seatsInClass
        .map((s) => `${s.row}${seatNumberToLetter(Number(s.seat))}`)
        .join(", ");
      const totalPrice = seatsInClass.reduce(
        (sum, s) => sum + Number(s.price),
        0
      );
      const classDetails = CLASS_DETAILS[displayType];

      if (!classDetails) {
        console.error(`Детали класса не найдены для типа: ${type}`);
        continue;
      }

      const classBlock = document.createElement("div");
      classBlock.className = "selected-class-block";

      const header = document.createElement("div");
      header.className = "selected-class-header";
      header.innerHTML = `
                <span class="selected-class-seat-numbers">${seatNumbers}</span>
            `;

      const details = document.createElement("div");
      details.className = "selected-class-details";
      details.innerHTML = `
    <div class="detail-item">
      <svg width="20" height="20" viewBox="0 0 512 512"><path d="${ICON_PATHS.handLuggage}"/></svg>
      <span>Ручная кладь: ${classDetails.handLuggage}</span>
    </div>
    <div class="detail-item">
      <svg width="20" height="20" viewBox="0 0 512 512"><path d="${ICON_PATHS.baggage}"/></svg>
      <span>Багаж: ${classDetails.baggage}</span>
    </div>
    <div class="detail-item">
      <svg width="20" height="20" viewBox="0 0 512 512"><path d="${ICON_PATHS.exchange}"/></svg>
      <span>Обмен билета: ${classDetails.exchange}</span>
    </div>
    <div class="detail-item">
      <svg width="20" height="20" viewBox="0 0 512 512"><path d="${ICON_PATHS.refund}"/></svg>
      <span>Возврат билета: ${classDetails.refund}</span>
    </div>
    <div class="detail-item">
      <svg width="20" height="20" viewBox="0 0 512 512"><path d="${ICON_PATHS.boarding}"/></svg>
      <span>Посадка: ${classDetails.boarding}</span>
    </div>
    <div class="detail-item">
      <svg width="20" height="20" viewBox="0 0 512 512"><path d="${ICON_PATHS.food}"/></svg>
      <span>Питание: ${classDetails.food}</span>
    </div>
    <div class="detail-item">
      <svg width="20" height="20" viewBox="0 0 512 512"><path d="${ICON_PATHS.entertainment}"/></svg>
      <span>Развлечения/привилегии: ${classDetails.entertainment}</span>
    </div>
  `;
      classBlock.appendChild(header);
      classBlock.appendChild(details);
      selectedSeatInfoBlock.appendChild(classBlock);
    }

    const totalOverallPrice = selectedSeats.reduce(
      (sum, s) => sum + Number(s.price),
      0
    );
    seatPriceInfoBlock.innerHTML += `<p id="seat-price">${totalOverallPrice} ₽</p>`;
  }
}

function updateSeatClassLocks() {
  // Получаем все места, исключая пустышки и занятые
  const allSeats = document.querySelectorAll(".seat:not(.seat-empty)");

  // Если не выбрано ни одного места, разблокируем все доступные места
  if (selectedSeats.length === 0) {
    allSeats.forEach((btn) => {
      btn.disabled = false;
      btn.classList.remove("seat-locked");
    });
    return;
  }

  // Определяем выбранный класс и достигнут ли лимит мест
  const selectedType = selectedSeats[0].type;
  const limitReached = selectedSeats.length >= totalPassengersNum;

  // Блокируем места в зависимости от условий
  allSeats.forEach((btn) => {
    if (btn.dataset.type !== selectedType) {
      // Блокируем места другого класса
      btn.disabled = true;
      btn.classList.add("seat-locked");
    } else if (limitReached && !btn.classList.contains("selected-seat")) {
      // Блокируем места того же класса, если достигнут лимит
      btn.disabled = true;
      btn.classList.add("seat-locked");
    } else {
      // Разблокируем места, если они соответствуют условиям
      btn.disabled = false;
      btn.classList.remove("seat-locked");
    }
  });
}

// Обработчик подтверждения выбора
confirmBtn.addEventListener("click", () => {
  if (selectedSeats.length != totalPassengersNum) {
    showErrorDialog(
      "Пожалуйста, выберите все места для пассажиров перед бронированием"
    );
    return;
  }

  const type = selectedSeats[0].type;
  const totalPrice = selectedSeats.reduce(
    (sum, seat) => sum + Number(seat.price),
    0
  );
  const baggageCount = BAGGAGE_COUNT[type] * selectedSeats.length;
  const seats = selectedSeats.map((s) => ({
    row: s.row,
    seat: seatNumberToLetter(s.seat),
  }));

  const seatData = {
    type: type,
    totalBaggageCount: baggageCount,
    price: totalPrice,
    seats: seats,
  };

  console.log("Данные для бронирования:", seatData);
  confirmFetch(seatData);
});

async function confirmFetch(seatData) {
  const response = await fetch("/seat-selection/confirm", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest",
    },
    body: JSON.stringify(seatData),
  });
  if (response.ok) {
    console.log("данные отправлены");
    window.location.href = "/booking";
  }
}

// Инициализация при загрузке страницы
window.addEventListener("DOMContentLoaded", async () => {
  // Инициализация диалога ошибки
  const dialog = document.getElementById("seat-error-dialog");
  const closeButton = dialog.querySelector(".dialog-close");
  closeButton.addEventListener("click", () => dialog.close());

  // Получение данных о местах
  await getSeatStructure();
});
