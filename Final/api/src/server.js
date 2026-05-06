const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 80;

// Middleware to parse JSON bodies automatically
app.use(express.json());

// Serve the uploads folder statically so the frontend can request the images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import Routers
const usersRouter = require('./routes/users');
const itemsRouter = require('./routes/items');
const locationsRouter = require('./routes/locations');
const notificationsRouter = require('./routes/notifications');

// Mount Routers
app.use('/users', usersRouter);
app.use('/items', itemsRouter);
app.use('/locations', locationsRouter);
app.use('/notifications', notificationsRouter);


// Ask our server to listen for incoming connections
app.listen(PORT, () => console.log(`Server listening on port: ${PORT}`));