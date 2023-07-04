import { el } from "redom";
import { getUserAccounts, getAccountInfo, transferFunds } from "../api";
import { formatDate, getMonthName } from "../utils";
import { renderAccountsPage } from "./accountsPage";
import { renderFullAccountInfoPage } from "./fullAccountInfo.js";

export default function renderAdvancedAccountInfoPage(accountNumber) {
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

  // transfer part
  const transferWrapper = el("div", { class: "row transfer-wrapper" });

  const newTransactionCard = el("div", { class: "col card transaction-card" });
  const newTransactionCardBody = el("div", { class: "card-body" });
  const newTransactionCardTitle = el("h5", {}, "Новый перевод");
  const newTransactionCardForm = el("form", { class: "transaction-form" });
  const formFirstRow = el("fieldset");
  const formFirstRowLabel = el("label", {}, "Номер счёта получателя");
  const formFirstRowInput = el("input", { placeholder: "Введите номер счёта" });
  formFirstRow.append(formFirstRowLabel, formFirstRowInput);
  const formSecondRow = el("fieldset");
  const formSecondRowLabel = el("label", {}, "Сумма перевода");
  const formSecondRowInput = el("input", { placeholder: "Введите сумму" });
  formSecondRow.append(formSecondRowLabel, formSecondRowInput);
  const sendButtonWrapper = el("div", {
    class: "send-transaction-button-wrapper",
  });
  const sendButton = el(
    "button",
    { class: "btn btn-primary send-transaction-button", id: "send" },
    "Отправить"
  );
  sendButtonWrapper.append(sendButton);
  newTransactionCardForm.append(formFirstRow, formSecondRow, sendButtonWrapper);
  newTransactionCardBody.append(
    newTransactionCardTitle,
    newTransactionCardForm
  );
  newTransactionCard.append(newTransactionCardBody);
  configureTransferBtn(
    sendButtonWrapper,
    accountNumber,
    formFirstRowLabel,
    formSecondRowInput
  );

  // graphics
  const balaceDynamicCard = el("div", {
    class: "card balance-dynamic-card col",
  });
  const balaceDynamicCardBody = el("div", { class: "card-body" });
  const balaceDynamicCardTitle = el("h5", {}, "Динамика баланса");
  const graphics = el("canvas", { id: "balace-dynamic-graph" });

  balaceDynamicCardBody.append(balaceDynamicCardTitle, graphics);
  balaceDynamicCard.append(balaceDynamicCardBody);

  transferWrapper.append(newTransactionCard, balaceDynamicCard);
  container.append(transferWrapper);

  // history part
  const historyWrapper = el("div", { class: "row history-wrapper" });
  const historyCard = el("div", { class: "card history-card col" });
  const historyCardBody = el("div", { class: "card-body" });
  const historyCardTitle = el("h5", {}, "История переводов");

  const historyTable = createTable();

  historyCardBody.append(historyCardTitle, historyTable);
  historyCard.append(historyCardBody);
  historyWrapper.append(historyCard);
  container.append(historyWrapper);

  loadData(accountNumber);

  //
  const main = document.getElementById("main");
  main.innerHTML = "";
  main.appendChild(container);  
}

async function loadData(accountNumber) {
  const accountsInfo = await getAccountInfo(accountNumber);
  if (!accountsInfo) {
    return;
  }
  //console.log(accountsInfo);

  // Balance
  const balanceElement = document.querySelector(".account-base-info__balance");
  balanceElement.textContent =
    Number(accountsInfo.payload.balance.toFixed(2)) + " ₽";

  // Last 6 months
  const balance = accountsInfo.payload.balance;
  let balance_tmp = balance;
  let totalPerMonth = [];
  let findedFirstInMonth = [];

  for (let i = 0; i < 6; i++) {
    totalPerMonth.push(balance_tmp);
    findedFirstInMonth.push(false);
  }

  const transactions = accountsInfo.payload.transactions;
  if (transactions.length === 0) {
    const element = document.getElementById("balace-dynamic-graph");
    element.innerHTML = "";
    
    const infoText = el("p", {}, "Операции со счётом не проводились");
    element.parentNode.append(infoText);
    element.remove();
    hideFullAccountInfoPage();

  } else {
    let counter = 5;
    let lastTransactionMonth = new Date(
      transactions[transactions.length - 1].date
    ).getMonth();
    for (let i = transactions.length - 1; i >= 0; i--) {
      const transactionDate = new Date(transactions[i].date);
      const transactionMonth = transactionDate.getMonth();

      if (accountNumber === transactions[i].to) {
        balance_tmp -= transactions[i].amount;
      } else {
        balance_tmp += transactions[i].amount;
      }

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
    }

    totalPerMonth = totalPerMonth.map((number) => Number(number.toFixed(2)));
    configureGraphics(totalPerMonth);
  }

  // Transactions
  const tbody = document.querySelector(".history-table__body");
  tbody.innerHTML = "";

  if (accountsInfo.payload.transactions.length === 0) {
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
    for (let i = accountsInfo.payload.transactions.length - 1; i > 0; i--) {
      const tr = el("tr");
      const tdFrom = el("td", {}, accountsInfo.payload.transactions[i].from);
      const tdTo = el("td", {}, accountsInfo.payload.transactions[i].to);
      const tdAmount = el("td", {});
      //
      if (accountNumber === accountsInfo.payload.transactions[i].to) {
        tdAmount.classList.add("transaction-amount--green");
        tdAmount.textContent =
          "+ " +
          accountsInfo.payload.transactions[i].amount.toLocaleString("ru-RU") +
          " ₽";
      } else {
        tdAmount.classList.add("transaction-amount--red");
        tdAmount.textContent =
          "- " +
          accountsInfo.payload.transactions[i].amount.toLocaleString("ru-RU") +
          " ₽";
      }
  
      const tdDate = el(
        "td",
        {},
        formatDate(accountsInfo.payload.transactions[i].date)
      );
      tr.append(tdFrom, tdTo, tdAmount, tdDate);
      tbody.append(tr);
  
      if (i <= accountsInfo.payload.transactions.length - 10) {
        break;
      }
    }
    showFullAccountInfoPage(accountNumber);
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

  historyTable.append(historyTableHead, historyTableBody);
  return historyTable;
}

let graph = null;
async function configureGraphics(data) {
  const element = document.getElementById("balace-dynamic-graph");
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
}

function configureReturnBtn(btn) {
  btn.addEventListener("click", async () => {
    let accs = await getUserAccounts();
    if (accs) {
      renderAccountsPage(accs.payload);
    }
  });
}

function configureTransferBtn(btn, from, toField, amountField) {
  btn.addEventListener("click", async (e) => {
    e.preventDefault();

    let transfer = {
      from: from,
      to: toField.value,
      amount: amountField.value,
    };
    let response = await transferFunds(transfer);
    if (response) {
      console.log(from);
      loadData(from);
    }
  });
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
