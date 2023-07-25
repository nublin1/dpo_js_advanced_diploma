import { el } from "redom";
import {
  getCurrencies,
  getCurrencyExchangeRate,
  openCurrencyExchangeRate,
  getAllCurrencies,
  currencyBuy,
} from "./../api";
import Choices from "choices.js";
import JustValidate from "just-validate";

export async function renderCurrencyPage() {
  const container = el("div", { class: "container currency-container" });

  //Upper part
  const h1 = el(
    "h1",
    { class: "currency-container__heading" },
    "Валютный обмен"
  );

  // Main columns
  const mainRow = el("div", { class: "row gx-5" });
  const leftSide = el("div", { class: "col" });
  const rightSide = el("div", { class: "col" });
  mainRow.append(leftSide, rightSide);

  //
  const yourCurrencyCard = el("div", { class: "card yourcurrency-card" });
  const yourCurrencyCardBody = el("div", { class: "card-body" });
  const yourCurrencyTitle = el("h5", { class: "card-title" }, "Ваши валюты");
  const yourCurrencyList = el("ul", { class: "yourcurrency-list" });
  await reloadYourCurrencyList(yourCurrencyList);

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
    class: "exchange-data",
  });
  const exchangeForm = el("form", {
    class: "exchange-form",
    id: "exchangeForm",
  });
  const exchangeFieldset = el("fieldset", { class: "exchange-form__fieldset" });
  const exchangeFromWrapper = el("div", { class: "exchange-form__from" });
  const exchangeFromLabel = el(
    "label",
    { class: "exchange-form__label" },
    "Из"
  );
  const exchangeFromSelect = el("select", {
    class: "exchange-form__select-from",
  });
  exchangeFromWrapper.append(exchangeFromLabel, exchangeFromSelect);

  const exchangeToWrapper = el("div", { class: "exchange-form__to" });
  const exchangeToLabel = el("label", { class: "exchange-form__label" }, "в");
  const exchangeToSelect = el("select", { class: "exchange-form__select-to" });
  exchangeToWrapper.append(exchangeToLabel, exchangeToSelect);
  exchangeFieldset.append(exchangeFromWrapper, exchangeToWrapper);
  exchangeForm.append(exchangeFieldset);

  const fieldsetSummary = el("fieldset", {
    class: "exchange-form__fieldset-summary",
  });
  const summaryLabel = el("label", { class: "exchange-form__label" }, "Сумма");
  const summaryInput = el("input", { class: "exchange-form__summary-input" });
  fieldsetSummary.append(summaryLabel, summaryInput);

  exchangeForm.append(fieldsetSummary);

  const exchangeButton = el(
    "button",
    { class: "btn btn-primary exchange-form__button align-self-center" },
    "Обменять"
  );
  exchangeButton.setAttribute("type", "submit");
  exchangeButton.setAttribute("form", "exchangeForm");

  const errorMessage = el("p", { class: "exchange-form__error-message" });

  exchangeData.append(exchangeForm, exchangeButton);
  currencyExchangeCardBody.append(
    currencyExchangeTitle,
    exchangeData,
    errorMessage
  );
  currencyExchangeCard.append(currencyExchangeCardBody);
  leftSide.append(currencyExchangeCard);

  //
  const currencyRTChangedCard = el("div", {
    class: "card currency-rt-card ",
    id: "currencyRTChangedCard",
  });
  const currencyRTChangedCardBody = el("div", { class: "card-body" });
  const currencyRTChangedTitle = el(
    "h5",
    { class: "card-title" },
    "Измененные курсы в реальном времени"
  );
  const currencyRTChangedList = el("ul", { class: "currency-exchange-list" });

  currencyRTChangedCardBody.append(
    currencyRTChangedTitle,
    currencyRTChangedList
  );
  currencyRTChangedCard.append(currencyRTChangedCardBody);
  rightSide.append(currencyRTChangedCard);

  // modal
  const dialog = el("dialog", {class: "transaction-modal", id:"transaction-modal__ok"});
  const dialogText = el("p", { class: "dialog-text" }, "Транзакция выполнена");
  const dialogForm = el("form", { });
  const closeButton= el("button", { class: "button button-primary close-button" }, "Закрыть");

  dialogForm.append(closeButton);
  dialog.append(dialogText, dialogForm);

  //
  container.append(h1, mainRow, dialog);

  const main = document.getElementById("main");
  main.innerHTML = "";
  main.appendChild(container);

  configureModal();
  renderCurrencyExchange_RT();
  configureCurrencyExcCard();
}

function configureModal() {
  const dialog = document.getElementById("transaction-modal__ok");
  const closeButton = dialog.querySelector(".close-button");
  closeButton.addEventListener("click", (e) => {
    e.preventDefault();
    dialog.close();
  });
}

function configureExcValidation() {
  const validator = new JustValidate(document.querySelector(".exchange-form"), {
    errorsContainer: document.querySelector(".exchange-form__error-message"),
  });
  validator.addField(document.querySelector(".exchange-form__summary-input"), [
    {
      rule: "required",
      errorMessage: "Введите сумму",
    },
    {
      rule: "number",
      errorMessage: "Сумма должна быть числом",
    },
    {
      validator: (value) => {
        return value <= 0 ? false : true;
      },
      errorMessage: "Сумма не может быть отрицательной или быть равной нулю",
    },
  ]);
  validator.onSuccess(async function (e) {
    e.preventDefault();
    const exchangeFromSelect = document.querySelector(
      ".exchange-form__select-from"
    );
    const exchangeToSelect = document.querySelector(
      ".exchange-form__select-to"
    );
    const answer = await currencyBuy(
      exchangeFromSelect.value,
      exchangeToSelect.value,
      document.querySelector(".exchange-form__summary-input").value
    );
    if (answer.payload !== null) {
      document.querySelector(".exchange-form__error-message").textContent = "";
      document.getElementById("transaction-modal__ok").showModal();
      await reloadYourCurrencyList(
        document.querySelector(".yourcurrency-list")
      );
    } else {
      document.querySelector(".exchange-form__error-message").textContent =
        "Недостаточно средств";
    }

    document.querySelector(".exchange-form__summary-input").value = "";
  });
}

async function configureCurrencyExcCard() {
  const allCurrenciesList = await getAllCurrencies();
  const exchangeFromSelect = document.querySelector(
    ".exchange-form__select-from"
  );
  const exchangeToSelect = document.querySelector(".exchange-form__select-to");

  for (let i = 0; i < allCurrenciesList.payload.length; i++) {
    const option = el(
      "option",
      { value: allCurrenciesList.payload[i] },
      allCurrenciesList.payload[i]
    );
    exchangeFromSelect.append(option);
  }

  for (let i = 0; i < allCurrenciesList.payload.length; i++) {
    const option = el(
      "option",
      { value: allCurrenciesList.payload[i] },
      allCurrenciesList.payload[i]
    );
    exchangeToSelect.append(option);
  }

  const choices_From = new Choices(
    document.querySelector(".exchange-form__select-from"),
    {
      searchEnabled: false,
      itemSelectText: "",
    }
  );

  const choices_To = new Choices(
    document.querySelector(".exchange-form__select-to"),
    {
      searchEnabled: false,
      itemSelectText: "",
    }
  );

  configureExcValidation();
}

async function renderCurrencyExchange_RT() {
  let currencyRTChangedCard = document.getElementById("currencyRTChangedCard");
  if (!currencyRTChangedCard) {
    return;
  }

  let soc = openCurrencyExchangeRate();
  setInterval(async () => {
    const ans = await getCurrencyExchangeRate(soc);

    const currencyRTChangedItem = el("li", {
      class:
        ans.change === 1
          ? "currency-item currency-item--green"
          : "currency-item currency-item--red",
    });
    const itemName = el(
      "span",
      { class: "currency-item__name" },
      ans.from + " / " + ans.to
    );
    const itemRateWrapper = el("div", { class: "rate-wrapper" });
    const itemRate = el("span", ans.rate);
    const itemArrow = el("span", ans.change === 1 ? "▲" : "▼");
    itemRateWrapper.append(itemRate, itemArrow);
    currencyRTChangedItem.append(itemName, itemRateWrapper);

    const attachList = currencyRTChangedCard.querySelector(
      ".currency-exchange-list"
    );

    attachList.prepend(currencyRTChangedItem);
    if (attachList.children.length > 22) {
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
