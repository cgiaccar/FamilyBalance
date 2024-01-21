const url = window.location.href;
const parts = url.split("/");
const id = parts[parts.length - 1]
const month = parts[parts.length - 2]
const year = parts[parts.length - 3]
deleteButton = document.getElementById('delete_button');

function getDay(date) {
    const divided = date.split("-");
    return divided[2];
}

// Show single expense in its table (page to modify and delete, expense.html)
getExpense().then(expense => {
    const table = document.querySelector("#expense_table");
    const tr = document.createElement("tr");
    const date = document.createElement("td");
    const description = document.createElement("td");
    const category = document.createElement("td");
    const total_cost = document.createElement("td");
    const users = document.createElement("td");
    date.innerText = getDay(expense.date) + "-" + month + "-" + year;;
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

// Takes a single expense using api
async function getExpense() {
    const response = await fetch(`/api/budget/${year}/${month}/${id}`);
    const expense = await response.json();
    return expense;
}

// Calls modify/put from api
async function modifyExpense() {
    try {
        await fetch(`/api/budget/${year}/${month}/${id}`, { method: 'PUT' });
    }
    catch (error) {
        console.log(error);
    }
}

// Calls delete from api
deleteButton.addEventListener("click", async (event) => {
    event.preventDefault();
    let result = window.confirm("Sei sicuro di voler eliminare la spesa?");
    if (result) {
        try {
            const response = await fetch(`/api/budget/${year}/${month}/${id}`, { method: 'DELETE' });
            if (response.ok) {
                alert("Spesa eliminata con successo!");
                window.location.replace("/");
            } else {
                alert("Qualcosa è andato storto, eliminazione fallita.")
            }
        }
        catch (error) {
            console.log(error);
        }
    }
});
