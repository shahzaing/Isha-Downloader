// Multi-platform Media & 4K Photo Resolver for Isha Video Downloader
// Developed by Isha Zahid (Dentist & Creator)

function detectPlatform(url) {
  if (!url || typeof url !== 'string') return 'unknown';
  const cleanUrl = url.toLowerCase();
  if (cleanUrl.includes('tiktok.com')) return 'tiktok';
  if (cleanUrl.includes('instagram.com')) return 'instagram';
  if (cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be')) return 'youtube';
  if (cleanUrl.includes('facebook.com') || cleanUrl.includes('fb.watch') || cleanUrl.includes('fb.com')) return 'facebook';
  if (cleanUrl.includes('twitter.com') || cleanUrl.includes('x.com')) return 'twitter';
  if (cleanUrl.includes('pinterest.com') || cleanUrl.includes('pin.it')) return 'pinterest';
  if (cleanUrl.includes('reddit.com') || cleanUrl.includes('redd.it')) return 'reddit';
  return 'general';
}

// 1. YouTube Engine
async function resolveYouTube(url) {
  let videoId = '';
  try {
    if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0]?.split('/')[0];
    } else if (url.includes('youtube.com/watch')) {
      const u = new URL(url);
      videoId = u.searchParams.get('v');
    } else if (url.includes('youtube.com/shorts/')) {
      videoId = url.split('youtube.com/shorts/')[1]?.split('?')[0]?.split('/')[0];
    } else if (url.includes('youtube.com/embed/')) {
      videoId = url.split('youtube.com/embed/')[1]?.split('?')[0]?.split('/')[0];
    }
  } catch (e) {}

  if (!videoId && url.match(/[a-zA-Z0-9_-]{11}/)) {
    const match = url.match(/[a-zA-Z0-9_-]{11}/);
    if (match) videoId = match[0];
  }

  let title = 'YouTube Video';
  let author = 'YouTube Creator';
  let thumbnail = videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : 'https://www.youtube.com/favicon.ico';

  try {
    const oRes = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId || 'dQw4w9WgXcQ'}&format=json`, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    if (oRes.ok) {
      const oData = await oRes.json();
      if (oData.title) title = oData.title;
      if (oData.author_name) author = oData.author_name;
      if (oData.thumbnail_url) thumbnail = oData.thumbnail_url;
    }
  } catch (e) {}

  const fullYtUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const isShorts = url.includes('/shorts/');

  return {
    success: true,
    platform: 'YouTube',
    title: title,
    author: author,
    thumbnail: thumbnail,
    duration: isShorts ? 'Shorts HD' : 'Full HD 1080p',
    downloads: [
      {
        quality: isShorts ? '1080p Full HD YouTube Shorts' : '1080p Full HD Video (Server 1)',
        resolution: '1080p FHD (1920x1080)',
        url: `https://ssyoutube.com/en173/?url=${encodeURIComponent(fullYtUrl)}`,
        direct: false,
        ext: 'mp4',
        type: 'video',
        badge: '1080p Full HD'
      },
      {
        quality: '720p HD Video (Fast Mobile Server 2)',
        resolution: '720p HD (1280x720)',
        url: `https://10downloader.com/download?v=${encodeURIComponent(fullYtUrl)}`,
        direct: false,
        ext: 'mp4',
        type: 'video',
        badge: '720p HD'
      },
      {
        quality: 'Original Full Audio (MP3 320kbps Studio)',
        resolution: 'MP3 320kbps Audio',
        url: `https://ytmp3.cc/?url=${encodeURIComponent(fullYtUrl)}`,
        direct: false,
        ext: 'mp3',
        type: 'audio',
        badge: '320kbps MP3'
      },
      {
        quality: '4K Ultra HD Poster / Thumbnail',
        resolution: '4K MaxRes Quality',
        url: videoId ? `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg` : thumbnail,
        direct: true,
        ext: 'jpg',
        type: 'photo',
        badge: '4K Thumbnail'
      }
    ]
  };
}

// 2. TikTok Engine
async function resolveTikTok(url) {
  let title = 'TikTok Video (No Watermark)';
  let author = '@tiktok_creator';
  let thumbnail = 'https://assets.tiktok.com/favicon.ico';

  try {
    const oRes = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    if (oRes.ok) {
      const oData = await oRes.json();
      if (oData.title) title = oData.title;
      if (oData.author_name) author = `@${oData.author_unique_id || oData.author_name}`;
      if (oData.thumbnail_url) thumbnail = oData.thumbnail_url;
    }
  } catch (e) {}

  return {
    success: true,
    platform: 'TikTok',
    title: title,
    author: author,
    thumbnail: thumbnail,
    duration: 'HD No Watermark',
    downloads: [
      {
        quality: '1080p Full HD Video (No Watermark - Fast Server 1)',
        resolution: '1080p FHD High Bitrate',
        url: `https://snaptik.app/?url=${encodeURIComponent(url)}`,
        direct: false,
        ext: 'mp4',
        type: 'video',
        badge: '1080p Full HD'
      },
      {
        quality: '720p HD Video (No Watermark - Server 2)',
        resolution: '720p HD Standard',
        url: `https://ssstik.io/en?url=${encodeURIComponent(url)}`,
        direct: false,
        ext: 'mp4',
        type: 'video',
        badge: '720p HD'
      },
      {
        quality: 'Original Background Audio (MP3 320kbps)',
        resolution: 'Audio 320kbps',
        url: `https://lovetik.com/api/download?url=${encodeURIComponent(url)}`,
        direct: false,
        ext: 'mp3',
        type: 'audio',
        badge: '320kbps MP3'
      },
      {
        quality: '4K Ultra HD Cover Photo',
        resolution: '4K Cover Image',
        url: thumbnail,
        direct: true,
        ext: 'jpg',
        type: 'photo',
        badge: '4K Ultra HD'
      }
    ]
  };
}

// 3. Instagram Engine
async function resolveInstagram(url) {
  return {
    success: true,
    platform: 'Instagram',
    title: 'Instagram Post / Reel',
    author: '@instagram_creator',
    thumbnail: 'https://static.cdninstagram.com/rsrc.php/v3/yI/r/VsNE-OHk_8a.png',
    downloads: [
      {
        quality: '4K Ultra HD Photo / Carousel (Server 1)',
        resolution: 'Original 4K Image',
        url: `https://fastdl.app/en?url=${encodeURIComponent(url)}`,
        direct: false,
        ext: 'jpg',
        type: 'photo',
        badge: '4K Ultra HD'
      },
      {
        quality: '1080p Full HD Reel / Video (Server 2)',
        resolution: '1080p FHD High Bitrate',
        url: `https://snapinsta.app/?url=${encodeURIComponent(url)}`,
        direct: false,
        ext: 'mp4',
        type: 'video',
        badge: '1080p Full HD'
      },
      {
        quality: '720p HD Video / Reel',
        resolution: '720p HD Standard',
        url: `https://saveig.app/en?url=${encodeURIComponent(url)}`,
        direct: false,
        ext: 'mp4',
        type: 'video',
        badge: '720p HD'
      },
      {
        quality: 'Original Reel Audio (MP3 320kbps)',
        resolution: 'Audio 320kbps',
        url: `https://fastdl.app/en?url=${encodeURIComponent(url)}`,
        direct: false,
        ext: 'mp3',
        type: 'audio',
        badge: '320kbps MP3'
      }
    ]
  };
}

// 4. Pinterest Engine (Direct 4K Image)
async function resolvePinterest(url) {
  let photoUrl = url;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    const html = await res.text();
    const imgMatch = html.match(/https:\/\/i\.pinimg\.com\/(?:originals|\d+x)\/[a-zA-Z0-9_\-\/]+\.(?:jpg|png|webp)/g);
    if (imgMatch && imgMatch.length > 0) {
      photoUrl = imgMatch[0].replace(/\/\d+x\//, '/originals/');
    }
  } catch (e) {}

  const isDirectPhoto = photoUrl.startsWith('https://i.pinimg.com');

  return {
    success: true,
    platform: 'Pinterest',
    title: 'Pinterest 4K Aesthetic Pin / Wallpaper',
    author: 'Pinterest Creator',
    thumbnail: isDirectPhoto ? photoUrl : 'https://s.pinimg.com/images/favicon_red_192.png',
    downloads: [
      {
        quality: '4K Ultra HD Photo / Wallpaper (Direct File)',
        resolution: '4K Originals (Uncompressed)',
        url: photoUrl,
        direct: isDirectPhoto,
        ext: 'jpg',
        type: 'photo',
        badge: '4K Ultra HD'
      },
      {
        quality: '1080p Full HD Video Pin / Image (Server 2)',
        resolution: '1080p FHD',
        url: `https://pinterestvideodownloader.com/?url=${encodeURIComponent(url)}`,
        direct: false,
        ext: 'mp4',
        type: 'video',
        badge: '1080p Full HD'
      }
    ]
  };
}

// Master Media Resolver
async function resolveMedia(url) {
  if (!url || typeof url !== 'string') {
    throw new Error('Please provide a valid video link.');
  }

  const trimmed = url.trim();
  const platform = detectPlatform(trimmed);

  if (platform === 'youtube') return await resolveYouTube(trimmed);
  if (platform === 'tiktok') return await resolveTikTok(trimmed);
  if (platform === 'instagram') return await resolveInstagram(trimmed);
  if (platform === 'pinterest') return await resolvePinterest(trimmed);

  return {
    success: true,
    platform: platform.toUpperCase(),
    title: 'Social Media Post / Video',
    author: 'Content Creator',
    thumbnail: 'hero-avatar.jpg',
    downloads: [
      {
        quality: '1080p Full HD Video',
        resolution: '1080p FHD MP4',
        url: `https://savefrom.net/#url=${encodeURIComponent(trimmed)}`,
        direct: false,
        ext: 'mp4',
        type: 'video',
        badge: '1080p Full HD'
      },
      {
        quality: '720p HD Video',
        resolution: '720p HD MP4',
        url: `https://savefrom.net/#url=${encodeURIComponent(trimmed)}`,
        direct: false,
        ext: 'mp4',
        type: 'video',
        badge: '720p HD'
      },
      {
        quality: 'Original Audio (MP3 320kbps)',
        resolution: 'Audio 320kbps',
        url: `https://ytmp3.cc/?url=${encodeURIComponent(trimmed)}`,
        direct: false,
        ext: 'mp3',
        type: 'audio',
        badge: '320kbps MP3'
      }
    ]
  };
}

// Vercel Serverless Function Handler
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  let targetUrl = '';
  try {
    if (req.body) {
      if (typeof req.body === 'object' && req.body.url) {
        targetUrl = req.body.url;
      } else if (typeof req.body === 'string') {
        const parsed = JSON.parse(req.body);
        targetUrl = parsed.url;
      }
    }
    if (!targetUrl && req.query && req.query.url) {
      targetUrl = req.query.url;
    }
  } catch (e) {}

  if (!targetUrl) {
    return res.status(400).json({ success: false, error: 'URL parameter is required.' });
  }

  try {
    const data = await resolveMedia(targetUrl);
    return res.status(200).json(data);
  } catch (err) {
    console.error('Resolver error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Error resolving media.' });
  }
};

module.exports.resolveMedia = resolveMedia;
module.exports.detectPlatform = detectPlatform;
