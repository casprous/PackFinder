const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /locations/desks
router.get('/desks', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query('SELECT loc_id as id, loc_name as name, loc_lat as lat, loc_lon as lng FROM Location WHERE is_desk = 1');
    
    const locations = rows.map(r => ({
        id: r.id,
        name: r.name,
        coordinates: { lat: parseFloat(r.lat), lng: parseFloat(r.lng) }
    }));
    
    res.status(200).json(locations);
  } catch (err) {
    console.error(err);
    res.status(500).json({error: "Database error"});
  } finally {
    if (conn) conn.release();
  }
});

module.exports = router;