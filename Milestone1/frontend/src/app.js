const express = require('express');

const app = express();
const PORT = process.env.PORT || 80;

// Designate the static folder as serving static resources (CSS, JS)
app.use(express.static(__dirname + '/static'));

// Route for the root index page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/templates/index.html');
});

// Routes for application pages
app.get('/home.html', (req, res) => {
  res.sendFile(__dirname + '/templates/home.html');
});

app.get('/login.html', (req, res) => {
  res.sendFile(__dirname + '/templates/login.html');
});

app.get('/forum.html', (req, res) => {
  res.sendFile(__dirname + '/templates/forum.html');
});

app.get('/profile.html', (req, res) => {
  res.sendFile(__dirname + '/templates/profile.html');
});

app.get('/map.html', (req, res) => {
  res.sendFile(__dirname + '/templates/map.html');
});

app.get('/post.html', (req, res) => {
  res.sendFile(__dirname + '/templates/post.html');
});

// Ask our server to listen for incoming connections
app.listen(PORT, () => console.log(`Server listening on port: ${PORT}`));