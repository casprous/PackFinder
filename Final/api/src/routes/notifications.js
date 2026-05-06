const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const pool = require('../db');
const webpush = require('web-push');

// Configure web-push with keys
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Get all notifications for the logged-in user
router.get('/', authenticateToken, async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const notifications = await conn.query(
            "SELECT * FROM Notification WHERE notif_usr_id = ? ORDER BY notif_created_at DESC",
            [req.user.id]
        );
        
        // Count unread
        const unreadCount = notifications.filter(n => !n.notif_is_read).length;
        
        res.json({ unreadCount, notifications });
    } catch (err) {
        res.status(500).json({ error: "Database error" });
    } finally {
        if (conn) conn.release();
    }
});

// Mark a notification as read
router.put('/:id/read', authenticateToken, async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        await conn.query(
            "UPDATE Notification SET notif_is_read = TRUE WHERE notif_id = ? AND notif_usr_id = ?",
            [req.params.id, req.user.id]
        );
        res.json({ message: "Marked as read" });
    } catch (err) {
        res.status(500).json({ error: "Database error" });
    } finally {
        if (conn) conn.release();
    }
});


// POST /notifications/subscribe (Save push subscription)
router.post('/subscribe', authenticateToken, async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const subscription = req.body;

        // Use REPLACE INTO or handle duplicates so we don't crash if they resubscribe
        await conn.query(
            `INSERT INTO Push_Subscription (sub_usr_id, sub_endpoint, sub_p256dh, sub_auth) 
             VALUES (?, ?, ?, ?) 
             ON DUPLICATE KEY UPDATE sub_usr_id = ?`,
            [req.user.id, subscription.endpoint, subscription.keys.p256dh, subscription.keys.auth, req.user.id]
        );
        res.status(201).json({});
    } catch (err) {
        console.error("Subscription Error:", err);
        res.status(500).json({ error: "Database error" });
    } finally {
        if (conn) conn.release();
    }
});

module.exports = router;