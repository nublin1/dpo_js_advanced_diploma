import { el, mount } from "redom";
import {
  login,
  getCurrencies,
  getUserAccounts,
  getCurrencyExchangeRate,
  openCurrencyExchangeRate,
  allCurrenciesList,
  currencyBuy,
} from "./api";
import { renderAccountsPage } from "./pages/accountsPage.js";

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



export function renderCurrencyPage() {
  const container = el("div", { class: "container currency-container" });

  //
  const h1 = el("h1", { class: "" }, "Валютный обмен");

  //
  const mainRow = el("div", { class: "row gx-5" });
  const leftSide = el("div", { class: "col" });
  const rightSide = el("div", { class: "col" });
  mainRow.append(leftSide, rightSide);

  //
  const yourCurrencyCard = el("div", { class: "card yourcurrency-card" });
  const yourCurrencyCardBody = el("div", { class: "card-body" });
  const yourCurrencyTitle = el("h5", { class: "card-title" }, "Ваши валюты");
  const yourCurrencyList = el("ul", { class: "yourcurrency-list" });
  reloadYourCurrencyList(yourCurrencyList);

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
  const exchangeData = el("div", {
    class: "d-flex exchange-data justify-content-between",
  });
  const exchangeForm = el("form", { class: "exchange-form" });
  const exchangeFieldset = el("fieldset");
  const exchangeFromWrapper = el("div", { class: "exchange-from" });
  const exchangeFromLabel = el("label", { class: "" }, "Из");
  const exchangeFromSelect = el("select", { class: "" });
  for (let i = 0; i < allCurrenciesList.length; i++) {
    const option = el("option", { value: allCurrenciesList[i] }, allCurrenciesList[i] );
    exchangeFromSelect.append(option);
  }

  exchangeFromWrapper.append(exchangeFromLabel, exchangeFromSelect);
  const exchangeToWrapper = el("div", { class: "exchange-to" });
  const exchangeToLabel = el("label", { class: "" }, "в");
  const exchangeToSelect = el("select", { class: "" });
  for (let i = 0; i < allCurrenciesList.length; i++) {
    const option = el("option", { value: allCurrenciesList[i] }, allCurrenciesList[i] );
    exchangeToSelect.append(option);
  }
  exchangeToWrapper.append(exchangeToLabel, exchangeToSelect);
  const summaryWrapper = el("div", { class: "summary" });
  const summaryLabel = el("label", { class: "" }, "Сумма");
  const summaryInput = el("input", { class: "" });
  summaryWrapper.append(summaryLabel, summaryInput);
  exchangeFieldset.append(
    exchangeFromWrapper,
    exchangeToWrapper,
    summaryWrapper
  );
  exchangeForm.append(exchangeFieldset);

  const exchangeButton = el(
    "button",
    { class: "btn btn-primary exchange-Button align-self-center" },
    "Обменять"
  );
  exchangeButton.addEventListener("click", async(e) => {
    e.preventDefault();
   const anwer = await currencyBuy(exchangeFromSelect.value, exchangeToSelect.value, summaryInput.value);
   reloadYourCurrencyList(document.querySelector(".yourcurrency-list"));
  });  
  exchangeData.append(exchangeForm, exchangeButton);
  currencyExchangeCardBody.append(currencyExchangeTitle, exchangeData);
  currencyExchangeCard.append(currencyExchangeCardBody);
  leftSide.append(currencyExchangeCard);

  //
  const currencyRTChangedCard = el("div", {
    class: "card  h-100",
    id: "currencyRTChangedCard",
  });
  const currencyRTChangedCardBody = el("div", { class: "card-body" });
  const currencyRTChangedTitle = el(
    "h5",
    { class: "card-title" },
    "Измененные курсов в реальном времени"
  );
  const currencyRTChangedList = el("ul", { class: "currency-exchange-list" });

  currencyRTChangedCardBody.append(
    currencyRTChangedTitle,
    currencyRTChangedList
  );
  currencyRTChangedCard.append(currencyRTChangedCardBody);
  rightSide.append(currencyRTChangedCard);

  //
  container.append(h1, mainRow);

  const main = document.getElementById("main");
  main.innerHTML = "";
  main.appendChild(container);
  renderCurrencyExchange_RT();
}

function renderCurrencyExchange_RT() {
  let currencyRTChangedCard = document.getElementById("currencyRTChangedCard");
  if (!currencyRTChangedCard) {
    return;
  }

  let soc = openCurrencyExchangeRate();
  setInterval(async () => {
    const ans = await getCurrencyExchangeRate(soc);

    const currencyRTChangedItem = el("li", {
      class: "currency-item green-pseudo",
    });
    const itemName = el("span", ans.from + " / " + ans.to);
    const itemRateWrapper = el("div", { class: "rate-wrapper" });
    const itemRate = el("span", ans.rate);
    const itemArrow = el("span", ans.change === 1 ? "▲" : "▼");
    itemRateWrapper.append(itemRate, itemArrow);
    currencyRTChangedItem.append(itemName, itemRateWrapper);
    ans.change === 1
      ? currencyRTChangedItem.classList.add("green-pseudo")
      : currencyRTChangedItem.classList.add("red-pseudo");

    const attachList = currencyRTChangedCard.getElementsByClassName(
      "currency-exchange-list"
    )[0];

    attachList.prepend(currencyRTChangedItem);
    if (attachList.children.length > 21) {
      attachList.removeChild(attachList.lastChild);
    }
  }, 1000);
}

async function reloadYourCurrencyList(element) {  
  element.innerHTML = "";

  const currencies = await getCurrencies();  

  const currencyKeys = Object.keys(currencies.payload);
  for (let i = 0; i < currencyKeys.length; i++) {
    const val = Object.values(currencies.payload)[i];

    const listItem = el("li", { class: "currency-item" });
    const itemName = el("span", val.code);
    const itemAmount = el("span", val.amount);
    listItem.append(itemName, itemAmount);
    element.append(listItem);
  }
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
