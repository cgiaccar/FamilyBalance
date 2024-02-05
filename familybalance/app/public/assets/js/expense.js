// Useful elements
const url = window.location.href;
const parts = url.split("/");
const id = parts[parts.length - 1]
const month = parts[parts.length - 2]
const year = parts[parts.length - 3]
const deleteButton = document.getElementById('delete_button');
const modifyButton = document.getElementById('modify_button');
const refreshButton = document.getElementById('refresh_button');
const hiddenDiv = document.getElementById('hidden_div')
const modifyForm = document.getElementById('modify_form');
const feedback = document.getElementById('feedback');
let loggedUsername = "";
let hostUsername = "";
const usersList = document.getElementById('users_list');  // List of all users for hints
let usernames = []; // Array with all valid usernames


// Utility functions to format date
function getDay(date) {
    const parts = date.split("-");
    return parts[2];
}
function getYear(date) {
    const parts = date.split("-");
    return parts[0];
}
function getMonth(date) {
    const parts = date.split("-");
    return parts[1];
}

// Show single expense in its table,
// fill the modify_form (hidden at the beginning)
// and set the visibility of modify/delete buttons
getExpense().then(expense => {
    const showDate = document.getElementById("show_date");
    const showDescription = document.getElementById("show_description");
    const showCategory = document.getElementById("show_category");
    const showTotalCost = document.getElementById("show_total_cost");
    const showUser = document.getElementById("show_user");
    const showUserQuota = document.getElementById("show_user_quota");
    const showHost = document.getElementById("show_host");
    showDate.innerText = getDay(expense.date) + "-" + month + "-" + year;
    showDescription.innerText = expense.description;
    showCategory.innerText = expense.category;
    showTotalCost.innerText = expense.total_cost;
    Object.keys(expense.users).forEach(property => { //users is an object with a property named after each user with their quota
        showUser.innerText += property + "\n ";
        showUserQuota.innerText += expense.users[property] + "\n ";
    })
    showHost.innerText = expense.host;

    // Fill the modify_form
    document.getElementById('date').setAttribute("value", expense.date);
    document.getElementById('description').innerText = expense.description;
    document.getElementById('category').setAttribute("value", expense.category);
    document.getElementById('total_cost').setAttribute("value", expense.total_cost);
    let i = 0;
    Object.keys(expense.users).forEach((user) => {
        i++;
        // Add an empty line for the user
        addUser(i);
        // Fill the new user and remove event listener
        document.getElementById('name' + i).setAttribute("value", user);
        document.getElementById('quota' + i).setAttribute("value", expense.users[user]);
    });
    // Add an empty user at the end
    addUserWithTrigger(i + 1);

    // Get user info and set visibility of modify/delete buttons
    getUser().then(user => {
        loggedUsername = user.username;
        hostUsername = expense.host;
        if (loggedUsername === hostUsername) {
            deleteButton.style.display = "";
            modifyButton.style.display = "";
        }
    });
});

// Gets all users and fills the option list
getSearchedUsers("").then(users => {
    users.forEach(user => {
        usernames.push(user.username);  // Fill valid usernames' array
        const option = document.createElement('option');
        option.value = user.username;
        option.innerText = " (" + user.name + " " + user.surname + ")";
        usersList.appendChild(option);
    });
});

// Controls modify_form visibility (inside its div)
modifyButton.addEventListener("click", (event) => {
    event.preventDefault();
    if (hiddenDiv.style.display === "none") {
        hiddenDiv.style.display = "";
        modifyButton.innerText = "Nascondi modifiche"
        hiddenDiv.scrollIntoView();
    } else {
        hiddenDiv.style.display = "none";
        modifyButton.innerText = "Modifica"
    }
});

refreshButton.addEventListener("click", (event) => {
    event.preventDefault();
    window.location.reload();
});

// Calls modify/put from api (same as newExpense, but with PUT and reload page at the end)
modifyForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const feedback = document.getElementById('feedback');

    if (loggedUsername !== hostUsername) {
        feedback.textContent = 'Non puoi modificare questa spesa!';
        return;
    }

    const date = document.getElementById('date').value.trim();
    const description = document.getElementById('description').innerText.trim();
    const category = document.getElementById('category').value.trim();
    const totalCost = document.getElementById('total_cost').value.trim();

    // Date must be set
    if (!date) {
        feedback.textContent = 'Per favore, inserire una data';
        return;
    }

    const names = document.querySelectorAll('.name'); //All elements of class 'name'
    const quotas = document.querySelectorAll('.quota'); //All elements of class 'quota'
    // Create and fill users object
    let users = {};
    let stop = false;
    names.forEach((name, index) => {
        let quota = quotas[index];
        if (quota.value && name.value) {  // If the values are filled
            if (!usernames.includes(name.value)) {    // Check if inserted user exists
                feedback.textContent = 'Attenzione! l\'utente \"' + name.value + '\" non esiste.';
                stop = true;
                return;
            }
            users[name.value] = quota.value;
        }
    });
    if (stop) { return; }

    // Logged user must always appear (if only with quota = 0) (useful when lending money)
    if (!Object.hasOwn(users, loggedUsername)) {
        users[loggedUsername] = 0;
    }

    // Can't have a refund with more than 2 users or a single user
    if (totalCost === "0" && Object.keys(users).length !== 2) {
        feedback.textContent = 'Per favore, indicare il tuo nome e quello di un altro utente per un rimborso';
        return;
    }

    // Sum of quotas must be = total cost
    let sum = 0;
    quotas.forEach(quota => {
        if (quota.value) {  // If the value is filled
            sum = parseFloat((sum + parseFloat(quota.value)).toFixed(2));
        }
    });
    if (totalCost != sum) {
        feedback.textContent = "Attenzione! La somma delle quote deve essere pari al costo totale";
        return;
    }

    // Fetch api to add new expense
    const newYear = getYear(date);
    const newMonth = getMonth(date);
    const response = await fetch(`/api/budget/${newYear}/${newMonth}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date, description, category, total_cost: totalCost, users }),
    });

    // Feedback from database
    if (!response.ok) {
        feedback.textContent = 'Modifica fallita!';
        return;
    } else {
        alert('Spesa modificata con successo!');
        window.location.replace(`/budget/${newYear}/${newMonth}/${id}`);  // Reload page
        return;
    }
});

// Calls addUser and then adds the event listener (same as addExpense)
function addUserWithTrigger(i) {
    addUser(i);
    document.getElementById('quota' + i).addEventListener('input', function () {
        addUserWithTrigger(i + 1);
    }, { once: true });
}

// Adds a new user to the modify_form (same as addExpense)
function addUser(i) {
    const users = document.getElementById('users');

    // Create div user_i
    const newUser = document.createElement("div");
    newUser.setAttribute("id", "user" + i);
    newUser.setAttribute("class", "row");

    // Create divs for columns
    const divLabel = document.createElement("div");
    divLabel.setAttribute("class", "col-sm-4");
    const divQuota = document.createElement("div");
    divQuota.setAttribute("class", "col-sm-3");

    // Create label and input for name_i
    const nameLabel = document.createElement("label");
    nameLabel.setAttribute("for", "name" + i);
    nameLabel.setAttribute("class", "form-label");
    nameLabel.innerHTML = "Utente: ";
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.setAttribute("list", "users_list");
    nameInput.setAttribute("id", "name" + i);
    nameInput.setAttribute("name", "name" + i);
    nameInput.setAttribute("class", "name form-control");

    // Create label and input for quota_i
    const quotaLabel = document.createElement("label");
    quotaLabel.setAttribute("for", "quota" + i);
    quotaLabel.setAttribute("class", "form-label");
    quotaLabel.innerHTML = " Spesa: ";
    const quotaInput = document.createElement("input");
    quotaInput.type = "number";
    quotaInput.setAttribute("step", "0.01");
    quotaInput.setAttribute("id", "quota" + i);
    quotaInput.setAttribute("name", "quota" + i);
    quotaInput.setAttribute("class", "quota form-control");

    const br = document.createElement("br");

    divLabel.appendChild(nameLabel);
    divLabel.appendChild(nameInput);
    divQuota.appendChild(quotaLabel);
    divQuota.appendChild(quotaInput);
    newUser.appendChild(divLabel);
    newUser.appendChild(divQuota);

    users.appendChild(newUser)
    users.appendChild(br);
}


// Calls delete from api
deleteButton.addEventListener("click", async (event) => {
    event.preventDefault();

    if (loggedUsername !== hostUsername) {
        feedback.textContent = 'Non puoi eliminare questa spesa!';
        return;
    }

    let result = window.confirm("Sei sicuro di voler eliminare la spesa?");
    if (result) {
        try {
            const response = await fetch(`/api/budget/${year}/${month}/${id}`, { method: 'DELETE' });
            if (response.ok) {
                alert("Spesa eliminata con successo!");
                window.location.replace(`/budget`);  // Back to expenses' page
            } else {
                alert("Qualcosa è andato storto, eliminazione fallita.")
            }
        }
        catch (error) {
            console.log(error);
        }
    }
});


// Takes a single expense using api
async function getExpense() {
    const response = await fetch(`/api/budget/${year}/${month}/${id}`);
    const expense = await response.json();
    return expense;
}

// Takes the user info using api
async function getUser() {
    const response = await fetch("/api/budget/whoami");
    const user = await response.json();
    return user;
}

// Search users using api
async function getSearchedUsers(query) {
    const response = await fetch(`/api/users/search?q=${query}`);
    const users = await response.json();
    return users;
}
