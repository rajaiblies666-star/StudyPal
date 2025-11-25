const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const db = new sqlite3.Database('studypal.db');

db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    avatar TEXT,
    xp INTEGER DEFAULT 0
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject_id INTEGER,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    FOREIGN KEY (subject_id) REFERENCES subjects (id)
  )
`);

app.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  db.run('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, password], (err) => {
    if (err) {
      res.status(500).send('Error registering user');
    } else {
      res.send('User registered successfully');
    }
  });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  db.get('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (err, row) => {
    if (err || !row) {
      res.status(401).send('Invalid credentials');
    } else {
      res.send({ id: row.id, name: row.name, email: row.email, avatar: row.avatar, xp: row.xp });
    }
  });
});

app.get('/subjects', (req, res) => {
  db.all('SELECT * FROM subjects', [], (err, rows) => {
    if (err) {
      res.status(500).send('Error fetching subjects');
    } else {
      res.json(rows);
    }
  });
});

app.get('/questions/:subjectId', (req, res) => {
  const subjectId = req.params.subjectId;
  db.all('SELECT * FROM questions WHERE subject_id = ?', [subjectId], (err, rows) => {
    if (err) {
      res.status(500).send('Error fetching questions');
    } else {
      res.json(rows);
    }
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
