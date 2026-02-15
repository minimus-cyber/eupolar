const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../database');

const router = express.Router();

// Show registration form
router.get('/register', (req, res) => {
  if (req.session.user) {
    return res.redirect('/user/dashboard');
  }
  res.render('auth/register', { error: null });
});

// Handle registration
router.post('/register', async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  // Validation
  if (!name || !email || !password || !confirmPassword) {
    return res.render('auth/register', { error: 'Tutti i campi sono obbligatori' });
  }

  if (password !== confirmPassword) {
    return res.render('auth/register', { error: 'Le password non coincidono' });
  }

  if (password.length < 6) {
    return res.render('auth/register', { error: 'La password deve essere almeno 6 caratteri' });
  }

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    db.getDb().run(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            return res.render('auth/register', { error: 'Email già registrata' });
          }
          return res.render('auth/register', { error: 'Errore durante la registrazione' });
        }

        // Auto-login after registration
        req.session.user = {
          id: this.lastID,
          name,
          email
        };
        res.redirect('/user/dashboard');
      }
    );
  } catch (error) {
    res.render('auth/register', { error: 'Errore durante la registrazione' });
  }
});

// Show login form
router.get('/login', (req, res) => {
  if (req.session.user) {
    return res.redirect('/user/dashboard');
  }
  res.render('auth/login', { error: null });
});

// Handle login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.render('auth/login', { error: 'Email e password sono obbligatori' });
  }

  db.getDb().get(
    'SELECT * FROM users WHERE email = ?',
    [email],
    async (err, user) => {
      if (err || !user) {
        return res.render('auth/login', { error: 'Email o password non validi' });
      }

      try {
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
          return res.render('auth/login', { error: 'Email o password non validi' });
        }

        req.session.user = {
          id: user.id,
          name: user.name,
          email: user.email
        };
        res.redirect('/user/dashboard');
      } catch (error) {
        res.render('auth/login', { error: 'Errore durante il login' });
      }
    }
  );
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
