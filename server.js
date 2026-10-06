// Isha Video Downloader - Universal Server (Local & Vercel Express Preset)
// Developed by Isha Zahid (Dentist & Creator)

const express = require('express');
const cors = require('cors');
const path = require('path');
const resolveHandler = require('./api/resolve');
const downloadHandler = require('./api/download');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets from public and root
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));

// API Routes
app.all('/api/resolve', (req, res) => {
  return resolveHandler(req, res);
});

app.all('/api/download', (req, res) => {
  return downloadHandler(req, res);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'active', service: 'Isha Video Downloader', author: 'Isha Zahid' });
});

// Root / Fallback route
app.get('*', (req, res) => {
  const publicIndex = path.join(__dirname, 'public', 'index.html');
  const rootIndex = path.join(__dirname, 'index.html');
  res.sendFile(publicIndex, (err) => {
    if (err) {
      res.sendFile(rootIndex);
    }
  });
});

// Start local server if not running as serverless function
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Isha Downloader Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
