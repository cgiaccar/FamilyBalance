const form = document.getElementById('new_expense_form');
const feedback = document.getElementById('feedback');

function getYear(date) {
    const parts = date.split("-");
    return parts[0];
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

    const names = document.querySelectorAll('.name'); //All elements of class 'name'
    const quotas = document.querySelectorAll('.quota'); //All elements of class 'part'
    // Create and fill users object
    let users = {};
    names.forEach((name, index) => {
        let quota = quotas[index];
        users[name.value] = quota.value;
    });

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
        body: JSON.stringify({ date, description, category, total_cost, users }),
    });
    if (!response.ok) {
        feedback.textContent = 'Aggiunta di dati fallita!';
        return;
    } else {
        feedback.textContent = 'Spesa aggiunta con successo!'
        return;
    }
});



/* part1.on('change', function () {
    createNext(2);
});

function createNext(index) {

    if ($('#part' + index).length == 0) {
        // create the next text box if not exists
        const next = $('<input>', {
            id: 'part' + index,
            type: 'text',
            name: 'part' + index
        });

        next.on('change', function () {
            createNext(index + 1)
        });
        next.appendTo(users);
    }
}
 */