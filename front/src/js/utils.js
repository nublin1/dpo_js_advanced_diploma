export function formateDate(dateIn) {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  let fomatedDate;
  if (dateIn === null) {
    fomatedDate = "Нет транзакций";
  } else {
    fomatedDate =
      dateIn.getDate() +
      " " +
      monthNames[dateIn.getMonth()] +
      " " +
      dateIn.getFullYear();
  }

  return fomatedDate;
}
