import { el } from "redom";
import { getAccountInfo } from "../api";

export default function renderAdvancedAccountInfoPage(accountNumber) {
  async () => {
    const accountsInfo = await getAccountInfo(accountNumber);
  };

  //
  const container = el("div", {
    class: "container advancedAccountInfo-container",
  });

  // upper part
  const headerWrapper = el("div", {
    class: "row justify-content-space-between",
  });
  const h1 = el("h1", { class: "col" }, "Просмотр счёта");
  const btnReturn = el(
    "button",
    { class: "btn btn-primary col-auto", id: "back-to-accounts" },
    "← Вернуться назад"
  );
  configureReturnBtn(btnReturn);
  headerWrapper.append(h1, btnReturn);

  const accountBaseInfo = el("div", {
    class: "row justify-content-space-between",
  });
  const accNumber = el("p", { class: "col" }, "№ ---");
  const balance = el("p", { class: " col-auto" }, "Баланс: " + "---");
  accountBaseInfo.append(accNumber, balance);

  container.append(headerWrapper, accountBaseInfo);

  // lower part
  const advancedInfoWrapper = el("div", { class: "row" });

  const newTransactionCard = el("div", { class: "card col" });
  const newTransactionCardBody = el("div", { class: "card-body" });
  const newTransactionCardTitle = el("h5", {}, "Новый перевод");
  const newTransactionCardForm = el("form", {});
  const formFirstRow = el("div");
  const formFirstRowLabel = el("label", {}, "Номер счёта получателя");
  const formFirstRowInput = el("input", { placeholder: "Введите номер счёта" });
  formFirstRow.append(formFirstRowLabel, formFirstRowInput);
  const formSecondRow = el("div");
  const formSecondRowLabel = el("label", {}, "Сумма перевода");
  const formSecondRowInput = el("input", { placeholder: "Введите сумму" });
  formSecondRow.append(formSecondRowLabel, formSecondRowInput);
  const sendButton = el(
    "button",
    { class: "btn btn-primary send-transaction-button", id: "send" },
    "Отправить"
  );
  newTransactionCardForm.append(formFirstRow, formSecondRow, sendButton);
  newTransactionCardBody.append(
    newTransactionCardTitle,
    newTransactionCardForm
  );
  newTransactionCard.append(newTransactionCardBody);

  const balaceDynamicCard = el("div", { class: "card col" });
  const balaceDynamicCardBody = el("div", { class: "card-body" });
  const balaceDynamicCardTitle = el("h5", {}, "Динамика баланса");
  const graphics = el("canvas", { id: "myChart" });
  configureGraphics(graphics);

  balaceDynamicCardBody.append(balaceDynamicCardTitle, graphics);
  balaceDynamicCard.append(balaceDynamicCardBody);

  advancedInfoWrapper.append(newTransactionCard, balaceDynamicCard);
  container.append(advancedInfoWrapper);

  // history part
  const historyWrapper = el("div", { class: "row" });
  const historyCard = el("div", { class: "card col" });
  const historyCardBody = el("div", { class: "card-body" });
  const historyCardTitle = el("h5", {}, "История переводов");

  const historyTable = createTable();

  historyCardBody.append(historyCardTitle, historyTable);
  historyCard.append(historyCardBody);
  historyWrapper.append(historyCard);

  container.append(historyWrapper);


  //
  const main = document.getElementById("main");
  main.innerHTML = "";
  main.appendChild(container);
}

function createTable() {
  const historyTable = el("table", { class: "table" });
  const historyTableHead = el("thead");
  const historyTableHeadRow = el("tr");
  const historyTableHeadh1 = el("th", {}, "Счёт отправителя"); 
  const historyTableHeadh2 = el("th" , {}, "Счёт получателя");
  const historyTableHeadh3 = el("th", {}, "Сумма");
  const historyTableHeadh4 = el("th", {}, "Дата");
  
  historyTableHeadRow.append(historyTableHeadh1, historyTableHeadh2, historyTableHeadh3, historyTableHeadh4);
  historyTableHead.append(historyTableHeadRow);

  const historyTableBody = el("tbody");

  historyTable.append(historyTableHead, historyTableBody);
  return historyTable;
}

function configureGraphics(element) {
  new Chart(element, {
    type: "bar",
    data: {
      labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
      datasets: [
        {
          label: "# of Votes",
          data: [12, 19, 3, 5, 2, 3],
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          max: 19,
        },
      },
    },
  });
}

function configureReturnBtn(btn) {
  btn.addEventListener("click", () => {});
}
