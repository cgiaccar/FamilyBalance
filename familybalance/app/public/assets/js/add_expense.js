// Useful elements
const form = document.getElementById('new_expense_form');   // The form
const totalCostEl = document.getElementById('total_cost');
const quota1 = document.getElementById('quota1');   // Quota of the first user
const name1 = document.getElementById('name1');   // Name of the first user
const usersList = document.getElementById('users_list');  // List of all users for hints
let loggedUsername = "";
let usernames = []; // Array with all valid usernames

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
        usernames.push(user.username);  // Fill valid usernames' array
        const option = document.createElement('option');
        option.value = user.username;
        option.innerText = " (" + user.name + " " + user.surname + ")";
        usersList.appendChild(option);
    });
});


// At submit, checks data and sends it to api to add
form.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Removes previous invalid checks
    document.querySelectorAll('.is-invalid').forEach(el => {
        el.classList.remove('is-invalid');
    });
    form.classList.remove('was-validated');

    const feedbackTotal = document.getElementById('feedback_total');

    // Check if fields are set
    if (!form.checkValidity()) {
        feedbackTotal.innerText = "Inserisci un numero valido (due cifre dopo la virgola).";
        form.classList.add('was-validated');
        return;
    }

    const date = document.getElementById('date').value.trim();
    const description = document.getElementById('description').innerText;
    const category = document.getElementById('category').value.trim();
    const totalCost = totalCostEl.value.trim();

    const names = document.querySelectorAll('.name');   // All elements of class 'name'
    const quotas = document.querySelectorAll('.quota'); // All elements of class 'quota'
    // Create and fill users object
    let users = {};
    let stop = false;
    names.forEach((name, index) => {
        let quota = quotas[index];
        if (quota.value && name.value) {  // If the values are filled
            if (!usernames.includes(name.value)) {    // Check if inserted user exists
                const feedbackUser = document.getElementById('feedback_user' + (index + 1));
                const userEl = document.getElementById('name' + (index + 1));
                feedbackUser.innerText = 'Attenzione! l\'utente \"' + name.value + '\" non esiste.';
                userEl.classList.add('is-invalid');
                stop = true;
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
        feedbackTotal.innerText = 'Per effettuare un rimborso (costo totale = 0), indica il tuo nome e quello di un altro utente.';
        totalCostEl.classList.add('is-invalid');
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
        feedbackTotal.innerText = "Attenzione! La somma delle quote deve essere pari al costo totale";
        totalCostEl.classList.add('is-invalid');
        return;
    }

    // Fetch api to add the new expense
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
        alert("Aggiunta di dati fallita!");
        return;
    } else {
        alert("Spesa aggiunta con successo!");
        const newId = await response.json();
        window.location.replace(`/budget/${year}/${month}/${newId}`);  // Go to new expense
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
    newUser.setAttribute("class", "row");

    // Create divs for columns
    const divName = document.createElement("div");
    divName.setAttribute("class", "col-sm-4");
    const divQuota = document.createElement("div");
    divQuota.setAttribute("class", "col-sm-3");

    // Create div for feedback
    const divFeedback = document.createElement("div");
    divFeedback.setAttribute("id", "feedback_user" + i);
    divFeedback.setAttribute("class", "invalid-feedback")

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

    divName.appendChild(nameLabel);
    divName.appendChild(nameInput);
    nameInput.after(divFeedback);
    divQuota.appendChild(quotaLabel);
    divQuota.appendChild(quotaInput);
    newUser.appendChild(divName);
    newUser.appendChild(divQuota);

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