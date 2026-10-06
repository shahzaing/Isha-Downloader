# 🚀 Isha Video Downloader
**Developed by Isha Zahid**

A professional, high-performance, and mobile-friendly All-in-One Social Media Video & Audio Downloader Web Application.

---

## ✨ Key Features

- **Multi-Platform Support**: TikTok (No Watermark), Instagram Reels & Posts, YouTube Shorts & Videos, Facebook Videos, Twitter / X, and Pinterest.
- **Ultra-Modern UI/UX**: Luxury Dark Obsidian theme with responsive layout, glassmorphism, glowing accents, and smooth animations.
- **Mobile Optimized**: Seamless experience on Android (Chrome) and iPhone / iPad (Safari) with direct downloads.
- **Fast CDN Streaming**: Direct high-speed download links with quality options (1080p Full HD, 720p HD, MP3 Audio).
- **1-Click Paste & Detection**: Automatically detects the platform and fetches media info with thumbnail, duration, and title preview.
- **100% Free & No Sign-up**: Unlimited downloads with zero registration required.
- **Vercel & Cloud Ready**: Pre-configured serverless configuration (`vercel.json`) for 1-click deployment.

---

## 🛠️ How to Run Locally

1. Open terminal inside this folder:
   ```bash
   npm install
   ```
2. Start the local server:
   ```bash
   npm start
   ```
3. Open your browser and visit:
   ```
   http://localhost:3000
   ```

---

## 🌐 How to Deploy to GitHub & Vercel

### Step 1: Push to GitHub
1. Create a new repository on [GitHub](https://github.com) named `isha-video-downloader`.
2. In your project terminal, run:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Isha Video Downloader by Isha Zahid"
   git branch -M main
   git remote add origin https://github.com/YOUR_GITHUB_USERNAME/isha-video-downloader.git
   git push -u origin main
   ```

### Step 2: Deploy on Vercel (100% Free)
1. Go to [Vercel.com](https://vercel.com) and log in with your GitHub account.
2. Click **"Add New..."** -> **"Project"**.
3. Import your `isha-video-downloader` GitHub repository.
4. Click **"Deploy"** (no custom build settings required, `vercel.json` will automatically configure everything).
5. Within 30 seconds, your site will be live at `https://isha-video-downloader.vercel.app`!

---

## 🔗 How to Connect Your GoDaddy Domain

1. On **Vercel Dashboard**, go to your project -> **Settings** -> **Domains**.
2. Type your GoDaddy domain name (e.g., `ishadownloader.com` or `www.ishadownloader.com`) and click **Add**.
3. Vercel will show you the exact DNS records to add:
   - **Type A Record**: `@` pointing to `76.76.21.21`
   - **Type CNAME Record**: `www` pointing to `cname.vercel-dns.com`
4. Log into your **GoDaddy Account** -> **My Products** -> **DNS Management** for your domain.
5. Add or edit the **A** and **CNAME** records provided by Vercel.
6. Wait 5-15 minutes for DNS propagation — your custom domain will now be live with free SSL (HTTPS)!

---

## 👩‍💻 Credits & Author

- **Creator & Developer**: **Isha Zahid**
- **License**: MIT
