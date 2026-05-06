const express = require('express');
const router = express.Router();
const usersData = require('../data/users.json');

// POST /users/register
router.post('/register', (req, res) => {
  const newUser = { id: Date.now(), ...req.body };
  postsData.push(newUser);
  res.status(201).json({ message: "User registered successfully", user: newUser });
});

// POST /users/login
router.post('/login', (req, res) => {
  res.status(200).json({ message: "Login successful", token: "mock-jwt-token" });
});

// POST /users/logout
router.post('/logout', (req, res) => {
  res.status(200).json({ message: "Logout successful" });
});

// GET /users/profile
router.get('/profile', (req, res) => {
  // Return a mock user profile for the currently authenticated user
  res.status(200).json(usersData[0]); 
});

module.exports = router;