# Voice Flow 360

An enterprise conversational consumer intelligence and market research platform. Users participate in interactive chat surveys and trivia polls, share brand feedback, and earn verified rewards.

---

## 🚀 How to Push to GitHub & Deploy to Vercel

### Step 1: Initialize Git Repository and Push to GitHub

1. Unzip the downloaded code archive on your computer.
2. Open a terminal in the project directory and run:

```bash
# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit - Voice Flow 360"

# Set default branch to main
git branch -M main

# Add your GitHub remote (replace with your GitHub repository URL)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git

# Push code to GitHub
git push -u origin main
```

---

### Step 2: Deploy to Vercel (1-Click Setup)

1. Log into your account on [Vercel](https://vercel.com).
2. Click **"Add New..."** -> **"Project"**.
3. Select your newly pushed **GitHub repository**.
4. Vercel will automatically detect `Vite` framework settings (configured in `vercel.json`):
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. *(Optional)* In **Environment Variables**, add:
   - `GEMINI_API_KEY`: *(Optional, for AI grounding features)*
6. Click **"Deploy"**.

Vercel will build and launch your live portal with global CDN caching, automatic SSL, and pre-rendered SEO pages!

---

## 🛠 Local Development

```bash
# Install dependencies
npm install

# Start local development server (port 3000)
npm run dev

# Create complete production build
npm run build

# Start production server
npm start
```
