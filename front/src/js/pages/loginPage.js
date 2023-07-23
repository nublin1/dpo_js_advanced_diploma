import { el } from "redom";
import { login, getUserAccounts } from "../api";
import JustValidate from "just-validate";

export function renderSignInPage() {
  const container = el("div", {
    class: "container signIn-container",
  });

  const h1 = el("h1", "Вход в аккаунт");
  const form = el("form", { id: "signInForm" });
  const fieldset = el("fieldset");
  fieldset.style.width = "100%";

  const loginWrapper = el("div", {
    class: " ",
  });
  const labelLogin = el("label", { class: "" }, "Логин");
  const loginInput = el("input", { class: "input-login", value: "developer" });
  loginWrapper.append(labelLogin, loginInput);

  const passwordWrapper = el("div", {
    class: " ",
  });
  const labelPassword = el("label", { class: "" }, "Пароль");
  const passwordInput = el("input", {
    class: "input-password",
    value: "skillbox",
  });
  passwordWrapper.append(labelPassword, passwordInput);

  const buttonWrapper = el("div", { class: "buttons" });
  const button = el(
    "button",
    { class: "button button-primary", id: "signIn" },
    "Войти"
  );
  buttonWrapper.append(button);
  fieldset.append(loginWrapper, passwordWrapper);
  form.append(fieldset, buttonWrapper);
  container.append(h1, form);

  //

  document.getElementById("header-buttons").style.display = "none";
  const main = document.getElementById("main");
  main.innerHTML = "";
  main.appendChild(container);

  configLogin();
}

function configLogin() {
  const loginValidator = new JustValidate("#signInForm", {});

  loginValidator.addField(document.querySelector(".input-login"), [
    {
      rule: "required",
      errorMessage: "Введите логин",
    },
  ])
  .addField(document.querySelector(".input-password"), [
    {
      rule: "required",
      errorMessage: "Введите пароль",
    }
  ])

  loginValidator.onSuccess(function (e) {
    e.preventDefault();   
    tryLogin();
  })
}

async function tryLogin() {
  let response = await login(document.querySelector(".input-login").value, document.querySelector(".input-password").value);
  if (response.error === "") {
    let response2 = await getUserAccounts();
    //console.log(response2);
    if (response2) {
      window.location.hash = "#" + "accounts";
    }
  }
}
