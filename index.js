// Entry point for Vercel deployment
const express = require('express');
const path = require('path');
const app = express();

// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, 'frontend')));

// Handle all routes by serving the main HTML file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

module.exports = app;