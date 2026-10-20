// Цвета классов
const CLASS_COLORS = {
  first: "#d6b24c",
  business: "#bdbdbd",
  comfort: "#7be3e0",
  eco: "#7be37b",
};

// Ограничения для классов
const CLASS_LIMITS = {
  1: {
    // Один проход
    business: {
      minRows: 2,
      maxRows: 10,
      minSeats: 2,
      maxSeats: 6,
      mustBeEven: false,
    },
    comfort: {
      minRows: 4,
      maxRows: 20,
      minSeats: 4,
      maxSeats: 6,
      mustBeEven: true,
      allowZero: true,
    },
    eco: {
      minRows: 10,
      maxRows: 30,
      minSeats: 5,
      maxSeats: 6,
      mustBeEven: false,
    },
  },
  2: {
    // Два прохода
    first: {
      minRows: 2,
      maxRows: 8,
      minSeats: 3,
      maxSeats: 4,
      mustBeEven: false,
      allowZero: true,
    },
    business: {
      minRows: 4,
      maxRows: 12,
      minSeats: 4,
      maxSeats: 7,
      mustBeEven: false,
    },
    comfort: {
      minRows: 6,
      maxRows: 20,
      minSeats: 6,
      maxSeats: 10,
      mustBeEven: false,
      allowZero: true,
    },
    eco: {
      minRows: 12,
      maxRows: 30,
      minSeats: 9,
      maxSeats: 10,
      mustBeEven: false,
    },
  },
};

const crudMode1 = document.getElementById("crudmode-id").value
const airplaneId = crudMode1 == "edit" ? document.getElementById("airplane-id").value : null
/*
if (crudMode1 == "edit"){
    const airplaneId = document.getElementById("airplane-id").value
    console.log("id самолёт из бд")
    console.log(airplaneId)
}*/

// Функции валидации
function validateClassLimits(data) {
  if (data.mode === MODES.CONFIG) return [];
  const aisles = data.numberOfPassages;
  const limits = CLASS_LIMITS[aisles];
  const errors = [];
  const classMap = {};
  data.cabinStructures.forEach((c) => {
    classMap[c.serviceClass.toLowerCase()] = c;
  });
  Object.entries(limits).forEach(([className, classLimits]) => {
    let rows, seats;
    if (className === "eco") {
      rows = +data.ecoRows || 0;
      seats = +data.ecoSeats || 0;
    } else {
      const c = classMap[className];
      rows = c ? c.numberOfRows : 0;
      seats = c ? c.numberOfSeatsPerRow : 0;
    }
    if ((className === "first" || className === "comfort") && rows === 0) {
      return;
    }
    if (rows < classLimits.minRows || rows > classLimits.maxRows) {
      if (
        !(className === "first" && rows === 0) &&
        !(className === "comfort" && rows === 0)
      ) {
        errors.push(
          `${getClassName(className)}: количество рядов должно быть от ${
            classLimits.minRows
          } до ${classLimits.maxRows}`
        );
      }
    }
    if (
      rows > 0 &&
      (seats < classLimits.minSeats || seats > classLimits.maxSeats)
    ) {
      errors.push(
        `${getClassName(className)}: количество мест в ряду должно быть от ${
          classLimits.minSeats
        } до ${classLimits.maxSeats}`
      );
    }
  });
  return errors;
}

function validateClassRelations(data) {
  // Для MANUAL берём значения из cabinStructures, для CONFIG — пропускаем
  if (data.mode === MODES.CONFIG) return [];
  const errors = [];
  const aisles = data.numberOfPassages;
  const classMap = {};
  data.cabinStructures.forEach((c) => {
    classMap[c.serviceClass.toLowerCase()] = c;
  });
  const first = classMap["first"] || {};
  const business = classMap["business"] || {};
  const comfort = classMap["comfort"] || {};
  const eco = classMap["eco"] || {};
  if (aisles === 2) {
    if (
      (first.numberOfRows || 0) > 0 &&
      (first.numberOfRows || 0) >= (business.numberOfRows || 0)
    ) {
      errors.push(
        "Количество рядов первого класса должно быть меньше бизнес-класса"
      );
    }
    if (
      (first.numberOfRows || 0) > 0 &&
      (business.numberOfRows || 0) > 0 &&
      (first.numberOfSeatsPerRow || 0) > (business.numberOfSeatsPerRow || 0)
    ) {
      errors.push(
        `Количество мест в ряду первого класса (${first.numberOfSeatsPerRow}) не может быть больше, чем в бизнес-классе (${business.numberOfSeatsPerRow})`
      );
    }
    if (
      (business.numberOfRows || 0) > 0 &&
      (comfort.numberOfRows || 0) > 0 &&
      (business.numberOfSeatsPerRow || 0) > (comfort.numberOfSeatsPerRow || 0)
    ) {
      errors.push(
        `Количество мест в ряду бизнес-класса (${business.numberOfSeatsPerRow}) не может быть больше, чем в комфорт-классе (${comfort.numberOfSeatsPerRow})`
      );
    }
    if (
      (comfort.numberOfRows || 0) > 0 &&
      (eco.numberOfRows || 0) > 0 &&
      (comfort.numberOfSeatsPerRow || 0) > (eco.numberOfSeatsPerRow || 0)
    ) {
      errors.push(
        `Количество мест в ряду комфорт-класса (${comfort.numberOfSeatsPerRow}) не может быть больше, чем в эконом-классе (${eco.numberOfSeatsPerRow})`
      );
    }
  }
  if (
    (business.numberOfRows || 0) > 0 &&
    (comfort.numberOfRows || 0) > 0 &&
    (business.numberOfRows || 0) >= (comfort.numberOfRows || 0)
  ) {
    errors.push(
      "Количество рядов бизнес-класса должно быть меньше комфорт-класса"
    );
  }
  if (
    (comfort.numberOfRows || 0) > 0 &&
    (eco.numberOfRows || 0) > 0 &&
    (comfort.numberOfRows || 0) >= (eco.numberOfRows || 0)
  ) {
    errors.push(
      "Количество рядов комфорт-класса должно быть меньше эконом-класса"
    );
  }
  if (aisles === 1) {
    if (
      (business.numberOfRows || 0) > 0 &&
      (comfort.numberOfRows || 0) > 0 &&
      (business.numberOfSeatsPerRow || 0) > (comfort.numberOfSeatsPerRow || 0)
    ) {
      errors.push(
        `Количество мест в ряду бизнес-класса (${business.numberOfSeatsPerRow}) не может быть больше, чем в комфорт-классе (${comfort.numberOfSeatsPerRow})`
      );
    }
    if (
      (comfort.numberOfRows || 0) > 0 &&
      (eco.numberOfRows || 0) > 0 &&
      (comfort.numberOfSeatsPerRow || 0) > (eco.numberOfSeatsPerRow || 0)
    ) {
      errors.push(
        `Количество мест в ряду комфорт-класса (${comfort.numberOfSeatsPerRow}) не может быть больше, чем в эконом-классе (${eco.numberOfSeatsPerRow})`
      );
    }
    if (
      (business.numberOfRows || 0) > 0 &&
      (eco.numberOfRows || 0) > 0 &&
      (business.numberOfSeatsPerRow || 0) > (eco.numberOfSeatsPerRow || 0)
    ) {
      errors.push(
        `Количество мест в ряду бизнес-класса (${business.numberOfSeatsPerRow}) не может быть больше, чем в эконом-классе (${eco.numberOfSeatsPerRow})`
      );
    }
  }
  return errors;
}

function getClassName(key) {
  const names = {
    first: "Первый класс",
    business: "Бизнес-класс",
    comfort: "Комфорт-класс",
    eco: "Эконом-класс",
  };
  return names[key];
}

const form = document.getElementById("plane-form");
const visual = document.getElementById("plane-visual");

// Получение элементов для валидации верхних 4 полей
const modelInput = document.getElementById("model");
const modelError = document.getElementById("model-error");
const rangeInput = document.getElementById("range");
const rangeError = document.getElementById("range-error");
const brandInput = document.getElementById("brand");
const brandError = document.getElementById("brand-error");
const airlineInput = document.getElementById("airline");
const airlineError = document.getElementById("airline-error");

const crudMode = document.getElementById("current-mode").value;
console.log("Current mode:", crudMode);

let airplaneData = null;

async function loadAirplaneData(forceRefresh = false) {
  let url = "/constructor/api";
  if (forceRefresh) {
    url += `?t=${new Date().getTime()}`;
  }

  try {
    const response = await fetch(url, {
      headers: forceRefresh
        ? {
            "Cache-Control": "no-cache",
          }
        : {},
    });

    return await response.json();
  } catch (error) {
    console.error("Error loading data:", error);
    return null;
  }
}

if (crudMode === "edit") {
  loadAirplaneData(true).then((data) => {
    if (data) {
      airplaneData = data;
      console.log("Airplane data:", airplaneData);
      rangeInput.value = data.range;
      setTimeout(() => {
        if (data.airline) {
          console.log(data.airline);
          airlineInput.value = data.airline;

          // Загрузка брендов после выбора авиакомпании
          const event = new Event("change");
          airlineInput.dispatchEvent(event);

          brandInput.value = data.brandId;

          // Установка бренда после загрузки
          setTimeout(() => {
            if (data.brandId) {
              console.log(data.brandId);
              brandInput.value = data.brandId;
              modelInput.disabled = false;
              modelInput.value = data.model;
            }
          }, 1);
        }
      }, 1);
      document.querySelector(
        `input[name="aisles"][value="${data.numberOfPassages}"]`
      ).checked = true;
      updateAislesVisibility();
      initSelects(); // ВАЖНО: сначала инициализируем селекты
      const manualRadio = document.querySelector(
        'input[name="mode"][value="manual"]'
      );
      if (manualRadio) {
        manualRadio.checked = true;
        updateMode(MODES.MANUAL);
      }
      // Заполнение данных классов
      if (data.cabinStructures) {
        data.cabinStructures.forEach((cabin) => {
          const classKey = cabin.serviceClass.toLowerCase();
          const classId = classKey === "economy" ? "eco" : classKey;

          const rowsSelect = document.getElementById(`${classId}Rows`);
          const seatsSelect = document.getElementById(`${classId}Seats`);

          if (rowsSelect) rowsSelect.value = cabin.numberOfRows;
          if (seatsSelect) seatsSelect.value = cabin.numberOfSeatsPerRow;
        });
      }

      updateSeatsVisibility();
      renderPlane();
    }
  });
}

// if (mode == "edit") {
//   try {
//     fetch("/constructor/api")
//       .then((response) => response.json())
//       .then((data) => {
//         airplaneData = data;
//         console.log("Airplane data:", airplaneData);
//         // rangeInput.value = airplaneData.range;
//       })
//       .catch((error) => {
//         console.error("Error fetching data:", error);
//       });
//   } catch (error) {
//     console.error("Unexpected error:", error);
//   }
// }

// --- Конфигурации ---
const CONFIGS = {
  1: [
    {
      key: "standard",
      title: "Стандартный рейс",
      desc: "2-2 / 3-3 / 3-3",
      schema: "Бизнес: 2-2\nКомфорт: 3-3\nЭконом: 3-3",
      rows: {
        business: 8,
        comfort: 12,
        eco: 20,
      },
    },
    {
      key: "premium",
      title: "Премиум-перевозки",
      desc: "2-1 / 2-2 / 3-3",
      schema: "Бизнес: 2-1\nКомфорт: 2-2\nЭконом: 3-3",
      rows: {
        business: 6,
        comfort: 10,
        eco: 18,
      },
    },
    {
      key: "small",
      title: "Небольшой самолёт",
      desc: "2-2 / 2-2 / 3-2",
      schema: "Бизнес: 2-2\nКомфорт: 2-2\nЭконом: 3-2",
      rows: {
        business: 4,
        comfort: 8,
        eco: 15,
      },
    },
    {
      key: "lowcost",
      title: "Лоукостер",
      desc: "3-3 / 3-3 / 3-3",
      schema: "Бизнес: 3-3\nКомфорт: 3-3\nЭконом: 3-3",
      rows: {
        business: 6,
        comfort: 8,
        eco: 25,
      },
    },
  ],
  2: [
    {
      key: "premium2",
      title: "Премиум-конфигурация",
      desc: "1-1-1 / 1-2-1 / 2-3-2 / 3-4-3",
      schema: "Первый: 1-1-1\nБизнес: 1-2-1\nКомфорт: 2-3-2\nЭконом: 3-4-3",
      rows: {
        first: 4,
        business: 8,
        comfort: 12,
        eco: 20,
      },
    },
    {
      key: "balanced",
      title: "Сбалансированная",
      desc: "1-2-1 / 2-2-2 / 2-4-2 / 3-3-3",
      schema: "Первый: 1-2-1\nБизнес: 2-2-2\nКомфорт: 2-4-2\nЭконом: 3-3-3",
      rows: {
        first: 6,
        business: 10,
        comfort: 14,
        eco: 22,
      },
    },
    {
      key: "dense",
      title: "Высокоплотная",
      desc: "1-2-1 / 2-3-2 / 3-3-3 / 3-4-3",
      schema: "Первый: 1-2-1\nБизнес: 2-3-2\nКомфорт: 3-3-3\nЭконом: 3-4-3",
      rows: {
        first: 4,
        business: 8,
        comfort: 12,
        eco: 25,
      },
    },
  ],
};

// Структура для разбиения мест по сторонам прохода для однопроходных конфигураций
const configSeatSides = {
  // Однопроходные
  standard: {
    business: { left: 2, right: 2 }, // 2-2
    comfort: { left: 3, right: 3 }, // 3-3
    eco: { left: 3, right: 3 }, // 3-3
  },
  premium: {
    business: { left: 2, right: 1 }, // 2-1
    comfort: { left: 2, right: 2 }, // 2-2
    eco: { left: 3, right: 3 }, // 3-3
  },
  small: {
    business: { left: 2, right: 2 }, // 2-2
    comfort: { left: 2, right: 2 }, // 2-2
    eco: { left: 3, right: 2 }, // 3-2
  },
  lowcost: {
    business: { left: 3, right: 3 }, // 3-3
    comfort: { left: 3, right: 3 }, // 3-3
    eco: { left: 3, right: 3 }, // 3-3
  },
};

// Структура для разбиения мест по блокам для двухпроходных конфигураций
const configSeatBlocks = {
  premium2: {
    first: { left: 1, center: 1, right: 1 }, // 1-1-1
    business: { left: 1, center: 2, right: 1 }, // 1-2-1
    comfort: { left: 2, center: 3, right: 2 }, // 2-3-2
    eco: { left: 3, center: 4, right: 3 }, // 3-4-3
  },
  balanced: {
    first: { left: 1, center: 2, right: 1 }, // 1-2-1
    business: { left: 2, center: 2, right: 2 }, // 2-2-2
    comfort: { left: 2, center: 4, right: 2 }, // 2-4-2
    eco: { left: 3, center: 3, right: 3 }, // 3-3-3
  },
  dense: {
    first: { left: 1, center: 2, right: 1 }, // 1-2-1
    business: { left: 2, center: 3, right: 2 }, // 2-3-2
    comfort: { left: 3, center: 3, right: 3 }, // 3-3-3
    eco: { left: 3, center: 4, right: 3 }, // 3-4-3
  },
};

// Режимы конструктора
const MODES = {
  CONFIG: "config",
  MANUAL: "manual",
};

let currentMode = MODES.CONFIG;

function getFormData() {
  const aisles = +document.querySelector('input[name="aisles"]:checked').value;
  const mode = document.querySelector('input[name="mode"]:checked').value;

  // Получаем id и name для brand и airline
  const brandSelect = document.getElementById("brand");
  const airlineSelect = document.getElementById("airline");
  const airlineOption = airlineSelect.selectedOptions[0];
  const airlineId = airlineOption
    ? airlineOption.getAttribute("data-value")
    : null;
  const airlineName = airlineOption ? airlineOption.text : "";
  const brandId = brandSelect.value;
  const brandName = brandSelect.selectedOptions[0].text;

  let data = {
    model: modelInput.value,
    range: +rangeInput.value,
    brandId,
    brandName,
    airlineId,
    airplaneId,
    airlineName,
    numberOfPassages: aisles,
    mode,
    cabinStructures: [],
  };

  let configKey = null;
  if (mode === MODES.CONFIG) {
    let selectedConfigCard = document.querySelector(".config-card.selected");
    if (!selectedConfigCard) {
      selectedConfigCard = document.querySelector(".config-card");
      if (selectedConfigCard) selectedConfigCard.classList.add("selected");
    }
    configKey = selectedConfigCard ? selectedConfigCard.dataset.key : null;
    data.configKey = configKey;
  }

  // Описания классов обслуживания (точно как в БД)
  const classes = [
    {
      id: 1,
      name: "FIRST",
      rows: "firstRows",
      seats: "firstSeats",
      configKey: "first",
    },
    {
      id: 2,
      name: "BUSINESS",
      rows: "businessRows",
      seats: "businessSeats",
      configKey: "business",
    },
    {
      id: 3,
      name: "COMFORT",
      rows: "comfortRows",
      seats: "comfortSeats",
      configKey: "comfort",
    },
    {
      id: 4,
      name: "ECONOMY",
      rows: "ecoRows",
      seats: "ecoSeats",
      configKey: "eco",
    },
  ];

  classes.forEach((cls) => {
    let numberOfRows = 0,
      numberOfSeats = 0;
    if (mode === MODES.CONFIG) {
      const config = CONFIGS[aisles].find((c) => c.key === configKey);
      if (
        config &&
        config.rows &&
        typeof config.rows[cls.configKey] !== "undefined"
      ) {
        numberOfRows = config.rows[cls.configKey];
        const configSeats = {
          standard: { business: 4, comfort: 6, eco: 6 },
          premium: { business: 3, comfort: 4, eco: 6 },
          small: { business: 4, comfort: 4, eco: 5 },
          lowcost: { business: 6, comfort: 6, eco: 6 },
          premium2: { first: 3, business: 4, comfort: 7, eco: 10 },
          balanced: { first: 4, business: 6, comfort: 8, eco: 9 },
          dense: { first: 4, business: 7, comfort: 9, eco: 10 },
        };
        const seats = configSeats[configKey] || {};
        numberOfSeats = seats[cls.configKey] || 0;
        data.cabinStructures.push({
          serviceClass: cls.name,
          numberOfRows,
          numberOfSeatsPerRow: numberOfSeats,
        });
        return;
      }
    } else {
      numberOfRows = +document.getElementById(cls.rows)?.value || 0;
      numberOfSeats = +document.getElementById(cls.seats)?.value || 0;
      data[cls.rows] = numberOfRows;
      data[cls.seats] = numberOfSeats;
      if (numberOfRows > 0 && numberOfSeats > 0) {
        data.cabinStructures.push({
          serviceClass: cls.name,
          numberOfRows,
          numberOfSeatsPerRow: numberOfSeats,
        });
      }
    }
  });

  // Гарантируем, что ecoRows и ecoSeats всегда есть в data
  if (!("ecoRows" in data))
    data.ecoRows = +document.getElementById("ecoRows")?.value || 0;
  if (!("ecoSeats" in data))
    data.ecoSeats = +document.getElementById("ecoSeats")?.value || 0;
  return data;
}

function fillSelect(id, min, max, onlyEven = false) {
  const sel = document.getElementById(id);
  if (!sel) return;
  sel.innerHTML = "";
  const isFirstRows = id === "firstRows";
  const isComfortRows = id === "comfortRows";
  const allowZero = isFirstRows || isComfortRows;
  if (allowZero && id.endsWith("Rows")) {
    const opt = document.createElement("option");
    opt.value = "0";
    opt.textContent = "0";
    sel.appendChild(opt);
  }
  for (let i = min; i <= max; i++) {
    if (!onlyEven || i % 2 === 0) {
      const opt = document.createElement("option");
      opt.value = i;
      opt.textContent = i;
      sel.appendChild(opt);
    }
  }
}

function initSelects() {
  const aisles = +document.querySelector('input[name="aisles"]:checked').value;
  const limits = CLASS_LIMITS[aisles];
  Object.entries(limits).forEach(([className, classLimits]) => {
    fillSelect(
      `${className}Rows`,
      classLimits.minRows,
      classLimits.maxRows,
      classLimits.mustBeEven
    );
    fillSelect(
      `${className}Seats`,
      classLimits.minSeats,
      classLimits.maxSeats,
      classLimits.mustBeEven
    );
  });
}

function renderPlane() {
  const data = getFormData();
  let rows = [];
  const aisles = data.numberOfPassages;
  if (data.mode === MODES.CONFIG) {
    const configKey = data.configKey;
    const config = CONFIGS[aisles].find((c) => c.key === configKey);
    if (config && config.rows) {
      if (aisles === 1) {
        for (let i = 0; i < (config.rows.business || 0); i++)
          rows.push({
            type: "business",
            seats:
              (configSeatSides[configKey]?.business?.left || 0) +
              (configSeatSides[configKey]?.business?.right || 0),
          });
        for (let i = 0; i < (config.rows.comfort || 0); i++)
          rows.push({
            type: "comfort",
            seats:
              (configSeatSides[configKey]?.comfort?.left || 0) +
              (configSeatSides[configKey]?.comfort?.right || 0),
          });
        for (let i = 0; i < (config.rows.eco || 0); i++)
          rows.push({
            type: "eco",
            seats:
              (configSeatSides[configKey]?.eco?.left || 0) +
              (configSeatSides[configKey]?.eco?.right || 0),
          });
      } else {
        for (let i = 0; i < (config.rows.first || 0); i++)
          rows.push({
            type: "first",
            seats:
              (configSeatBlocks[configKey]?.first?.left || 0) +
              (configSeatBlocks[configKey]?.first?.center || 0) +
              (configSeatBlocks[configKey]?.first?.right || 0),
          });
        for (let i = 0; i < (config.rows.business || 0); i++)
          rows.push({
            type: "business",
            seats:
              (configSeatBlocks[configKey]?.business?.left || 0) +
              (configSeatBlocks[configKey]?.business?.center || 0) +
              (configSeatBlocks[configKey]?.business?.right || 0),
          });
        for (let i = 0; i < (config.rows.comfort || 0); i++)
          rows.push({
            type: "comfort",
            seats:
              (configSeatBlocks[configKey]?.comfort?.left || 0) +
              (configSeatBlocks[configKey]?.comfort?.center || 0) +
              (configSeatBlocks[configKey]?.comfort?.right || 0),
          });
        for (let i = 0; i < (config.rows.eco || 0); i++)
          rows.push({
            type: "eco",
            seats:
              (configSeatBlocks[configKey]?.eco?.left || 0) +
              (configSeatBlocks[configKey]?.eco?.center || 0) +
              (configSeatBlocks[configKey]?.eco?.right || 0),
          });
      }
    }
  } else {
    if (aisles === 1) {
      const business =
        data.cabinStructures.find((c) => c.serviceClass === "BUSINESS") || {};
      const comfort =
        data.cabinStructures.find((c) => c.serviceClass === "COMFORT") || {};
      const eco =
        data.cabinStructures.find((c) => c.serviceClass === "ECONOMY") || {};
      for (let i = 0; i < (business.numberOfRows || 0); i++)
        rows.push({ type: "business", seats: business.numberOfSeatsPerRow });
      for (let i = 0; i < (comfort.numberOfRows || 0); i++)
        rows.push({ type: "comfort", seats: comfort.numberOfSeatsPerRow });
      for (let i = 0; i < (eco.numberOfRows || 0); i++)
        rows.push({ type: "eco", seats: eco.numberOfSeatsPerRow });
    } else {
      const first =
        data.cabinStructures.find((c) => c.serviceClass === "FIRST") || {};
      const business =
        data.cabinStructures.find((c) => c.serviceClass === "BUSINESS") || {};
      const comfort =
        data.cabinStructures.find((c) => c.serviceClass === "COMFORT") || {};
      const eco =
        data.cabinStructures.find((c) => c.serviceClass === "ECONOMY") || {};
      for (let i = 0; i < (first.numberOfRows || 0); i++)
        rows.push({ type: "first", seats: first.numberOfSeatsPerRow });
      for (let i = 0; i < (business.numberOfRows || 0); i++)
        rows.push({ type: "business", seats: business.numberOfSeatsPerRow });
      for (let i = 0; i < (comfort.numberOfRows || 0); i++)
        rows.push({ type: "comfort", seats: comfort.numberOfSeatsPerRow });
      for (let i = 0; i < (eco.numberOfRows || 0); i++)
        rows.push({ type: "eco", seats: eco.numberOfSeatsPerRow });
    }
  }

  // Вычисляем максимальное количество мест для каждой секции
  let maxLeft = 0,
    maxCenter = 0,
    maxRight = 0;
  rows.forEach((row) => {
    if (aisles === 1) {
      const seatDistribution =
        data.mode === MODES.CONFIG && data.configKey
          ? configSeatSides[data.configKey]?.[row.type]
          : null;
      const left = seatDistribution
        ? seatDistribution.left
        : Math.ceil(row.seats / 2);
      const right = seatDistribution
        ? seatDistribution.right
        : row.seats - left;
      maxLeft = Math.max(maxLeft, left);
      maxRight = Math.max(maxRight, right);
    } else {
      const seatBlocks =
        data.mode === MODES.CONFIG && data.configKey
          ? configSeatBlocks[data.configKey]?.[row.type]
          : null;

      if (seatBlocks) {
        maxLeft = Math.max(maxLeft, seatBlocks.left);
        maxCenter = Math.max(maxCenter, seatBlocks.center);
        maxRight = Math.max(maxRight, seatBlocks.right);
      } else {
        // Новая логика распределения мест для двух проходов
        const totalSeats = row.seats;
        let left, center, right;

        // Распределяем места с приоритетом центральной секции
        const baseSeats = Math.floor(totalSeats / 3);
        const extraSeats = totalSeats % 3;

        if (extraSeats === 0) {
          // Равномерное распределение
          left = right = center = baseSeats;
        } else if (extraSeats === 1) {
          // Дополнительное место идёт в центр
          center = baseSeats + 1;
          left = right = baseSeats;
        } else {
          // extraSeats === 2
          // Оба дополнительных места идут в центр
          center = baseSeats + 2;
          left = right = baseSeats;
        }

        maxLeft = Math.max(maxLeft, left);
        maxCenter = Math.max(maxCenter, center);
        maxRight = Math.max(maxRight, right);
      }
    }
  });

  // Плавное обновление
  visual.classList.remove("fadein");
  void visual.offsetWidth; // reflow
  visual.innerHTML = "";
  const plane = document.createElement("div");
  plane.className = "plane";

  rows.forEach((row, idx) => {
    const rowDiv = document.createElement("div");
    rowDiv.className = "plane-row";

    // Добавляем номер ряда
    const rowNum = document.createElement("span");
    rowNum.className = "row-num";
    rowNum.textContent = idx + 1;
    rowDiv.appendChild(rowNum);

    if (aisles === 1) {
      const seatDistribution =
        data.mode === MODES.CONFIG && data.configKey
          ? configSeatSides[data.configKey]?.[row.type]
          : null;
      const left = seatDistribution
        ? seatDistribution.left
        : Math.ceil(row.seats / 2);
      const right = seatDistribution
        ? seatDistribution.right
        : row.seats - left;

      // Добавляем пустые места слева
      const leftEmptyCount = maxLeft - left;
      for (let i = 0; i < leftEmptyCount; i++) {
        const seat = document.createElement("span");
        seat.className = "seat seat-empty";
        rowDiv.appendChild(seat);
      }

      // Добавляем левые места
      for (let i = 0; i < left; i++) {
        const seat = document.createElement("span");
        seat.className = "seat";
        seat.style.background = CLASS_COLORS[row.type];
        rowDiv.appendChild(seat);
      }

      // Добавляем проход
      const aisle = document.createElement("span");
      aisle.className = "aisle";
      rowDiv.appendChild(aisle);

      // Добавляем правые места
      for (let i = 0; i < right; i++) {
        const seat = document.createElement("span");
        seat.className = "seat";
        seat.style.background = CLASS_COLORS[row.type];
        rowDiv.appendChild(seat);
      }

      // Добавляем пустые места справа
      const rightEmptyCount = maxRight - right;
      for (let i = 0; i < rightEmptyCount; i++) {
        const seat = document.createElement("span");
        seat.className = "seat seat-empty";
        rowDiv.appendChild(seat);
      }

      // Устанавливаем grid-template-columns
      rowDiv.style.gridTemplateColumns = `40px repeat(${maxLeft}, 22px) 18px repeat(${maxRight}, 22px)`;
    } else {
      const configKey = data.configKey;
      const seatBlocks =
        data.mode === MODES.CONFIG && configKey
          ? configSeatBlocks[configKey]?.[row.type]
          : null;

      let left, center, right;
      if (seatBlocks) {
        left = seatBlocks.left;
        center = seatBlocks.center;
        right = seatBlocks.right;
      } else {
        // Используем ту же логику распределения, что и выше
        const totalSeats = row.seats;
        const baseSeats = Math.floor(totalSeats / 3);
        const extraSeats = totalSeats % 3;

        if (extraSeats === 0) {
          left = right = center = baseSeats;
        } else if (extraSeats === 1) {
          center = baseSeats + 1;
          left = right = baseSeats;
        } else {
          center = baseSeats + 2;
          left = right = baseSeats;
        }
      }

      // Всегда центрируем среднюю секцию
      const centerEmptyTotal = maxCenter - center;
      const centerEmptyLeft = Math.floor(centerEmptyTotal / 2);
      const centerEmptyRight = centerEmptyTotal - centerEmptyLeft;

      // Левая секция
      for (let i = 0; i < maxLeft - left; i++) {
        const seat = document.createElement("span");
        seat.className = "seat seat-empty";
        rowDiv.appendChild(seat);
      }
      for (let i = 0; i < left; i++) {
        const seat = document.createElement("span");
        seat.className = "seat";
        seat.style.background = CLASS_COLORS[row.type];
        rowDiv.appendChild(seat);
      }

      // Первый проход
      const aisle1 = document.createElement("span");
      aisle1.className = "aisle";
      rowDiv.appendChild(aisle1);

      // Центральная секция
      for (let i = 0; i < centerEmptyLeft; i++) {
        const seat = document.createElement("span");
        seat.className = "seat seat-empty";
        rowDiv.appendChild(seat);
      }
      for (let i = 0; i < center; i++) {
        const seat = document.createElement("span");
        seat.className = "seat";
        seat.style.background = CLASS_COLORS[row.type];
        rowDiv.appendChild(seat);
      }
      for (let i = 0; i < centerEmptyRight; i++) {
        const seat = document.createElement("span");
        seat.className = "seat seat-empty";
        rowDiv.appendChild(seat);
      }

      // Второй проход
      const aisle2 = document.createElement("span");
      aisle2.className = "aisle";
      rowDiv.appendChild(aisle2);

      // Правая секция
      for (let i = 0; i < right; i++) {
        const seat = document.createElement("span");
        seat.className = "seat";
        seat.style.background = CLASS_COLORS[row.type];
        rowDiv.appendChild(seat);
      }
      for (let i = 0; i < maxRight - right; i++) {
        const seat = document.createElement("span");
        seat.className = "seat seat-empty";
        rowDiv.appendChild(seat);
      }

      // Устанавливаем grid-template-columns
      rowDiv.style.gridTemplateColumns = `40px repeat(${maxLeft}, 22px) 18px repeat(${maxCenter}, 22px) 18px repeat(${maxRight}, 22px)`;
    }

    plane.appendChild(rowDiv);
    if (idx < rows.length - 1 && row.type !== rows[idx + 1].type) {
      rowDiv.classList.add("class-gap");
    }
  });

  visual.appendChild(plane);
  setTimeout(() => visual.classList.add("fadein"), 10);
}

function showError(input, errorElement, message) {
  if (!input || !errorElement) return;
  input.classList.add("error");
  errorElement.textContent = message;
  errorElement.classList.add("visible");
}

function resetField(input, errorElement) {
  if (!input || !errorElement) return;
  input.classList.remove("error");
  errorElement.classList.remove("visible");
  errorElement.textContent = "";
}

function validateModel() {
  const value = modelInput.value.trim();
  if (value === "") {
    showError(modelInput, modelError, "Необходимо заполнить параметр");
    return false;
  }
  if (isNaN(value)) {
    showError(modelInput, modelError, "Введите числовое значение");
    return false;
  }
  const num = parseInt(value, 10);
  if (isNaN(num) || num < 1 || num > 999) {
    showError(modelInput, modelError, "Номер модели должен быть от 1 до 999");
    return false;
  }
  resetField(modelInput, modelError);
  return true;
}

function validateRange() {
  const range = rangeInput.value.trim();
  if (range === "") {
    showError(rangeInput, rangeError, "Необходимо заполнить параметр");
    return false;
  }
  if (isNaN(range)) {
    showError(rangeInput, rangeError, "Введите числовое значение");
    return false;
  }
  const rangeNum = parseInt(range);
  if (rangeNum < 1000 || rangeNum > 15000) {
    showError(
      rangeInput,
      rangeError,
      "Дальность должна быть от 1000 до 15000 км"
    );
    return false;
  }
  resetField(rangeInput, rangeError);
  return true;
}

function validateRequiredUnified(input, errorElement) {
  if (!input.value.trim()) {
    showError(input, errorElement, "Необходимо заполнить параметр");
    return false;
  }
  resetField(input, errorElement);
  return true;
}

function validateTopFields() {
  let isValid = true;
  if (!validateModel()) isValid = false;
  if (!validateRange()) isValid = false;
  if (!validateRequiredUnified(airlineInput, airlineError)) isValid = false;
  if (!validateRequiredUnified(brandInput, brandError)) isValid = false;
  return isValid;
}

// Функции для работы с модальными окнами
function showErrorDialog(errors) {
  const dialog = document.getElementById("error-dialog");
  const errorList = document.getElementById("error-list");
  errorList.innerHTML = errors.map((error) => `<p>${error}</p>`).join("");
  dialog.showModal();
}

function closeErrorDialog() {
  const dialog = document.getElementById("error-dialog");
  dialog.close();
}

function showSuccessDialog() {
  const dialog = document.getElementById("success-dialog");
  dialog.showModal();
}

function closeSuccessDialog() {
  const dialog = document.getElementById("success-dialog");
  dialog.close();
}

// Обработчики событий для полей формы
modelInput.addEventListener("input", function (e) {
  // Удаляем все символы, кроме цифр
  this.value = this.value.replace(/\D/g, "");
  resetField(modelInput, modelError);
});

rangeInput.addEventListener("input", function (e) {
  // Удаляем все символы, кроме цифр
  this.value = this.value.replace(/\D/g, "");
  resetField(rangeInput, rangeError);
});

brandInput.addEventListener("input", () => resetField(brandInput, brandError));
airlineInput.addEventListener("input", () =>
  resetField(airlineInput, airlineError)
);

// blur: не показываем ошибку, если поле пустое
modelInput.addEventListener("blur", () => {
  if (modelInput.value.trim() !== "") validateModel();
});
rangeInput.addEventListener("blur", () => {
  if (rangeInput.value.trim() !== "") validateRange();
});
brandInput.addEventListener("blur", () => {
  if (brandInput.value.trim() !== "")
    validateRequiredUnified(brandInput, brandError);
});
airlineInput.addEventListener("blur", () => {
  if (airlineInput.value.trim() !== "")
    validateRequiredUnified(airlineInput, airlineError);
});

// Обновляем обработчик кнопки сохранения
document.getElementById("saveBtn").addEventListener("click", async function () {
  const topValid = validateTopFields();
  if (!topValid) return;

  const data = getFormData();

  // Проверяем только для ручного режима
  if (data.mode === MODES.MANUAL) {
    const limitErrors = validateClassLimits(data);
    const relationErrors = validateClassRelations(data);
    const allErrors = [...limitErrors, ...relationErrors];

    if (allErrors.length > 0) {
      showErrorDialog(allErrors);
      return;
    }
  }

  console.log("Отправляемые cabinStructures:", data.cabinStructures);
  console.log(crudMode)

  console.log(data)

  if (crudMode == 'add'){
    try {
      const response = await fetch("/api/airplanes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorText = await response.text();
        showErrorDialog(["Ошибка при сохранении: " + errorText]);
        return;
      }
      showSuccessDialog();
    } catch (error) {
      showErrorDialog(["Ошибка при отправке запроса: " + error.message]);
    }
  }
  else{
    try {
      const response = await fetch(`/api/airplanes`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorText = await response.text();
        showErrorDialog(["Ошибка при сохранении: " + errorText]);
        return;
      }
      showSuccessDialog();
    } catch (error) {
      showErrorDialog(["Ошибка при отправке запроса: " + error.message]);
    }
  }
});

function renderConfigCards(aisles) {
  const configGroup = document.getElementById("config-group");
  configGroup.innerHTML = "";

  CONFIGS[aisles].forEach((config) => {
    const card = document.createElement("div");
    card.className = "config-card";
    card.dataset.key = config.key;
    card.innerHTML = `
            <h3>${config.title}</h3>
            <p class="config-desc">${config.desc}</p>
            <pre class="config-schema">${config.schema}</pre>
        `;
    card.addEventListener("click", () => {
      document
        .querySelectorAll(".config-card")
        .forEach((c) => c.classList.remove("selected"));
      card.classList.add("selected");
      renderPlane();
    });
    configGroup.appendChild(card);
  });

  // Выбираем первую конфигурацию по умолчанию
  const firstCard = configGroup.querySelector(".config-card");
  if (firstCard) {
    firstCard.classList.add("selected");
  }
}

function updateMode(mode) {
  currentMode = mode;
  const configRow = document.getElementById("config-row");
  const manualSettings = document.getElementById("manual-settings");

  if (mode === MODES.CONFIG) {
    configRow.classList.add("active");
    manualSettings.classList.remove("active");

    // Исправление: выделяем первую конфигурацию и устанавливаем configKey
    const aisles = +document.querySelector('input[name="aisles"]:checked')
      .value;
    renderConfigCards(aisles);
    const firstCard = document.querySelector(".config-card");
    if (firstCard) {
      document
        .querySelectorAll(".config-card")
        .forEach((c) => c.classList.remove("selected"));
      firstCard.classList.add("selected");
      // Установить configKey в form data (через скрытое поле или глобально)
      // renderPlane сам вызовет getFormData, где configKey будет взят из выделенной карточки
      renderPlane();
      return;
    }
  } else {
    configRow.classList.remove("active");
    manualSettings.classList.add("active");
  }

  renderPlane();
}

function updateAislesVisibility() {
  const aisles = +document.querySelector('input[name="aisles"]:checked').value;
  // Обрабатываем все элементы, связанные с первым классом
  const firstClassElements = document.querySelectorAll(
    '.first-class-row, .legend-row:first-child, [data-class="first"]'
  );
  firstClassElements.forEach((el) => {
    if (el.classList.contains("legend-row") || el.hasAttribute("data-class")) {
      el.style.display = aisles === 2 ? "flex" : "none";
    } else {
      el.style.display = aisles === 2 ? "block" : "none";
    }
  });

  // После изменения видимости первого класса обновляем видимость полей выбора мест
  setTimeout(updateSeatsVisibility, 0);
}

function updateSeatsVisibility() {
  // Обработка первого класса (только для двухпроходной конфигурации)
  const firstRowsSelect = document.getElementById("firstRows");
  if (firstRowsSelect) {
    const firstSeatsLabel = document.getElementById("firstSeats-label");
    const firstSeats = document.getElementById("firstSeats");
    if (firstSeatsLabel && firstSeats) {
      const isVisible = firstRowsSelect.value !== "0";
      firstSeatsLabel.style.display = isVisible ? "" : "none";
      firstSeats.style.display = isVisible ? "" : "none";
      if (!isVisible) {
        firstSeats.blur();
      }
    }
  }

  // Обработка комфорт класса
  const comfortRowsSelect = document.getElementById("comfortRows");
  if (comfortRowsSelect) {
    const comfortSeatsLabel = document.getElementById("comfortSeats-label");
    const comfortSeats = document.getElementById("comfortSeats");
    if (comfortSeatsLabel && comfortSeats) {
      const isVisible = comfortRowsSelect.value !== "0";
      comfortSeatsLabel.style.display = isVisible ? "" : "none";
      comfortSeats.style.display = isVisible ? "" : "none";
      if (!isVisible) {
        comfortSeats.blur();
      }
    }
  }
}

// Обработчики событий
form.addEventListener("input", (e) => {
  const renderTriggeringFields = [
    "mode",
    "aisles",
    "firstRows",
    "firstSeats",
    "businessRows",
    "businessSeats",
    "comfortRows",
    "comfortSeats",
    "ecoRows",
    "ecoSeats",
  ];

  if (e.target.name === "mode") {
    updateMode(e.target.value);
  } else if (e.target.name === "aisles") {
    const aisles = +e.target.value;
    updateAislesVisibility();
    renderConfigCards(aisles);
    initSelects(); // Переинициализируем селекты при изменении количества проходов
  }

  // Перерисовываем схему только если изменилось релевантное поле
  if (
    renderTriggeringFields.includes(e.target.name) ||
    renderTriggeringFields.includes(e.target.id)
  ) {
    renderPlane();
  }
});

// Инициализация
window.addEventListener("DOMContentLoaded", () => {
  // Сначала создаем обертки для секций
  const form = document.querySelector("form");
  const classLabels = Array.from(form.children).filter(
    (el) =>
      el.tagName === "LABEL" && !el.previousElementSibling?.matches("label")
  );

  classLabels.forEach((label) => {
    const section = document.createElement("div");
    section.className = "class-section";

    // Находим все элементы до следующего основного label
    const elements = [];
    let currentElement = label;

    while (
      currentElement &&
      (!currentElement.nextElementSibling ||
        !currentElement.nextElementSibling.matches("form > label:first-child"))
    ) {
      elements.push(currentElement);
      currentElement = currentElement.nextElementSibling;
      if (!currentElement) break;
    }

    // Перемещаем элементы в section
    elements.forEach((el) => {
      if (el && el.parentElement) {
        section.appendChild(el);
      }
    });

    // Вставляем section в форму
    form.appendChild(section);
  });

  // Затем инициализируем селекты и остальные компоненты
  initSelects();
  renderConfigCards(1);
  updateMode(MODES.CONFIG);
  updateAislesVisibility();
  renderPlane();

  // Обработчики для изменения количества рядов
  document.addEventListener("change", function (e) {
    if (e.target.id === "firstRows" || e.target.id === "comfortRows") {
      updateSeatsVisibility();
    }
  });

  // Обработчик изменения количества проходов
  document.querySelectorAll('input[name="aisles"]').forEach((radio) => {
    radio.addEventListener("change", updateAislesVisibility);
  });

  // Универсальная обработка всех select элементов
  function makeSelectToggle(labelId, selectId) {
    const label = document.getElementById(labelId);
    const select = document.getElementById(selectId);
    if (!label || !select) return;

    label.addEventListener("mousedown", function (e) {
      e.preventDefault();
      if (document.activeElement === select) {
        select.blur();
      } else {
        select.focus();
        if (typeof select.showPicker === "function") {
          select.showPicker();
        } else {
          const event = new MouseEvent("mousedown", { bubbles: true });
          select.dispatchEvent(event);
        }
      }
    });

    select.addEventListener("mousedown", function (e) {
      if (document.activeElement === select) {
        e.preventDefault();
        select.blur();
      }
    });

    // Добавляем обработчик изменения значения
    select.addEventListener("change", function () {
      select.blur(); // Убираем фокус после выбора
    });
  }

  const selectPairs = {
    "brand-label": "brand",
    "airline-label": "airline",
    "firstRows-label": "firstRows",
    "firstSeats-label": "firstSeats",
    "businessRows-label": "businessRows",
    "businessSeats-label": "businessSeats",
    "comfortRows-label": "comfortRows",
    "comfortSeats-label": "comfortSeats",
    "ecoRows-label": "ecoRows",
    "ecoSeats-label": "ecoSeats",
  };

  Object.entries(selectPairs).forEach(([labelId, selectId]) => {
    makeSelectToggle(labelId, selectId);
  });

  // Инициализация зависимых списков
  initDependentSelects();
});

// Инициализация зависимых списков
function initDependentSelects() {
  brandInput.disabled = true;
  modelInput.disabled = true;
  loadAirlines();

  let isFirstChange = true;

  airlineInput.addEventListener("change", async function () {
    brandInput.disabled = true;
    modelInput.disabled = true;

    const selectedOption = this.options[this.selectedIndex];

    if (selectedOption && selectedOption.hasAttribute("data-value")) {
      const airlineId = selectedOption.getAttribute("data-value");

      try {
        brandInput.innerHTML = '<option value="">Загрузка марок...</option>';
        const response = await fetchWithRetry(
          `/api/brands?airlineId=${airlineId}`
        );

        if (response.ok) {
          const brands = await response.json();
          if (brands && brands.length > 0) {
            brandInput.innerHTML = '<option value="0">Выберите марку</option>';

            brands.forEach((brand) => {
              brandInput.innerHTML += `<option value="${brand.brandId}">${brand.name}</option>`;
            });

            brandInput.disabled = false;

            // Особое поведение только при первом вызове
            if (
              isFirstChange &&
              crudMode === "edit" &&
              airplaneData &&
              airplaneData.brandId
            ) {
              brandInput.value = airplaneData.brandId;
              if (airplaneData.model) {
                modelInput.disabled = false;
                modelInput.value = airplaneData.model;
              }
              isFirstChange = false;
            } else {
              brandInput.value = 0;
              modelInput.placeholder = "Сначала выберите марку";
            }
          } else {
            brandInput.innerHTML =
              '<option value="">Нет доступных марок</option>';
          }
        } else {
          brandInput.innerHTML = '<option value="">Ошибка загрузки</option>';
        }
      } catch (error) {
        console.error("Ошибка при загрузке марок:", error);
        brandInput.innerHTML = '<option value="">Ошибка загрузки</option>';
      }
    }
  });

  // Обработчик изменения марки - УБРАН СБРОС МОДЕЛИ
  brandInput.addEventListener("change", function () {
    // Только разблокируем поле модели
    if (this.value) {
      modelInput.disabled = false;
      modelInput.placeholder = "Укажите новый номер";
      modelInput.min = 1;
      modelInput.max = 999;
      modelInput.type = "number";

      // Сохраняем текущее значение модели если оно есть
      if (!modelInput.value && airplaneData && airplaneData.model) {
        modelInput.value = airplaneData.model;
      }
    } else {
      modelInput.disabled = true;
      modelInput.placeholder = "Сначала выберите марку";
    }
  });
}

// Универсальная функция fetch с повторными попытками
async function fetchWithRetry(url, options = {}, retries = 3, delay = 500) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error("Network response was not ok");
      return response;
    } catch (e) {
      if (i < retries - 1) {
        await new Promise((res) => setTimeout(res, delay));
      } else {
        throw e;
      }
    }
  }
}

// Загрузка авиакомпаний
async function loadAirlines() {
  try {
    const response = await fetchWithRetry("/api/airlines");
    if (response.ok) {
      const airlines = await response.json();
      if (airlines && airlines.length > 0) {
        if (crudMode !== "edit") {
          airlineInput.innerHTML =
            '<option value="">Выберите авиакомпанию</option>';
        } else {
          airlineInput.innerHTML = "";
        }
        airlines.forEach((airline) => {
          airlineInput.innerHTML += `<option value="${airline.name}" data-value="${airline.airlineId}">${airline.name}</option>`;
        });
        airlineInput.disabled = false;
      } else {
        airlineInput.innerHTML =
          '<option value="">Нет доступных авиакомпаний</option>';
      }
    } else {
      airlineInput.innerHTML = '<option value="">Ошибка загрузки</option>';
    }
  } catch (error) {
    console.error("Ошибка при загрузке авиакомпаний:", error);
    airlineInput.innerHTML = '<option value="">Ошибка загрузки</option>';
  }
}
