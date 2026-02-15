const express = require('express');
const db = require('../database');

const router = express.Router();

// Middleware to check authentication
const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }
  next();
};

// Apply auth middleware to all routes
router.use(requireAuth);

// Dashboard
router.get('/dashboard', (req, res) => {
  res.render('user/dashboard');
});

// Lifechart routes
router.get('/lifechart', (req, res) => {
  const userId = req.session.user.id;
  
  db.getDb().all(
    'SELECT * FROM lifechart_entries WHERE user_id = ? ORDER BY date DESC LIMIT 30',
    [userId],
    (err, entries) => {
      if (err) {
        console.error(err);
        entries = [];
      }
      res.render('user/lifechart', { entries });
    }
  );
});

router.post('/lifechart', (req, res) => {
  const { date, mood_level, sleep_hours, medications, notes } = req.body;
  const userId = req.session.user.id;

  db.getDb().run(
    'INSERT INTO lifechart_entries (user_id, date, mood_level, sleep_hours, medications, notes) VALUES (?, ?, ?, ?, ?, ?)',
    [userId, date, mood_level, sleep_hours, medications, notes],
    (err) => {
      if (err) {
        console.error(err);
      }
      res.redirect('/user/lifechart');
    }
  );
});

// Mood diary routes
router.get('/mood-diary', (req, res) => {
  const userId = req.session.user.id;
  
  db.getDb().all(
    'SELECT * FROM mood_diary WHERE user_id = ? ORDER BY date DESC LIMIT 30',
    [userId],
    (err, entries) => {
      if (err) {
        console.error(err);
        entries = [];
      }
      res.render('user/mood-diary', { entries });
    }
  );
});

router.post('/mood-diary', (req, res) => {
  const {
    date,
    mood_morning,
    mood_afternoon,
    mood_evening,
    energy_level,
    anxiety_level,
    irritability_level,
    activities,
    thoughts
  } = req.body;
  const userId = req.session.user.id;

  db.getDb().run(
    `INSERT INTO mood_diary 
     (user_id, date, mood_morning, mood_afternoon, mood_evening, energy_level, anxiety_level, irritability_level, activities, thoughts) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [userId, date, mood_morning, mood_afternoon, mood_evening, energy_level, anxiety_level, irritability_level, activities, thoughts],
    (err) => {
      if (err) {
        console.error(err);
      }
      res.redirect('/user/mood-diary');
    }
  );
});

// Questionnaires routes
router.get('/questionnaires', (req, res) => {
  const userId = req.session.user.id;
  
  db.getDb().all(
    'SELECT * FROM questionnaire_responses WHERE user_id = ? ORDER BY completed_at DESC',
    [userId],
    (err, responses) => {
      if (err) {
        console.error(err);
        responses = [];
      }
      res.render('user/questionnaires', { responses });
    }
  );
});

router.get('/questionnaires/:type', (req, res) => {
  const type = req.params.type;
  res.render('user/questionnaire-form', { type });
});

router.post('/questionnaires/:type', (req, res) => {
  const type = req.params.type;
  const userId = req.session.user.id;
  const responses = JSON.stringify(req.body);
  
  // Simple scoring (can be enhanced based on questionnaire type)
  let score = 0;
  Object.values(req.body).forEach(val => {
    if (!isNaN(val)) score += parseInt(val);
  });

  db.getDb().run(
    'INSERT INTO questionnaire_responses (user_id, questionnaire_type, responses, score) VALUES (?, ?, ?, ?)',
    [userId, type, responses, score],
    (err) => {
      if (err) {
        console.error(err);
      }
      res.redirect('/user/questionnaires');
    }
  );
});

module.exports = router;
