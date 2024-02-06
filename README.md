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
Grazie alle classi di Bootstrap, tutti gli elementi delle pagine sono responsivi e si adattano alle dimensioni dello schermo.  
Il controllo dell'autenticazione è effettuato in `app.js` con un middleware. Se un utente non autenticato cerca di accedere a pagine riservate, viene invece riportato alla pagina d'errore.  
Tentare di accedere a pagine non esistenti riporta alla Homepage.

## DEMO
// TODO