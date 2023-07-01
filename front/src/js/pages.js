import { el } from "redom";
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
    { class: "button button-primary", id: "signIn" },
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
