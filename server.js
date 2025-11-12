// IMPORT DAN KONFIG
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./database.js");

const app = express();
const PORT = process.env.PORT || 3200;
const JWT_SECRET = process.env.JWT_SECRET || "mysecret";

// MIDDLEWARE UMUM 
app.use(cors());
app.use(express.json());

//  AUTH MIDDLEWARE 
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // format: "Bearer <token>"

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error("JWT Verify Error:", err.message);
      return res.status(403).json({ error: "Invalid or expired token" });
    }
    req.user = decoded.user;
    next();
  });
}

//  STATUS 
app.get("/status", (req, res) => {
  res.json({ ok: true, status: "Server is running", service: "Movie API" });
});

// REGISTER 
app.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password || password.length < 6) {
    return res.status(400).json({ error: "Invalid username or password" });
  }

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) return res.status(500).json({ error: "Hashing failed" });

    const sql = "INSERT INTO users (username, password) VALUES (?,?)";
    db.run(sql, [username.toLowerCase(), hashedPassword], function (err) {
      if (err) {
        if (err.message.includes("UNIQUE"))
          return res.status(409).json({ error: "Username already exists" });
        return res.status(500).json({ error: "Database error" });
      }
      res.status(201).json({ message: "User registered", userId: this.lastID });
    });
  });
});

//  LOGIN 
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "Missing credentials" });

  const sql = "SELECT * FROM users WHERE username = ?";
  db.get(sql, [username.toLowerCase()], (err, user) => {
    if (err || !user)
      return res.status(401).json({ error: "Invalid username or password" });

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err || !isMatch)
        return res.status(401).json({ error: "Invalid username or password" });

      const payload = { user: { id: user.id, username: user.username } };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

      res.json({ message: "Login successful", token });
    });
  });
});

//  MOVIES 
app.get("/movies", (req, res) => {
  db.all("SELECT * FROM movies ORDER BY id ASC", [], (err, rows) => {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ message: "success", data: rows });
  });
});

app.get("/movies/:id", (req, res) => {
  db.get("SELECT * FROM movies WHERE id = ?", [req.params.id], (err, row) => {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ message: "success", data: row });
  });
});

app.post("/movies", authenticateToken, (req, res) => {
  const { title, director, year } = req.body;
  if (!title || !director || !year) {
    return res.status(400).json({ error: "Missing movie fields" });
  }

  const sql = "INSERT INTO movies (title, director, year) VALUES (?,?,?)";
  db.run(sql, [title, director, year], (err) => {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ message: "Movie added successfully" });
  });
});

// DIRECTORS 
app.get("/directors", (req, res) => {
  const sql = "SELECT DISTINCT director FROM movies ORDER BY director ASC";
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ message: "success", data: rows.map((r) => r.director) });
  });
});

app.get("/directors/:name", (req, res) => {
  const sql = "SELECT * FROM movies WHERE director = ?";
  db.all(sql, [req.params.name], (err, rows) => {
    if (err) return res.status(400).json({ error: err.message });
    if (rows.length === 0)
      return res.status(404).json({ message: "Director not found" });
    res.json({ message: "success", data: rows });
  });
});

// 🔒 Tambah director baru
app.post("/directors", authenticateToken, (req, res) => {
  const { name, title, year } = req.body;
  if (!name || !title || !year)
    return res.status(400).json({ error: "Missing director or movie info" });

  const sql = "INSERT INTO movies (title, director, year) VALUES (?,?,?)";
  db.run(sql, [title, name, year], (err) => {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ message: `Director '${name}' added with movie '${title}'` });
  });
});

// 🔒 Ubah nama director
app.put("/directors/:oldName", authenticateToken, (req, res) => {
  const { newName } = req.body;
  if (!newName)
    return res.status(400).json({ error: "New name is required" });

  const sql = "UPDATE movies SET director = ? WHERE director = ?";
  db.run(sql, [newName, req.params.oldName], function (err) {
    if (err) return res.status(400).json({ error: err.message });
    if (this.changes === 0)
      return res.status(404).json({ message: "Director not found" });
    res.json({ message: "Director updated successfully" });
  });
});

// 🔒 Hapus director
app.delete("/directors/:name", authenticateToken, (req, res) => {
  const sql = "DELETE FROM movies WHERE director = ?";
  db.run(sql, [req.params.name], function (err) {
    if (err) return res.status(400).json({ error: err.message });
    if (this.changes === 0)
      return res.status(404).json({ message: "Director not found" });
    res.json({ message: "Director and related movies deleted" });
  });
});


app.listen(PORT, () => {
  console.log(` Server aktif di http://localhost:${PORT}`);
});
