const url = window.location.href;
const parts = url.split("/");
const id = parts[parts.length - 1]
const month = parts[parts.length - 2]
const year = parts[parts.length - 3]


getExpense().then(expense => {
    console.log(expense);
    const table = document.querySelector("#expense_table");
    const tr = document.createElement("tr");
    const date = document.createElement("td");
    const description = document.createElement("td");
    const category = document.createElement("td");
    const total_cost = document.createElement("td");
    const users = document.createElement("td");
    date.innerText = expense.date;
    description.innerText = expense.description;
    category.innerText = expense.category;
    total_cost.innerText = expense.total_cost;
    users.innerText = "";
    Object.keys(expense.users).forEach(property => { //users is an object with a property named after each user with their quota
        users.innerText += property + ": " + expense.users[property] + "\n ";
    })
    table.appendChild(tr);
    tr.appendChild(date);
    tr.appendChild(description);
    tr.appendChild(category);
    tr.appendChild(total_cost);
    tr.appendChild(users);
});

async function getExpense() {
    const response = await fetch(`/api/budget/2024/01/${id}`);
    const expense = await response.json();
    return expense;
}

async function modifyExpense() {
    try {
        await fetch(`/api/budget/${year}/${month}/${id}`, { method: 'PUT' });
    }
    catch (error) {
        console.log(error);
    }
}