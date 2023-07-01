
import { getBanks, getUserAccounts, getAllCurrencies, logout } from "./js/api";
import {
  renderSignInPage,  
  renderATMsPage,
} from "./js/pages";
import { renderAccountsPage } from "./js/pages/accountsPage";
import { renderCurrencyPage } from "./js/pages/currencyPage";
import "./styles/style.scss";

document.getElementById("ATMs").addEventListener("click", async (e) => {
  e.preventDefault();
  const banks = await getBanks();
  if (banks) {
    //console.log(banks);
    renderATMsPage(banks.payload);
  }
});

document.getElementById("Accounts").addEventListener("click", async (e) => {
  e.preventDefault();
  let accs = await getUserAccounts();
  if (accs) {
    renderAccountsPage(accs.payload);
  }
});

document.getElementById("Currency").addEventListener("click", async (e) => {
  e.preventDefault();

  renderCurrencyPage();
});

document.getElementById("Exit").addEventListener("click", (e) => {
  logout();
  renderSignInPage();
});

document.addEventListener("DOMContentLoaded", () => {
  getAllCurrencies();

  renderSignInPage();
});
