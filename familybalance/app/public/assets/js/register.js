// Useful elements
const form = document.getElementById("register_form");
const usernameEl = document.getElementById('username');
const passwordEl = document.getElementById('password');
const nameEl = document.getElementById('name');
const surnameEl = document.getElementById('surname');
const feedbackUsername = document.getElementById("feedback_username");
const feedbackPassword = document.getElementById("feedback_password");

// At submit, checks and sends info to server
form.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Removes previous invalid checks
    usernameEl.classList.remove('is-invalid');
    passwordEl.classList.remove('is-invalid');
    form.classList.remove('was-validated');

    // Check if fields are set
    if (!form.checkValidity()) {
        feedbackUsername.innerText = "Scegli uno username.";
        feedbackPassword.innerText = "Scegli una password.";
        form.classList.add('was-validated');
        return;
    }

    const username = usernameEl.value.trim();
    const password = passwordEl.value.trim();
    const name = nameEl.value.trim();
    const surname = surnameEl.value.trim();

    // Check password length
    if (password.length < 3) {
        feedbackPassword.innerText = "Questa password è troppo corta.";
        passwordEl.classList.add('is-invalid');
        return;
    }

    // Fetch api to register
    const response = await fetch(`/api/auth/signup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, name, surname }),
    });

    // Feedback from database
    if (!response.ok) {
        if (response.status === 500) {
            alert("Registrazione fallita!");
            return;
        }
        if (response.status === 403) {
            feedbackUsername.innerText = "Username già preso! Scegline un altro";
            usernameEl.classList.add('is-invalid');
            return;
        }
    } else {
        window.location.replace("/budget/whoami")   // Redirect to profile
    }
});