import { getBanks,  logout } from "./js/api";
import { renderSignInPage } from "./js/pages/loginPage";
import { renderATMsPage } from "./js/pages/ATMsPage";
import { renderAccountsPage } from "./js/pages/accountsPage";
import { renderCurrencyPage } from "./js/pages/currencyPage";
import renderAdvancedAccountInfoPage from "./js/pages/advancedAccountInfo.js";
import { renderFullAccountInfoPage } from "./js/pages/fullAccountInfo.js";
import { saveCurrentPage, getCurrentPage, clearCurrentPage } from "./js/utils";
import "./styles/style.scss";

const btn_atms = document.getElementById("ATMs");
const btn_accounts = document.getElementById("Accounts");
const btn_currency = document.getElementById("Currency");
const btn_exit = document.getElementById("Exit");

btn_atms.addEventListener("click",  (e) => {
  e.preventDefault();
  window.location.hash = "#" + "atms";
  saveCurrentPage();
  setActiveBtn(e.target);
});

btn_accounts.addEventListener("click", async (e) => {
  e.preventDefault();
  window.location.hash = "#" + "accounts";
  saveCurrentPage();
  setActiveBtn(e.target);
});

btn_currency.addEventListener("click", async (e) => {
  e.preventDefault();
  window.location.hash = "#" + "currency";
  saveCurrentPage();
  setActiveBtn(e.target);
});

btn_exit.addEventListener("click", (e) => {
  logout();
  clearCurrentPage();
  window.location.hash = "#" + "login";
  btn_atms.classList.remove("header-btn-active");
  btn_accounts.classList.remove("header-btn-active");
  btn_currency.classList.remove("header-btn-active");
});

document.addEventListener("DOMContentLoaded", () => {
  // getAllCurrencies();
  if (getCurrentPage() === "" || getCurrentPage() === null) {
    window.location.hash = "#" + "login";
  }
  else {
    window.location.hash = getCurrentPage();
  }
 
  renderPage();
});

window.onhashchange = () => {
  renderPage();
};

async function renderPage() {
  const hash = window.location.hash;
  //console.log(hash);
  if (hash === "#atms") {
    const banks = await getBanks();
    if (banks) {
      //console.log(banks);
      renderATMsPage(banks.payload);
    }
  } else if (hash === "#accounts") {
    renderAccountsPage();
  } else if (hash === "#currency") {
    renderCurrencyPage();
  } else if (hash === "#login") {
    renderSignInPage();
  } else if (hash.includes("#fullAccount")) {
    const lastIndex = hash.lastIndexOf("/");
    const result = hash.slice(lastIndex + 1);
    renderFullAccountInfoPage(result);
  
  } else if (hash.includes("#account")) {
    const lastIndex = hash.lastIndexOf("/");
    const result = hash.slice(lastIndex + 1);
    renderAdvancedAccountInfoPage(result);
  }
}

function setActiveBtn(btn) {
  btn_atms.classList.remove("header-btn-active");
  btn_accounts.classList.remove("header-btn-active");
  btn_currency.classList.remove("header-btn-active");
  

  btn.classList.add("header-btn-active");
}