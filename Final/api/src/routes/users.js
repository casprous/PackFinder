const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authenticateToken = require('../middleware/auth');
const pool = require('../db');

const API_SECRET_KEY = process.env.API_SECRET_KEY;

// POST /users/register
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  let conn;
  
  try {
    conn = await pool.getConnection();
    const existing = await conn.query("SELECT * FROM User WHERE usr_username = ?", [username]);
    if (existing.length > 0) return res.status(400).json({ error: "Username already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Using generic First/Last names to satisfy the NOT NULL schema requirements
    await conn.query(
      "INSERT INTO User (usr_first_name, usr_last_name, usr_username, usr_password, usr_salt, usr_email) VALUES (?, ?, ?, ?, ?, ?)",
      ['NCSU', 'Student', username, hashedPassword, salt, email]
    );
    res.status(201).json({ message: "User registered successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({error: "Database error"});
  } finally {
    if (conn) conn.release();
  }
});

// POST /users/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  let conn;
  
  try {
    conn = await pool.getConnection();
    const users = await conn.query("SELECT * FROM User WHERE usr_username = ?", [username]);
    
    if (users.length === 0) return res.status(401).json({ error: "Invalid credentials." });

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.usr_password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials." });

    const token = jwt.sign({ id: user.user_id, username: user.usr_username }, API_SECRET_KEY, { expiresIn: '2h' });
    res.status(200).json({ message: "Login successful", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({error: "Database error"});
  } finally {
    if (conn) conn.release();
  }
});

// POST /users/logout
router.post('/logout', (req, res) => {
  res.status(200).json({ message: "Logout successful" });
});

// GET /users/profile (Protected)
router.get('/profile', authenticateToken, async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const users = await conn.query("SELECT usr_username as username FROM User WHERE user_id = ?", [req.user.id]);
    
    if (users.length > 0) res.status(200).json(users[0]);
    else res.status(404).json({ error: "User not found" });
  } catch (err) {
    res.status(500).json({error: "Database error"});
  } finally {
    if (conn) conn.release();
  }
});

// PUT /users/profile/username (Protected)
router.put('/profile/username', authenticateToken, async (req, res) => {
  const { newUsername } = req.body;
  let conn;
  try {
    conn = await pool.getConnection();
    const existing = await conn.query("SELECT * FROM User WHERE usr_username = ?", [newUsername]);
    if (existing.length > 0) return res.status(400).json({ error: "Username already taken" });

    await conn.query("UPDATE User SET usr_username = ? WHERE user_id = ?", [newUsername, req.user.id]);
    const token = jwt.sign({ id: req.user.id, username: newUsername }, API_SECRET_KEY, { expiresIn: '2h' });
    
    res.status(200).json({ message: "Username updated successfully", token });
  } catch (err) {
    res.status(500).json({error: "Database error"});
  } finally {
    if (conn) conn.release();
  }
});

// PUT /users/profile/password (Protected)
router.put('/profile/password', authenticateToken, async (req, res) => {
  const { newPassword } = req.body;
  let conn;
  try {
    conn = await pool.getConnection();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    await conn.query("UPDATE User SET usr_password = ?, usr_salt = ? WHERE user_id = ?", [hashedPassword, salt, req.user.id]);
    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({error: "Database error"});
  } finally {
    if (conn) conn.release();
  }
});

module.exports = router;