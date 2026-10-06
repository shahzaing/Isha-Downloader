// Multi-platform Media Resolver for Isha Video Downloader
// Developed by Isha Zahid

// Helper to detect platform
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
  if (cleanUrl.includes('threads.net')) return 'threads';
  if (cleanUrl.includes('snapchat.com')) return 'snapchat';
  return 'general';
}

// 1. TikTok Engine (Direct fast TikWM API)
async function resolveTikTok(url) {
  try {
    const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}&hd=1`;
    const res = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    const data = await res.json();

    if (data && data.code === 0 && data.data) {
      const item = data.data;
      const downloads = [];

      // HD Video No Watermark
      if (item.hdplay) {
        downloads.push({
          quality: 'HD Video (No Watermark)',
          resolution: '1080p / HD',
          url: item.hdplay.startsWith('http') ? item.hdplay : `https://www.tikwm.com${item.hdplay}`,
          ext: 'mp4',
          type: 'video',
          badge: 'Best Quality'
        });
      }

      // Normal Video No Watermark
      if (item.play) {
        downloads.push({
          quality: 'Video (No Watermark)',
          resolution: '720p SD',
          url: item.play.startsWith('http') ? item.play : `https://www.tikwm.com${item.play}`,
          ext: 'mp4',
          type: 'video',
          badge: 'Standard'
        });
      }

      // MP3 Audio
      if (item.music) {
        downloads.push({
          quality: 'Original Audio (MP3)',
          resolution: 'Audio 320kbps',
          url: item.music.startsWith('http') ? item.music : `https://www.tikwm.com${item.music}`,
          ext: 'mp3',
          type: 'audio',
          badge: 'Audio'
        });
      }

      return {
        success: true,
        platform: 'TikTok',
        title: item.title || 'TikTok Video by ' + (item.author?.nickname || 'Creator'),
        author: item.author?.nickname ? `@${item.author.unique_id} (${item.author.nickname})` : '@tiktok_user',
        thumbnail: item.cover || item.origin_cover || item.author?.avatar,
        duration: item.duration ? `${item.duration}s` : null,
        downloads
      };
    }
  } catch (err) {
    console.error('TikTok resolve error:', err.message);
  }
  return null;
}

// 2. Cobalt Multi-Engine (High reliability for YouTube, Instagram, Twitter, Facebook, Pinterest)
async function resolveCobalt(url) {
  const cobaltInstances = [
    'https://api.cobalt.tools',
    'https://cobalt-api.kwiatekm.tokyo',
    'https://co.wuk.sh',
    'https://api.vkrdownloader.com/server?vkr='
  ];

  for (const instance of cobaltInstances) {
    try {
      if (instance.includes('vkrdownloader')) {
        const res = await fetch(`${instance}${encodeURIComponent(url)}`, { timeout: 8000 });
        const data = await res.json();
        if (data && data.data) {
          const vData = data.data;
          const downloads = [];
          
          if (vData.downloads && Array.isArray(vData.downloads)) {
            vData.downloads.forEach(d => {
              if (d.url) {
                downloads.push({
                  quality: d.format_id || d.quality || 'Standard Video',
                  resolution: d.resolution || (d.format_note || 'HD'),
                  url: d.url,
                  ext: d.ext || 'mp4',
                  type: d.ext === 'mp3' || d.quality?.includes('Audio') ? 'audio' : 'video'
                });
              }
            });
          } else if (vData.url) {
            downloads.push({
              quality: 'HD Video',
              resolution: '1080p / 720p',
              url: vData.url,
              ext: 'mp4',
              type: 'video'
            });
          }

          if (downloads.length > 0) {
            return {
              success: true,
              platform: detectPlatform(url).toUpperCase(),
              title: vData.title || 'Downloaded Media',
              author: vData.author || vData.uploader || 'Social Media User',
              thumbnail: vData.thumbnail || vData.picture || null,
              duration: vData.duration || null,
              downloads
            };
          }
        }
      } else {
        // Standard Cobalt JSON API
        const res = await fetch(`${instance}/api/json`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'User-Agent': 'IshaDownloader/1.0'
          },
          body: JSON.stringify({
            url: url,
            videoQuality: 'max',
            youtubeVideoCodec: 'h264'
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (data && (data.url || data.picker)) {
            const downloads = [];
            if (data.url) {
              downloads.push({
                quality: 'High Quality Download (Fast)',
                resolution: 'Best Available',
                url: data.url,
                ext: data.filename?.split('.').pop() || 'mp4',
                type: data.filename?.endsWith('.mp3') ? 'audio' : 'video',
                badge: 'Recommended'
              });
            }
            if (data.picker && Array.isArray(data.picker)) {
              data.picker.forEach((p, idx) => {
                downloads.push({
                  quality: `Item #${idx + 1} (${p.type || 'Media'})`,
                  resolution: 'High Quality',
                  url: p.url,
                  ext: p.type === 'photo' ? 'jpg' : 'mp4',
                  type: p.type === 'photo' ? 'photo' : 'video'
                });
              });
            }

            return {
              success: true,
              platform: detectPlatform(url).toUpperCase(),
              title: data.filename ? data.filename.replace(/\.[^/.]+$/, '') : 'Media Video',
              author: 'Social Media Creator',
              thumbnail: data.thumb || null,
              downloads
            };
          }
        }
      }
    } catch (e) {
      // Continue to next fallback
      continue;
    }
  }
  return null;
}

// 3. Instagram Direct Scraper Fallback
async function resolveInstagramDirect(url) {
  try {
    // Try public instagram reel/post metadata
    const cleanUrl = url.split('?')[0].replace(/\/$/, '') + '/?__a=1&__d=dis';
    const res = await fetch(cleanUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Sec-Fetch-Mode': 'navigate'
      }
    });

    if (res.ok) {
      const data = await res.json();
      const items = data.items || (data.graphql && [data.graphql.shortcode_media]);
      if (items && items.length > 0) {
        const item = items[0];
        const videoUrl = item.video_versions ? item.video_versions[0]?.url : item.video_url;
        const thumb = item.image_versions2 ? item.image_versions2.candidates[0]?.url : item.display_url;
        
        if (videoUrl) {
          return {
            success: true,
            platform: 'Instagram',
            title: item.caption?.text ? item.caption.text.slice(0, 80) + '...' : 'Instagram Reel/Video',
            author: item.user?.username ? `@${item.user.username}` : '@instagram_user',
            thumbnail: thumb,
            downloads: [
              {
                quality: 'HD Reel Video',
                resolution: '1080p High Quality',
                url: videoUrl,
                ext: 'mp4',
                type: 'video',
                badge: 'Direct'
              }
            ]
          };
        }
      }
    }
  } catch (err) {
    // Instagram direct fallback failed, continuing
  }
  return null;
}

// 4. Universal Master Handler
async function resolveMedia(url) {
  if (!url || typeof url !== 'string') {
    throw new Error('Please provide a valid video link.');
  }

  const trimmed = url.trim();
  const platform = detectPlatform(trimmed);

  // If TikTok
  if (platform === 'tiktok') {
    const ttRes = await resolveTikTok(trimmed);
    if (ttRes) return ttRes;
  }

  // If Instagram
  if (platform === 'instagram') {
    const igDirect = await resolveInstagramDirect(trimmed);
    if (igDirect) return igDirect;
  }

  // Multi-engine resolver for all platforms
  const multiRes = await resolveCobalt(trimmed);
  if (multiRes) return multiRes;

  // Secondary fallback for general URLs
  const secondaryRes = await resolveTikTok(trimmed);
  if (secondaryRes) return secondaryRes;

  throw new Error('Could not fetch media. Please verify the link is public and try again.');
}

module.exports = {
  detectPlatform,
  resolveMedia
};
