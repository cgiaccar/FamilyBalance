// Useful elements
let loggedUsername = "";
const searchForm = document.getElementById('search_form');
const searchTableBody = document.getElementById('search_table_body');
const searchTable = document.getElementById('search_table');
const balanceTableBody = document.getElementById('balance_table_body');

// Takes logged user's username
getUser().then(user => {
    loggedUsername = user.username;
});

// Shows balance of logged user
getBalance().then(balance => {
    Object.keys(balance).forEach(key => {
        const tr = document.createElement("tr");
        const debtor = document.createElement("td");
        const amount = document.createElement("td");
        debtor.setAttribute("class", "text-end");
        amount.innerText = balance[key];
        const a = document.createElement("a");
        a.href = `/balance/${key}`;
        a.innerText = key;
        debtor.appendChild(a);
        balanceTableBody.appendChild(tr);
        tr.appendChild(debtor);
        tr.appendChild(amount);
    });
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

                name.innerText = user.name;
                surname.innerText = user.surname;

                const a = document.createElement("a");
                a.href = `/balance/${user.username}`;
                a.innerText = user.username;
                username.appendChild(a);

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
