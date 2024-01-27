// Useful elements
const form = document.getElementById('new_expense_form');   // The form
const totalCostEl = document.getElementById('total_cost');    // Total cost of the new expense
const quota1 = document.getElementById('quota1');   // Quota of the first user
const name1 = document.getElementById('name1');   // Name of the first user
let loggedUsername = "";     // Name of the logged user
const usersList = document.getElementById('users_list');  // List of all users for hints

// Fill user1 with default value "name = logged user"
getUser().then(user => {
    const name1 = document.getElementById('name1');
    loggedUsername = user.username;
    name1.setAttribute("value", loggedUsername);
});

// Always copy total cost in quota1
totalCostEl.addEventListener('input', () => {
    quota1.setAttribute("value", totalCostEl.value);
});

// Gets all users and fills the option list
getSearchedUsers("").then(users => {
    users.forEach(user => {
        const option = document.createElement('option');
        option.value = user.username;
        option.innerText = " (" + user.name + " " + user.surname + ")";
        usersList.appendChild(option);
    });
});


// At submit, takes data and fetches api
form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const feedback = document.getElementById('feedback');

    const date = document.getElementById('date').value.trim();
    const description = document.getElementById('description').value.trim();
    const category = document.getElementById('category').value.trim();
    const totalCost = totalCostEl.value.trim();

    const names = document.querySelectorAll('.name');   // All elements of class 'name'
    const quotas = document.querySelectorAll('.quota'); // All elements of class 'quota'
    // Create and fill users object
    let users = {};
    names.forEach((name, index) => {
        let quota = quotas[index];
        if (quota.value && name.value) {  // If the values are filled
            users[name.value] = quota.value;
        }
    });

    // Date must be set
    if (!date) {
        feedback.textContent = 'Per favore, inserire una data';
        return;
    }

    // Logged user must always appear (if only with quota = 0)
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
    const year = getYear(date);
    const month = getMonth(date);
    const response = await fetch(`/api/budget/${year}/${month}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date, description, category, total_cost: totalCost, users }),
    });

    // Feedback from database
    if (!response.ok) {
        feedback.textContent = 'Aggiunta di dati fallita!';
        return;
    } else {
        feedback.textContent = 'Spesa aggiunta con successo!';
        return;
    }
});


// Recursive event listener to add new users
quota1.addEventListener('input', function () { addUserWithTrigger(2) }, { once: true });

// Calls addUser and then adds the event listener
function addUserWithTrigger(i) {
    addUser(i);
    // Add recursive event listener
    document.getElementById('quota' + i).addEventListener('input', function () {
        addUserWithTrigger(i + 1);
    }, { once: true });
}

// Adds a new user to the form
function addUser(i) {
    const users = document.getElementById('users');

    // Create div user_i
    const newUser = document.createElement("div");
    newUser.setAttribute("id", "user" + i);

    // Create label and input for name_i
    const nameLabel = document.createElement("label");
    nameLabel.setAttribute("for", "name" + i);
    nameLabel.innerHTML = "Utente: ";
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.setAttribute("list", "users_list");
    nameInput.setAttribute("id", "name" + i);
    nameInput.setAttribute("name", "name" + i);
    nameInput.setAttribute("class", "name");

    // Create label and input for quota_i
    const quotaLabel = document.createElement("label");
    quotaLabel.setAttribute("for", "quota" + i);
    quotaLabel.innerHTML = " Spesa: ";
    const quotaInput = document.createElement("input");
    quotaInput.type = "number";
    quotaInput.setAttribute("step", "0.01");
    quotaInput.setAttribute("id", "quota" + i);
    quotaInput.setAttribute("name", "quota" + i);
    quotaInput.setAttribute("class", "quota");

    const br = document.createElement("br");

    newUser.appendChild(nameLabel);
    newUser.appendChild(nameInput);
    newUser.appendChild(quotaLabel);
    newUser.appendChild(quotaInput);

    users.appendChild(newUser)
    users.appendChild(br);
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