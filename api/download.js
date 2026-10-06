// Stream / Download proxy for Isha Video Downloader
// Forces Content-Disposition attachment so browser saves to disk instead of playing

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const fileUrl = req.query.url;
  const filename = req.query.filename || `Isha_Download_${Date.now()}`;
  const ext = req.query.ext || 'mp4';

  if (!fileUrl) {
    return res.status(400).json({ error: 'URL parameter is required.' });
  }

  const cleanFilename = filename.endsWith(`.${ext}`) ? filename : `${filename}.${ext}`;

  try {
    const upstream = await fetch(fileUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!upstream.ok) {
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(cleanFilename)}"`);
      return res.redirect(302, fileUrl);
    }

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(cleanFilename)}"`);

    const arrayBuffer = await upstream.arrayBuffer();
    return res.send(Buffer.from(arrayBuffer));
  } catch (err) {
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(cleanFilename)}"`);
    return res.redirect(302, fileUrl);
  }
};
