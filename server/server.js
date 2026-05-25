"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const HTTPS = require("https");
const cors = require("cors");
const tokenAdministration = require("./tokenAdministration");
const mongoFunctions = require("./mongoFunctions");

// ---- Costanti di configurazione ----
const PORT = 8888;
const DB = "biblioteca"; // nome del database MongoDB
const C_USERS = "libri"; // collection per il login

// ============================================================
//  CREAZIONE DEL SERVER HTTPS
//  fs.readFileSync legge i file in modo sincrono (bloccante).
//  Questo va bene all'avvio, prima che il server accetti richieste.
// ============================================================
const privateKey = fs.readFileSync("keys/privateKey.pem", "utf8"); 		// chiave privata TLS
const certificate = fs.readFileSync("keys/certificate.crt", "utf8"); 	// certificato TLS
const credentials = { key: privateKey, cert: certificate };

// Creazione dell'app Express che viene passata al server HTTPS.
// Express gestisce il routing, HTTPS gestisce la cifratura.
const app = express();

// Creazione server HTTPS
// const httpsServer = HTTPS.createServer(credentials, app);

// Avviamo il server: ascoltiamo solo sull'interfaccia locale (127.0.0.1)
/*httpsServer.listen(PORT, "127.0.0.1", () => {
    console.log("=================================================");
    console.log(`  Server HTTPS avviato su https://127.0.0.1:${PORT}`);
    console.log("=================================================");
});*/


// Creazione server HTTP

app.listen(PORT,function (){
    console.log("=================================================");
    console.log(`  Server HTTP avviato su https://127.0.0.1:${PORT}`);
    console.log("=================================================");
});

// ============================================================
//  MIDDLEWARE (funzioni eseguite ad ogni richiesta, in ordine)
// ============================================================
// CORS: abilita le richieste da origini diverse (es. Angular su porta 4200)
app.use(cors());
// Permette di leggere il body delle richieste in formato JSON
app.use(bodyParser.json());
// Permette di leggere il body in formato form-urlencoded (HTML form)
app.use(bodyParser.urlencoded({ extended: true }));



// Middleware di LOG: registra ogni richiesta in arrivo
app.use((req, res, next) => {
    const ora = new Date().toLocaleTimeString();
    console.log(`${ora} >>> ${req.method}: ${req.originalUrl}`);
    // Log dei parametri GET (query string)
    if (Object.keys(req.query).length > 0)
        console.log("  Query params: " + JSON.stringify(req.query));
    // Log dei parametri POST (body)
    if (req.body && Object.keys(req.body).length > 0)
        console.log("  Body params:  " + JSON.stringify(req.body));
    next(); // passa al middleware/route successivo
});


// ============================================================
//  FUNZIONE DI UTILITÀ: risposta di errore
//  Centralizzo la gestione degli errori per non ripetere codice.
// ============================================================
function sendError(res, code, message) {
    console.error(`  [${code}] ${message}`);
    res.status(code).send({ error: message });
}

// ============================================================
//  FUNZIONE DI UTILITÀ: middleware di verifica token
//  Da usare come parametro intermedio nelle route protette.
//  Esempio: app.get("/api/...", checkToken, (req,res) => { ... })
// ============================================================
function checkToken(req, res, next) {
    tokenAdministration.ctrlToken(req,(payload)=>{
        if(payload.err_exp)
            return sendError(res,403,payload.message);
        req.tokenPayload = payload;
        tokenAdministration.createToken(payload);
        req.newToken=tokenAdministration.token;
        next();
    });
}

// ============================================================
//  ROUTE: POST /api/login
//  Riceve username e password, cerca l'utente nel DB,
//  e se le credenziali sono corrette crea e restituisce il token JWT.
//
//  Body richiesto: { username: "...", password: "..." }
//  Risposta OK:    { msg: "Login OK", token: "eyJhbGci..." }
// ============================================================
app.post("/api/login", (req, res) => {
    console.log("Start login");
    const query = { user: req.body.username };
    mongoFunctions.findLogin(req,DB,C_USERS,query,(err,data)=>{
        if(err.codeErr == -1){  // Login OK
            tokenAdministration.createToken(data);
            res.send({ msg: "Login OK", token: tokenAdministration.token });
        }else{  // Login fallito
            sendError(res, err.codeErr, err.message);
        }
    });
});

app.get("/api/libri", (req, res) => {
    mongoFunctions.find(DB,C_USERS,{},(err,data)=>{
        if(err.codeErr == -1)
            res.send({data:data, newToken:req.newToken});
        else
            sendError(res,err.codeErr,err.message);
    });
});

app.post("/api/libri/inserisci", (req, res) => {
    mongoFunctions.insert(DB,C_USERS,req.body,(err,data)=>{
        if(err.codeErr == -1)
            res.send({msg:"Studente inserito", id: data.insertedId, newToken:req.newToken});
        else
            sendError(res,err.codeErr,err.message); 
    });
});

app.post("/api/libri/cercaPerGenere", (req, res) => {
    mongoFunctions.find(DB,C_USERS,req.body,(err,data)=>{
        if(err.codeErr == -1)
            res.send({data:data, newToken:req.newToken});
        else
            sendError(res,err.codeErr,err.message);
    });
});
