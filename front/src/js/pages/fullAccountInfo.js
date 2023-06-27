import { el } from "redom";
import { getAccountInfo } from "../api";
import { formatDate, getMonthName } from "../utils";
import renderAdvancedAccountInfoPage from "./advancedAccountInfo.js";

export function renderFullAccountInfoPage(accountNumber) {
  //
  const container = el("div", {
    class: "container fullAccountInfo-container",
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
  headerWrapper.append(h1, btnReturn);
  configureReturnBtn(btnReturn, accountNumber);
  container.append(headerWrapper);

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
  container.append(accountBaseInfo);

  // graphics
  const balaceDynamicCard = el("div", {
    class: "col card balace-dynamic-card",
  });
  const balaceDynamicCardBody = el("div", { class: "card-body" });
  const balaceDynamicCardTitle = el("h5", {}, "Динамика баланса");
  const graphics = el("canvas", { id: "balace-dynamic-graph" });

  balaceDynamicCardBody.append(balaceDynamicCardTitle, graphics);
  balaceDynamicCard.append(balaceDynamicCardBody);
  container.append(balaceDynamicCard);

  // Ratio of incoming and outgoing transactions
  const ratioCard = el("div", { class: "col card ratio-card" });
  const ratioCardBody = el("div", { class: "card-body" });
  const ratioCardTitle = el(
    "h5",
    {},
    "Соотношение входящих и исходящих транзакций"
  );
  const ratio = el("canvas", { id: "ratio-graph" });

  ratioCardBody.append(ratioCardTitle, ratio);
  ratioCard.append(ratioCardBody);
  container.append(ratioCard);

  // history part
  const historyWrapper = el("div", { class: "row history-wrapper" });
  const historyCard = el("div", { class: "card col" });
  const historyCardBody = el("div", { class: "card-body" });
  const historyCardTitle = el("h5", {}, "История переводов");

  const historyTable = createHistoryTable();

  historyCardBody.append(historyCardTitle, historyTable);
  historyCard.append(historyCardBody);
  container.append(historyCard);

  //
  const main = document.getElementById("main");
  main.innerHTML = "";
  main.appendChild(container);

  loadData(accountNumber);
}

function configureReturnBtn(btn, accountNumber) {
  btn.addEventListener("click", () => {
    renderAdvancedAccountInfoPage(accountNumber);
  });
}

function createHistoryTable() {
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

async function loadData(accountNumber) {
  const accountsInfo = await getAccountInfo(accountNumber);
  if (!accountsInfo) {
    return;
  }

  // Balance
  const balanceElement = document.querySelector(".account-base-info__balance");
  balanceElement.textContent =
    Number(accountsInfo.payload.balance.toFixed(2)) + " ₽";

  // Transactions
  const tbody = document.querySelector(".history-table__body");
  tbody.innerHTML = "";

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

    if (i <= accountsInfo.payload.transactions.length - 25) {
      break;
    }
  }

  // 12 months
  const balance = accountsInfo.payload.balance;
  let balance_tmp = balance;
  let totalPerMonth = [];
  let findedFirstInMonth = [];

  for (let i = 0; i < 12; i++) {
    totalPerMonth.push(balance_tmp);
    findedFirstInMonth.push(false);
  }

  const transactions = accountsInfo.payload.transactions;
  let counter = 11;
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
  configureDynamicGraphic(totalPerMonth);
  configureRatioGraphic(totalPerMonth);
}

let graphDynamic = null;
async function configureDynamicGraphic(data) {
  const element = document.getElementById("balace-dynamic-graph");
  const currentDate = new Date();
  let labels = [];
  for (let i = data.length; i > 0; i--) {
    labels.push(getMonthName(currentDate.getMonth() - i + 1));
  }

  if (graphDynamic) {
    graphDynamic.destroy();
  }

  graphDynamic = new Chart(element, {
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

let graphRatio = null;
async function configureRatioGraphic(data) {
  const element = document.getElementById("ratio-graph");  
  const currentDate = new Date();
  let labels = [];
  for (let i = data.length; i > 0; i--) {
    labels.push(getMonthName(currentDate.getMonth() - i + 1));
  }

  if (graphRatio) {
    graphRatio.destroy();
  }

  graphRatio = new Chart(element, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "ratio",
          data: data,
          borderWidth: 1,        
          backgroundColor: [            
            createGradient("rgba(0, 255, 0, 0.5)", "rgba(255, 0, 0, 0.5)", 1), // Градиент для столбца
          ],
        },
      ],
    },
    options: {
      maintainAspectRatio: true,
      aspectRatio: 5, 
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          position: "right",
          barPercentage : 1,
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

// Функция для создания градиента
function createGradient(color1, color2, barHeightPercentage) {
  const ctx = document.createElement("canvas").getContext("2d");
  var gradient = ctx.createLinearGradient(0, 0, 0, 100);
  gradient.addColorStop(0, color1);
  gradient.addColorStop(0.5, color1);
  gradient.addColorStop(0.5, color2);
  gradient.addColorStop(1, color2);
  return gradient;
}
