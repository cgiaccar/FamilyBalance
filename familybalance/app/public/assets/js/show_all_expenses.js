// Useful elements
const tableBody = document.getElementById('expenses_table_body');
const filterForm = document.getElementById('filter_form');
const yearSelector = document.getElementById('input_year');
const monthSelector = document.getElementById('input_month');
const searchForm = document.getElementById('search_form');
const queryInput = document.getElementById('query');
const hiddenDiv = document.getElementById('filters_and_table');   // Div with stuff that needs to appear

// Show all expenses in the big table
// Takes expenses and for each one shows it
getExpenses().then(expenses => {
    if (expenses.length > 0) {
        hiddenDiv.style.display = "";
        expenses.forEach(expense => {
            addExpense(expense);
        });
    } else {    // No expenses yet
        const message = document.createElement("h3");
        message.innerText = "Ops, non hai mai effettuato delle spese!\nUsa il pulsante qui sotto per crearne una nuova:"
        hiddenDiv.before(message);
    }
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
    const totalCost = document.createElement("td");
    const host = document.createElement("td");

    const year = getYear(expense.date);
    const month = getMonth(expense.date);
    const day = getDay(expense.date);
    date.innerText = day + "-" + month + "-" + year;
    category.innerText = expense.category;
    totalCost.innerText = expense.total_cost + " €";
    host.innerText = expense.host;

    // Clickable table row to the expense
    tr.addEventListener('click', event => {
        event.preventDefault();
        window.location.href = `/budget/${year}/${month}/${expense._id}`;
    });

    tableBody.appendChild(tr);
    tr.appendChild(date);
    tr.appendChild(category);
    tr.appendChild(totalCost);
    tr.appendChild(host);
}

// Clear table and then show all expenses of the chosen year and month
filterForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    tableBody.innerHTML = "";
    queryInput.value = "";
    const year = yearSelector.value;
    const month = monthSelector.value;
    if (!month) {   // If month is not selected, use only year
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

searchForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    tableBody.innerHTML = "";
    monthSelector.value = "";
    yearSelector.value = "";
    const query = queryInput.value;
    getSearchedExpenses(query).then(expenses => {
        expenses.forEach(expense => {
            addExpense(expense);
        });
    });
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

// Search expenses using api
async function getSearchedExpenses(query) {
    const response = await fetch(`/api/budget/search?q=${query}`);
    const expenses = await response.json();
    return expenses;
}
