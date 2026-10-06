// Vercel Serverless Handler for Isha Video Downloader
const express = require('express');
const cors = require('cors');
const { resolveMedia } = require('./resolve');
const { handleDownloadProxy } = require('./download');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/resolve', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, error: 'Please enter a valid video link' });
    }
    const mediaInfo = await resolveMedia(url);
    return res.json(mediaInfo);
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Unable to download this video. Please ensure the link is public.'
    });
  }
});

app.get('/api/download', handleDownloadProxy);

app.get('/api/health', (req, res) => {
  res.json({ status: 'active', service: 'Isha Video Downloader', author: 'Isha Zahid' });
});

module.exports = app;
