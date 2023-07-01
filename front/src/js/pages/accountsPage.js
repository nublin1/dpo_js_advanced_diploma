import { el } from "redom";
import { formatMonthDate } from "../utils.js";
import { createNewAccount } from "../api.js";
import renderAdvancedAccountInfoPage from "./advancedAccountInfo.js";

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
    { class: "btn btn-primary add-account" },
    "+ Создать новый счет"
  );
  configureAddNewAccBtn(button);
  controlAccountsWrapper.append(h1, sortingType, button);
  container.append(controlAccountsWrapper);

  // Нижняя часть
  const accountsWrapper = el("div", { class: "row accounts" });
  for (let i = 0; i < accountsInfo.length; i++) {
    const card = createAccountCard(accountsInfo[i]);
    accountsWrapper.append(card);
  }
  container.append(accountsWrapper);

  //
  document.getElementById("header-buttons").style.display = "block";
  const main = document.getElementById("main");
  main.innerHTML = "";
  main.appendChild(container);
}

function createAccountCard(account) {

  const card = el("div", { class: "card account-card col-4" });

  const cardBody = el("div", { class: "card-body" });
  const cardTitle = el("h5", { class: "card-title" }, account.account);
  const formatedBalance =  account.balance.toLocaleString("ru-RU");
  const price = el("p", {}, formatedBalance + " ₽");
  const lastTransactionHeader = el("h6", {}, "Последняя транзакция:");

  let date = account.transactions.length>0 ? new Date(account.transactions[0].date) : null;
  const lastTransaction = el("p", {}, formatMonthDate(date));
  const buttonOpen = el(
    "button",
    { class: "btn btn-primary open-account" },
    "Открыть"
  );
  configureOpenButton(buttonOpen, account.account);

  cardBody.append(
    cardTitle,
    price,
    lastTransactionHeader,
    lastTransaction,
    buttonOpen
  );
  card.append(cardBody);
  return card;
}

function configureAddNewAccBtn(button) {
  button.addEventListener("click", async (e) => {
    e.preventDefault();
    let newAcc = await createNewAccount();
    if (newAcc) {
      console.log(newAcc);
      const card = createAccountCard(newAcc.payload);
      document.querySelector(".accounts").append(card);
    }
  });
}

function configureOpenButton(button, accountNumber) {
  button.addEventListener("click", (e) => {
    e.preventDefault();
    renderAdvancedAccountInfoPage(accountNumber);
  })
}
