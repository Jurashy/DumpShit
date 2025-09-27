// main.js
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs"); // for password hashing
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = 4000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// DB connection
const db = new sqlite3.Database("mydatabase.db", (err) => {
  if (err) return console.error(err.message);
  console.log("Connected to SQLite database.");
});

// Create users table if not exists
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )
`);

// Route for registration
app.post("/register", (req, res) => {
  const { username, email, password } = req.body;

  // Hash the password
  const hashedPassword = bcrypt.hashSync(password, 10);

  // Insert into DB
  const sql = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;
  db.run(sql, [username, email, hashedPassword], (err) => {
    if (err) {
      console.error("Error inserting user:", err.message);
      return res.send("❌ Registration failed. Maybe email already exists.");
    }
    res.send("✅ User registered successfully!");
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

app.get("/users", (req, res) => {
  db.all("SELECT id, username, email FROM users", [], (err, rows) => {
    if (err) {
      return res.status(500).send("Error fetching users");
    }
    res.json(rows);
  });
});
