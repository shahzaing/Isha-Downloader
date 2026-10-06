// Isha Video Downloader - Frontend Client Logic
// Developed by Isha Zahid

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

  // Preview elements
  const resultThumb = document.getElementById('resultThumb');
  const resultDuration = document.getElementById('resultDuration');
  const resultPlatform = document.getElementById('resultPlatform');
  const resultTitle = document.getElementById('resultTitle');
  const resultAuthor = document.getElementById('resultAuthor');
  const downloadOptionsContainer = document.getElementById('downloadOptions');

  // 1. Platform Detection
  function checkUrlPlatform(url) {
    if (!url) return null;
    const lower = url.toLowerCase();
    if (lower.includes('tiktok.com')) return { name: 'TikTok', class: 'tiktok', icon: '🎵' };
    if (lower.includes('instagram.com')) return { name: 'Instagram', class: 'instagram', icon: '📸' };
    if (lower.includes('youtube.com') || lower.includes('youtu.be')) return { name: 'YouTube', class: 'youtube', icon: '📺' };
    if (lower.includes('facebook.com') || lower.includes('fb.watch') || lower.includes('fb.com')) return { name: 'Facebook', class: 'facebook', icon: '📘' };
    if (lower.includes('twitter.com') || lower.includes('x.com')) return { name: 'Twitter / X', class: 'twitter', icon: '🐦' };
    if (lower.includes('pinterest.com') || lower.includes('pin.it')) return { name: 'Pinterest', class: 'pinterest', icon: '📌' };
    if (lower.includes('reddit.com')) return { name: 'Reddit', class: 'reddit', icon: '🤖' };
    return null;
  }

  function updateInputUI() {
    const val = videoInput.value.trim();
    if (val.length > 0) {
      btnClear.style.display = 'inline-flex';
      const platform = checkUrlPlatform(val);
      if (platform) {
        badgeTag.textContent = `${platform.icon} ${platform.name}`;
        badgeTag.className = `badge-tag ${platform.class}`;
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

  // 2. Paste Button
  btnPaste.addEventListener('click', async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          videoInput.value = text.trim();
          updateInputUI();
          showToast('Link pasted from clipboard! 📋', 'success');
          // Auto trigger fetch if valid link
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
      showToast('Clipboard access was blocked. Please paste manually.', 'info');
    }
  });

  // 3. Clear Button
  btnClear.addEventListener('click', () => {
    videoInput.value = '';
    updateInputUI();
    resultCard.classList.remove('active');
    videoInput.focus();
  });

  // 4. Download Action Trigger
  btnFetch.addEventListener('click', () => {
    fetchMedia();
  });

  videoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      fetchMedia();
    }
  });

  // 5. Fetch Media from API
  async function fetchMedia() {
    const url = videoInput.value.trim();

    if (!url) {
      showToast('Please paste a video link first!', 'error');
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
    btnFetch.innerHTML = '<span>Fetching Video...</span>';

    try {
      const response = await fetch('/api/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to download video. Please check the URL.');
      }

      renderResult(data);
      showToast('Video processed successfully! 🎉', 'success');
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Could not fetch video. Verify the link is public.', 'error');
    } finally {
      loadingState.classList.remove('active');
      btnFetch.disabled = false;
      btnFetch.innerHTML = '<span>⚡ Download Now</span>';
    }
  }

  // 6. Render Download Results
  function renderResult(data) {
    resultTitle.textContent = data.title || 'Social Media Video';
    resultAuthor.textContent = data.author ? `By ${data.author}` : 'Public Video';
    resultPlatform.textContent = data.platform || 'HD Media';

    // Thumbnail fallback
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

    // Render download links
    downloadOptionsContainer.innerHTML = '';

    if (data.downloads && data.downloads.length > 0) {
      data.downloads.forEach((item, index) => {
        const row = document.createElement('div');
        row.className = 'download-row';

        const isAudio = item.type === 'audio' || item.ext === 'mp3';
        const isPhoto = item.type === 'photo';
        const formatLabel = isAudio ? 'MP3' : (isPhoto ? 'JPG' : (item.ext ? item.ext.toUpperCase() : 'MP4'));

        const cleanSafeName = (data.title || 'IshaDownloader')
          .replace(/[^a-zA-Z0-9_-]/g, '_')
          .slice(0, 30);
        
        // Proxy download link for reliable saving
        const proxyDownloadUrl = `/api/download?url=${encodeURIComponent(item.url)}&filename=${encodeURIComponent(cleanSafeName)}&ext=${item.ext || 'mp4'}`;

        row.innerHTML = `
          <div class="download-info">
            <span class="download-format-badge">${formatLabel}</span>
            <div>
              <div class="download-quality-title">
                ${item.quality || 'High Quality'}
                ${item.badge ? `<span class="download-badge-recom">${item.badge}</span>` : ''}
              </div>
              <small style="color: var(--text-dim); font-size: 0.78rem;">${item.resolution || 'Direct Stream'}</small>
            </div>
          </div>
          <a href="${proxyDownloadUrl}" class="btn-download-action" download="${cleanSafeName}.${item.ext || 'mp4'}">
            <span>📥 Download</span>
          </a>
        `;

        downloadOptionsContainer.appendChild(row);
      });
    } else {
      downloadOptionsContainer.innerHTML = `<p style="color: var(--text-muted); font-size: 0.9rem;">No direct download formats available. Please try another link.</p>`;
    }

    resultCard.classList.add('active');
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // 7. Toast Notifications
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
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

  // 8. FAQ Accordion Toggle
  const faqQuestions = document.querySelectorAll('.faq-question');
  faqQuestions.forEach(btn => {
    btn.addEventListener('click', () => {
      const parent = btn.parentElement;
      const isActive = parent.classList.contains('active');

      // Close all others
      document.querySelectorAll('.faq-item').forEach(item => item.classList.remove('active'));

      if (!isActive) {
        parent.classList.add('active');
      }
    });
  });

  // 9. Platform chips click
  document.querySelectorAll('.platform-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      videoInput.focus();
      showToast(`Copy and paste any ${chip.textContent.trim()} link here! 🚀`, 'info');
    });
  });
});
