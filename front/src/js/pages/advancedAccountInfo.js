import { el } from "redom";
import { getUserAccounts, getAccountInfo, transferFunds } from "../api";
import { formatDate, getMonthName } from "../utils";
import { renderAccountsPage } from "./accountsPage";
import { renderFullAccountInfoPage } from "./fullAccountInfo.js";
import JustValidate from 'just-validate';

let validator = null;
let accountNumber = null;

export default function renderAdvancedAccountInfoPage(inputAccNumber) {
  accountNumber = (inputAccNumber);
  //
  const container = el("div", {
    class: "container advancedAccountInfo-container",
  });

  // Upper part
  const headerWrapper = el("div", {
    class: "row justify-content-space-between header-wrapper",
  });
  const h1 = el("h1", { class: "col header-wrapper__title" }, "Просмотр счёта");
  const btnReturn = el(
    "button",
    {
      class: "btn btn-primary col-auto header-wrapper__btn",
      id: "back-to-accounts",
    },
    "← Вернуться назад"
  );
  configureReturnBtn(btnReturn);
  headerWrapper.append(h1, btnReturn);

  const accountBaseInfo = el("div", {
    class: "row justify-content-space-between account-base-info",
  });
  const accNumber = el(
    "p",
    { class: "col account-base-info__number" },
    "№ " + accountNumber
  );
  const balance = el(
    "p",
    { class: "col-auto account-base-info__balance" },
    "Баланс: " + "---"
  );
  accountBaseInfo.append(accNumber, balance);

  container.append(headerWrapper, accountBaseInfo);

  //#region transfer part
  const transferWrapper = el("div", { class: "row transfer-wrapper" });

  const newTransactionCard = el("div", { class: "col card transaction-card" });
  const newTransactionCardBody = el("div", { class: "card-body" });
  const newTransactionCardTitle = el("h5", {}, "Новый перевод");
  const newTransactionCardForm = el("form", { class: "transaction-form", id: "transfer-form" });
  const formFirstRow = el("fieldset");
  const formFirstRowLabel = el("label", {}, "Номер счёта получателя");
  const formFirstRowInput = el("input", { class: "input-to", placeholder: "Введите номер счёта", required: true });
  formFirstRow.append(formFirstRowLabel, formFirstRowInput);
  const formSecondRow = el("fieldset");
  const formSecondRowLabel = el("label", {}, "Сумма перевода");
  const formSecondRowInput = el("input", { class: "summa", placeholder: "Введите сумму", required: true, type: "number" });
  formSecondRow.append(formSecondRowLabel, formSecondRowInput);
  const sendButtonWrapper = el("div", {
    class: "send-transaction-button-wrapper",
  });
  const sendButton = el(
    "button",
    { class: "btn btn-primary send-transaction-button", id: "send", type: "submit" },
    "Отправить"
  );
  const errorsSpace = el("div", { class: "errors-space" });


  sendButtonWrapper.append(sendButton);
  newTransactionCardForm.append(formFirstRow, formSecondRow, sendButtonWrapper, errorsSpace);
  newTransactionCardBody.append(
    newTransactionCardTitle,
    newTransactionCardForm
  );
  newTransactionCard.append(newTransactionCardBody);
  //#endregion

  //#region graphics
  const balanceDynamicCard = el("div", {
    class: "card balance-dynamic-card col",
  });
  const balanceDynamicCardBody = el("div", { class: "card-body-balance" });
  const balanceDynamicCardTitle = el("h5", {}, "Динамика баланса");
  const spinnerWrapper = el("div", { class: "d-flex justify-content-center", id: "spinner-balance" });
  const spinner = el("div", { class: "spinner-border text-primary", role: "status" });

  spinnerWrapper.append(spinner);
  balanceDynamicCardBody.append(balanceDynamicCardTitle, spinnerWrapper);
  balanceDynamicCard.append(balanceDynamicCardBody);

  transferWrapper.append(newTransactionCard, balanceDynamicCard);
  container.append(transferWrapper);
  //#endregion

  //#region history part
  const historyWrapper = el("div", { class: "row history-wrapper" });
  const historyCard = el("div", { class: "card history-card col" });
  const historyCardBody = el("div", { class: "card-body" });
  const historyCardTitle = el("h5", {}, "История переводов");

  const historyTable = createTable();

  historyCardBody.append(historyCardTitle, historyTable);
  historyCard.append(historyCardBody);
  historyWrapper.append(historyCard);
  container.append(historyWrapper);
  //#endregion

  //
  const main = document.getElementById("main");
  main.innerHTML = "";
  main.appendChild(container);

  loadData();
}

async function loadData() {  
  const accountsInfo = await getAccountInfo(accountNumber);
  if (!accountsInfo) {
    return;
  }
  //console.log(accountsInfo);

  // Balance
  const balanceElement = document.querySelector(".account-base-info__balance");
  balanceElement.textContent =
    Number(accountsInfo.payload.balance.toFixed(2)) + " ₽";

  constructGraphics(accountsInfo.payload);
  constructTransactionsHistory(accountsInfo.payload);
  configureForm();
}

function constructGraphics(accountsInfo) {
  // Last 6 months
  const balance = accountsInfo.balance;
  let balance_tmp = balance;
  let totalPerMonth = [];
  let findedFirstInMonth = [];

  for (let i = 0; i < 6; i++) {
    totalPerMonth.push(0);
    findedFirstInMonth.push(false);
  }
  totalPerMonth[totalPerMonth.length - 1] = balance_tmp;

  const transactions = accountsInfo.transactions;
  if (transactions.length === 0) {
    const element = document.querySelector(".balance-dynamic-card");
    const infoText = el("p", {}, "Операции со счётом не проводились");

    document.getElementById("spinner-balance").remove();
    element.append(infoText);
    hideFullAccountInfoPage();

  } else {
    let counter = 5;
    let lastTransactionMonth = new Date(
      transactions[transactions.length - 1].date
    ).getMonth();
    for (let i = transactions.length - 1; i >= 0; i--) {
      const transactionDate = new Date(transactions[i].date);
      const transactionMonth = transactionDate.getMonth();

      if (transactionMonth !== lastTransactionMonth) {
        lastTransactionMonth = transactionMonth;
        counter--;
      }

      if (
        transactionMonth >= 0 &&
        transactionMonth < 12 &&
        !findedFirstInMonth[counter]
      ) {
        totalPerMonth[counter] = balance_tmp;
        findedFirstInMonth[counter] = true;
      }

      if (accountsInfo.account === transactions[i].to) {
        balance_tmp -= transactions[i].amount;
      } else {
        balance_tmp += transactions[i].amount;
      }
    }

    totalPerMonth = totalPerMonth.map((number) => Number(number.toFixed(2)));
    configureGraphics(totalPerMonth);
  }
}

function constructTransactionsHistory(accountsInfo) {
  // Transactions
  const tbody = document.querySelector(".history-table__body");
  tbody.innerHTML = "";

  if (accountsInfo.transactions.length === 0) {
    const historyTableFoot = el("tfoot", { class: "history-table__foot" });
    const historyTableFootRow = el("tr", { class: "history-table__row" });
    const historyTableFootCell1 = el("th", {
      class: "history-table__cell",
      colspan: 4,
    }, "Операции со счётом не проводились");
    historyTableFootRow.append(historyTableFootCell1);
    historyTableFoot.append(historyTableFootRow);


    const table = document.querySelector(".history-table");
    table.append(historyTableFoot);

  }
  else {
    for (let i = accountsInfo.transactions.length - 1; i >= 0; i--) {
      const tr = el("tr");
      const tdFrom = el("td", {}, accountsInfo.transactions[i].from);
      const tdTo = el("td", {}, accountsInfo.transactions[i].to);
      const tdAmount = el("td", {});
      //
      if (accountsInfo.account === accountsInfo.transactions[i].to) {
        tdAmount.classList.add("transaction-amount--green");
        tdAmount.textContent =
          "+ " +
          accountsInfo.transactions[i].amount.toLocaleString("ru-RU") +
          " ₽";
      } else {
        tdAmount.classList.add("transaction-amount--red");
        tdAmount.textContent =
          "- " +
          accountsInfo.transactions[i].amount.toLocaleString("ru-RU") +
          " ₽";
      }

      const tdDate = el(
        "td",
        {},
        formatDate(accountsInfo.transactions[i].date)
      );
      tr.append(tdFrom, tdTo, tdAmount, tdDate);
      tbody.append(tr);

      if (i <= accountsInfo.transactions.length - 10) {
        break;
      }
    }
    showFullAccountInfoPage(accountsInfo.account);
  }
}

function createTable() {
  const historyTable = el("table", { class: "table history-table" });
  const historyTableHead = el("thead", { class: "history-table__head" });
  const historyTableHeadRow = el("tr", { class: "history-table__row" });
  const historyTableHeadCell1 = el(
    "th",
    { class: "history-table__cell" },
    "Счёт отправителя"
  );
  const historyTableHeadCell2 = el(
    "th",
    { class: "history-table__cell" },
    "Счёт получателя"
  );
  const historyTableHeadCell3 = el(
    "th",
    { class: "history-table__cell" },
    "Сумма"
  );
  const historyTableHeadCell4 = el(
    "th",
    { class: "history-table__cell" },
    "Дата"
  );

  historyTableHeadRow.append(
    historyTableHeadCell1,
    historyTableHeadCell2,
    historyTableHeadCell3,
    historyTableHeadCell4
  );
  historyTableHead.append(historyTableHeadRow);

  const historyTableBody = el("tbody", { class: "history-table__body" });
  const historyTableBodyRow = el("tr", { class: "history-table__row" });
  const historyTableBodyCellSpinner = el("th", {
    class: "history-table__cell spinner-border text-primary",
    colspan: 4,
  });



  historyTableBodyRow.append(historyTableBodyCellSpinner);
  historyTableBody.append(historyTableBodyRow);
  historyTable.append(historyTableHead, historyTableBody);
  return historyTable;
}

function configureForm() {
  if (validator)
    validator.destroy();

  validator = new JustValidate("#transfer-form", {
    errorsContainer: document.querySelector(".errors-space"),
    validateBeforeSubmitting: true,
  });

  validator.addField(document.querySelector(".input-to"), [
    {
      rule: "required",
      errorMessage: "Введите счёт получателя",
    },
    {
      rule: 'number',
      errorMessage: "Счёт получателя должен быть числом",
    }
  ])
    validator.addField(document.querySelector(".summa"), [
      {
        rule: "required",
        errorMessage: "Введите сумму",
      },
      {
        validator: (value) => {
          return value <= 0 ? false : true
        },
        errorMessage: "Сумма не может быть отрицательной или быть равной нулю",
      }
    ])

  validator.onSuccess(function (e) {
    e.preventDefault();   

    let transfer = {
      from: accountNumber,
      to: document.querySelector(".input-to").value,
      amount: document.querySelector(".summa").value,
    };
    
    Transfer(transfer);
  
  });
  validator.onFail(function () {
    console.log("Form is invalid!");
  });

}

let graph = null;
async function configureGraphics(data) {
  let element = document.getElementById("balace-dynamic-graph");
  if (!element) {
    element = el("canvas", { id: "balace-dynamic-graph" });
  }

  const currentDate = new Date();
  let labels = [];
  for (let i = data.length; i > 0; i--) {
    labels.push(getMonthName(currentDate.getMonth() - i + 1));
  }

  if (graph) {
    graph.destroy();
  }

  graph = new Chart(element, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "balance",
          data: data,
          borderWidth: 1,
        },
      ],
    },
    options: {
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          position: "right",
          grid: {
            display: false, // Скрыть линии сетки на оси
          },
          min: Math.min(...data),
          max: Math.max(...data),
          ticks: {
            display: true, // Отобразить значения на оси
            callback: function (value, index, values) {
              if (value === Math.max(...data) || value === Math.min(...data)) {
                return value;
              } else {
                return ""; // Оставить пустым для скрытия промежуточных значений
              }
            },
          },
        },
      },
    },
  });

  const spinner = document.getElementById("spinner-balance");
  if (spinner) {
    spinner.remove();
  }
  document.querySelector(".card-body-balance").append(element);
}

function configureReturnBtn(btn) {
  btn.addEventListener("click", async () => {
    let accs = await getUserAccounts();
    if (accs) {
      renderAccountsPage(accs.payload);
    }
  });
}

async function Transfer(transfer) {
  let response = await transferFunds(transfer);
  if (response) {
    // console.log(transfer);
    loadData(document.querySelector(".account-base-info__number").value);
  }
}

function showFullAccountInfoPage(accountNumber) {
  document
    .querySelector(".balance-dynamic-card")
    .addEventListener("click", () => {
      renderFullAccountInfoPage(accountNumber);
    });

  document.querySelector(".history-card").addEventListener("click", () => {
    renderFullAccountInfoPage(accountNumber);
  });
}

function hideFullAccountInfoPage() {
  document.querySelector(".balance-dynamic-card").style.cursor = "auto";
  document.querySelector(".balance-dynamic-card").removeEventListener("click", () => {

  });

  document.querySelector(".history-card").style.cursor = "auto";
  document.querySelector(".history-card").removeEventListener("click", () => {

  });

}
