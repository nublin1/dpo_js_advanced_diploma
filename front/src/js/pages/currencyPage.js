import { el } from "redom";
import {
  getCurrencies,
  getCurrencyExchangeRate,
  openCurrencyExchangeRate,
  allCurrenciesList,
  currencyBuy,
} from "./../api";
import Choices from "choices.js";

export async function renderCurrencyPage() {
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
  const exchangeForm = el("form", { class: "exchange-form" });
  const exchangeFieldset = el("fieldset", { class: "fieldset-exchange" });
  const exchangeFromWrapper = el("div", { class: "exchange-from" });
  const exchangeFromLabel = el("label", { class: "" }, "Из");
  const exchangeFromSelect = el("select", { class: "select-from" });
  for (let i = 0; i < allCurrenciesList.length; i++) {
    const option = el("option", { value: allCurrenciesList[i] }, allCurrenciesList[i]);
    exchangeFromSelect.append(option);
  }
  exchangeFromWrapper.append(exchangeFromLabel, exchangeFromSelect);

  const exchangeToWrapper = el("div", { class: "exchange-to" });
  const exchangeToLabel = el("label", { class: "" }, "в");
  const exchangeToSelect = el("select", { class: "select-to" });
  for (let i = 0; i < allCurrenciesList.length; i++) {
    const option = el("option", { value: allCurrenciesList[i] }, allCurrenciesList[i]);
    exchangeToSelect.append(option);
  }
  exchangeToWrapper.append(exchangeToLabel, exchangeToSelect);
  exchangeFieldset.append(
    exchangeFromWrapper,
    exchangeToWrapper,
  );
  exchangeForm.append(exchangeFieldset);

  const fieldsetSummary = el("fieldset", { class: "fieldset-summary" });
  const summaryLabel = el("label", { class: "" }, "Сумма");
  const summaryInput = el("input", { class: "" });
  fieldsetSummary.append(summaryLabel, summaryInput);

  exchangeForm.append(fieldsetSummary);

  const exchangeButton = el(
    "button",
    { class: "btn btn-primary exchange-Button align-self-center" },
    "Обменять"
  );
  exchangeButton.addEventListener("click", async (e) => {
    e.preventDefault();
    const answer = await currencyBuy(exchangeFromSelect.value, exchangeToSelect.value, summaryInput.value);
    await reloadYourCurrencyList(document.querySelector(".yourcurrency-list"));
  });
  exchangeData.append(exchangeForm, exchangeButton);
  currencyExchangeCardBody.append(currencyExchangeTitle, exchangeData);
  currencyExchangeCard.append(currencyExchangeCardBody);
  leftSide.append(currencyExchangeCard);

  //
  const currencyRTChangedCard = el("div", {
    class: "card currency-rt-card h-100",
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
  cinfigureCurrencyExcCard();
}

function cinfigureCurrencyExcCard() {
  const choices_From = new Choices(document.querySelector(".select-from"), {
    searchEnabled: false,
    itemSelectText: "",
  });

  const choices_To = new Choices(document.querySelector(".select-to"), {
    searchEnabled: false,
    itemSelectText: "",
    // classNames: {
    //   containerOuter: 'choices',
    //   containerInner: 'choices__inner',
    // }
  });
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