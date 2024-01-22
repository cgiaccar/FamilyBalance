// Useful elements
const tableBody = document.getElementById('expenses_table_body');
const filterForm = document.getElementById('filter_form');
const yearSelector = document.getElementById('input_year');

// Show all expenses in the big table (index.html)
// Takes expenses and for each one shows it
getExpenses().then(expenses => {
    expenses.forEach(expense => {
        addExpense(expense);
    });
});

// Fill year selector
for (i = 1990; i < 2025; i++) {
    let option = document.createElement("option")
    option.value = i;
    option.innerText = i;
    yearSelector.appendChild(option);
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

// Show a single expense in the big table
function addExpense(expense) {
    const tr = document.createElement("tr");
    const date = document.createElement("td");
    const category = document.createElement("td");
    const total_cost = document.createElement("td");
    const a = document.createElement("a");
    const year = getYear(expense.date);
    const month = getMonth(expense.date);
    const day = getDay(expense.date);
    a.href = `/budget/${year}/${month}/${expense._id}`;
    a.innerText = day + "-" + month + "-" + year;
    date.appendChild(a);
    category.innerText = expense.category;
    total_cost.innerText = expense.total_cost;
    tableBody.appendChild(tr);
    tr.appendChild(date);
    tr.appendChild(category);
    tr.appendChild(total_cost);
}

// Clear table and then show all expenses of the chosen year and month
filterForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    tableBody.innerHTML = "";
    const year = yearSelector.value;
    const month = document.getElementById('input_month').value;
    if (!month) {
        getExpensesYear(year).then(expenses => {
            expenses.forEach(expense => {
                addExpense(expense);
            });
        });
    }
    else {
        getExpensesYearMonth(year, month).then(expenses => {
            expenses.forEach(expense => {
                addExpense(expense);
            });
        });
    }
});


// Takes all user's expenses using api
async function getExpenses() {
    const response = await fetch("/api/budget");
    const expenses = await response.json();
    return expenses;
}

// Takes all user's expenses in the year using api
async function getExpensesYear(year) {
    const response = await fetch(`/api/budget/${year}`);
    const expenses = await response.json();
    return expenses;
}

// Takes all user's expenses in year and month using api
async function getExpensesYearMonth(year, month) {
    const response = await fetch(`/api/budget/${year}/${month}`);
    const expenses = await response.json();
    return expenses;
}