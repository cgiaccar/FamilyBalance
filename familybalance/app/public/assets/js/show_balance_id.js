// Useful elements
const url = window.location.href;
const parts = url.split("/");
const id = parts[parts.length - 1]; // Other user ID (their username)
let username = "";
const hiddenDiv = document.getElementById("hidden_div");
const tableBody = document.getElementById("balance_table_body");
const title = document.getElementById('title');

// Check if user exists and then prepares page
checkIfUserExists(id).then(exists => {
    if (exists) { // User exists
        // Add other user's username/id to the title
        title.innerHTML += id;
        title.style.display = "";

        // Get logged user's username
        getUser().then(user => {
            username = user.username;
        });

        // Get balance with other user and fill the table
        getBalanceID().then(balance => {
            if (balance.length > 0) {
                hiddenDiv.style.display = "";
                balance.forEach(expense => {
                    addToBalanceTable(expense);
                });
            } else {    // No balance yet
                const message = document.createElement("h3");
                message.innerText = "Non ci sono movimenti tra te e " + id + ".";
                title.after(message);
            }
        });
    } else {    // User does NOT exist
        title.innerHTML = "Errore!";
        title.style.display = "";
        const message = document.createElement("h3");
        message.innerText = "L'utente \"" + id + "\" non esiste.";
        title.after(message);
    }
});


// Add a row to the table
function addToBalanceTable(expense) {
    const tr = document.createElement("tr");
    const date = document.createElement("td");
    const debt = document.createElement("td");
    const year = getYear(expense.date);
    const month = getMonth(expense.date);
    const day = getDay(expense.date);
    date.innerText = day + '-' + month + '-' + year;

    if (expense.total_cost === "0") {   // it's a refund
        const amount = expense.users[username]; // user's amount
        if (amount < 0) {    // if negative
            debt.innerText = id + " ti ha rimborsato " + amount.replace("-", "") + " €"    // other is refunding user
            debt.style.color = "green";
        } else {
            debt.innerText = "Hai rimborsato " + amount + " € a " + id    // user is refunding other
            debt.style.color = "red";
        }
    } else {
        if (expense.host === username) {  // if user is host
            debt.innerText = id + " ti deve " + expense.users[id] + " €";   // other user owes user this amount
            debt.style.color = "green";
        } else {    // other user is host
            debt.innerText = "Devi " + expense.users[username] + " € a " + id; // user owes other this amount
            debt.style.color = "red";
        }
    }

    // Clickable table row to the expense
    tr.addEventListener('click', event => {
        event.preventDefault();
        window.location.href = `/budget/${year}/${month}/${expense._id}`;
    });

    tableBody.appendChild(tr);
    tr.appendChild(date);
    tr.appendChild(debt);
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

// Check if username exists using api
async function checkIfUserExists(id) {
    const response = await fetch(`/api/users/check/${id}`);
    if (!response.ok) {
        return false;
    } else {
        return true;
    }
}