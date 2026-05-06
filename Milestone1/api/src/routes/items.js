const express = require('express');
const router = express.Router();
const postsData = require('../data/posts.json');

// GET /items
router.get('/', (req, res) => {
  // Maybe add logic here later to filter by req.query.category or req.query.location
  res.status(200).json(postsData);
});

// POST /items
router.post('/', (req, res) => {
  const newItem = { id: Date.now(), ...req.body, status: "lost" };
  postsData.push(newItem);
  res.status(201).json({ message: "Item post created successfully", item: newItem });
});

// GET /items/:itemId
router.get('/:itemId', (req, res) => {
  const item = postsData.find(p => p.id === parseInt(req.params.itemId));
  if (item) {
    res.status(200).json(item);
  } else {
    res.status(404).json({ error: "Item not found" });
  }
});

// PUT /items/:itemId/status
router.put('/:itemId/status', (req, res) => {
  const { status } = req.body;
  res.status(200).json({ 
    message: `Status of item ${req.params.itemId} updated successfully`, 
    newStatus: status 
  });
});

module.exports = router;