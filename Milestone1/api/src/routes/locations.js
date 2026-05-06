const express = require('express');
const router = express.Router();
const locationsData = require('../data/locations.json');

// GET /locations/desks
router.get('/desks', (req, res) => {
  res.status(200).json(locationsData);
});

module.exports = router;