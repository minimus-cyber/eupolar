const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'eupolar.db');
let db;

const init = () => {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        reject(err);
      } else {
        console.log('Database connected');
        createTables().then(resolve).catch(reject);
      }
    });
  });
};

const createTables = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Users table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          name TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) reject(err);
      });

      // Lifechart entries table
      db.run(`
        CREATE TABLE IF NOT EXISTS lifechart_entries (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          date DATE NOT NULL,
          mood_level INTEGER NOT NULL,
          sleep_hours REAL,
          medications TEXT,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `, (err) => {
        if (err) reject(err);
      });

      // Mood diary entries table
      db.run(`
        CREATE TABLE IF NOT EXISTS mood_diary (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          date DATE NOT NULL,
          mood_morning INTEGER,
          mood_afternoon INTEGER,
          mood_evening INTEGER,
          mood_level INTEGER,
          energy_level INTEGER,
          anxiety_level INTEGER,
          irritability_level INTEGER,
          sleep_hours REAL,
          medications TEXT,
          activities TEXT,
          thoughts TEXT,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `, (err) => {
        if (err) reject(err);
      });

      // Add new columns to existing mood_diary table if they don't exist
      // SQLite doesn't support IF NOT EXISTS in ALTER TABLE, so we ignore errors
      db.run(`ALTER TABLE mood_diary ADD COLUMN mood_level INTEGER`, () => {});
      db.run(`ALTER TABLE mood_diary ADD COLUMN sleep_hours REAL`, () => {});
      db.run(`ALTER TABLE mood_diary ADD COLUMN medications TEXT`, () => {});
      db.run(`ALTER TABLE mood_diary ADD COLUMN notes TEXT`, () => {});

      // Questionnaire responses table
      db.run(`
        CREATE TABLE IF NOT EXISTS questionnaire_responses (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          questionnaire_type TEXT NOT NULL,
          responses TEXT NOT NULL,
          score INTEGER,
          completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `, (err) => {
        if (err) reject(err);
      });

      // Lifechart questionnaire responses table
      db.run(`
        CREATE TABLE IF NOT EXISTS lifechart_data (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          data TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id),
          UNIQUE(user_id)
        )
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });
};

const getDb = () => db;

module.exports = {
  init,
  getDb
};
