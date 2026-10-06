// Stream / Download proxy for Isha Video Downloader
// Developed by Isha Zahid

async function handleDownloadProxy(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const fileUrl = req.query.url;
    const filename = req.query.filename || `IshaDownloader_${Date.now()}.mp4`;
    const ext = req.query.ext || 'mp4';

    if (!fileUrl) {
      return res.status(400).json({ error: 'URL is required for download proxy' });
    }

    const cleanFilename = filename.endsWith(`.${ext}`) ? filename : `${filename}.${ext}`;

    if (!fileUrl.startsWith('http')) {
      return res.status(400).json({ error: 'Invalid URL provided' });
    }

    // Direct 302 redirect for maximum speed and zero memory overhead on Vercel
    return res.redirect(302, fileUrl);
  } catch (err) {
    if (req.query.url) {
      return res.redirect(302, req.query.url);
    }
    return res.status(500).json({ error: 'Failed to process media download' });
  }
}

module.exports = handleDownloadProxy;
module.exports.handleDownloadProxy = handleDownloadProxy;
