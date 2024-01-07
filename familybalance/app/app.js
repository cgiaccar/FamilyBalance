const express = require('express'); //carichiamo express
const app = express(); // costruiamo app

app.use(express.static(`${__dirname}/public`)); // risolve la cartella public da qualsiasi request
app.get('/json/:animal', (req, res) => {
    let a = {};
    if (req.params.animal === "cane") {
        a = {
            "nome": "Simba",
            "verso": "bau!",
            "colore": "bianco"
        }
    } else if (req.params.animal === "gatto") {
        a = {
            "nome": "Lino",
            "verso": "miao!",
            "colore": "grigio"
        }
    }
    res.json(a);
});

app.listen(3000); //ascoltiamo su porta 3000