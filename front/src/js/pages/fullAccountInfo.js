import { el } from "redom";
import { getAccountInfo } from "../api";
import { formatDate, getMonthName } from "../utils";
import renderAdvancedAccountInfoPage from "./advancedAccountInfo.js";

let accountsInfo = null;
let currentPage = 1; // Current page

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
  ratio.height = 250;

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

  //body
  const historyTableBody = el("tbody", { class: "history-table__body" });

  //foot
  const historyTableFoot = el("tfoot", { class: "history-table__foot" });
  const historyTableFootRow = el("tr", { class: "history-table__row" });
  const historyTableFootCell1 = el("th", {
    class: "history-table__cell",
    colspan: 4,
  });
  const pagination = el("div", { id: "pagination" });
  historyTableFootCell1.append(pagination);
  historyTableFootRow.append(historyTableFootCell1);
  historyTableFoot.append(historyTableFootRow);

  historyTable.append(historyTableHead, historyTableBody, historyTableFoot);
  return historyTable;
}

async function loadData(accountNumber) {
  accountsInfo = await getAccountInfo(accountNumber);
  if (!accountsInfo) {
    return;
  }

  // Balance
  const balanceElement = document.querySelector(".account-base-info__balance");
  balanceElement.textContent =
    Number(accountsInfo.payload.balance.toFixed(2)) + " ₽";

  //#region Transactions
  displayTableData(1);
  updatePagination();

  //#endregion

  //#region 12

  const curBalance = accountsInfo.payload.balance;
  let balance_tmp = curBalance;
  let totalPerMonth = [];
  let findedFirstInMonth = [];
  let totalTransactionsPerMonth = [];
  let totalPositiveTransactions = [];

  for (let i = 0; i < 12; i++) {
    totalPerMonth.push(balance_tmp);
    findedFirstInMonth.push(false);
    totalTransactionsPerMonth.push(0);
    totalPositiveTransactions.push(0);
  }

  const transactions = accountsInfo.payload.transactions;
  let counter = 11;
  let lastTransactionMonth = new Date(
    transactions[transactions.length - 1].date
  ).getMonth();
  for (let i = transactions.length - 1; i >= 0; i--) {
    const transactionDate = new Date(transactions[i].date);
    const transactionMonth = transactionDate.getMonth();
    totalTransactionsPerMonth[counter] += 1;

    if (accountNumber === transactions[i].to) {
      balance_tmp -= transactions[i].amount;
      totalPositiveTransactions[counter] += 1;
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
    if (counter < 0) {
      break;
    }
  }

  totalPerMonth = totalPerMonth.map((number) => Number(number.toFixed(2)));
  let positivePercentPerMonth = [];
  for (let i = 0; i < totalPerMonth.length; i++) {
    positivePercentPerMonth.push(
      Number(
        (totalPositiveTransactions[i] / totalTransactionsPerMonth[i]) * 100
      ).toFixed(2)
    );
  }

  configureDynamicGraphic(totalPerMonth);
  configureRatioGraphic(totalPerMonth, positivePercentPerMonth);
  //#endregion
}

function displayTableData(currentPage) {
  const tbody = document.querySelector(".history-table__body");
  tbody.innerHTML = "";
  const offset = (currentPage - 1) * 25;

  for (
    let i = accountsInfo.payload.transactions.length - 1 - offset;
    i > 0;
    i--
  ) {
    const tr = el("tr");
    const tdFrom = el("td", {}, accountsInfo.payload.transactions[i].from);
    const tdTo = el("td", {}, accountsInfo.payload.transactions[i].to);
    const tdAmount = el("td", {});
    //
    if (
      accountsInfo.payload.account === accountsInfo.payload.transactions[i].to
    ) {
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

    if (i <= accountsInfo.payload.transactions.length - offset - 25) {
      break;
    }
  }
}

function updatePagination() {
  if (accountsInfo.payload.transactions.length > 25) {
    const countPages = Math.ceil(accountsInfo.payload.transactions.length / 25);
    const pagination = document.querySelector("#pagination");
    pagination.innerHTML = "";
    const maxVisibleButtons = 5; // Maximum number of visible page buttons
    const firstPageButton = createPageButton(1, "В начало");
    pagination.appendChild(firstPageButton);

    const prevPageButton = createPageButton(currentPage - 1, "Предыдущая");
    pagination.appendChild(prevPageButton);

    let startPage = Math.max(
      1,
      currentPage - Math.floor(maxVisibleButtons / 2)
    );
    let endPage = Math.min(countPages, startPage + maxVisibleButtons - 1);

    if (endPage - startPage < maxVisibleButtons - 1) {
      startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      const pageButton = createPageButton(i, i.toString());
      pagination.appendChild(pageButton);
    }

    const nextPageButton = createPageButton(currentPage + 1, "Следующая");
    pagination.appendChild(nextPageButton);

    const lastPageButton = createPageButton(countPages, "В конец");
    pagination.appendChild(lastPageButton);

    const activeButton = pagination.querySelector(
      `button[data-page="${currentPage}"]`
    );
    activeButton.classList.add("active");
  }
}

// Function to create a page button
function createPageButton(page, label) {
  const pageButton = el("button", { class: "button page-button" }, label);
  pageButton.setAttribute("data-page", page);
  pageButton.addEventListener("click", () => {
    currentPage = page;
    displayTableData(currentPage);
    updatePagination();
  });
  return pageButton;
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
async function configureRatioGraphic(totalPerMonth, positivePercentPerMonth) {
  const element = document.getElementById("ratio-graph");
  const currentDate = new Date();
  let labels = [];
  for (let i = totalPerMonth.length; i > 0; i--) {
    labels.push(getMonthName(currentDate.getMonth() - i + 1));
  }

  if (graphRatio) {
    graphRatio.destroy();
  }

  // gradients
  const maxVal = Math.max(...totalPerMonth);
  const minVal = Math.min(...totalPerMonth);
  const totalHeight = maxVal + Math.abs(minVal);
  const zeroPercent = 100 / (totalHeight /  Math.abs(minVal));
  let gradients = [];
  for (let i = 0; i < totalPerMonth.length; i++) {
    let tarColorHeight = totalPerMonth[totalPerMonth.length - 1] / 2;
    let percentColorHeight =
      (positivePercentPerMonth * 100) / totalPerMonth[totalPerMonth.length - 1];
    let tarBarHeightPercent = Math.abs(totalPerMonth[i] * 100) / totalHeight;
    //console.log(positivePercentPerMonth);
    gradients.push(
      createGradient(
        "rgba(0, 255, 0, 0.5)",
        "rgba(255, 0, 0, 0.5)",
        positivePercentPerMonth[i] / 100,
        tarBarHeightPercent,
        totalPerMonth[i] >= 0 ? true : false,
        zeroPercent
      )
    );
  }

  graphRatio = new Chart(element, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "ratio",
          data: totalPerMonth,
          borderWidth: 1,
          backgroundColor: gradients,
        },
      ],
    },
    options: {
      maintainAspectRatio: true,
      //responsive: false,
      aspectRatio: 5,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: false,
          position: "right",
          barPercentage: 1,
          grid: {
            display: false, // Скрыть линии сетки на оси
          },
          min: Math.min(...totalPerMonth),
          max: Math.max(...totalPerMonth),
          ticks: {
            display: true, // Отобразить значения на оси
            callback: function (value, index, values) {
              if (
                value === Math.max(...totalPerMonth) ||
                value === Math.min(...totalPerMonth)
              ) {
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

  //
}

// Функция для создания градиента
function createGradient(
  color1,
  color2,
  barColorHeightPercent,
  barHeightPercent,
  isPositive,
  zeroPercent
) {
  console.log("barColorHeightPercent " + barColorHeightPercent);
  const ctx = document.getElementById("ratio-graph").getContext("2d");
 
  const canvasTrueHeight = ctx.canvas.height - (ctx.canvas.height * 12 / 100);
  const canvasHeight = (canvasTrueHeight / 100) * barHeightPercent;
  const zeroPoint = (canvasTrueHeight / 100) * zeroPercent;
  //console.log("zeroPoint " + zeroPoint);
  let gradient;
  if (isPositive === true) {
    gradient = ctx.createLinearGradient(0, canvasTrueHeight - zeroPoint, 0,  canvasTrueHeight - zeroPoint - canvasHeight);
  } else {
    gradient = ctx.createLinearGradient(0, canvasTrueHeight - zeroPoint, 0,   canvasTrueHeight - zeroPoint + canvasHeight);
  }

  gradient.addColorStop(0, color1);
  gradient.addColorStop(barColorHeightPercent, color1);
  gradient.addColorStop(barColorHeightPercent, color2);
  gradient.addColorStop(1, color2);
  return gradient;
}