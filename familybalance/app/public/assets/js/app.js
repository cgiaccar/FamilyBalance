// Show all expenses in the big table (index.html)
// Takes expenses and for each one shows it
getExpenses().then(expenses => {
    expenses.forEach(expense => {
        addExpense(expense);
    });
});

// Show a single expense in the big table
function addExpense(expense) {
    const table = document.querySelector("#expenses_table");
    const tr = document.createElement("tr");
    const date = document.createElement("td");
    const category = document.createElement("td");
    const total_cost = document.createElement("td");
    const a = document.createElement("a");
    a.href = `/budget/2024/01/${expense._id}`;
    a.innerText = expense.date;
    date.appendChild(a);
    category.innerText = expense.category;
    total_cost.innerText = expense.total_cost;
    table.appendChild(tr);
    tr.appendChild(date);
    tr.appendChild(category);
    tr.appendChild(total_cost);
}

// Takes all user's expenses using api
async function getExpenses() {
    const response = await fetch("/api/budget");
    const expenses = await response.json();
    return expenses;
}