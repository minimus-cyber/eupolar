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
  
  // Calculate normalized score (0-100) based on questionnaire type
  let score = 0;
  const answers = req.body;
  
  if (type === 'mood-assessment') {
    // Q1: mood (1-10, higher is better for balance, 5 is ideal)
    // Q2: sleep quality (1-10, higher is better)
    // Q3: energy level (1-10, 5-6 is ideal)
    // Q4: negative thoughts (1-10, lower is better) - REVERSE
    // Q5: concentration (1-10, higher is better)
    const q1Score = Math.max(0, 10 - Math.abs(parseInt(answers.q1) - 5.5)); // optimal around 5-6
    const q2Score = parseInt(answers.q2);
    const q3Score = Math.max(0, 10 - Math.abs(parseInt(answers.q3) - 5.5)); // optimal around 5-6
    const q4Score = 11 - parseInt(answers.q4); // reverse scored
    const q5Score = parseInt(answers.q5);
    score = Math.round(((q1Score + q2Score + q3Score + q4Score + q5Score) / 50) * 100);
  } else if (type === 'medication-adherence') {
    // Q1: frequency (1-10, higher is better)
    // Q2: forgetting (1-10, higher is better - already states 10=never)
    // Q3: satisfaction (1-10, higher is better)
    // Q4: side effects (1-10, lower is better) - REVERSE
    // Q5: ease of following (1-10, higher is better)
    const q1Score = parseInt(answers.q1);
    const q2Score = parseInt(answers.q2);
    const q3Score = parseInt(answers.q3);
    const q4Score = 11 - parseInt(answers.q4); // reverse scored
    const q5Score = parseInt(answers.q5);
    score = Math.round(((q1Score + q2Score + q3Score + q4Score + q5Score) / 50) * 100);
  } else if (type === 'sleep-quality') {
    // Q1: hours (0-12, 7-8 is optimal)
    // Q2: feeling rested (1-10, higher is better)
    // Q3: time to fall asleep (1-10, lower is better) - REVERSE
    // Q4: wake frequency (1-10, lower is better) - REVERSE
    // Q5: overall quality (1-10, higher is better)
    const hours = parseInt(answers.q1);
    const q1Score = Math.max(0, (10 - Math.abs(hours - 7.5)) * 1.25); // optimal 7-8 hours, scaled to 0-10
    const q2Score = parseInt(answers.q2);
    const q3Score = 11 - parseInt(answers.q3); // reverse scored
    const q4Score = 11 - parseInt(answers.q4); // reverse scored
    const q5Score = parseInt(answers.q5);
    score = Math.round(((q1Score + q2Score + q3Score + q4Score + q5Score) / 50) * 100);
  } else if (type === 'general-wellbeing') {
    // Q1: quality of life (1-10, higher is better)
    // Q2: satisfaction with relationships (1-10, higher is better)
    // Q3: daily activities (1-10, higher is better)
    // Q4: stress (1-10, lower is better) - REVERSE
    // Q5: optimism (1-10, higher is better)
    const q1Score = parseInt(answers.q1);
    const q2Score = parseInt(answers.q2);
    const q3Score = parseInt(answers.q3);
    const q4Score = 11 - parseInt(answers.q4); // reverse scored
    const q5Score = parseInt(answers.q5);
    score = Math.round(((q1Score + q2Score + q3Score + q4Score + q5Score) / 50) * 100);
  } else if (type === 'physical-activity') {
    // Q1: days per week (0-7, normalized)
    // Q2: minutes per day (0-120, normalized)
    // Q3: intensity (1-10, higher is better)
    // Q4: motivation (1-10, higher is better)
    // Q5: feeling after (1-10, higher is better)
    const q1Score = (parseInt(answers.q1) / 7) * 10; // normalize to 0-10
    const q2Score = Math.min((parseInt(answers.q2) / 30) * 10, 10); // 30+ mins = full score
    const q3Score = parseInt(answers.q3);
    const q4Score = parseInt(answers.q4);
    const q5Score = parseInt(answers.q5);
    score = Math.round(((q1Score + q2Score + q3Score + q4Score + q5Score) / 50) * 100);
  } else if (type === 'nutrition') {
    // Q1: regular meals (0-5, 3-4 is optimal)
    // Q2: fruits/vegetables (1-10, higher is better)
    // Q3: processed food (1-10, lower is better) - REVERSE
    // Q4: water intake (0-10, 8+ glasses is optimal)
    // Q5: overall quality (1-10, higher is better)
    const meals = parseInt(answers.q1);
    // Multiply by 2 to scale deviation to 0-10 range (max deviation of 5 meals * 2 = 10 points penalty)
    const q1Score = Math.max(0, 10 - Math.abs(meals - 3.5) * 2); // optimal 3-4 meals
    const q2Score = parseInt(answers.q2);
    const q3Score = 11 - parseInt(answers.q3); // reverse scored
    const q4Score = Math.min((parseInt(answers.q4) / 8) * 10, 10); // 8+ glasses = full score
    const q5Score = parseInt(answers.q5);
    score = Math.round(((q1Score + q2Score + q3Score + q4Score + q5Score) / 50) * 100);
  } else if (type === 'social-relationships') {
    // Q1: interaction frequency (1-10, higher is better)
    // Q2: feeling supported (1-10, higher is better)
    // Q3: feeling lonely (1-10, lower is better) - REVERSE
    // Q4: relationship quality (1-10, higher is better)
    // Q5: satisfaction (1-10, higher is better)
    const q1Score = parseInt(answers.q1);
    const q2Score = parseInt(answers.q2);
    const q3Score = 11 - parseInt(answers.q3); // reverse scored
    const q4Score = parseInt(answers.q4);
    const q5Score = parseInt(answers.q5);
    score = Math.round(((q1Score + q2Score + q3Score + q4Score + q5Score) / 50) * 100);
  }

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
