const form = document.getElementById('new_expense_form');
const errorMessage = document.getElementById('error_message');

function getYear(date) {
    const parts = date.split("-");
    return parts[2];
}

function getMonth(date) {
    const parts = date.split("-");
    return parts[1];
}

// At submit, takes data and fetches api
form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const date = document.getElementById('date').value.trim();
    const description = document.getElementById('description').value.trim();
    const category = document.getElementById('category').value.trim();
    const total_cost = document.getElementById('total_cost').value.trim();
    if (!date) {
        errorMessage.textContent = 'Per favore, inserire una data';
        return;
    }
    const year = getYear(date);
    const month = getMonth(date);
    const response = await fetch(`/api/budget/${year}/${month}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date, description, category, total_cost }),
    });
    if (!response.ok) {
        errorMessage.textContent = 'Aggiunta di dati fallita!';
        return;
    } else {
        errorMessage.textContent = 'Spesa aggiunta con successo!'
        return;
    }
});