import { getBanks,  getAllCurrencies, logout } from "./js/api";
import { renderSignInPage  } from "./js/pages/loginPage";
import {renderATMsPage} from "./js/pages/ATMsPage";
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

  renderAccountsPage();
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
