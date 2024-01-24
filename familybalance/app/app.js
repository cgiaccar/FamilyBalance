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


// Login - returns user if found in users db
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
// Actually returns the login page
app.get('/auth/signin', async (req, res) => {
    res.sendFile(`${__dirname}/public/login.html`);
});


// Register - adds user in users db
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
// Actually returns the register page
app.get('/auth/signup', async (req, res) => {
    res.sendFile(`${__dirname}/public/register.html`);
});


// Authentication
function verify(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.status(403).send("Non autenticato!");
    }
}


// GET /api/budget/ - returns logged user's expenses as an array
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


// GET /api/budget/whoami - if authenticated, returns logged user
// Must be before GET /api/budget/:year or "whoami" will be interpreted as a possible year and the flow will go there
app.get("/api/budget/whoami", verify, async (req, res) => {
    const user = req.session.user;
    res.json(user);
});
// Actually returns the whoami.html page
app.get("/budget/whoami", verify, async (req, res) => {
    try {
        const data = await fs.readFile(`${__dirname}/public/whoami.html`, { encoding: `utf8` });
        res.send(data);
    } catch (err) {
        console.log(err);
    }
});


// GET /api/budget/:year - returns logged user's expenses in the specified year
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


// GET /api/budget/:year/:month - returns logged user's expenses in the specified year and month
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


// GET /api/budget/:year/:month/:id - returns logged user's expense of specified id in the specified year and month
app.get("/api/budget/:year/:month/:id", verify, async (req, res) => {
    let id = req.params.id;

    const client = new MongoClient(uri);
    await client.connect();
    const expenses = client.db("expenses");

    let db_expense = await expenses.collection("expenses").findOne({ "_id": new ObjectId(id) });
    res.json(db_expense);
});
// Actually returns the correct expense's page
app.get("/budget/:year/:month/:id", verify, async (req, res) => {
    try {
        const data = await fs.readFile(`${__dirname}/public/expense.html`, { encoding: `utf8` });
        res.send(data);
    } catch (err) {
        console.log(err);
    }
});


// POST /api/budget/:year/:month - adds an expense in the specified year and month
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
// Actually returns the newExpense.html page
app.get("/budget/add", verify, async (req, res) => {
    try {
        const data = await fs.readFile(`${__dirname}/public/newExpense.html`, { encoding: `utf8` });
        res.send(data);
    } catch (err) {
        console.log(err);
    }
});


// PUT /api/budget/:year/:month/:id - modifies the expense with specified id in the specified year and month
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


// DELETE /api/budget/:year/:month/:id - removes the expense with specified id in the specified year and month
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


// GET /api/balance - returns a give/take summary of logged user as an object
app.get("/api/balance", verify, async (req, res) => {
    const client = new MongoClient(uri);
    await client.connect();
    const expenses = client.db("expenses");

    // Filter on logged user
    const username = req.session.user.username;
    let query = {};
    query['users.' + username] = { $exists: true };

    let db_expenses = await expenses.collection("expenses").find(query).toArray();

    // Perform calculations
    let balance = {};
    db_expenses.forEach(expense => {    // for each expense
        if (expense.total_cost === "0") {   // if it's a refund
            Object.keys(expense.users).forEach(user => {
                if (user !== username) {
                    if (!balance[user]) {   // if it doesn't exist, set it to 0
                        balance[user] = 0;
                    }
                    balance[user] -= parseFloat(expense.users[user]);   // pay off the refund for the other user
                }
            });
        } else {    // if it's a normal expense
            if (expense.host === username) {    // if I'm host
                Object.keys(expense.users).forEach(user => {    // everyone
                    if (user !== username) {    // except me
                        if (!balance[user]) {   // if it doesn't exist, set it to 0
                            balance[user] = 0;
                        }
                        balance[user] += parseFloat(expense.users[user]);   // adds their quota to their debt with me
                    }
                });
            }
            else {  // if I'm NOT host
                if (!balance[expense.host]) {   // if it doesn't exist, set it to 0
                    balance[expense.host] = 0;
                }
                balance[expense.host] -= parseFloat(expense.users[username]);   // subtract my quota from host's debt with me
            }
        }
    });

    res.json(balance);
});


// GET /api/balance/:id - returns all movements between logged user and user with specified id (username) 
app.get("/api/balance/:id", verify, async (req, res) => {
    const client = new MongoClient(uri);
    await client.connect();
    const expenses = client.db("expenses");

    // Take expenses hosted by one of the users and with both usernames
    const username = req.session.user.username;
    const otherUsername = req.params.id;
    let query = {};
    query['users.' + username] = { $exists: true };
    query['users.' + otherUsername] = { $exists: true };
    query['host'] = { $in: [username, otherUsername] };

    res.json(await expenses.collection("expenses").find(query).toArray());
});
// Actually returns the balance_id.html page
app.get("/balance/:id", verify, async (req, res) => {
    try {
        const data = await fs.readFile(`${__dirname}/public/balance_id.html`, { encoding: `utf8` });
        res.send(data);
    } catch (err) {
        console.log(err);
    }
});


// GET /api/budget/search?q=query - returns all expenses that match the query string
app.get("/api/budget/search?q=query", verify, (req, res) => {
    //TODO
});


// GET /api/users/search?q=query - returns all users that match the query string
app.get("/api/users/search?q=query", verify, (req, res) => {
    //TODO //needs verify?
});


app.listen(3000); //Listen on port 3000