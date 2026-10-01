
const express = require("express");
const path = require("path");
const crypto = require("crypto");
const Database = require("better-sqlite3");

const app = express();
const PORT = process.env.PORT || 3000;
const db = new Database("void.db");

app.use(express.json({ limit: "1mb" }));
app.use(express.static(__dirname));

db.pragma("journal_mode = WAL");
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    password_salt TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return { hash, salt };
}

function cleanUser(row) {
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    createdAt: row.created_at
  };
}

app.post("/api/auth/register", (req, res) => {
  const username = String(req.body.username || "").trim().replace(/^@/, "");
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");

  if (!/^[a-zA-Z0-9._-]{3,24}$/.test(username)) {
    return res.status(400).json({ error: "Username must be 3–24 characters and use letters, numbers, dots, underscores or hyphens." });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Enter a valid email address." });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "Password must contain at least 8 characters." });
  }

  const existing = db.prepare("SELECT id FROM users WHERE username = ? OR email = ?").get(username, email);
  if (existing) {
    return res.status(409).json({ error: "An account with that username or email already exists." });
  }

  const { hash, salt } = hashPassword(password);
  const result = db.prepare(`
    INSERT INTO users (username, email, password_hash, password_salt)
    VALUES (?, ?, ?, ?)
  `).run(username, email, hash, salt);

  const user = db.prepare("SELECT id, username, email, created_at FROM users WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json({ user: cleanUser(user) });
});

app.post("/api/auth/login", (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");

  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!user) return res.status(401).json({ error: "Invalid email or password." });

  const { hash } = hashPassword(password, user.password_salt);
  const ok = crypto.timingSafeEqual(
    Buffer.from(hash, "hex"),
    Buffer.from(user.password_hash, "hex")
  );

  if (!ok) return res.status(401).json({ error: "Invalid email or password." });

  // Prototype phase: return the user record. Production should issue a secure,
  // HttpOnly, SameSite session cookie instead of storing authentication state in JS.
  res.json({ user: cleanUser(user) });
});

app.get("/api/auth/users", (req, res) => {
  // Development-only diagnostic endpoint. Remove before production deployment.
  const users = db.prepare("SELECT id, username, email, created_at FROM users ORDER BY id DESC").all();
  res.json({ users });
});

app.listen(PORT, () => {
  console.log(`VOID backend running at http://localhost:${PORT}`);
});
