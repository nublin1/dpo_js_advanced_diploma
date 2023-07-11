import { getBanks,  logout } from "./js/api";
import { renderSignInPage } from "./js/pages/loginPage";
import { renderATMsPage } from "./js/pages/ATMsPage";
import { renderAccountsPage } from "./js/pages/accountsPage";
import { renderCurrencyPage } from "./js/pages/currencyPage";
import renderAdvancedAccountInfoPage from "./js/pages/advancedAccountInfo.js";
import { renderFullAccountInfoPage } from "./js/pages/fullAccountInfo.js";
import "./styles/style.scss";

document.getElementById("ATMs").addEventListener("click",  (e) => {
  e.preventDefault();
  window.location.hash = "#" + "atms";  
});

document.getElementById("Accounts").addEventListener("click", async (e) => {
  e.preventDefault();
  window.location.hash = "#" + "accounts";
});

document.getElementById("Currency").addEventListener("click", async (e) => {
  e.preventDefault();
  window.location.hash = "#" + "currency";
  
});

document.getElementById("Exit").addEventListener("click", (e) => {
  logout();
  window.location.hash = "#" + "login";
});

document.addEventListener("DOMContentLoaded", () => {
  // getAllCurrencies();
  window.location.hash = "#" + "login";
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
