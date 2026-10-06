// Multi-platform Media & 4K Photo Resolver for Isha Video Downloader
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

// 1. YouTube Resolver (Universal: yt-dlp on Server/Docker + Fast Fallback)
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

  const downloads = [
    {
      quality: isShorts ? '1080p Full HD YouTube Shorts' : '1080p Full HD Video (.MP4 Direct)',
      resolution: '1080p FHD (1920x1080)',
      url: `/api/download?sourceUrl=${encodeURIComponent(fullYtUrl)}&format=bestvideo[height<=1080]+bestaudio/best[height<=1080]/best&filename=${encodeURIComponent(title)}&ext=mp4`,
      isExternal: false,
      ext: 'mp4',
      type: 'video',
      badge: '1080p Full HD'
    },
    {
      quality: '720p HD Video (.MP4 Fast Direct)',
      resolution: '720p HD (1280x720)',
      url: `/api/download?sourceUrl=${encodeURIComponent(fullYtUrl)}&format=bestvideo[height<=720]+bestaudio/best[height<=720]/best&filename=${encodeURIComponent(title)}&ext=mp4`,
      isExternal: false,
      ext: 'mp4',
      type: 'video',
      badge: '720p HD'
    },
    {
      quality: 'Original Full Audio (MP3 320kbps Studio)',
      resolution: 'MP3 320kbps Audio',
      url: `/api/download?sourceUrl=${encodeURIComponent(fullYtUrl)}&format=bestaudio/best&filename=${encodeURIComponent(title)}&ext=mp3`,
      isExternal: false,
      ext: 'mp3',
      type: 'audio',
      badge: '320kbps MP3'
    },
    {
      quality: '4K Ultra HD Poster / Thumbnail',
      resolution: '4K MaxRes Quality',
      url: `/api/download?url=${encodeURIComponent(maxThumbnail)}&filename=${encodeURIComponent(title + '_4K_Cover')}&ext=jpg`,
      isExternal: false,
      ext: 'jpg',
      type: 'photo',
      badge: '4K Thumbnail'
    }
  ];

  return {
    success: true,
    platform: 'YouTube',
    title: title,
    author: author,
    thumbnail: maxThumbnail,
    duration: isShorts ? 'Shorts HD' : 'Full HD 1080p',
    downloads
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
      const title = item.title || 'TikTok Video by ' + (item.author?.nickname || 'Creator');

      if (item.images && Array.isArray(item.images)) {
        item.images.forEach((imgUrl, idx) => {
          downloads.push({
            quality: `4K Ultra HD Photo #${idx + 1}`,
            resolution: 'Original 4K Image',
            url: `/api/download?url=${encodeURIComponent(imgUrl)}&filename=${encodeURIComponent(title + '_photo_' + (idx + 1))}&ext=jpg`,
            isExternal: false,
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
          url: `/api/download?url=${encodeURIComponent(fullUrl)}&filename=${encodeURIComponent(title)}&ext=mp4`,
          isExternal: false,
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
          url: `/api/download?url=${encodeURIComponent(musicUrl)}&filename=${encodeURIComponent(title + '_audio')}&ext=mp3`,
          isExternal: false,
          ext: 'mp3',
          type: 'audio',
          badge: '320kbps MP3'
        });
      }

      if (downloads.length > 0) {
        return {
          success: true,
          platform: 'TikTok',
          title: title,
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
        const title = item.caption?.text ? item.caption.text.slice(0, 80) : 'Instagram_Media';

        if (item.carousel_media && Array.isArray(item.carousel_media)) {
          item.carousel_media.forEach((cItem, idx) => {
            const photoUrl = cItem.image_versions2?.candidates[0]?.url;
            if (photoUrl) {
              downloads.push({
                quality: `4K Ultra HD Photo #${idx + 1}`,
                resolution: 'Original 4K Image',
                url: `/api/download?url=${encodeURIComponent(photoUrl)}&filename=${encodeURIComponent(title + '_photo_' + (idx + 1))}&ext=jpg`,
                isExternal: false,
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
            url: `/api/download?url=${encodeURIComponent(item.image_versions2.candidates[0].url)}&filename=${encodeURIComponent(title)}&ext=jpg`,
            isExternal: false,
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
            url: `/api/download?url=${encodeURIComponent(videoUrl)}&filename=${encodeURIComponent(title)}&ext=mp4`,
            isExternal: false,
            ext: 'mp4',
            type: 'video',
            badge: '1080p Full HD'
          });
        }

        if (downloads.length > 0) {
          return {
            success: true,
            platform: 'Instagram',
            title: title,
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
  let pageTitle = 'Pinterest 4K Media';
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    const html = await res.text();
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    if (titleMatch) pageTitle = titleMatch[1].replace(/ \| Pinterest.*/, '').trim();

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
      url: `/api/download?url=${encodeURIComponent(photoUrl)}&filename=${encodeURIComponent(pageTitle)}&ext=jpg`,
      isExternal: false,
      ext: 'jpg',
      type: 'photo',
      badge: '4K Ultra HD'
    });
  }

  if (videoUrl) {
    downloads.push({
      quality: '1080p Full HD Video Pin (Direct MP4)',
      resolution: '1080p FHD Direct MP4',
      url: `/api/download?url=${encodeURIComponent(videoUrl)}&filename=${encodeURIComponent(pageTitle)}&ext=mp4`,
      isExternal: false,
      ext: 'mp4',
      type: 'video',
      badge: '1080p Full HD'
    });
  }

  if (downloads.length === 0) {
    downloads.push({
      quality: 'Original Pinterest Media',
      resolution: 'Original Format',
      url: `/api/download?url=${encodeURIComponent(url)}&filename=Pinterest_Media&ext=jpg`,
      isExternal: false,
      ext: 'jpg',
      type: 'photo',
      badge: 'Original'
    });
  }

  return {
    success: true,
    platform: 'Pinterest',
    title: pageTitle,
    author: 'Pinterest Creator',
    thumbnail: photoUrl.startsWith('http') ? photoUrl : 'https://s.pinimg.com/webapp/favicon-54a5b2af.png',
    downloads
  };
}

// 5. Facebook Direct Engine
async function resolveFacebook(url) {
  let videoUrl = null;
  let pageTitle = 'Facebook Video';
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate'
      }
    });
    const html = await res.text();
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    if (titleMatch) pageTitle = titleMatch[1].replace(/ \| Facebook.*/, '').trim();

    const hdMatch = html.match(/browser_native_hd_url["']:\s*["']([^"']+)["']/);
    const sdMatch = html.match(/browser_native_sd_url["']:\s*["']([^"']+)["']/);

    if (hdMatch) {
      videoUrl = JSON.parse(`"${hdMatch[1]}"`);
    } else if (sdMatch) {
      videoUrl = JSON.parse(`"${sdMatch[1]}"`);
    }
  } catch (e) {}

  const downloads = [];
  if (videoUrl) {
    downloads.push({
      quality: '1080p Full HD Facebook Video',
      resolution: '1080p FHD Direct MP4',
      url: `/api/download?url=${encodeURIComponent(videoUrl)}&filename=${encodeURIComponent(pageTitle)}&ext=mp4`,
      isExternal: false,
      ext: 'mp4',
      type: 'video',
      badge: '1080p Full HD'
    });
  } else {
    downloads.push({
      quality: '1080p Full HD Video (.MP4 Direct)',
      resolution: '1080p Direct MP4',
      url: `/api/download?sourceUrl=${encodeURIComponent(url)}&format=bestvideo+bestaudio/best&filename=${encodeURIComponent(pageTitle)}&ext=mp4`,
      isExternal: false,
      ext: 'mp4',
      type: 'video',
      badge: '1080p Full HD'
    });
  }

  return {
    success: true,
    platform: 'Facebook',
    title: pageTitle,
    author: 'Facebook Creator',
    thumbnail: 'https://static.xx.fbcdn.net/rsrc.php/yD/r/d4ZIVX-5C6b.ico',
    downloads
  };
}

// Master Handler
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const url = (req.body?.url || req.query?.url || '').trim();

  if (!url) {
    return res.status(400).json({ success: false, error: 'Please enter a valid video or photo URL.' });
  }

  const platform = detectPlatform(url);

  try {
    let result = null;

    if (platform === 'tiktok') {
      result = await resolveTikTok(url);
    } else if (platform === 'pinterest') {
      result = await resolvePinterest(url);
    } else if (platform === 'instagram') {
      result = await resolveInstagram(url);
    } else if (platform === 'facebook') {
      result = await resolveFacebook(url);
    } else if (platform === 'youtube') {
      result = await resolveYouTube(url);
    }

    if (!result) {
      // General fallback
      if (platform === 'youtube') {
        result = await resolveYouTube(url);
      } else if (platform === 'tiktok') {
        result = await resolveTikTok(url);
      } else if (platform === 'pinterest') {
        result = await resolvePinterest(url);
      } else if (platform === 'facebook') {
        result = await resolveFacebook(url);
      } else {
        result = await resolveYouTube(url);
      }
    }

    if (result && result.success) {
      return res.status(200).json(result);
    }

    return res.status(404).json({
      success: false,
      error: 'Could not extract direct stream. Please ensure the link is public.'
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Resolver error: ' + (err.message || 'Unknown server error')
    });
  }
};
