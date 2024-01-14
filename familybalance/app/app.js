const express = require('express'); //carichiamo express
const fs = require('fs/promises');
const { MongoClient, ObjectId } = require('mongodb');
const session = require('express-session');

const uri = "mongodb://mongohost";
const app = express(); // costruiamo app

app.use(express.static(`${__dirname}/public`)); // risolve la cartella public da qualsiasi request
app.use(express.urlencoded());
app.use(session({
    secret: 'segreto',
    resave: false
}));


// Login
app.get('/api/auth/signin', async (req, res) => {
    res.sendFile(`${__dirname}/public/login.html`);
});
app.post('/api/auth/signin', async (req, res) => {

    const client = new MongoClient(uri);
    await client.connect();
    const users = client.db("users");
    const db_user = await users.collection("users").findOne({ username: req.body.username });

    if (db_user && db_user.password === req.body.password) {
        req.session.user = db_user;
        res.redirect('/');
    } else {
        res.status(403).send("Non autenticato!");
    }
});


// Register 
app.get('/api/auth/signup', async (req, res) => {   //should it be an api?
    res.sendFile(`${__dirname}/public/register.html`);
});
app.post('/api/auth/signup', async (req, res) => {

    const client = new MongoClient(uri);
    await client.connect();
    const users = client.db("users");

    const new_user = {
        username: req.body.username,
        password: req.body.password,
        name: req.body.name,
        surname: req.body.surname
    }

    try {
        const check = await users.collection("users").findOne({ username: new_user.username });
        if (!check) { // if user doesn't exist already
            const db_user = await users.collection("users").insertOne(new_user);
            req.session.user = new_user;
            res.redirect('/api/restricted');
        } else {
            res.status(403).send("Username già preso!");
        }
    } catch (error) {
        console.log(error);
    }
});


// Authentication
function verify(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.status(403).send("Non autenticato!");
    }
}

// Temporaneo
app.get('/api/restricted', verify, (req, res) => {
    res.json({ message: 'Welcome to the protected route!', user: req.session.user.username });
});


// GET /api/budget/ - logged user's expenses
app.get("/api/budget", verify, async (req, res) => {

    const client = new MongoClient(uri);
    await client.connect();
    const expenses = client.db("expenses");

    res.json(await expenses.collection("expenses").find().toArray())
});

// GET /api/budget/:year - logged user's expenses in the chosen year
app.get("/api/budget/:year", verify, (req, res) => {
    //TODO
});

// GET /api/budget/:year/:month - logged user's expenses in the chosen year and month
app.get("/api/budget/:year/:month", verify, (req, res) => {
    //TODO
});

// GET /api/budget/:year/:month/:id - logged user's expense of chosen id in the chosen year and month
app.get("/budget/:year/:month/:id", verify, async (req, res) => {
    try {
        const data = await fs.readFile(`${__dirname}/public/expense.html`, { encoding: `utf8` });
        res.send(data);
    } catch (err) {
        console.log(err);
    }
});
app.get("/api/budget/:year/:month/:id", verify, async (req, res) => {

    let id = req.params.id;

    const client = new MongoClient(uri);
    await client.connect();
    const expenses = client.db("expenses");

    let db_expense = await expenses.collection("expenses").findOne({ "_id": new ObjectId(id) });
    res.json(db_expense);
});

// POST /api/budget/:year/:month - Adding logged user's expense in the chosen year and month
app.post("/api/budget/:year/:month", verify, async (req, res) => {
    const client = new MongoClient(uri);
    await client.connect();
    //const users = client.db("users");
    const expenses = client.db("expenses");

    const new_expense = {   // temporary
        date: "10-01-2024",
        description: "Siamo andati a mangiare al ristorante",
        category: "Cibo",
        total_cost: 100,
        users: {
            cami97: 60,
            gigi: 40
        }
    }

    try {
        const db_expense = await expenses.collection("expenses").insertOne(new_expense);
        /*
        const expense_id = db_expense._id; //.str or .toString()
        const db_user = await users.collection("users").findOne({ username: req.session.user.username });
        db_user.expenses.add(expense_id);
        */
        res.json({ message: 'You added the new expense!', expense: db_expense });
    } catch (error) {
        console.log(error);
    }
});

// PUT /api/budget/:year/:month/:id - edit logged user's expense of chosen id in the chosen year and month
app.put("/api/budget/:year/:month/:id", verify, (req, res) => {
    //TODO
});

// DELETE /api/budget/:year/:month/:id - remove logged user's expense of chosen id in the chosen year and month
app.delete("/api/budget/:year/:month/:id", verify, (req, res) => {
    //TODO
});

// GET /api/balance - visualize give/take summary of logged user
app.get("/api/balance", verify, (req, res) => {
    //TODO
});

// GET /api/balance/:id - visualize give/take summary of logged user with user of chosen id
app.get("/api/balance/:id", verify, (req, res) => {
    //TODO
});

// GET /api/budget/search?q=query - search expense that matches the query string
app.get("/api/budget/search?q=query", verify, (req, res) => {
    //TODO
});

// GET /api/budget/whoami - if authenticated, returns logged user's info
app.get("/api/budget/whoami", verify, (req, res) => {
    //TODO
});

// GET /api/users/search?q=query - searches user that matches query string
app.get("/api/users/search?q=query", verify, (req, res) => {
    //TODO //needs verify?
});

app.listen(3000); //ascoltiamo su porta 3000