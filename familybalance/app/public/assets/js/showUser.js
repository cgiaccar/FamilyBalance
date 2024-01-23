// Shows user info in its table (page whoami.html)
getUser().then(user => {
    const table = document.querySelector("#user_table");
    const tr = document.createElement("tr");
    const username = document.createElement("td");
    const name = document.createElement("td");
    const surname = document.createElement("td");
    username.innerText = user.username;
    name.innerText = user.name;
    surname.innerText = user.surname;
    table.appendChild(tr);
    tr.appendChild(username);
    tr.appendChild(name);
    tr.appendChild(surname);
});

getBalance().then(balance => {
    const table = document.querySelector("#balance_table");
    Object.keys(balance).forEach(key => {
        const tr = document.createElement("tr");
        const debtor = document.createElement("td");
        const amount = document.createElement("td");
        debtor.innerText = key;
        amount.innerText = balance[key];
        table.appendChild(tr);
        tr.appendChild(debtor);
        tr.appendChild(amount);
    });
});

// Takes the user info using api
async function getUser() {
    const response = await fetch("/api/budget/whoami");
    const user = await response.json();
    return user;
}

// Takes user balance using api
async function getBalance() {
    const response = await fetch("/api/balance");
    const user = await response.json();
    return user;
}