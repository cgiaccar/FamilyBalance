// Shows user info in the card
getUser().then(user => {
    const username = document.getElementById("username");
    const name = document.getElementById("name");
    const surname = document.getElementById("surname");
    username.innerText = user.username;
    name.innerText = user.name;
    surname.innerText = user.surname;
});

// Takes the user info using api
async function getUser() {
    const response = await fetch("/api/budget/whoami");
    const user = await response.json();
    return user;
}
