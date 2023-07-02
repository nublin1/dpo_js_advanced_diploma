export function getMonthName(monthNumer) {
  const monthNames = [
    "января",
    "февраля",
    "марта",
    "апреля",
    "мая",
    "июня",
    "июля",
    "августа",
    "сентября",
    "октября",
    "ноября",
    "декабря",
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

