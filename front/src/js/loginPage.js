import { el } from "redom";
import {
  login,  
  getUserAccounts,  
} from "./api";
import { renderAccountsPage } from "./pages/accountsPage.js";

export function renderSignInPage() {
  const container = el("div", {
    class: "container signIn-container",
  });

  const h1 = el("h1", "Вход в аккаунт");
  const form = el("form");
  const fieldset = el("fieldset");
  fieldset.style.width = "100%";

  const loginWrapper = el("div", {
    class: "row justify-content-start align-items-center",
  });
  const labelLogin = el("label", { class: "col-2" }, "Логин");
  const loginInput = el("input", { class: "col-auto", value: "developer" });
  loginWrapper.append(labelLogin, loginInput);

  const passwordWrapper = el("div", {
    class: "row justify-content-start align-items-center",
  });
  const labelPassword = el("label", { class: "col-2" }, "Пароль");
  const passwordInput = el("input", { class: "col-auto", value: "skillbox" });
  passwordWrapper.append(labelPassword, passwordInput);

  const button = el(
    "button",
    { class: "button button-primary", id: "signIn" },
    "Войти"
  );
  button.addEventListener("click", async (e) => {
    e.preventDefault();
    let response = await login(loginInput.value, passwordInput.value);
    if (response.error === "") {
      let response2 = await getUserAccounts();
      //console.log(response2);
      if (response2) {
        renderAccountsPage(response2.payload);
      }
    }
  });

  fieldset.append(loginWrapper, passwordWrapper, button);
  form.append(fieldset);
  container.append(h1, form);

  //
  document.getElementById("header-buttons").style.display = "none";
  const main = document.getElementById("main");
  main.innerHTML = "";
  main.appendChild(container);
}

