export function getMonthName(monthNumer) {
  // const monthNames = [
  //   "января",
  //   "февраля",
  //   "марта",
  //   "апреля",
  //   "мая",
  //   "июня",
  //   "июля",
  //   "августа",
  //   "сентября",
  //   "октября",
  //   "ноября",
  //   "декабря",
  // ];
  const monthNames = [
    "янв",
    "фев",
    "мар",
    "апр",
    "мая",
    "июн",
    "июл",
    "авг",
    "сен",
    "окт",
    "ноя",
    "дек",
  ];

  const adjustedIndex = (monthNumer + 12) % 12;

  return monthNames[adjustedIndex];
}

export function formatMonthDate(dateIn) {  

  let fomatedDate;
  if (dateIn === null) {
    fomatedDate = "Нет транзакций";
  } else {
    fomatedDate =
      dateIn.getDate() +
      " " +
      getMonthName(dateIn.getMonth()) +
      " " +
      dateIn.getFullYear();
  }

  return fomatedDate;
}

export function formatDate(dateIn) {
  let date = new Date(dateIn);
  let formattedDate;
  const month = date.getMonth() + 1; // Добавляем 1, чтобы получить корректный номер месяца

  formattedDate =
    date.getDate() +
    "." +
    month +
    "." +
    date.getFullYear();

  return formattedDate;
}

export function saveAccount(account) {
  const storedArray = localStorage.getItem("accountAutocompleteNumbers");
  let accountAutocompleteNumbers;
  if (storedArray === null) {
    accountAutocompleteNumbers = [];
    accountAutocompleteNumbers.push(account);
  }
  else {
    accountAutocompleteNumbers = JSON.parse(storedArray);
    const foundIndex = accountAutocompleteNumbers.indexOf(account);
    if (foundIndex === -1) {
      accountAutocompleteNumbers.push(account);
    }
  }  
 
  localStorage.setItem("accountAutocompleteNumbers", JSON.stringify(accountAutocompleteNumbers));
}

export function loadAccounts() {
  const storedArray = localStorage.getItem("accountAutocompleteNumbers");
  const accountAutocompleteNumbers = storedArray ? JSON.parse(storedArray) : [];
  return accountAutocompleteNumbers; 
}