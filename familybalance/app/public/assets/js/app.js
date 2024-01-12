getExpenses().then(expenses => {
    expenses.forEach(expense => {
        addExpense(expense);
    });
});

function addExpense(expense) {
    const table = document.querySelector("#expenses_table");
    const tr = document.createElement("tr");
    const date = document.createElement("td");
    const category = document.createElement("td");
    const total_cost = document.createElement("td");
    const a = document.createElement("a");
    a.href = `/api/budget/2024/01/${expense._id}`;
    a.innerText = expense.date;
    date.appendChild(a);
    category.innerText = expense.category;
    total_cost.innerText = expense.total_cost;
    table.appendChild(tr);
    tr.appendChild(date);
    tr.appendChild(category);
    tr.appendChild(total_cost);
}

async function getExpenses() {
    const response = await fetch("/api/budget");
    const expenses = await response.json();
    return expenses;
}