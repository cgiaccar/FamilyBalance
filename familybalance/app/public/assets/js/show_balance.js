// Useful elements
let loggedUsername = "";
const searchForm = document.getElementById('search_form');
const searchTableBody = document.getElementById('search_table_body');
const searchTable = document.getElementById('search_table');
const balanceTable = document.getElementById('balance_table');
const balanceTableBody = document.getElementById('balance_table_body');
const title = document.getElementById('title');

// Takes logged user's username
getUser().then(user => {
    loggedUsername = user.username;
});

// Shows balance of logged user
getBalance().then(balance => {
    if (Object.keys(balance).length > 0) {
        balanceTable.style.display = "";
        Object.keys(balance).forEach(key => {
            const tr = document.createElement("tr");
            const debtor = document.createElement("td");
            const amount = document.createElement("td");
            debtor.setAttribute("class", "text-end");
            let sign = "";
            let color = "red";
            if (balance[key] > 0) {
                sign = "+";
                color = "green";
            } else if (balance[key] === 0) {
                color = "green";
            }
            amount.innerText = sign + balance[key] + " €";
            amount.style.color = color;
            debtor.innerText = key;

            // Clickable table row to balance with other user
            tr.addEventListener('click', event => {
                event.preventDefault();
                window.location.href = `/balance/${key}`;
            });

            balanceTableBody.appendChild(tr);
            tr.appendChild(debtor);
            tr.appendChild(amount);
        });
    } else {    // No balance yet
        const message = document.createElement("h3");
        message.innerText = "Ops, non hai un bilancio!\nTorna quando avrai creato delle spese, oppure cerca un utente qui sotto:"
        title.after(message);
    }
});

// Clear table and then show users resulting from search
searchForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    searchTable.style.display = "";
    searchTableBody.innerHTML = "";
    const query = document.getElementById('query').value;
    getSearchedUsers(query).then(users => {
        users.forEach(user => {
            if (user.username !== loggedUsername) {
                const tr = document.createElement("tr");
                const username = document.createElement("td");
                const name = document.createElement("td");
                const surname = document.createElement("td");

                username.innerText = user.username;
                name.innerText = user.name;
                surname.innerText = user.surname;

                // Clickable table row to balance with other user
                tr.addEventListener('click', event => {
                    event.preventDefault();
                    window.location.href = `/balance/${user.username}`;
                });

                searchTableBody.appendChild(tr);
                tr.appendChild(username);
                tr.appendChild(name);
                tr.appendChild(surname);
            }
        });
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
    const balance = await response.json();
    return balance;
}

// Search users using api
async function getSearchedUsers(query) {
    const response = await fetch(`/api/users/search?q=${query}`);
    const users = await response.json();
    return users;
}
