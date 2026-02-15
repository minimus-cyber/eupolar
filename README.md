# Eupolar 🧠

Portale di psicoeducazione per il disturbo bipolare basato sul metodo di Colom e Vieta.

## Descrizione

Eupolar è un portale web completo dedicato alla psicoeducazione sul disturbo bipolare, sviluppato seguendo le linee guida del metodo scientifico di Colom e Vieta dell'Università di Barcellona.

### Funzionalità per Utenti Non Registrati

- **Informazioni sul Disturbo Bipolare**: Caratteristiche, storia e consigli basati su evidenze scientifiche
- **Psicoeducazione**: Materiali educativi per persone con diagnosi di disturbo bipolare
- **Guida per Familiari e Amici**: Risorse per supportare le persone care
- **Informazioni per Operatori**: Strumenti e informazioni per professionisti della salute mentale

### Funzionalità per Utenti Registrati

- **Lifechart**: Strumento interattivo per tracciare l'andamento dell'umore nel tempo con visualizzazione grafica
- **Diario dell'Umore**: Webapp con domande guidate per il monitoraggio quotidiano dell'umore, energia, ansia e altri parametri
- **Questionari di Autoaiuto**: Questionari standardizzati di autovalutazione per:
  - Valutazione dell'umore
  - Aderenza alla terapia
  - Qualità del sonno
  - Benessere generale

## Requisiti Tecnici

- Node.js 14.x o superiore
- NPM 6.x o superiore

## Installazione

```bash
# Clona il repository
git clone https://github.com/minimus-cyber/eupolar.git
cd eupolar

# Installa le dipendenze
npm install

# Avvia il server
npm start
```

Il portale sarà accessibile all'indirizzo `http://localhost:3000`

## Struttura del Progetto

```
eupolar/
├── public/              # File statici (CSS, JS, immagini)
│   └── css/
├── views/               # Template EJS
│   ├── partials/        # Header e footer
│   ├── auth/            # Pagine di autenticazione
│   └── user/            # Pagine area riservata
├── routes/              # Route Express
│   ├── auth.js          # Autenticazione
│   └── user.js          # Funzionalità utente
├── data/                # Database SQLite
├── database.js          # Configurazione database
├── server.js            # Server principale
└── package.json         # Dipendenze

```

## Tecnologie Utilizzate

- **Backend**: Node.js, Express
- **Database**: SQLite3
- **Template Engine**: EJS
- **Autenticazione**: express-session, bcrypt
- **Frontend**: HTML5, CSS3, JavaScript vanilla

## Database

Il sistema utilizza SQLite con le seguenti tabelle:

- `users`: Informazioni utenti registrati
- `lifechart_entries`: Dati del lifechart
- `mood_diary`: Registrazioni del diario dell'umore
- `questionnaire_responses`: Risposte ai questionari

## Sicurezza

- Password criptate con bcrypt
- Sessioni sicure con express-session
- Rate limiting per prevenire abusi
- Validazione input lato server
- Protezione delle route autenticate
- Cookie HttpOnly per prevenire XSS

**Note per la Produzione:**
- Configurare HTTPS e impostare `NODE_ENV=production`
- Cambiare `SESSION_SECRET` con una chiave segreta sicura
- Implementare backup regolari del database
- Considerare l'uso di un database più robusto (PostgreSQL, MySQL)
- Aggiungere protezione CSRF per i form se necessario

## Note Importanti

⚠️ **Disclaimer Medico**: Questo portale fornisce informazioni educative e strumenti di auto-monitoraggio. Non sostituisce la consulenza medica professionale. Gli utenti devono continuare a seguire le indicazioni del proprio medico curante.

## Sviluppo Futuro

Possibili miglioramenti:
- Esportazione dati in PDF
- Grafici più avanzati con librerie come Chart.js
- Notifiche e promemoria
- Integrazione con app mobile
- Sistema di backup dati
- Supporto multilingua

## Licenza

ISC

## Contatti

Per domande o supporto, contattare il team attraverso il repository GitHub.

## Riferimenti

Il programma di psicoeducazione è basato sul lavoro dei Dott. Francesc Colom ed Eduard Vieta:
- Colom, F., & Vieta, E. (2006). Psychoeducation Manual for Bipolar Disorder. Cambridge University Press.
