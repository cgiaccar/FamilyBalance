// Useful elements
const form = document.getElementById("login_form");
const usernameEl = document.getElementById('username');
const passwordEl = document.getElementById('password');
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
        feedbackUsername.innerText = "Inserisci il tuo username.";
        feedbackPassword.innerText = "Inserisci la tua password.";
        form.classList.add('was-validated');
        return;
    }

    const username = usernameEl.value.trim();
    const password = passwordEl.value.trim();

    // Fetch api to login
    const response = await fetch(`/api/auth/signin`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });

    // Feedback from database
    if (!response.ok) {
        if (response.status === 500) {
            alert("Login fallito!");
            return;
        }
        if (response.status === 403) {
            feedbackUsername.innerText = "Username o password errati!";
            feedbackPassword.innerText = "Username o password errati!";
            usernameEl.classList.add('is-invalid');
            passwordEl.classList.add('is-invalid');
            return;
        }
    } else {
        window.location.replace("/budget/whoami")   // Redirect to profile
    }
});