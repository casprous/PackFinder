const jwt = require('jsonwebtoken');
const API_SECRET_KEY = process.env.API_SECRET_KEY;

const authenticateToken = (req, res, next) => {
  // Grab the token from the "Authorization: Bearer <token>" header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: "Access denied. No token provided." });

  jwt.verify(token, API_SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid or expired token." });
    
    // Attach the decoded user payload to the request object
    req.user = user;
    next();
  });
};

module.exports = authenticateToken;