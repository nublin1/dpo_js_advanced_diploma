export async function login(login, password) {
  const response = await fetch("http://localhost:3000/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      login,
      password,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      //console.log(data);
      if (data.payload.token) {
        localStorage.setItem("token", data.payload.token);
      }
      return data;
    })
    .catch((error) => {
      if (error.data.contains("Invalid password")) {
        alert("Неверный логин или пароль");
      }
      if (error.data.contains("No such user")) {
        alert("пользователя с таким логином не существует");
      }
      return error;
    });
  return response;
}

export function logout() {
  localStorage.removeItem("token");
}

export async function getUserAccounts() {
  const response = await fetch("http://localhost:3000/accounts", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Basic " + localStorage.getItem("token"),
    },
  })
    .then((response) => response.json())
    .then((data) => {
      return data;
    })
    .catch((error) => {
      console.log(error);
    });

  return response;
}

export function createNewAccount() {
  const response = fetch("http://localhost:3000/create-account", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Basic " + localStorage.getItem("token"),
    },   
  })
    .then((response) => response.json())
    .then((data) => {
      return data;
    })
    .catch((error) => {
      console.log(error);
    });
  return response;
}

export async function getAccountInfo(accountNumber) {
  const response = await fetch(`http://localhost:3000/account/${accountNumber}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Basic " + localStorage.getItem("token"),
    },
  })
    .then((response) => response.json())
    .then((data) => {
      return data;
    })
    .catch((error) => {
      console.log(error);
    }); 
  return response;
}

export async function getCurrencies() {
  const response = await fetch("http://localhost:3000/currencies", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Basic " + localStorage.getItem("token"),
    },
  })
    .then((response) => response.json())
    .then((data) => {
      return data;
    })
    .catch((error) => {
      console.log(error);
    });

  return response;
}

export async function getBanks() {
  const response = await fetch("http://localhost:3000/banks", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      //'Authorization': 'Basic ' + localStorage.getItem('token')
    },
  })
    .then((response) => response.json())
    .then((data) => {
      return data;
    })
    .catch((error) => {
      console.log(error);
    });

  return response;
}

export function openCurrencyExchangeRate() {
  let socket = new WebSocket("ws://localhost:3000/currency-feed");

  socket.onopen = function () {
    console.log("Соединение установлено");
  };

  return socket;
}

export function getCurrencyExchangeRate(socket) {
  return new Promise((resolve, reject) => {
    socket.onmessage = function (event) {
      const data = JSON.parse(event.data);
      resolve(data);
    };
  });
}

export function closeCurrencyExchangeRate(socket) {
  socket.close();
  //socket.close(1000, "работа закончена");
}

export let allCurrenciesList = [];
export function getAllCurrencies() {
  const response = fetch("http://localhost:3000/all-currencies", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      //Authorization: "Basic " + localStorage.getItem("token"),
    },
  })
    .then((response) => response.json())
    .then((data) => {
      allCurrenciesList = data.payload;  
      return data;
    })
    .catch((error) => {
      console.log(error);
    });
}


export async function currencyBuy(from, to, amount) {
  const response = await fetch("http://localhost:3000/currency-buy", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Basic " + localStorage.getItem("token"),
    },
    body: JSON.stringify({
      from,
      to,
      amount,      
    })
  })
    .then((response) => response.json())
    .then((data) => {
      return data;
    })
    .catch((error) => {
      console.log(error);
    });

  return response;
}
