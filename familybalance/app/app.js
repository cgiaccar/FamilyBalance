const express = require('express'); //Load express
const bodyParser = require('body-parser');
const fs = require('fs/promises');
const { MongoClient, ObjectId } = require('mongodb');
const session = require('express-session');

const uri = "mongodb://mongohost";
const app = express(); // Create app

app.use(express.static(`${__dirname}/public`)); // Solves from public folder from any request
app.use(express.urlencoded());

app.use(bodyParser.json()); // Parse incoming requests with JSON payloads
app.use(bodyParser.urlencoded({ extended: true })); // Parse incoming requests with URL-encoded payloads

app.use(session({
    secret: 'my_biggest_secret',
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
        res.redirect('/budget/whoami');
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
            res.redirect('/budget/whoami');
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

// GET /api/budget/ - logged user's expenses
app.get("/api/budget", verify, async (req, res) => {

    const client = new MongoClient(uri);
    await client.connect();
    const expenses = client.db("expenses");

    // Filter on logged user
    const username = req.session.user.username;
    let query = {};
    query['users.' + username] = { $exists: true };

    res.json(await expenses.collection("expenses").find(query).toArray());
});

// GET /api/budget/whoami - if authenticated, returns logged user's info
// Must be before /api/budget/:year or "whoami" will be interpreted as a possible year and the flow will go there
app.get("/api/budget/whoami", verify, async (req, res) => {
    const user = req.session.user;
    res.json(user);
});
// Actually fetches the whoami.html page
app.get("/budget/whoami", verify, async (req, res) => {
    try {
        const data = await fs.readFile(`${__dirname}/public/whoami.html`, { encoding: `utf8` });
        res.send(data);
    } catch (err) {
        console.log(err);
    }
});

// GET /api/budget/:year - logged user's expenses in the chosen year
app.get("/api/budget/:year", verify, async (req, res) => {
    const client = new MongoClient(uri);
    await client.connect();
    const expenses = client.db("expenses");

    const username = req.session.user.username;
    const year = req.params.year;
    let query = {};
    query['users.' + username] = { $exists: true }; // Filter on logged user
    query["date"] = { $regex: `${year}` }; // Filter on selected year

    res.json(await expenses.collection("expenses").find(query).toArray());
});

// GET /api/budget/:year/:month - logged user's expenses in the chosen year and month
app.get("/api/budget/:year/:month", verify, async (req, res) => {
    const client = new MongoClient(uri);
    await client.connect();
    const expenses = client.db("expenses");

    const username = req.session.user.username;
    const year = req.params.year;
    const month = req.params.month
    let query = {};
    query['users.' + username] = { $exists: true }; // Filter on logged user
    query["date"] = { $regex: `${year}-${month}` }; // Filter on selected year and month

    res.json(await expenses.collection("expenses").find(query).toArray());
});

// GET /api/budget/:year/:month/:id - logged user's expense of chosen id in the chosen year and month
app.get("/api/budget/:year/:month/:id", verify, async (req, res) => {

    let id = req.params.id;

    const client = new MongoClient(uri);
    await client.connect();
    const expenses = client.db("expenses");

    let db_expense = await expenses.collection("expenses").findOne({ "_id": new ObjectId(id) });
    res.json(db_expense);
});
// Actually fetches the correct expense's page
app.get("/budget/:year/:month/:id", verify, async (req, res) => {
    try {
        const data = await fs.readFile(`${__dirname}/public/expense.html`, { encoding: `utf8` });
        res.send(data);
    } catch (err) {
        console.log(err);
    }
});

// POST /api/budget/:year/:month - Adding logged user's expense in the chosen year and month
app.post("/api/budget/:year/:month", verify, async (req, res) => {

    const client = new MongoClient(uri);
    await client.connect();
    const expenses = client.db("expenses");

    const new_expense = {
        date: req.body.date,
        description: req.body.description,
        category: req.body.category,
        total_cost: req.body.total_cost,
        users: req.body.users,
        host: req.session.user.username
    }

    try {
        await expenses.collection("expenses").insertOne(new_expense);
        res.status(201).json(); // Send ok status
    } catch (error) {
        console.log(error);
        res.status(500).json(); // Send server error status
    }
});
// Actually fetches the newExpense.html page
app.get("/budget/add", verify, async (req, res) => {
    try {
        const data = await fs.readFile(`${__dirname}/public/newExpense.html`, { encoding: `utf8` });
        res.send(data);
    } catch (err) {
        console.log(err);
    }
});

// PUT /api/budget/:year/:month/:id - edit logged user's expense of chosen id in the chosen year and month
app.put("/api/budget/:year/:month/:id", verify, async (req, res) => {
    const client = new MongoClient(uri);
    await client.connect();
    const expenses = client.db("expenses");

    const filter = { _id: new ObjectId(req.params.id) };
    const updateExpense = {
        $set: {
            date: req.body.date,
            description: req.body.description,
            category: req.body.category,
            total_cost: req.body.total_cost,
            users: req.body.users
        }
    };

    try {
        await expenses.collection("expenses").updateOne(filter, updateExpense);
        res.status(201).json(); // Send ok status
    }
    catch (error) {
        console.log(error);
        res.status(500).json(); // Send server error status
    }
});

// DELETE /api/budget/:year/:month/:id - remove logged user's expense of chosen id in the chosen year and month
app.delete("/api/budget/:year/:month/:id", verify, async (req, res) => {
    const client = new MongoClient(uri);
    await client.connect();
    const expenses = client.db("expenses");

    const id = req.params.id;
    try {
        await expenses.collection("expenses").deleteOne({ "_id": new ObjectId(id) });
        res.status(201).json(); // Send ok status
    } catch (error) {
        console.log(error);
        res.status(500).json(); // Send server error status
    }
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

// GET /api/users/search?q=query - searches user that matches query string
app.get("/api/users/search?q=query", verify, (req, res) => {
    //TODO //needs verify?
});

app.listen(3000); //Listen on port 3000