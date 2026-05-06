const express = require('express');

const app = express();
const PORT = process.env.PORT || 80;

// Middleware to parse JSON bodies automatically
app.use(express.json());

// Import Routers
const usersRouter = require('./routes/users');
const itemsRouter = require('./routes/items');
const locationsRouter = require('./routes/locations');

// Mount Routers
app.use('/users', usersRouter);
app.use('/items', itemsRouter);
app.use('/locations', locationsRouter);

// Ask our server to listen for incoming connections
app.listen(PORT, () => console.log(`Server listening on port: ${PORT}`));