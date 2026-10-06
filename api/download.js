// Stream / Direct Download Proxy for Isha Video Downloader
// Developed by Isha Zahid (Dentist & Creator)

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const fileUrl = req.query.url;
  const filename = req.query.filename || `IshaDownloader_${Date.now()}`;
  const ext = req.query.ext || 'mp4';

  if (!fileUrl) {
    return res.status(400).json({ error: 'URL parameter is required.' });
  }

  const cleanFilename = filename.endsWith(`.${ext}`) ? filename : `${filename}.${ext}`;

  try {
    const upstreamRes = await fetch(fileUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!upstreamRes.ok) {
      return res.status(404).json({ error: 'Upstream media stream not available directly.' });
    }

    const contentType = upstreamRes.headers.get('content-type') || (ext === 'mp3' ? 'audio/mpeg' : (ext === 'jpg' ? 'image/jpeg' : 'video/mp4'));
    const contentLength = upstreamRes.headers.get('content-length');

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(cleanFilename)}"`);
    if (contentLength) {
      res.setHeader('Content-Length', contentLength);
    }

    const arrayBuffer = await upstreamRes.arrayBuffer();
    return res.send(Buffer.from(arrayBuffer));
  } catch (err) {
    return res.status(500).json({ error: 'Failed to process media download.' });
  }
};
