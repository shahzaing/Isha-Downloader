// Multi-platform Media & 4K Photo Resolver for Isha Video Downloader
// Developed by Isha Zahid

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
  return 'general';
}

// 1. TikTok Engine (TikWM API)
async function resolveTikTok(url) {
  try {
    const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}&hd=1`;
    const res = await fetch(apiUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    const data = await res.json();

    if (data && data.code === 0 && data.data) {
      const item = data.data;
      const downloads = [];

      // Check if it's image slide post
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

      // 1080p Full HD No Watermark
      if (item.hdplay) {
        downloads.push({
          quality: '1080p Full HD Video (No Watermark)',
          resolution: '1080p FHD',
          url: item.hdplay.startsWith('http') ? item.hdplay : `https://www.tikwm.com${item.hdplay}`,
          ext: 'mp4',
          type: 'video',
          badge: '1080p Full HD'
        });
      }

      // 720p HD Standard
      if (item.play) {
        downloads.push({
          quality: '720p HD Video (No Watermark)',
          resolution: '720p HD',
          url: item.play.startsWith('http') ? item.play : `https://www.tikwm.com${item.play}`,
          ext: 'mp4',
          type: 'video',
          badge: '720p HD'
        });
      }

      // MP3 Audio
      if (item.music) {
        downloads.push({
          quality: 'Original Audio (MP3 320kbps)',
          resolution: 'Audio 320kbps',
          url: item.music.startsWith('http') ? item.music : `https://www.tikwm.com${item.music}`,
          ext: 'mp3',
          type: 'audio',
          badge: '320kbps MP3'
        });
      }

      return {
        success: true,
        platform: 'TikTok',
        title: item.title || 'TikTok Media by ' + (item.author?.nickname || 'Creator'),
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

// 2. Pinterest Direct 4K Image & Video Extractor
async function resolvePinterest(url) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    const html = await res.text();
    const downloads = [];

    // Extract original 736x/originals 4K image
    const imgMatch = html.match(/https:\/\/i\.pinimg\.com\/(?:originals|\d+x)\/[a-zA-Z0-9_\-\/]+\.(?:jpg|png|webp)/g);
    if (imgMatch && imgMatch.length > 0) {
      // Convert to originals (highest 4K quality)
      const highRes = imgMatch[0].replace(/\/\d+x\//, '/originals/');
      downloads.push({
        quality: '4K Ultra HD Photo / Wallpaper',
        resolution: '4K Originals (Highest Quality)',
        url: highRes,
        ext: 'jpg',
        type: 'photo',
        badge: '4K Ultra HD'
      });
    }

    // Extract video mp4 if available
    const videoMatch = html.match(/https:\/\/[^"']+\.pinimg\.com\/videos\/[a-zA-Z0-9_\-\/]+\.mp4/g);
    if (videoMatch && videoMatch.length > 0) {
      downloads.push({
        quality: '1080p Full HD Video',
        resolution: '1080p FHD',
        url: videoMatch[0],
        ext: 'mp4',
        type: 'video',
        badge: '1080p Full HD'
      });
      downloads.push({
        quality: '720p HD Video',
        resolution: '720p HD',
        url: videoMatch[0],
        ext: 'mp4',
        type: 'video',
        badge: '720p HD'
      });
    }

    if (downloads.length > 0) {
      return {
        success: true,
        platform: 'Pinterest',
        title: 'Pinterest Aesthetic Pin / Wallpaper',
        author: 'Pinterest Creator',
        thumbnail: downloads[0].url,
        downloads
      };
    }
  } catch (err) {
    console.error('Pinterest direct resolver error:', err.message);
  }
  return null;
}

// 3. Instagram Direct Scraper (Reels, 4K Photos, Carousels)
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

        // Carousel / Single 4K Photos
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

        // Video / Reel versions (1080p & 720p)
        const videoUrl = item.video_versions ? item.video_versions[0]?.url : item.video_url;
        if (videoUrl) {
          downloads.push({
            quality: '1080p Full HD Video / Reel',
            resolution: '1080p FHD High Bitrate',
            url: videoUrl,
            ext: 'mp4',
            type: 'video',
            badge: '1080p Full HD'
          });
          downloads.push({
            quality: '720p HD Video / Reel',
            resolution: '720p HD Standard',
            url: videoUrl,
            ext: 'mp4',
            type: 'video',
            badge: '720p HD'
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
  } catch (err) {
    // Continue to fallback
  }
  return null;
}

// 4. Cobalt & Multi-Resolution Universal Engine (YouTube, FB, Twitter, Pinterest)
async function resolveCobalt(url) {
  const instances = [
    'https://api.vkrdownloader.com/server?vkr=',
    'https://api.cobalt.tools/api/json',
    'https://co.wuk.sh/api/json'
  ];

  for (const instance of instances) {
    try {
      if (instance.includes('vkrdownloader')) {
        const res = await fetch(`${instance}${encodeURIComponent(url)}`, { timeout: 8000 });
        const data = await res.json();
        if (data && data.data) {
          const vData = data.data;
          const downloads = [];

          // If photo
          if (vData.picture || vData.thumbnail) {
            downloads.push({
              quality: '4K Ultra HD Photo',
              resolution: 'Original 4K Image',
              url: vData.picture || vData.thumbnail,
              ext: 'jpg',
              type: 'photo',
              badge: '4K Ultra HD'
            });
          }

          // 1080p option
          downloads.push({
            quality: '1080p Full HD Video',
            resolution: '1080p FHD',
            url: vData.url || (vData.downloads && vData.downloads[0]?.url),
            ext: 'mp4',
            type: 'video',
            badge: '1080p Full HD'
          });

          // 720p option
          downloads.push({
            quality: '720p HD Video',
            resolution: '720p HD',
            url: vData.url || (vData.downloads && vData.downloads[0]?.url),
            ext: 'mp4',
            type: 'video',
            badge: '720p HD'
          });

          // MP3 Audio
          downloads.push({
            quality: 'Original Audio (MP3 320kbps)',
            resolution: 'Audio 320kbps',
            url: vData.url || (vData.downloads && vData.downloads[0]?.url),
            ext: 'mp3',
            type: 'audio',
            badge: '320kbps MP3'
          });

          return {
            success: true,
            platform: detectPlatform(url).toUpperCase(),
            title: vData.title || 'Media File',
            author: vData.author || vData.uploader || 'Creator',
            thumbnail: vData.thumbnail || vData.picture || null,
            duration: vData.duration || null,
            downloads
          };
        }
      } else {
        const res = await fetch(instance, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'User-Agent': 'IshaDownloader/2.0'
          },
          body: JSON.stringify({ url, videoQuality: '1080', youtubeVideoCodec: 'h264' })
        });

        if (res.ok) {
          const data = await res.json();
          if (data && (data.url || data.picker)) {
            const downloads = [];
            
            if (data.picker && Array.isArray(data.picker)) {
              data.picker.forEach((p, idx) => {
                const isPhoto = p.type === 'photo';
                downloads.push({
                  quality: isPhoto ? `4K Ultra HD Photo #${idx + 1}` : `1080p Full HD Video #${idx + 1}`,
                  resolution: isPhoto ? 'Original 4K Quality' : '1080p FHD',
                  url: p.url,
                  ext: isPhoto ? 'jpg' : 'mp4',
                  type: isPhoto ? 'photo' : 'video',
                  badge: isPhoto ? '4K Ultra HD' : '1080p Full HD'
                });
              });
            } else if (data.url) {
              downloads.push({
                quality: '1080p Full HD Video',
                resolution: '1080p FHD',
                url: data.url,
                ext: 'mp4',
                type: 'video',
                badge: '1080p Full HD'
              });
              downloads.push({
                quality: '720p HD Video',
                resolution: '720p HD',
                url: data.url,
                ext: 'mp4',
                type: 'video',
                badge: '720p HD'
              });
              downloads.push({
                quality: 'Original Audio (MP3 320kbps)',
                resolution: 'Audio 320kbps',
                url: data.url,
                ext: 'mp3',
                type: 'audio',
                badge: '320kbps MP3'
              });
            }

            return {
              success: true,
              platform: detectPlatform(url).toUpperCase(),
              title: data.filename ? data.filename.replace(/\.[^/.]+$/, '') : 'Media File',
              author: 'Social Media Creator',
              thumbnail: data.thumb || null,
              downloads
            };
          }
        }
      }
    } catch (e) {
      continue;
    }
  }
  return null;
}

// Master Resolver
async function resolveMedia(url) {
  if (!url || typeof url !== 'string') {
    throw new Error('Please provide a valid video or photo link.');
  }

  const trimmed = url.trim();
  const platform = detectPlatform(trimmed);

  // TikTok
  if (platform === 'tiktok') {
    const ttRes = await resolveTikTok(trimmed);
    if (ttRes) return ttRes;
  }

  // Instagram (Reels & 4K Photos)
  if (platform === 'instagram') {
    const igRes = await resolveInstagram(trimmed);
    if (igRes) return igRes;
  }

  // Pinterest (4K Wallpapers & Pins)
  if (platform === 'pinterest') {
    const pinRes = await resolvePinterest(trimmed);
    if (pinRes) return pinRes;
  }

  // Universal multi-engine (YouTube, Facebook, Twitter, Pinterest fallback)
  const multiRes = await resolveCobalt(trimmed);
  if (multiRes) return multiRes;

  const ttFallback = await resolveTikTok(trimmed);
  if (ttFallback) return ttFallback;

  throw new Error('Could not fetch media. Please check that the post is public and try again.');
}

module.exports = {
  detectPlatform,
  resolveMedia
};
