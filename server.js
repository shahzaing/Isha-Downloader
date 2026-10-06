// Isha Video Downloader - Main Server
// Developed by Isha Zahid

const express = require('express');
const cors = require('cors');
const path = require('path');
const { resolveMedia, detectPlatform } = require('./api/resolve');
const { handleDownloadProxy } = require('./api/download');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API Endpoint: Detect & Resolve Video Link
app.post('/api/resolve', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, error: 'Please enter a valid video link' });
    }

    const mediaInfo = await resolveMedia(url);
    return res.json(mediaInfo);
  } catch (error) {
    console.error('Resolve Error:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message || 'Unable to download this video. Please ensure the link is public.'
    });
  }
});

// API Endpoint: Download / Stream Proxy for direct downloads
app.get('/api/download', handleDownloadProxy);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'active', service: 'Isha Video Downloader', author: 'Isha Zahid' });
});

// Fallback to index.html for single page web app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`✨ Isha Video Downloader by Isha Zahid`);
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`=================================================`);
  });
}

module.exports = app;
