// Useful elements
const url = window.location.href;
const parts = url.split("/");
const id = parts[parts.length - 1]; // Other user ID (their username)
let username = "";

// Add other user's username/id to the title
const title = document.getElementById('title');
title.innerHTML += id;

// Get logged user's username
getUser().then(user => {
    username = user.username;
});

// Get balance with other user and fill the table
getBalanceID().then(balance => {
    balance.forEach(expense => {
        addToBalanceTable(expense);
    });
});

// Add a row to the table
function addToBalanceTable(expense) {
    const table = document.querySelector("#balance_table");
    const tr = document.createElement("tr");
    const date = document.createElement("td");
    const debt = document.createElement("td");
    const details = document.createElement("td");
    const year = getYear(expense.date);
    const month = getMonth(expense.date);
    const day = getDay(expense.date);
    date.innerText = day + '-' + month + '-' + year;
    const a = document.createElement("a");
    a.href = `/budget/${year}/${month}/${expense._id}`;
    a.innerText = "(visualizza dettagli)";
    details.appendChild(a);

    if (expense.total_cost === "0") {   // it's a refund
        const amount = expense.users[username]; // user's amount
        if (amount < 0) {    // if negative
            debt.innerText = id + " ti ha rimborsato " + (-amount)    // other is refunding user
        } else {
            debt.innerText = "Hai rimborsato " + amount + " a " + id    // user is refunding other
        }
    } else {
        if (expense.host === username) {  // if user is host
            debt.innerText = id + ' ti deve ' + expense.users[id];   // other user owes user this amount
        } else {    // other user is host
            debt.innerText = 'Devi ' + expense.users[username] + ' a ' + id; // user owes other this amount
        }
    }

    table.appendChild(tr);
    tr.appendChild(date);
    tr.appendChild(debt);
    tr.appendChild(details);
}

// Utility functions to format date
function getYear(date) {
    const parts = date.split("-");
    return parts[0];
}
function getMonth(date) {
    const parts = date.split("-");
    return parts[1];
}
function getDay(date) {
    const parts = date.split("-");
    return parts[2];
}

// Takes user balance with other user using api
async function getBalanceID() {
    const response = await fetch(`/api/balance/${id}`);
    const balance = await response.json();
    return balance;
}

// Takes the user info using api
async function getUser() {
    const response = await fetch("/api/budget/whoami");
    const user = await response.json();
    return user;
}