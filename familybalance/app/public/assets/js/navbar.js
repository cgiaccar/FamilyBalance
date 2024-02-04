// Useful elements
const defaultElements = document.querySelectorAll('.default_navbar');
const loggedElements = document.querySelectorAll('.logged_navbar');
const logout = document.getElementById('logout');

// Show correct navbar links
checkUser().then(result => {
    if (result === 'authenticated') { // If logged in
        // Show logged
        loggedElements.forEach(element => {
            element.style.display = "";
        });
    }
    else {
        // Show defaults
        defaultElements.forEach(element => {
            element.style.display = "";
        });
    }
});

// Logout
logout.addEventListener('click', async (event) => {
    event.preventDefault();
    const response = await fetch(`/api/auth/signout`, {
        method: 'POST',
    });

    if (!response.ok) {
        alert("Logout fallito!");
        return;
    } else {
        window.location.replace('/');
        return;
    }
});

// Tries to take the user info using api
async function checkUser() {
    const response = await fetch("/api/auth/check");
    const result = await response.text();
    return result;
}
