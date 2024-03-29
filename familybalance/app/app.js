// Load utilities
const express = require('express');
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
app.use("/bootstrap", express.static(`${__dirname}/node_modules/bootstrap/dist/`)); // Bootstrap
app.use("/bootstrap-icons", express.static(`${__dirname}/node_modules/bootstrap-icons/`)); // Bootstrap icons

app.use(session({
    secret: 'my_biggest_secret',
    resave: false
}));



// Authentication middleware
function verify(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.status(403);    // Forbidden
        res.sendFile(`${__dirname}/public/error.html`);
    }
}



// ############### API ###############

// Register - adds user in users db
app.post('/api/auth/signup', async (req, res) => {
    const client = new MongoClient(uri);
    await client.connect();
    const users = client.db("users");

    const newUser = {
        username: req.body.username,
        password: req.body.password,
        name: req.body.name,
        surname: req.body.surname
    }

    try {
        const check = await users.collection("users").findOne({ username: newUser.username });
        if (!check) {   // if user doesn't exist already
            await users.collection("users").insertOne(newUser);
            req.session.user = newUser;
            res.redirect('/budget/whoami');
        } else {
            res.status(403).send(); // Not authenticated (username already taken)
        }
    } catch (error) {
        console.log(error);
        res.status(500).send(); // Server error
    }
});


// Login - returns user if found in users db
app.post('/api/auth/signin', async (req, res) => {
    const client = new MongoClient(uri);
    await client.connect();
    const users = client.db("users");

    try {
        const dbUser = await users.collection("users").findOne({ username: req.body.username });

        if (dbUser && dbUser.password === req.body.password) {
            req.session.user = dbUser;
            res.redirect('/budget/whoami');
        } else {
            res.status(403).send(); // Not authenticated (wrong username/password)
        }
    } catch (error) {
        console.log(error);
        res.status(500).send(); // Server error
    }
});


// Logout - if the session exists (verify), deletes the session
app.post("/api/auth/signout", verify, async (req, res) => {
    req.session.destroy(function (error) {
        if (error) {
            console.log(error);
            res.status(500).send();    // Error
        } else {
            res.status(200).send();    // OK
        }
    });
});


// Check user - checks if the user is logged in without sending status errors
app.get("/api/auth/check", (req, res) => {
    if (req.session.user) {
        res.send("authenticated");
    }
    else {
        res.send("not authenticated");
    }
});


// All expenses - returns logged user's expenses as an array
app.get("/api/budget", verify, async (req, res) => {
    const client = new MongoClient(uri);
    await client.connect();
    const expenses = client.db("expenses");

    // Filter on logged user
    const username = req.session.user.username;
    let query = {};
    query['users.' + username] = { $exists: true };

    try {
        res.json(await expenses.collection("expenses").find(query).toArray());
    } catch (error) {
        console.log(error);
        res.status(500).send(); // Server error
    }
});


// Year expenses - returns logged user's expenses in the specified year
app.get("/api/budget/:year", verify, async (req, res, next) => {
    const year = req.params.year;

    // Check to avoid responding to /api/budget/whoami or /api/budget/search?q=query
    if (isNaN(year)) {
        next();
    } else {
        const client = new MongoClient(uri);
        await client.connect();
        const expenses = client.db("expenses");

        const username = req.session.user.username;

        let query = {};
        query['users.' + username] = { $exists: true }; // Filter on logged user
        query["date"] = { $regex: `${year}` }; // Filter on selected year

        try {
            res.json(await expenses.collection("expenses").find(query).toArray());
        } catch (error) {
            console.log(error);
            res.status(500).send(); // Server error
        }
    }
});


// Year and month expenses - returns logged user's expenses in the specified year and month
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

    try {
        res.json(await expenses.collection("expenses").find(query).toArray());
    } catch (error) {
        console.log(error);
        res.status(500).send(); // Server error
    }
});


// Single expense - returns logged user's expense of specified id in the specified year and month
app.get("/api/budget/:year/:month/:id", verify, async (req, res) => {
    let id = req.params.id;

    const client = new MongoClient(uri);
    await client.connect();
    const expenses = client.db("expenses");

    try {
        res.json(await expenses.collection("expenses").findOne({ "_id": new ObjectId(id) }));
    } catch (error) {
        console.log(error);
        res.status(500).send(); // Server error
    }
});


// Add - adds an expense in the specified year and month
app.post("/api/budget/:year/:month", verify, async (req, res) => {
    const client = new MongoClient(uri);
    await client.connect();
    const expenses = client.db("expenses");

    const newExpense = {
        date: req.body.date,
        description: req.body.description,
        category: req.body.category,
        total_cost: req.body.total_cost,
        users: req.body.users,
        host: req.session.user.username
    }

    try {
        const response = await expenses.collection("expenses").insertOne(newExpense);
        const newId = response.insertedId.toString();
        res.json(newId);  // Send ok status and the new id
    } catch (error) {
        console.log(error);
        res.status(500).json(); // Send server error status
    }
});


// Modify - modifies the expense with specified id in the specified year and month
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


// Delete - removes the expense with specified id in the specified year and month
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


// Balance - returns a give/take summary of logged user as an object
app.get("/api/balance", verify, async (req, res) => {
    const client = new MongoClient(uri);
    await client.connect();
    const expenses = client.db("expenses");

    // Filter on logged user
    const username = req.session.user.username;
    let query = {};
    query['users.' + username] = { $exists: true };

    try {
        let dbExpenses = await expenses.collection("expenses").find(query).toArray();

        // Perform calculations
        let balance = {};
        dbExpenses.forEach(expense => {    // for each expense
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

    } catch (error) {
        console.log(error);
        res.status(500).send(); // Server error
    }
});


// Balance with other - returns all movements between logged user and user with specified unique id (username) 
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

    try {
        res.json(await expenses.collection("expenses").find(query).toArray());
    } catch (error) {
        console.log(error);
        res.status(500).send(); // Server error
    }
});


// Search expenses - returns all expenses that match the query string
app.get("/api/budget/search", verify, async (req, res) => {
    const client = new MongoClient(uri);
    await client.connect();
    const expenses = client.db("expenses");

    const username = req.session.user.username;
    const queryString = req.query.q;

    let query = {};

    // Filter on logged user
    query['users.' + username] = { $exists: true };

    // Filter on query string ('i' -> case insensitive)
    query["$or"] = [
        { "date": { $regex: queryString, $options: 'i' } },
        { "description": { $regex: queryString, $options: 'i' } },
        { "category": { $regex: queryString, $options: 'i' } },
        { "total_cost": { $regex: queryString, $options: 'i' } }
    ];

    try {
        res.json(await expenses.collection("expenses").find(query).toArray());
    } catch (error) {
        console.log(error);
        res.status(500).send(); // Server error
    }
});


// User - if authenticated, returns logged user
app.get("/api/budget/whoami", verify, async (req, res) => {
    const user = req.session.user;
    res.json(user);
});


// Search users - returns all users that match the query string
app.get("/api/users/search", verify, async (req, res) => {
    const client = new MongoClient(uri);
    await client.connect();
    const users = client.db("users");

    const queryString = req.query.q;

    let query = {};

    // Filter on query string ('i' -> case insensitive)
    query["$or"] = [
        { "username": { $regex: queryString, $options: 'i' } },
        { "name": { $regex: queryString, $options: 'i' } },
        { "surname": { $regex: queryString, $options: 'i' } },
    ];

    try {
        res.json(await users.collection("users").find(query).toArray());
    } catch (error) {
        console.log(error);
        res.status(500).send(); // Server error
    }
});


// Check username - checks if the username exists
app.get("/api/users/check/:username", async (req, res) => {
    const client = new MongoClient(uri);
    await client.connect();
    const users = client.db("users");

    const username = req.params.username;

    const response = await users.collection("users").findOne({ username: username });
    if (!response) {
        res.status(404).send();    // Not found
    } else {
        res.status(200).send();    // Ok
    }
});


// ############################################################



// ############### html pages requests handling ###############

// Returns the register page
app.get('/auth/signup', async (req, res) => {
    try {
        const data = await fs.readFile(`${__dirname}/public/register.html`, { encoding: `utf8` });
        res.send(data);
    } catch (error) {
        console.log(error);
    }
});


// Returns the login page
app.get('/auth/signin', async (req, res) => {
    try {
        const data = await fs.readFile(`${__dirname}/public/login.html`, { encoding: `utf8` });
        res.send(data);
    } catch (error) {
        console.log(error);
    }
});


// Returns the all_expenses.html page
app.get("/budget", verify, async (req, res) => {
    try {
        const data = await fs.readFile(`${__dirname}/public/all_expenses.html`, { encoding: `utf8` });
        res.send(data);
    } catch (error) {
        console.log(error);
    }
});


// Returns the profile.html page
app.get("/budget/whoami", verify, async (req, res) => {
    try {
        const data = await fs.readFile(`${__dirname}/public/profile.html`, { encoding: `utf8` });
        res.send(data);
    } catch (error) {
        console.log(error);
    }
});


// Returns the correct expense's page
app.get("/budget/:year/:month/:id", verify, async (req, res) => {
    try {
        const data = await fs.readFile(`${__dirname}/public/expense.html`, { encoding: `utf8` });
        res.send(data);
    } catch (error) {
        console.log(error);
    }
});


// Returns the new_expense.html page
app.get("/budget/add", verify, async (req, res) => {
    try {
        const data = await fs.readFile(`${__dirname}/public/new_expense.html`, { encoding: `utf8` });
        res.send(data);
    } catch (error) {
        console.log(error);
    }
});


// Returns the balance.html page
app.get("/balance", verify, async (req, res) => {
    try {
        const data = await fs.readFile(`${__dirname}/public/balance.html`, { encoding: `utf8` });
        res.send(data);
    } catch (error) {
        console.log(error);
    }
});


// Returns the balance_id.html page
app.get("/balance/:id", verify, async (req, res) => {
    try {
        const data = await fs.readFile(`${__dirname}/public/balance_id.html`, { encoding: `utf8` });
        res.send(data);
    } catch (error) {
        console.log(error);
    }
});


// ############################################################



// Default: all other pages redirect to index
app.get('*', (req, res) => {
    res.redirect('/');
});



app.listen(3000); // Listen on port 3000