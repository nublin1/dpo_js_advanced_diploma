import { el, mount } from "redom";
import { getBanks, getCurrencies, getUserAccounts } from "./js/api";
import {
  renderSignInPage,
  renderAccountsPage,
  renderCurrencyPage,
  renderATMsPage,
} from "./js/pages";
import "./styles/style.scss";

document.addEventListener("DOMContentLoaded", () => {
  renderSignInPage();

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
  })

  document.getElementById("Currency").addEventListener("click", async (e) => {
    e.preventDefault();
    const currencies = await getCurrencies();
    if (currencies) {     
      renderCurrencyPage(currencies.payload);
    }    
  });
});
