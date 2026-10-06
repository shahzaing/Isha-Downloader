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

// 1. YouTube Full-Length & Shorts Engine
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
  const maxThumbnail = videoId ? `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg` : thumbnail;

  return {
    success: true,
    platform: 'YouTube',
    title: title,
    author: author,
    thumbnail: maxThumbnail,
    duration: isShorts ? 'Shorts HD' : 'Full HD 1080p',
    downloads: [
      {
        quality: isShorts ? '1080p Full HD YouTube Shorts' : '1080p Full HD Video (Direct MP4)',
        resolution: '1080p FHD (1920x1080)',
        url: `https://loader.to/api/button/?url=${encodeURIComponent(fullYtUrl)}&f=1080`,
        isLoader: true,
        ext: 'mp4',
        type: 'video',
        badge: '1080p Full HD'
      },
      {
        quality: '720p HD Video (Fast Direct MP4)',
        resolution: '720p HD (1280x720)',
        url: `https://loader.to/api/button/?url=${encodeURIComponent(fullYtUrl)}&f=720`,
        isLoader: true,
        ext: 'mp4',
        type: 'video',
        badge: '720p HD'
      },
      {
        quality: 'Original Full Audio (MP3 320kbps Studio)',
        resolution: 'MP3 320kbps Audio',
        url: `https://loader.to/api/button/?url=${encodeURIComponent(fullYtUrl)}&f=mp3`,
        isLoader: true,
        ext: 'mp3',
        type: 'audio',
        badge: '320kbps MP3'
      },
      {
        quality: '4K Ultra HD Poster / Thumbnail',
        resolution: '4K MaxRes Quality',
        url: maxThumbnail,
        isLoader: false,
        ext: 'jpg',
        type: 'photo',
        badge: '4K Thumbnail'
      }
    ]
  };
}

// 2. TikTok Direct Engine (No Watermark)
async function resolveTikTok(url) {
  try {
    const res = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}&hd=1`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://www.tikwm.com/'
      }
    });
    const data = await res.json();

    if (data && data.code === 0 && data.data) {
      const item = data.data;
      const downloads = [];

      if (item.images && Array.isArray(item.images)) {
        item.images.forEach((imgUrl, idx) => {
          downloads.push({
            quality: `4K Ultra HD Photo #${idx + 1}`,
            resolution: 'Original 4K Image',
            url: imgUrl,
            ext: 'jpg',
            type: 'photo',
            badge: '4K Ultra HD'
          });
        });
      }

      if (item.hdplay || item.play) {
        const streamUrl = item.hdplay || item.play;
        const fullUrl = streamUrl.startsWith('http') ? streamUrl : `https://www.tikwm.com${streamUrl}`;
        downloads.push({
          quality: '1080p Full HD Video (No Watermark)',
          resolution: '1080p FHD Direct MP4',
          url: fullUrl,
          ext: 'mp4',
          type: 'video',
          badge: '1080p Full HD'
        });
      }

      if (item.music) {
        const musicUrl = item.music.startsWith('http') ? item.music : `https://www.tikwm.com${item.music}`;
        downloads.push({
          quality: 'Original Background Audio (MP3 320kbps)',
          resolution: 'Audio 320kbps',
          url: musicUrl,
          ext: 'mp3',
          type: 'audio',
          badge: '320kbps MP3'
        });
      }

      if (downloads.length > 0) {
        return {
          success: true,
          platform: 'TikTok',
          title: item.title || 'TikTok Video by ' + (item.author?.nickname || 'Creator'),
          author: item.author?.nickname ? `@${item.author.unique_id} (${item.author.nickname})` : '@tiktok_user',
          thumbnail: item.cover || item.origin_cover,
          duration: item.duration ? `${item.duration}s` : 'HD Clip',
          downloads
        };
      }
    }
  } catch (e) {}

  return null;
}

// 3. Instagram Direct Engine (Reels & 4K Photos)
async function resolveInstagram(url) {
  try {
    const cleanUrl = url.split('?')[0].replace(/\/$/, '') + '/?__a=1&__d=dis';
    const res = await fetch(cleanUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });

    if (res.ok) {
      const data = await res.json();
      const items = data.items || (data.graphql && [data.graphql.shortcode_media]);
      if (items && items.length > 0) {
        const item = items[0];
        const downloads = [];

        if (item.carousel_media && Array.isArray(item.carousel_media)) {
          item.carousel_media.forEach((cItem, idx) => {
            const photoUrl = cItem.image_versions2?.candidates[0]?.url;
            if (photoUrl) {
              downloads.push({
                quality: `4K Ultra HD Photo #${idx + 1}`,
                resolution: 'Original 4K Image',
                url: photoUrl,
                ext: 'jpg',
                type: 'photo',
                badge: '4K Ultra HD'
              });
            }
          });
        } else if (item.image_versions2?.candidates?.length > 0) {
          downloads.push({
            quality: '4K Ultra HD Photo / Post',
            resolution: 'Original 4K Image',
            url: item.image_versions2.candidates[0].url,
            ext: 'jpg',
            type: 'photo',
            badge: '4K Ultra HD'
          });
        }

        const videoUrl = item.video_versions ? item.video_versions[0]?.url : item.video_url;
        if (videoUrl) {
          downloads.push({
            quality: '1080p Full HD Video / Reel',
            resolution: '1080p FHD Direct MP4',
            url: videoUrl,
            ext: 'mp4',
            type: 'video',
            badge: '1080p Full HD'
          });
        }

        if (downloads.length > 0) {
          return {
            success: true,
            platform: 'Instagram',
            title: item.caption?.text ? item.caption.text.slice(0, 80) + '...' : 'Instagram Reel / Photo',
            author: item.user?.username ? `@${item.user.username}` : '@instagram_creator',
            thumbnail: item.image_versions2 ? item.image_versions2.candidates[0]?.url : item.display_url,
            downloads
          };
        }
      }
    }
  } catch (err) {}

  return null;
}

// 4. Pinterest 4K Direct Photo & Video Engine
async function resolvePinterest(url) {
  let photoUrl = url;
  let videoUrl = null;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    const html = await res.text();
    const imgMatch = html.match(/https:\/\/i\.pinimg\.com\/(?:originals|\d+x)\/[a-zA-Z0-9_\-\/]+\.(?:jpg|png|webp)/g);
    if (imgMatch && imgMatch.length > 0) {
      photoUrl = imgMatch[0].replace(/\/\d+x\//, '/originals/');
    }
    const vidMatch = html.match(/https:\/\/[^"']+\.pinimg\.com\/videos\/[a-zA-Z0-9_\-\/]+\.mp4/g);
    if (vidMatch && vidMatch.length > 0) {
      videoUrl = vidMatch[0];
    }
  } catch (e) {}

  const isDirectPhoto = photoUrl.startsWith('https://i.pinimg.com');
  const downloads = [];

  if (isDirectPhoto) {
    downloads.push({
      quality: '4K Ultra HD Photo / Wallpaper (Direct File)',
      resolution: '4K Originals (Uncompressed)',
      url: photoUrl,
      ext: 'jpg',
      type: 'photo',
      badge: '4K Ultra HD'
    });
  }

  if (videoUrl) {
    downloads.push({
      quality: '1080p Full HD Video Pin (Direct MP4)',
      resolution: '1080p FHD Direct MP4',
      url: videoUrl,
      ext: 'mp4',
      type: 'video',
      badge: '1080p Full HD'
    });
  }

  if (downloads.length === 0) {
    downloads.push({
      quality: '4K Ultra HD Photo / Wallpaper',
      resolution: '4K Originals',
      url: photoUrl,
      ext: 'jpg',
      type: 'photo',
      badge: '4K Ultra HD'
    });
  }

  return {
    success: true,
    platform: 'Pinterest',
    title: 'Pinterest 4K Aesthetic Pin / Wallpaper',
    author: 'Pinterest Creator',
    thumbnail: isDirectPhoto ? photoUrl : 'https://s.pinimg.com/images/favicon_red_192.png',
    downloads
  };
}

// 5. Facebook HD Direct Engine
async function resolveFacebook(url) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    const html = await res.text();
    const downloads = [];

    const hdMatch = html.match(/browser_native_hd_url["']?\s*:\s*["']([^"']+)["']/i) || html.match(/playable_url_quality_hd["']?\s*:\s*["']([^"']+)["']/i);
    const sdMatch = html.match(/browser_native_sd_url["']?\s*:\s*["']([^"']+)["']/i) || html.match(/playable_url["']?\s*:\s*["']([^"']+)["']/i);

    if (hdMatch && hdMatch[1]) {
      const hdUrl = hdMatch[1].replace(/\\/g, '');
      downloads.push({
        quality: '1080p Full HD Facebook Video (Direct MP4)',
        resolution: '1080p FHD Direct MP4',
        url: hdUrl,
        ext: 'mp4',
        type: 'video',
        badge: '1080p Full HD'
      });
    }

    if (sdMatch && sdMatch[1]) {
      const sdUrl = sdMatch[1].replace(/\\/g, '');
      downloads.push({
        quality: '720p HD Facebook Video (Direct MP4)',
        resolution: '720p HD Direct MP4',
        url: sdUrl,
        ext: 'mp4',
        type: 'video',
        badge: '720p HD'
      });
    }

    if (downloads.length > 0) {
      return {
        success: true,
        platform: 'Facebook',
        title: 'Facebook Video / Reel',
        author: 'Facebook Creator',
        thumbnail: 'https://static.xx.fbcdn.net/rsrc.php/v3/y8/r/d9R9CPj8.png',
        downloads
      };
    }
  } catch (e) {}

  return null;
}

// Master Media Resolver
async function resolveMedia(url) {
  if (!url || typeof url !== 'string') {
    throw new Error('Please provide a valid video link.');
  }

  const trimmed = url.trim();
  const platform = detectPlatform(trimmed);

  if (platform === 'youtube') return await resolveYouTube(trimmed);
  if (platform === 'tiktok') {
    const tt = await resolveTikTok(trimmed);
    if (tt) return tt;
  }
  if (platform === 'instagram') {
    const ig = await resolveInstagram(trimmed);
    if (ig) return ig;
  }
  if (platform === 'pinterest') return await resolvePinterest(trimmed);
  if (platform === 'facebook') {
    const fb = await resolveFacebook(trimmed);
    if (fb) return fb;
  }

  throw new Error('Could not extract direct stream for this link. Please ensure it is a public video or photo.');
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
    return res.status(500).json({ success: false, error: err.message || 'Error resolving media.' });
  }
};

module.exports.resolveMedia = resolveMedia;
module.exports.detectPlatform = detectPlatform;
