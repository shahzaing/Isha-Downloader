// Stream & Direct Binary Downloader Proxy for Isha Video Downloader
// Developed by Isha Zahid (Dentist & Creator)

const { spawn, spawnSync } = require('child_process');

function hasYtDlp() {
  try {
    const res = spawnSync('yt-dlp', ['--version']);
    return res.status === 0;
  } catch (e) {
    return false;
  }
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const directUrl = req.query.url;
  const sourceUrl = req.query.sourceUrl;
  const format = req.query.format || 'bestvideo+bestaudio/best';
  const rawFilename = req.query.filename || `IshaDownloader_${Date.now()}`;
  const ext = req.query.ext || 'mp4';

  const cleanFilename = rawFilename.endsWith(`.${ext}`) ? rawFilename : `${rawFilename}.${ext}`;
  const encodedFilename = encodeURIComponent(cleanFilename).replace(/['()]/g, escape);

  // 1. If yt-dlp is available and sourceUrl is requested (Render/Docker/Local)
  if (sourceUrl && hasYtDlp()) {
    try {
      res.setHeader('Content-Type', ext === 'mp3' ? 'audio/mpeg' : (ext === 'jpg' ? 'image/jpeg' : 'video/mp4'));
      res.setHeader('Content-Disposition', `attachment; filename="${encodedFilename}"; filename*=UTF-8''${encodedFilename}`);

      const ytdlpArgs = [
        '-f', format,
        '-o', '-',
        '--no-playlist',
        '--no-warnings',
        sourceUrl
      ];

      const proc = spawn('yt-dlp', ytdlpArgs);

      proc.stdout.pipe(res);

      proc.stderr.on('data', (data) => {
        // Log in background if needed
      });

      req.on('close', () => {
        try {
          proc.kill();
        } catch (e) {}
      });

      proc.on('error', (err) => {
        if (!res.headersSent) {
          res.status(500).json({ error: 'Failed to process media with yt-dlp.' });
        }
      });

      return;
    } catch (e) {
      if (!res.headersSent) {
        return res.status(500).json({ error: 'yt-dlp execution failed.' });
      }
    }
  }

  // 2. Direct CDN stream proxy (TikTok, Pinterest, Instagram, Facebook CDN)
  const targetUrl = directUrl || sourceUrl;

  if (!targetUrl) {
    return res.status(400).json({ error: 'URL parameter is required.' });
  }

  try {
    const upstreamRes = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!upstreamRes.ok) {
      return res.status(upstreamRes.status).json({ error: 'Upstream media stream not available directly.' });
    }

    const contentType = upstreamRes.headers.get('content-type') || (ext === 'mp3' ? 'audio/mpeg' : (ext === 'jpg' ? 'image/jpeg' : 'video/mp4'));
    const contentLength = upstreamRes.headers.get('content-length');

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${encodedFilename}"; filename*=UTF-8''${encodedFilename}`);
    if (contentLength) {
      res.setHeader('Content-Length', contentLength);
    }

    const arrayBuffer = await upstreamRes.arrayBuffer();
    return res.send(Buffer.from(arrayBuffer));
  } catch (err) {
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Failed to stream media download.' });
    }
  }
};
