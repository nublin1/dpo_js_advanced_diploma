import { el } from "redom";
import { formatMonthDate } from "../utils.js";
import { createNewAccount, getUserAccounts } from "../api.js";

import Choices from "choices.js";


let accs = null;

export async function renderAccountsPage() {
  const container = el("div", { class: "container accounts-container" });

  // Upper part
  const controlAccountsWrapper = el("div", {
    class: "control-accounts d-flex  mb-3",
  });
  const h1 = el("h1", { class: " " }, "Ваши счета");
  let sortingType = el("select", { class: "p-2 me-auto",  id: "sorting-type" });
  const sortingTypeOptions = [
    { value: "number", label: "По номеру" },
    { value: "balance", label: "По балансу" },
    { value: "date", label: "По последней транзакции" },
  ];

  sortingTypeOptions.forEach((option) => {
    const optionEl = el("option", { value: option.value }, option.label);
    sortingType.append(optionEl);
  });  

  configureSortBtn(sortingType);

  const button = el(
    "button",
    { class: "btn btn-primary add-account" },
    "+ Создать новый счет"
  );
  configureAddNewAccBtn(button);
  controlAccountsWrapper.append(h1, sortingType, button);
  container.append(controlAccountsWrapper);

  // Lower part
  const accountsWrapper = el("div", { class: "row d-flex justify-content-center accounts" });
  const spinner = el("div", { class: "spinner-border text-primary", role: "status" });

  accountsWrapper.append(spinner);   
  container.append(accountsWrapper);

  //
  
  document.getElementById("header-buttons").style.display = "block";
  const main = document.getElementById("main");
  main.innerHTML = "";
  main.appendChild(container);

  loadData();
}

async function loadData() {
  accs = await getUserAccounts();

  if (!accs) {
    return;
  }

  renderAccounts(accs.payload);

  const choices = new Choices(document.getElementById("sorting-type"), {
    searchEnabled: false,
    itemSelectText: "",
  });

}

function renderAccounts(array) {
  const accountsWrapper = document.querySelector(".accounts");
  accountsWrapper.innerHTML = "";
  array.forEach((item) => {
    const card = createAccountCard(item);
    accountsWrapper.append(card);
  });
}

function createAccountCard(account) {
  const card = el("div", { class: "col-4 card account-card " });

  const cardBody = el("div", { class: "card-body" });
  const cardTitle = el("h5", { class: "card-title" }, account.account);
  const formatedBalance = account.balance.toLocaleString("ru-RU");
  const price = el("p", {}, formatedBalance + " ₽");
  const lastTransactionHeader = el("h6", {}, "Последняя транзакция:");

  let date =
    account.transactions.length > 0
      ? new Date(account.transactions[0].date)
      : null;
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
    const newAcc = await createNewAccount();
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
    window.location.hash = "#" + "account/" + accountNumber;
   
  });
}

function configureSortBtn(btn) {
  btn.addEventListener("change", (e) => {
    e.preventDefault();

    if (!accs) {
      return;
    }

    const accounts = accs.payload;

    switch (e.target.value) {
      case "number":
        accounts.sort((a, b) => a.account.localeCompare(b.account));
        break;
      case "balance":
        accounts.sort((a, b) => a.balance - b.balance);
        break;
      case "date":
        accounts.sort((a, b) => {
          const dateA =
            a.transactions.length > 0 ? new Date(a.transactions[0].date) : null;
          const dateB =
            b.transactions.length > 0 ? new Date(b.transactions[0].date) : null;
          return dateA - dateB;
        });
        break;
    }

    renderAccounts(accounts);
  });
}
