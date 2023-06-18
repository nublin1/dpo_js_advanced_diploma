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

  const fomatedDate = dateIn.getDate() + " " + monthNames[dateIn.getMonth()] + " " + dateIn.getFullYear();

  return fomatedDate;
}
