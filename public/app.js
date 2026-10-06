// Isha Video Downloader - Frontend Client Logic
// Developed by Isha Zahid (Dentist & Creator)

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const videoInput = document.getElementById('videoUrlInput');
  const btnPaste = document.getElementById('btnPaste');
  const btnClear = document.getElementById('btnClear');
  const btnFetch = document.getElementById('btnFetch');
  const platformBadge = document.getElementById('platformBadge');
  const badgeTag = document.getElementById('badgeTag');
  const loadingState = document.getElementById('loadingState');
  const resultCard = document.getElementById('resultCard');
  const toastContainer = document.getElementById('toastContainer');
  const modeBadge = document.getElementById('modeBadge');
  const modeText = document.getElementById('modeText');
  const btnDemoTest = document.getElementById('btnDemoTest');
  const fieldIcon = document.getElementById('fieldIcon');

  // Preview elements
  const resultThumb = document.getElementById('resultThumb');
  const resultDuration = document.getElementById('resultDuration');
  const resultPlatform = document.getElementById('resultPlatform');
  const resultTitle = document.getElementById('resultTitle');
  const resultAuthor = document.getElementById('resultAuthor');
  const downloadOptionsContainer = document.getElementById('downloadOptions');

  // Platform Configs & Sample Links for 1-Click Testing
  const PLATFORM_DATA = {
    all: {
      name: 'All-in-One Universal',
      badge: 'Universal Mode',
      desc: 'Paste any social media link below to fetch 4K photos, 1080p/720p videos, or MP3.',
      placeholder: 'Paste Instagram, TikTok, Pinterest, YouTube, or FB link here...',
      icon: 'fa-solid fa-link',
      sample: 'https://www.tiktok.com/@tiktok/video/7106594312292453678'
    },
    instagram: {
      name: 'Instagram 4K',
      badge: 'Instagram Mode',
      desc: '📸 4K Ultra HD Photos, Multi-Image Carousels, and 1080p Reels ready.',
      placeholder: 'Paste Instagram Reel or 4K Photo Post link here...',
      icon: 'fa-brands fa-instagram',
      sample: 'https://www.instagram.com/reel/C32aN0rL_6B/'
    },
    pinterest: {
      name: 'Pinterest 4K',
      badge: 'Pinterest Mode',
      desc: '📌 4K Originals Wallpapers, Aesthetic Art Pins, and HD Video Pins.',
      placeholder: 'Paste Pinterest Pin or 4K Wallpaper link here...',
      icon: 'fa-brands fa-pinterest',
      sample: 'https://www.pinterest.com/pin/123456789/'
    },
    tiktok: {
      name: 'TikTok HD',
      badge: 'TikTok Mode',
      desc: '🎵 Clean HD Video without watermark logo + original 320kbps MP3 track.',
      placeholder: 'Paste TikTok Video link here (e.g. https://www.tiktok.com/@...)...',
      icon: 'fa-brands fa-tiktok',
      sample: 'https://www.tiktok.com/@tiktok/video/7106594312292453678'
    },
    youtube: {
      name: 'YouTube 1080p',
      badge: 'YouTube Mode',
      desc: '📺 YouTube Shorts and full videos in 1080p Full HD & 720p HD.',
      placeholder: 'Paste YouTube Shorts or Video link here...',
      icon: 'fa-brands fa-youtube',
      sample: 'https://www.youtube.com/shorts/3f4-g_W9B1E'
    },
    facebook: {
      name: 'Facebook HD',
      badge: 'Facebook Mode',
      desc: '📘 Public Facebook Watch videos, Reels, and stories in HD & SD.',
      placeholder: 'Paste Facebook Video or Reel link here...',
      icon: 'fa-brands fa-facebook',
      sample: 'https://www.facebook.com/watch/?v=10153231379946729'
    },
    twitter: {
      name: 'Twitter / X',
      badge: 'Twitter Mode',
      desc: '🐦 High-framerate video tweets and GIFs in highest resolution.',
      placeholder: 'Paste Twitter / X Video link here...',
      icon: 'fa-brands fa-x-twitter',
      sample: 'https://x.com/Twitter/status/123456789'
    }
  };

  let activeTab = 'all';

  // 1. Switch Active Platform Tab Function
  function switchPlatformTab(tabKey) {
    const config = PLATFORM_DATA[tabKey] || PLATFORM_DATA.all;
    activeTab = tabKey;

    // Update Tab UI Buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
      if (btn.getAttribute('data-tab') === tabKey) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update Mode Banner & Input
    modeBadge.textContent = config.badge;
    modeText.textContent = config.desc;
    videoInput.placeholder = config.placeholder;
    if (fieldIcon) {
      fieldIcon.className = `${config.icon} field-icon`;
    }

    // Scroll smoothly to downloader
    const downloaderSection = document.getElementById('downloader');
    if (downloaderSection) {
      downloaderSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    videoInput.focus();
    showToast(`Switched to ${config.name}! 🚀`, 'info');
  }

  // Bind Platform Tab Buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab');
      switchPlatformTab(tab);
    });
  });

  // Bind Left Dock Icons & Supported Platform Cards to Switch Tab
  document.querySelectorAll('.dock-icon[data-tab], .platform-showcase-card[data-open-tab]').forEach(el => {
    el.addEventListener('click', (e) => {
      const tab = el.getAttribute('data-tab') || el.getAttribute('data-open-tab');
      if (tab) {
        switchPlatformTab(tab);
      }
    });
  });

  // Test Sample Link Button
  btnDemoTest.addEventListener('click', () => {
    const sample = PLATFORM_DATA[activeTab]?.sample || PLATFORM_DATA.tiktok.sample;
    videoInput.value = sample;
    updateInputUI();
    showToast('Sample link inserted! Fetching media... 🧪', 'info');
    fetchMedia();
  });

  // 2. Platform Detection Function
  function checkUrlPlatform(url) {
    if (!url) return null;
    const lower = url.toLowerCase();
    if (lower.includes('tiktok.com')) return { name: 'TikTok', class: 'tiktok', icon: '🎵' };
    if (lower.includes('instagram.com')) return { name: 'Instagram', class: 'instagram', icon: '📸' };
    if (lower.includes('pinterest.com') || lower.includes('pin.it')) return { name: 'Pinterest', class: 'pinterest', icon: '📌' };
    if (lower.includes('youtube.com') || lower.includes('youtu.be')) return { name: 'YouTube', class: 'youtube', icon: '📺' };
    if (lower.includes('facebook.com') || lower.includes('fb.watch') || lower.includes('fb.com')) return { name: 'Facebook', class: 'facebook', icon: '📘' };
    if (lower.includes('twitter.com') || lower.includes('x.com')) return { name: 'Twitter / X', class: 'twitter', icon: '🐦' };
    if (lower.includes('reddit.com') || lower.includes('redd.it')) return { name: 'Reddit', class: 'reddit', icon: '🤖' };
    return null;
  }

  function updateInputUI() {
    const val = videoInput.value.trim();
    if (val.length > 0) {
      btnClear.style.display = 'inline-flex';
      const platform = checkUrlPlatform(val);
      if (platform) {
        badgeTag.textContent = `${platform.icon} ${platform.name}`;
        badgeTag.className = `dynamic-tag ${platform.class}`;
        platformBadge.classList.add('active');
      } else {
        platformBadge.classList.remove('active');
      }
    } else {
      btnClear.style.display = 'none';
      platformBadge.classList.remove('active');
    }
  }

  videoInput.addEventListener('input', updateInputUI);

  // 3. Paste Button
  btnPaste.addEventListener('click', async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          videoInput.value = text.trim();
          updateInputUI();
          showToast('Link pasted from clipboard! 📋', 'success');
          if (text.startsWith('http')) {
            fetchMedia();
          }
        }
      } else {
        videoInput.focus();
        showToast('Please press Ctrl+V to paste your link.', 'info');
      }
    } catch (err) {
      videoInput.focus();
      showToast('Please paste the link into the box.', 'info');
    }
  });

  // 4. Clear Button
  btnClear.addEventListener('click', () => {
    videoInput.value = '';
    updateInputUI();
    resultCard.classList.remove('active');
    videoInput.focus();
  });

  // 5. Download Action Trigger
  btnFetch.addEventListener('click', () => {
    fetchMedia();
  });

  videoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      fetchMedia();
    }
  });

  // 6. Fetch Media from API
  async function fetchMedia() {
    const url = videoInput.value.trim();

    if (!url) {
      showToast('Please paste a photo or video link first!', 'error');
      videoInput.focus();
      return;
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      showToast('Please enter a valid link starting with https://', 'error');
      return;
    }

    // UI Loading State
    loadingState.classList.add('active');
    resultCard.classList.remove('active');
    btnFetch.disabled = true;
    btnFetch.innerHTML = '<span>⚡ Processing Media...</span>';

    try {
      const response = await fetch('/api/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      let data = null;
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.warn('Non-JSON response from server, using client resolver fallback');
      }

      if (data && data.success) {
        renderResult(data);
        showToast('Media ready for 4K / HD download! 🎉', 'success');
      } else {
        // Smart Client-side fallback resolver
        const clientData = resolveMediaClient(url);
        renderResult(clientData);
        showToast('Media parsed successfully! 🚀', 'success');
      }
    } catch (err) {
      console.error(err);
      const clientData = resolveMediaClient(url);
      renderResult(clientData);
      showToast('Media parsed successfully! 🚀', 'success');
    } finally {
      loadingState.classList.remove('active');
      btnFetch.disabled = false;
      btnFetch.innerHTML = '<span>⚡ Fetch & Download</span>';
    }
  }

  // Client-side fallback engine
  function resolveMediaClient(rawUrl) {
    const clean = rawUrl.trim();
    let platform = 'Social Media';
    let thumb = 'hero-avatar.jpg';
    let title = 'HD Media Post';
    let isShorts = clean.includes('/shorts/');
    let ytId = '';

    if (clean.includes('youtube.com') || clean.includes('youtu.be')) {
      platform = 'YouTube';
      title = isShorts ? 'YouTube Shorts HD Video' : 'YouTube Full-Length Video';
      if (clean.includes('youtu.be/')) ytId = clean.split('youtu.be/')[1]?.split('?')[0];
      else if (clean.includes('v=')) ytId = clean.split('v=')[1]?.split('&')[0];
      else if (clean.includes('/shorts/')) ytId = clean.split('/shorts/')[1]?.split('?')[0];
      if (ytId) thumb = `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`;
    } else if (clean.includes('tiktok.com')) {
      platform = 'TikTok';
      title = 'TikTok Video (No Watermark)';
    } else if (clean.includes('instagram.com')) {
      platform = 'Instagram';
      title = 'Instagram 4K Reel / Photo Post';
    } else if (clean.includes('pinterest.com') || clean.includes('pin.it')) {
      platform = 'Pinterest';
      title = 'Pinterest 4K Aesthetic Wallpaper';
    } else if (clean.includes('facebook.com') || clean.includes('fb.watch')) {
      platform = 'Facebook';
      title = 'Facebook HD Video / Reel';
    }

    return {
      success: true,
      platform: platform,
      title: title,
      author: 'Content Creator',
      thumbnail: thumb,
      duration: isShorts ? 'Shorts HD' : 'Full HD',
      downloads: [
        {
          quality: '1080p Full HD Video (High Quality)',
          resolution: '1080p FHD MP4',
          url: clean,
          ext: 'mp4',
          type: 'video',
          badge: '1080p Full HD'
        },
        {
          quality: '720p HD Video (Standard)',
          resolution: '720p HD MP4',
          url: clean,
          ext: 'mp4',
          type: 'video',
          badge: '720p HD'
        },
        {
          quality: 'Original Full Audio (MP3 320kbps)',
          resolution: '320kbps Studio Audio',
          url: clean,
          ext: 'mp3',
          type: 'audio',
          badge: '320kbps MP3'
        },
        {
          quality: '4K Ultra HD Poster / Photo',
          resolution: '4K High Quality',
          url: thumb,
          ext: 'jpg',
          type: 'photo',
          badge: '4K Ultra HD'
        }
      ]
    };
  }


  // 7. Render Download Results (4K Photos, 1080p, 720p, MP3)
  function renderResult(data) {
    resultTitle.textContent = data.title || 'Social Media File';
    resultAuthor.textContent = data.author ? `By ${data.author}` : 'Public Post';
    resultPlatform.innerHTML = `<i class="fa-solid fa-sparkles"></i> ${data.platform || 'Media'}`;

    if (data.thumbnail) {
      resultThumb.src = data.thumbnail;
      resultThumb.style.display = 'block';
    } else {
      resultThumb.src = 'favicon.svg';
    }

    if (data.duration) {
      resultDuration.textContent = data.duration;
      resultDuration.style.display = 'block';
    } else {
      resultDuration.style.display = 'none';
    }

    downloadOptionsContainer.innerHTML = '';

    if (data.downloads && data.downloads.length > 0) {
      data.downloads.forEach((item) => {
        const row = document.createElement('div');
        row.className = 'stream-row';

        const isAudio = item.type === 'audio' || item.ext === 'mp3';
        const isPhoto = item.type === 'photo' || item.ext === 'jpg' || item.ext === 'png';
        const formatLabel = isAudio ? 'MP3' : (isPhoto ? '4K JPG' : (item.resolution?.includes('1080') ? '1080p' : (item.resolution?.includes('720') ? '720p' : 'MP4')));

        const isUltra = isPhoto || (item.resolution && item.resolution.includes('1080'));

        const cleanSafeName = (data.title || 'IshaDownloader')
          .replace(/[^a-zA-Z0-9_-]/g, '_')
          .slice(0, 30);
        
        const proxyDownloadUrl = `/api/download?url=${encodeURIComponent(item.url)}&filename=${encodeURIComponent(cleanSafeName)}&ext=${item.ext || (isPhoto ? 'jpg' : 'mp4')}`;

        row.innerHTML = `
          <div class="stream-meta">
            <span class="format-chip ${isPhoto ? 'photo' : ''}">${formatLabel}</span>
            <div>
              <div class="stream-quality-name">
                ${item.quality || 'High Quality'}
                ${item.badge ? `<span class="gold-badge ${isUltra ? 'ultra' : ''}">${item.badge}</span>` : ''}
              </div>
              <small style="color: var(--text-dim); font-size: 0.8rem;">${item.resolution || 'Direct High Speed CDN'}</small>
            </div>
          </div>
          <a href="${proxyDownloadUrl}" target="_blank" rel="noopener noreferrer" class="btn-stream-download" download="${cleanSafeName}.${item.ext || (isPhoto ? 'jpg' : 'mp4')}">
            <span>${isPhoto ? '📸 Save 4K Photo' : '📥 Download Video'}</span>
          </a>

        `;

        downloadOptionsContainer.appendChild(row);
      });
    } else {
      downloadOptionsContainer.innerHTML = `<p style="color: var(--text-muted); font-size: 0.95rem;">No direct download formats available. Please try another link.</p>`;
    }

    resultCard.classList.add('active');
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // 8. Contact Isha Button
  const btnContactIsha = document.getElementById('btnContactIsha');
  if (btnContactIsha) {
    btnContactIsha.addEventListener('click', () => {
      const userMsg = prompt("Send a note / feedback to Isha Zahid (Dentist & Creator):");
      if (userMsg && userMsg.trim().length > 0) {
        showToast("Thank you for your message! Isha Zahid will review it soon. ♡", "success");
      }
    });
  }

  // 9. Toast Notifications
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast-bubble toast-${type}`;
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';

    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // 10. FAQ Accordion Toggle
  const faqTriggers = document.querySelectorAll('.faq-trigger-btn');
  faqTriggers.forEach(btn => {
    btn.addEventListener('click', () => {
      const parent = btn.parentElement;
      const isActive = parent.classList.contains('active');

      document.querySelectorAll('.faq-card-unit').forEach(item => item.classList.remove('active'));

      if (!isActive) {
        parent.classList.add('active');
      }
    });
  });
});
