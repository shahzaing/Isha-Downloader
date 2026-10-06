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

  function getApiBase() {
    return localStorage.getItem('isha_backend_url') || '';
  }

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
  if (btnDemoTest) {
    btnDemoTest.addEventListener('click', () => {
      const sample = PLATFORM_DATA[activeTab]?.sample || PLATFORM_DATA.tiktok.sample;
      videoInput.value = sample;
      updateInputUI();
      showToast('Sample link inserted! Fetching media... 🧪', 'info');
      fetchMedia();
    });
  }

  // 2. Platform Detection Function
  function checkUrlPlatform(url) {
    if (!url) return null;
    const clean = url.toLowerCase();
    if (clean.includes('instagram.com')) return { name: 'Instagram 4K', class: 'instagram', icon: 'fa-brands fa-instagram' };
    if (clean.includes('tiktok.com')) return { name: 'TikTok HD', class: 'tiktok', icon: 'fa-brands fa-tiktok' };
    if (clean.includes('pinterest.com') || clean.includes('pin.it')) return { name: 'Pinterest 4K', class: 'pinterest', icon: 'fa-brands fa-pinterest' };
    if (clean.includes('youtube.com') || clean.includes('youtu.be')) return { name: 'YouTube FHD', class: 'youtube', icon: 'fa-brands fa-youtube' };
    if (clean.includes('facebook.com') || clean.includes('fb.watch') || clean.includes('fb.com')) return { name: 'Facebook HD', class: 'facebook', icon: 'fa-brands fa-facebook' };
    if (clean.includes('twitter.com') || clean.includes('x.com')) return { name: 'Twitter / X', class: 'twitter', icon: 'fa-brands fa-x-twitter' };
    if (clean.includes('reddit.com')) return { name: 'Reddit Media', class: 'reddit', icon: 'fa-brands fa-reddit' };
    return null;
  }

  // Update Input UI (Badge, Clear Icon, Field Icon)
  function updateInputUI() {
    const val = videoInput.value.trim();
    if (val.length > 0) {
      btnClear.classList.add('visible');
    } else {
      btnClear.classList.remove('visible');
    }

    const detected = checkUrlPlatform(val);
    if (detected) {
      platformBadge.className = `platform-badge ${detected.class} active`;
      badgeTag.innerHTML = `<i class="${detected.icon}"></i> ${detected.name}`;
      if (fieldIcon) {
        fieldIcon.className = `${detected.icon} field-icon`;
      }
    } else {
      platformBadge.className = 'platform-badge';
      const config = PLATFORM_DATA[activeTab] || PLATFORM_DATA.all;
      if (fieldIcon) {
        fieldIcon.className = `${config.icon} field-icon`;
      }
    }
  }

  videoInput.addEventListener('input', updateInputUI);

  // Clear Input Button
  btnClear.addEventListener('click', () => {
    videoInput.value = '';
    updateInputUI();
    resultCard.classList.remove('active');
    videoInput.focus();
    showToast('Input cleared! ✨', 'info');
  });

  // 3. Paste Clipboard Button
  btnPaste.addEventListener('click', async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text && text.trim().startsWith('http')) {
          videoInput.value = text.trim();
          updateInputUI();
          showToast('Link pasted from clipboard! 📋', 'success');
          fetchMedia();
        } else if (text) {
          videoInput.value = text.trim();
          updateInputUI();
          showToast('Pasted clipboard content.', 'info');
        } else {
          showToast('Clipboard is empty! Copy a link first.', 'error');
        }
      } else {
        videoInput.focus();
        document.execCommand('paste');
        updateInputUI();
      }
    } catch (err) {
      showToast('Click in the box and press Ctrl+V to paste!', 'info');
      videoInput.focus();
    }
  });

  // 4. Toast Notification
  function showToast(msg, type = 'info') {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-check-circle';
    if (type === 'error') icon = 'fa-triangle-exclamation';

    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${msg}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // 5. Fetch Media Action Trigger
  btnFetch.addEventListener('click', () => {
    fetchMedia();
  });

  videoInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      fetchMedia();
    }
  });

  // 6. Primary Fetch Media Logic
  async function fetchMedia() {
    const url = videoInput.value.trim();

    if (!url) {
      showToast('Please paste a video or photo link first! 🔗', 'error');
      videoInput.focus();
      return;
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      showToast('Invalid link! Make sure it starts with https://', 'error');
      videoInput.focus();
      return;
    }

    // UI Loading State
    loadingState.classList.add('active');
    resultCard.classList.remove('active');
    btnFetch.disabled = true;
    btnFetch.classList.add('loading');

    try {
      const apiBase = getApiBase();
      const endpoint = `${apiBase}/api/resolve`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with status ${response.status}`);
      }

      const data = await response.json();

      if (data && data.success && data.downloads && data.downloads.length > 0) {
        renderResult(data);
        showToast('Media links resolved successfully! 🎉', 'success');
      } else {
        throw new Error(data.error || 'No downloadable streams found for this URL.');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      showToast(err.message || 'Failed to download media. Check link permissions.', 'error');
    } finally {
      loadingState.classList.remove('active');
      btnFetch.disabled = false;
      btnFetch.classList.remove('loading');
    }
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

    const apiBase = getApiBase();

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
        
        let finalDownloadUrl = item.url;
        if (!finalDownloadUrl.startsWith('http') && !finalDownloadUrl.startsWith('/api/')) {
          finalDownloadUrl = `/api/download?url=${encodeURIComponent(item.url)}&filename=${encodeURIComponent(cleanSafeName)}&ext=${item.ext || (isPhoto ? 'jpg' : (isAudio ? 'mp3' : 'mp4'))}`;
        }
        if (finalDownloadUrl.startsWith('/api/') && apiBase) {
          finalDownloadUrl = `${apiBase}${finalDownloadUrl}`;
        }

        row.innerHTML = `
          <div class="stream-meta">
            <span class="format-chip ${isPhoto ? 'photo' : ''}">${formatLabel}</span>
            <div>
              <div class="stream-quality-name">
                ${item.quality || 'High Quality'}
                ${item.badge ? `<span class="gold-badge ${isUltra ? 'ultra' : ''}">${item.badge}</span>` : ''}
              </div>
              <small style="color: var(--text-dim); font-size: 0.8rem;">${item.resolution || 'Direct In-App High Speed Stream'}</small>
            </div>
          </div>
          <a href="${finalDownloadUrl}" class="btn-stream-download" download="${cleanSafeName}.${item.ext || (isPhoto ? 'jpg' : (isAudio ? 'mp3' : 'mp4'))}">
            <span>${isPhoto ? '📸 Save 4K Photo' : (isAudio ? '🎵 Download MP3' : '📥 Download Video')}</span>
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

  // 8. Theme Toggle (Dark Mode / Luxury Gold Purple)
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    const savedTheme = localStorage.getItem('isha_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    themeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('isha_theme', next);
      updateThemeIcon(next);
      showToast(`Switched to ${next} mode! ✨`, 'info');
    });
  }

  function updateThemeIcon(theme) {
    if (!themeToggle) return;
    const icon = themeToggle.querySelector('i');
    if (icon) {
      icon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    }
  }

  // Initial UI check
  updateInputUI();
});
