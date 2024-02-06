# FamilyBalance
Webapp per gestire un bilancio familiare. Progetto finale del corso di Programmazione Web, a.a. 2023-2024.  
Autore: Camilla Giaccari, camillagiaccari97@gmail.com

## Strumenti utilizzati
Docker per creare il container  
Node.js con Express per implementare l'interfaccia REST  
Autenticazione con express-session  
MongoDB per il database  
Classi di Bootstrap (e Bootstrap-icons) per lo stile

## Organizzazione del codice
- FamilyBalance/
    - familybalance/
        - app/
            - public/
            - app.js
            - package-lock.json
            - package.json
        - docker-compose.yml
        - Dockerfile
    - .gitignore
    - README.md

Il file `app.js` contiene il lato server del progetto.  
La cartella `public` contiene i file per la gestione del lato client; è organizzata come segue:  
- public/
    - assets/
        - css/
            - style.css --> regole non coperte dalle classi di Bootstrap
        - js/
            - add_expense.js  -->     aggiunta di una nuova spesa
            - expense.js      -->  visualizzazione, modifica ed eliminazione di una spesa
            - login.js       -->      gestione login
            - navbar.js      -->      gestione barra di navigazione
            - register.js    -->      gestione registrazione
            - show_all_expenses.js --> visualizzazione tabella spese
            - show_balance_id.js  -->  visualizzazione bilancio tra due utenti
            - show_balance.js    -->   visualizzazione bilancio totale
            - show_user.js       -->   visualizzazione tessera di informazioni utente
            - to_top_button.js   -->   gestione pulsante per tornare in cima alla pagina
    - all_expenses.html --> pagina delle spese
    - balance_id.html  -->  pagina del bilancio tra due utenti
    - balance.html     -->  pagina del bilancio totale
    - error.html       -->  pagina di errore di autenticazione
    - expense.html     -->  pagina dei dettagli della spesa
    - index.html       -->  homepage
    - login.html       -->  form di login
    - new_expense.html -->  form per aggiungere una spesa
    - profile.html     -->  profilo personale
    - register.html    -->  form di registrazione

## Note di design
Tutte le pagine HTML contengono la barra di navigazione e un footer con pulsante per tornare indietro e pulsante per tornare in cima alla pagina.  
La home contiene le istruzioni d'uso per le altre pagine.  
Se un nuovo utente non ha ancora creato spese, le pagine che dovrebbero mostrare bilanci o spese mostreranno invece messaggi che incoraggiano a crearne una.  
Grazie alle classi di Bootstrap, tutti gli elementi delle pagine sono responsivi e si adattano alle dimensioni dello schermo.  
Il controllo dell'autenticazione è effettuato in `app.js` con un middleware. Se un utente non autenticato cerca di accedere a pagine riservate, viene invece riportato alla pagina d'errore.  
Tentare di accedere a pagine non esistenti riporta alla Homepage.  
Il nome del container Docker è `appgiaccaric`.

## DEMO
L'app utilizza mongoDB per gestire i dati degli utenti (db e collezione `users`) e delle spese (db e collezione `expenses`).  
Di seguito i comandi da eseguire per entrare nella shell di mongo e aggiungere alcuni dati dimostrativi:  
```
docker exec -it mongo mongosh
db.users
use users
db.users.insertMany( [
   {
        username: 'supermario',
        password: 'pass',
        name: 'Mario',
        surname: 'Mario'
   },
   {
        username: 'gigi',
        password: 'pass',
        name: 'Luigi',
        surname: 'Mario'
   },
   {
        username: 'princess',
        password: 'pass',
        name: 'Peach',
        surname: 'Mario'   
    },
    {
        username: 'Hero',
        password: 'pass',
        name: 'Link',
        surname: 'Link'   
    },
    {
        username: 'Queen',
        password: 'pass',
        name: 'Zelda',
        surname: 'Hyrule'   
    },
    {
        username: 'PurpleGuy98',
        password: 'pass',
        name: 'Spyro',
        surname: 'The Dragon'   
    },
    {
        username: 'fastestBlueDude',
        password: 'pass',
        name: 'Sonic',
        surname: 'The Hedgehog'
    }
] )

use expenses
db.expenses.insertMany( [
    {
        date: '2023-12-25',
        description: 'Cenone di Natale con tutti!',
        category: 'Cena',
        total_cost: '108.10',
        users: { supermario: '32.84', gigi: '40.06', princess: '35.2' },
        host: 'supermario'
    },
    {
        date: '2023-12-31',
        description: 'Festazza di Capodanno; da dividere tutte le spese per birre, stuzzichini e spumante',
        category: 'Festa',
        total_cost: '100',
        users: {
            Hero: '20', supermario: '20', PurpleGuy98: '20', fastestBlueDude: '20', gigi: '20',
        },
        host: 'Hero'
    },
    {
        date: '2024-01-18',
        description: "Cenetta romantica al McDonald's",
        category: 'Cena',
        total_cost: '20.35',
        users: { supermario: '10.30', princess: '10.05' },
        host: 'supermario'
    },
    {
        date: '2024-02-02',
        description: 'Serata al Bowling con link e spyro',
        category: 'Bowling',
        total_cost: '31.50',
        users: { fastestBlueDude: '13.70', PurpleGuy98: '12.30', Hero: '5.50' },
        host: 'fastestBlueDude'
    },
    {
        date: '2024-01-09',
        description: 'Attivato Netflix per la famiglia visto che Mario ha insistito (così puoi guardarti tutti i programmi di cucina che vuoi ora :P)',
        category: 'Netflix',
        total_cost: '30',
        users: { gigi: '10', supermario: '10', princess: '10' },
        host: 'gigi'
    },
    {
        date: '2024-01-23',
        description: 'Cena fuori con il bro',
        category: 'Cena',
        total_cost: '80',
        users: { gigi: '40', supermario: '40' },
        host: 'gigi'
    },
    {
        date: '2024-02-02',
        description: 'Ho ridato i soldi di Capodanno a Link finalmente',
        category: 'Rimborso',
        total_cost: '0',
        users: { supermario: '20', Hero: '-20' },
        host: 'supermario'
    }
] )

```