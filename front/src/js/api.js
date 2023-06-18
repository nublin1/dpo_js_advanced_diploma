export async function login (login, password) {    
    const response = await fetch('http://localhost:3000/login', {
        method: 'POST',       
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            login,
            password
        })
                      
    }).then(response => response.json())
    .then(data => {
        //console.log(data);
        if (data.payload.token) {           
            localStorage.setItem('token', data.payload.token);
        }
        return data;
    })
    .catch(error => {
        if (error.data.contains('Invalid password')) {
            alert('Неверный логин или пароль');
        }
        if (error.data.contains('No such user')) {
            alert('пользователя с таким логином не существует');
        }
        return error;
    })
    return response;    
}

export async function getUserAccounts () {
    const response = await fetch('http://localhost:3000/accounts', {
        method: 'GET',       
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + localStorage.getItem('token')
        }        
    }).then(response => response.json())
    .then(data => {        
        return data;
    })
    .catch(error => {
        console.log(error);
    })
    
    return response;
}

export async function getCurrencies() {
    const response = await fetch('http://localhost:3000/currencies', {
        method: 'GET',       
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + localStorage.getItem('token')
        }        
    }).then(response => response.json())
    .then(data => {        
        return data;
    })
    .catch(error => {
        console.log(error);
    })
    
    return response;
} 

export async function getBanks() {
    const response = await fetch('http://localhost:3000/banks', {
        method: 'GET',       
        headers: {
            'Content-Type': 'application/json',
            //'Authorization': 'Basic ' + localStorage.getItem('token')
        }        
    }).then(response => response.json())
    .then(data => {        
        return data;
    })
    .catch(error => {
        console.log(error);
    })
    
    return response;
}