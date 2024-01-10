const express = require('express'); //carichiamo express
const fs = require('fs/promises');
const { MongoClient } = require('mongodb');
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
        res.redirect('/api/restricted');
    } else {
        res.status(403).send("Non autenticato!");
    }
});


// Register
app.get('/api/auth/signup', async (req, res) => {
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

    const db_user = await users.collection("users").insertOne(new_user);

    if (db_user) {
        req.session.user = new_user;
        res.redirect('/api/restricted');
    } else {
        res.status(403).send("Qualcosa è andato storto, riprova");
    }
});


// Restricted access
function verify(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.status(403).send("Non autenticato!");
    }
}

app.get('/api/restricted', verify, (req, res) => {
    res.json({ message: 'Welcome to the protected route!', user: req.session.user.username });
});


app.listen(3000); //ascoltiamo su porta 3000