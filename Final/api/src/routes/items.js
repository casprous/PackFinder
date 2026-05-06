const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const pool = require('../db');
const multer = require('multer');
const path = require('path');
const webpush = require('web-push');

// Configure web-push with keys
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

const upload = multer({ dest: path.join(__dirname, '../uploads/') });

// GET /items (Fetch all posts with all replies)
router.get('/', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();

    // Fetch the posts
    let query = `
        SELECT i.item_id as id, u.usr_username as user, i.item_name as title,
               i.item_desc as description, l.loc_name as location,
               i.item_status as status, l.loc_lat as lat, l.loc_lon as lng,
               i.item_image as image, i.created_at as timestamp
        FROM item i
        JOIN User_Items ui ON i.item_id = ui.USI_item_id
        JOIN User u ON ui.USI_usr_id = u.user_id
        LEFT JOIN Item_Location il ON i.item_id = il.IL_item_id
        LEFT JOIN Location l ON il.IL_loc_id = l.loc_id
        ORDER BY i.item_id DESC
    `;
    let params = [];

    if (req.query.user) {
        query = `
            SELECT i.item_id as id, u.usr_username as user, i.item_name as title,
                   i.item_desc as description, l.loc_name as location,
                   i.item_status as status, l.loc_lat as lat, l.loc_lon as lng,
                   i.item_image as image, i.created_at as timestamp
            FROM item i
            JOIN User_Items ui ON i.item_id = ui.USI_item_id
            JOIN User u ON ui.USI_usr_id = u.user_id
            LEFT JOIN Item_Location il ON i.item_id = il.IL_item_id
            LEFT JOIN Location l ON il.IL_loc_id = l.loc_id
            WHERE u.usr_username = ?
            ORDER BY i.item_id DESC
        `;
        params.push(req.query.user);
    }

    const itemRows = await conn.query(query, params);

    // Fetch all replies joined with the User table to get the actual usernames
    const replyRows = await conn.query(`
        SELECT r.reply_item_id, u.usr_username, r.reply_text
        FROM Reply r
        JOIN User u ON r.reply_usr_id = u.user_id
        ORDER BY r.reply_created_at ASC
    `);

    // Map everything together
    const posts = itemRows.map(r => {
        // Filter out the replies that specifically belong to this item
        const itemReplies = replyRows
            .filter(reply => reply.reply_item_id === r.id)
            .map(reply => ({ user: reply.usr_username, text: reply.reply_text }));

        return {
            id: r.id,
            user: r.user,
            title: r.title,
            description: r.description,
            location: r.location || "Unknown Location",
            status: r.status,
            image: r.image,
            coordinates: r.lat && r.lng ? { lat: parseFloat(r.lat), lng: parseFloat(r.lng) } : null,
            timestamp: r.timestamp,
            replies: itemReplies // Attach the full array of replies
        };
    });

    res.status(200).json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({error: "Database error"});
  } finally {
    if (conn) conn.release();
  }
});

// GET /items/:itemId (Fetch a single post by ID)
router.get('/:itemId', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const itemId = req.params.itemId;

    const itemRows = await conn.query(`
      SELECT i.item_id as id, u.usr_username as user, i.item_name as title,
             i.item_desc as description, l.loc_name as location,
             i.item_status as status, l.loc_lat as lat, l.loc_lon as lng,
             i.item_image as image, i.created_at as timestamp
      FROM item i
      JOIN User_Items ui ON i.item_id = ui.USI_item_id
      JOIN User u ON ui.USI_usr_id = u.user_id
      LEFT JOIN Item_Location il ON i.item_id = il.IL_item_id
      LEFT JOIN Location l ON il.IL_loc_id = l.loc_id
      WHERE i.item_id = ?
    `, [itemId]);

    if (itemRows.length === 0) return res.status(404).json({ error: "Item not found" });

    const replyRows = await conn.query(`
      SELECT r.reply_item_id, u.usr_username, r.reply_text
      FROM Reply r
      JOIN User u ON r.reply_usr_id = u.user_id
      WHERE r.reply_item_id = ?
      ORDER BY r.reply_created_at ASC
    `, [itemId]);

    const r = itemRows[0];
    const post = {
      id: r.id,
      user: r.user,
      title: r.title,
      description: r.description,
      location: r.location || "Unknown Location",
      status: r.status,
      image: r.image,
      coordinates: r.lat && r.lng ? { lat: parseFloat(r.lat), lng: parseFloat(r.lng) } : null,
      timestamp: r.timestamp,
      replies: replyRows.map(reply => ({ user: reply.usr_username, text: reply.reply_text }))
    };

    res.status(200).json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  } finally {
    if (conn) conn.release();
  }
});

// POST /items (Create post with image)
router.post('/', authenticateToken, upload.single('image'), async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();
    
    const { title, description, location, status, lat, lng } = req.body;
    const imageFilename = req.file ? req.file.filename : null; 

    const itemResult = await conn.query(
        "INSERT INTO item (item_name, item_desc, item_status, item_image) VALUES (?, ?, ?, ?)",
        [title, description, status || "Lost", imageFilename]
    );
    const newItemId = Number(itemResult.insertId);

    await conn.query(
        "INSERT INTO User_Items (USI_usr_id, USI_item_id) VALUES (?, ?)",
        [req.user.id, newItemId]
    );

    if (lat && lng && lat !== 'null' && lng !== 'null') {
        const locResult = await conn.query(
            "INSERT INTO Location (loc_name, loc_lat, loc_lon) VALUES (?, ?, ?)",
            [location || "Pinned Location", lat, lng]
        );
        await conn.query(
            "INSERT INTO Item_Location (IL_item_id, IL_loc_id) VALUES (?, ?)",
            [newItemId, Number(locResult.insertId)]
        );
    }

    await conn.commit();
    res.status(201).json({ message: "Item post created successfully!" });
  } catch (err) {
    if (conn) await conn.rollback();
    res.status(500).json({error: "Database error"});
  } finally {
    if (conn) conn.release();
  }
});

// PUT /items/:itemId/status (Update status and notify owner)
router.put('/:itemId/status', authenticateToken, async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const { status } = req.body;
        const itemId = req.params.itemId;

        const ownerRows = await conn.query("SELECT USI_usr_id FROM User_Items WHERE USI_item_id = ?", [itemId]);

        if (ownerRows.length === 0) return res.status(404).json({ error: "Item not found" });

        const ownerId = ownerRows[0].USI_usr_id;

        if (ownerId !== req.user.id) return res.status(403).json({ error: "You are not authorized to update this item." });

        await conn.query("UPDATE item SET item_status = ? WHERE item_id = ?", [status, itemId]);

        res.status(200).json({ message: "Status updated successfully" });
    } catch (err) {
        console.error("Status Update Error:", err);
        res.status(500).json({ error: "Database error" });
    } finally {
        if (conn) conn.release();
    }
});

// POST /items/:itemId/replies (Add reply and notify owner)
router.post('/:itemId/replies', authenticateToken, async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const { text } = req.body;
        const itemId = req.params.itemId;

        // Insert the reply into the database
        await conn.query(
            "INSERT INTO Reply (reply_item_id, reply_usr_id, reply_text) VALUES (?, ?, ?)",
            [itemId, req.user.id, text]
        );

        const ownerRows = await conn.query("SELECT USI_usr_id FROM User_Items WHERE USI_item_id = ?", [itemId]);
        if (ownerRows.length > 0) {
            const ownerId = ownerRows[0].USI_usr_id; // Defined here
            
            // Only notify if the person replying isn't the owner
            if (ownerId !== req.user.id) {
                // 1. Insert In-App Notification
                await conn.query(
                    "INSERT INTO Notification (notif_usr_id, notif_item_id, notif_type, notif_message) VALUES (?, ?, ?, ?)",
                    [ownerId, itemId, 'reply', `${req.user.username} left a reply on your post.`]
                );

                // 2. Send Web Push Notification
                const subRows = await conn.query("SELECT * FROM Push_Subscription WHERE sub_usr_id = ?", [ownerId]);
                const pushPayload = JSON.stringify({
                    title: 'New Reply on PackFinder',
                    body: `${req.user.username} left a reply on your post.`,
                    url: `/forum.html?item=${itemId}`
                });

                for (let sub of subRows) {
                    const pushConfig = {
                        endpoint: sub.sub_endpoint,
                        keys: { auth: sub.sub_auth, p256dh: sub.sub_p256dh }
                    };
                    try {
                        await webpush.sendNotification(pushConfig, pushPayload);
                    } catch (error) {
                        if (error.statusCode === 404 || error.statusCode === 410) {
                            await conn.query("DELETE FROM Push_Subscription WHERE sub_id = ?", [sub.sub_id]);
                        }
                    }
                }
            }
        }

        res.status(201).json({ message: "Reply added successfully" });
    } catch (err) {
        console.error("Reply Error:", err);
        res.status(500).json({ error: "Database error" });
    } finally {
        if (conn) conn.release();
    }
});

module.exports = router;