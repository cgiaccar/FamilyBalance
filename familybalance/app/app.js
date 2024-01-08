const express = require('express'); //carichiamo express
const fs = require('fs/promises');
const { MongoClient } = require('mongodb');
const jwt = require('jsonwebtoken');

const uri = "mongodb://mongohost";
const app = express(); // costruiamo app

app.use(express.static(`${__dirname}/public`)); // risolve la cartella public da qualsiasi request
app.use(express.urlencoded({ extended: 'false' }));
app.use(express.json());


function generateAccessToken(user) {
    const payload = {
        username: user.username,
        name: user.name,
        surname: user.surname
    };

    const secret = 'secretkey';
    const options = { expiresIn: '1h' };

    return jwt.sign(payload, secret, options);
}

// Login
app.get('/api/auth/signin', async (req, res) => {
    try {
        const data = await fs.readFile(`${__dirname}/public/login.html`, { encoding: `utf8` });
        res.send(data);
    } catch (err) {
        console.log(err);
    }
});
app.post('/api/auth/signin', async (req, res) => {
    /*
    const client = new MongoClient(uri);
    await client.connect();
    const users = client.db("users");
    const db_user = await users.collection("users").findOne({ username: req.body.username });
    */

    db_user = { //temporaneo lol
        username: 'a',
        password: 'a',
        name: 'Camilla',
        surname: 'Giaccari'
    }

    if (db_user.password === req.body.password) {
        generateAccessToken(db_user);
        res.redirect('/index.html');
    } else {
        console.log(db_user.password);
        console.log(req.body.password);
        res.status(403).send("Non autenticato!");
    }
});

function verifyAccessToken(token) {
    const secret = 'secretkey';

    try {
        const decoded = jwt.verify(token, secret);
        return { success: true, data: decoded };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.sendStatus(401);
    }

    const result = verifyAccessToken(token);

    if (!result.success) {
        return res.status(403).json({ error: result.error });
    }

    req.user = result.data;
    next();
}

app.get('/api/restricted', authenticateToken, (req, res) => {
    res.json({ message: 'Welcome to the protected route!', user: req.user });
});


app.listen(3000); //ascoltiamo su porta 3000