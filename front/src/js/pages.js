import { el, mount } from "redom";
import { login, getUserAccounts } from "./api";
import { formateDate } from "./utils";

export function renderSignInPage() {
  const container = el("div", {
    class: "container signIn-container",
  });

  const h1 = el("h1", "Вход в аккаунт");
  const form = el("form");
  const fieldset = el("fieldset");
  fieldset.style.width = "100%";

  const loginWrapper = el("div", {
    class: "row justify-content-start align-items-center",
  });
  const labelLogin = el("label", { class: "col-2" }, "Логин");
  const loginInput = el("input", { class: "col-auto", value: "developer" });
  loginWrapper.append(labelLogin, loginInput);

  const passwordWrapper = el("div", {
    class: "row justify-content-start align-items-center",
  });
  const labelPassword = el("label", { class: "col-2" }, "Пароль");
  const passwordInput = el("input", { class: "col-auto", value: "skillbox" });
  passwordWrapper.append(labelPassword, passwordInput);

  const button = el(
    "button",
    { class: "btn btn-primary", id: "signIn" },
    "Войти"
  );
  button.addEventListener("click", async (e) => {
    e.preventDefault();
    let response = await login(loginInput.value, passwordInput.value);
    if (response.error === "") {
      let response2 = await getUserAccounts();
      //console.log(response2);
      if (response2) {
        renderAccountsPage(response2.payload);
      }
    }
  });

  fieldset.append(loginWrapper, passwordWrapper, button);
  form.append(fieldset);
  container.append(h1, form);

  //
  document.getElementById("header-buttons").style.display = "none";
  const main = document.getElementById("main");
  main.innerHTML = "";
  main.appendChild(container);
}

export function renderAccountsPage(accountsInfo) {
  const container = el("div", { class: "container accounts-container" });

  // Верхняя часть
  const controlAccountsWrapper = el("div", {
    class: "control-accounts d-flex  mb-3",
  });
  const h1 = el("h1", { class: "" }, "Ваши счета");
  const sortingType = el("select", { class: "p-2 me-auto" });
  const sortingTypeOptions = [
    { value: "number", label: "По номеру" },
    { value: "balance", label: "По балансу" },
    { value: "date", label: "По последней транзакции" },
  ];
  for (let i = 0; i < sortingTypeOptions.length; i++) {
    const option = el(
      "option",
      { value: sortingTypeOptions[i].value },
      sortingTypeOptions[i].label
    );
    sortingType.append(option);
  }

  const button = el(
    "button",
    { class: "btn btn-primary " },
    "+ Создать новый счет"
  );
  controlAccountsWrapper.append(h1, sortingType, button);
  container.append(controlAccountsWrapper);

  // Нижняя часть
  const accountsWrapper = el("div", { class: "row accounts" });
  for (let i = 0; i < accountsInfo.length; i++) {
    const card = el("div", { class: "card col-4" });

    const cardBody = el("div", { class: "card-body" });
    const cardTitle = el(
      "h5",
      { class: "card-title" },
      accountsInfo[i].account
    );
    const price = el("p", {}, accountsInfo[i].balance + " ₽");
    const lastTransactionHeader = el("h6", {}, "Последняя транзакция:");

    const date = new Date(accountsInfo[i].transactions[0].date);
    const lastTransaction = el("p", {}, formateDate(date));
    const buttonOpen = el("button", { class: "btn btn-primary" }, "Открыть");

    cardBody.append(
      cardTitle,
      price,
      lastTransactionHeader,
      lastTransaction,
      buttonOpen
    );
    card.append(cardBody);
    accountsWrapper.append(card);
    container.append(accountsWrapper);
  }

  //
  document.getElementById("header-buttons").style.display = "block";
  const main = document.getElementById("main");
  main.innerHTML = "";
  main.appendChild(container);
}

export function renderCurrencyPage(currencies) {
  const container = el("div", { class: "container currency-container" });

  //
  const h1 = el("h1", { class: "" }, "Валютный обмен");

  //
  const mainRow = el("div", { class: "row gx-5" });
  const leftSide = el("div", { class: "col" });
  const rightSide = el("div", { class: "col" });
  mainRow.append(leftSide, rightSide);

  //
  const yourCurrencyCard = el("div", { class: "card" });
  const yourCurrencyCardBody = el("div", { class: "card-body" });
  const yourCurrencyTitle = el("h5", { class: "card-title" }, "Ваша валюты");
  const yourCurrencyList = el("ul", { class: "currency-list" });
  const currencyKeys = Object.keys(currencies);
  for (let i = 0; i < currencyKeys.length; i++) {
    const val = Object.values(currencies)[i];

    const listItem = el("li", { class: "currency-item" });
    const itemName = el("span", val.code);
    const itemAmount = el("span", val.amount);
    listItem.append(itemName, itemAmount);
    yourCurrencyList.append(listItem);
  }

  yourCurrencyCardBody.append(yourCurrencyTitle, yourCurrencyList);
  yourCurrencyCard.append(yourCurrencyCardBody);
  leftSide.append(yourCurrencyCard);

  //
  const currencyExchangeCard = el("div", { class: "card exchange-card" });
  const currencyExchangeCardBody = el("div", { class: "card-body" });
  const currencyExchangeTitle = el(
    "h5",
    { class: "card-title" },
    "Обмен валют"
  );
  const exchangeData = el("div", { class: "d-flex exchange-data justify-content-between" });
  const exchangeForm = el("form");
  const exchangeFieldset = el("fieldset");
  const exchangeFromWrapper = el("div");
  const exchangeFromLabel = el("label", { class: "" }, "Откуда");
  const exchangeFromInput = el("input", { class: "" });
  exchangeFromWrapper.append(exchangeFromLabel, exchangeFromInput);
  const exchangeToWrapper = el("div");
  const exchangeToLabel = el("label", { class: "" }, "Куда");
  const exchangeToInput = el("input", { class: "" });
  exchangeToWrapper.append(exchangeToLabel, exchangeToInput);
  const summaryWrapper = el("div");
  const summaryLabel = el("label", { class: "" }, "Сумма");
  const summaryInput = el("input", { class: "" });
  summaryWrapper.append(summaryLabel, summaryInput);
  exchangeFieldset.append(
    exchangeFromWrapper,
    exchangeToWrapper,
    summaryWrapper
  );
  exchangeForm.append(exchangeFieldset);

  const exchangeButton = el("button", { class: "btn btn-primary exchange-Button align-self-center" }, "Обменять");
  exchangeData.append(exchangeForm, exchangeButton);
  currencyExchangeCardBody.append(currencyExchangeTitle, exchangeData);
  currencyExchangeCard.append(currencyExchangeCardBody);
  leftSide.append(currencyExchangeCard);

  //
  const currencyRTChangedCard = el("div", { class: "card" });
  const currencyRTChangedCardBody = el("div", { class: "card-body" });
  const currencyRTChangedTitle = el(
    "h5",
    { class: "card-title" },
    "Измененные курсов в реальном времени"
  );

  currencyRTChangedCardBody.append(currencyRTChangedTitle);
  currencyRTChangedCard.append(currencyRTChangedCardBody);
  rightSide.append(currencyRTChangedCard);

  //
  container.append(h1, mainRow);

  const main = document.getElementById("main");
  main.innerHTML = "";
  main.appendChild(container);
}

export function renderATMsPage(banks) {
  const container = el("div", { class: "container atm-container" });

  const title = el("h1", { class: "" }, "Карта банкоматов");

  const map = el("div", {
    class: "ya-map",
    id: "map",
    style: {
      width: "100%",
      height: "1000px",
    },
  });

  // Функция ymaps.ready() будет вызвана, когда
  // загрузятся все компоненты API, а также когда будет готово DOM-дерево.
  ymaps.ready(() => {
    const myMap = new ymaps.Map("map", {
      // Координаты центра карты.
      // Порядок по умолчанию: «широта, долгота».
      // Чтобы не определять координаты центра карты вручную,
      // воспользуйтесь инструментом Определение координат.
      center: [55.753994, 37.622093],
      // Уровень масштабирования. Допустимые значения:
      // от 0 (весь мир) до 19.
      zoom: 11,
      controls: [],
    });

    for (let i = 0; i < banks.length; i++) {
      const placeMaker = new ymaps.Placemark([banks[i].lat, banks[i].lon], {
        iconLayout: "default#image",
        iconImageSize: [50, 50],
      });
      myMap.geoObjects.add(placeMaker);
    }
  });

  container.append(title, map);
  const main = document.getElementById("main");
  main.innerHTML = "";
  main.appendChild(container);
}
