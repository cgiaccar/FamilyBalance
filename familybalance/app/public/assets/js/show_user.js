// Useful elements
const tableBody = document.getElementById('user_table_body');

// Shows user info in its table
getUser().then(user => {
    const tr = document.createElement("tr");
    const username = document.createElement("td");
    const name = document.createElement("td");
    const surname = document.createElement("td");
    username.innerText = user.username;
    name.innerText = user.name;
    surname.innerText = user.surname;
    tableBody.appendChild(tr);
    tr.appendChild(username);
    tr.appendChild(name);
    tr.appendChild(surname);
});

// Takes the user info using api
async function getUser() {
    const response = await fetch("/api/budget/whoami");
    const user = await response.json();
    return user;
}
