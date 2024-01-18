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

// Takes the user info using api
async function getUser() {
    const response = await fetch("/api/budget/whoami");
    const user = await response.json();
    return user;
}