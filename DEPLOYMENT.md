# Deployment Guide — Voice Flow 360

This repository contains a full-stack, production-ready build of the Voice Flow 360 portal.

---

## 1. Quick Build & Run (Node.js / VPS / PM2)

### Prerequisites
- Node.js 20+ or 22+
- npm or yarn

### Steps to Build & Start
```bash
# 1. Install all dependencies
npm install

# 2. Build client SPA, SSG SEO pages, and server bundle
npm run build

# 3. Start production server
npm start
```

### Running with PM2 on a VPS
```bash
npm install -g pm2
pm2 start dist/server.cjs --name "voiceflow360"
pm2 save
pm2 startup
```

---

## 2. Docker Deployment (Cloud Run, Railway, Render, VPS)

A multi-stage `Dockerfile` is included.

### Build and Run Docker Container:
```bash
# Build the image
docker build -t voiceflow360:latest .

# Run the container (listening on port 3000)
docker run -d -p 3000:3000 \
  -e NODE_ENV=production \
  -e GEMINI_API_KEY=your_gemini_api_key \
  --name voiceflow360 voiceflow360:latest
```

---

## 3. Cloud Run / Container Platforms (GCP, Railway, Render)

1. Connect your Git repository to **Google Cloud Run**, **Railway**, or **Render**.
2. Select **Docker** or use standard Node runtime:
   - Build Command: `npm run build`
   - Start Command: `npm start`
3. Set Environment Variables:
   - `PORT`: `3000` (or platform default)
   - `NODE_ENV`: `production`
   - `GEMINI_API_KEY`: *(Optional)* for server-side AI grounding
   - `SMTP_USER` & `SMTP_PASS`: *(Optional)* if using cPanel custom SMTP for outbound transactional emails

---

## 4. Static Hosting (Vercel, Netlify, Cloudflare Pages)

The `dist/` directory contains:
- Full client bundle (`dist/index.html` + `dist/assets/`)
- Pre-rendered static HTML files for over 315 routes (e.g. `/brand-case-studies`, `/about`, `/brands/*`) for search engine crawlers and AdSense compliance.
- `robots.txt`, `sitemap.xml`, and `ads.txt`

If deploying as static files only:
- Publish directory: `dist`
- Note: Dynamic Express proxy endpoints (e.g. `/api/brand-analysis`, `/api/email/*`) require Node.js runtime or serverless functions.

---

## 5. Environment Variables & Firebase Configuration

- `firebase-applet-config.json` is bundled directly into the build and connects to your live Cloud Firestore database (`ai-studio-remixchatearnfee-1a4fe499-2097-4245-b4c6-cdbc1babfb5e`).
- All Firestore security rules have been deployed.
