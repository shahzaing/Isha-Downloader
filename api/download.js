// Stream / Download proxy for Isha Video Downloader
// Forces Content-Disposition headers for direct mobile and desktop downloads

async function handleDownloadProxy(req, res) {
  try {
    const fileUrl = req.query.url;
    const filename = req.query.filename || `IshaDownloader_${Date.now()}.mp4`;
    const ext = req.query.ext || 'mp4';

    if (!fileUrl) {
      return res.status(400).json({ error: 'URL is required for download proxy' });
    }

    const cleanFilename = filename.endsWith(`.${ext}`) ? filename : `${filename}.${ext}`;

    // Fetch upstream media
    const upstreamRes = await fetch(fileUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!upstreamRes.ok) {
      return res.redirect(fileUrl);
    }

    const contentType = upstreamRes.headers.get('content-type') || (ext === 'mp3' ? 'audio/mpeg' : 'video/mp4');
    const contentLength = upstreamRes.headers.get('content-length');

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(cleanFilename)}"`);
    if (contentLength) {
      res.setHeader('Content-Length', contentLength);
    }

    // Stream response
    const arrayBuffer = await upstreamRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return res.send(buffer);
  } catch (err) {
    console.error('Download stream error:', err.message);
    if (req.query.url) {
      return res.redirect(req.query.url);
    }
    return res.status(500).json({ error: 'Failed to process media download' });
  }
}

module.exports = {
  handleDownloadProxy
};
