# 🚀 Learnify — Render Deployment Guide

## Prerequisites
- GitHub account
- Render.com account (free)
- MongoDB Atlas account (free)
- Cloudinary account (free)

---

## Step 1: MongoDB Atlas Setup

1. Go to [mongodb.com/atlas](https://mongodb.com/atlas) → Create free cluster
2. Database Access → Add User → username + password
3. Network Access → Add IP → `0.0.0.0/0`
4. Connect → Drivers → Copy connection string

```
mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/learnify
```

---

## Step 2: Push to GitHub

```bash
cd learnify
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/learnify.git
git push -u origin main
```

---

## Step 3: Deploy on Render

1. Go to [render.com](https://render.com) → Sign in
2. **New** → **Web Service**
3. Connect your GitHub repo
4. Settings:
   - **Name:** `learnify`
   - **Region:** `Singapore` (closest to India)
   - **Branch:** `main`
   - **Root Directory:** *(leave empty)*
   - **Build Command:** `npm install --prefix server && npm install --prefix client && npm run build --prefix client`
   - **Start Command:** `cd server && node server.js`
   - **Plan:** Free

5. **Environment Variables** → Add all these:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `MONGO_URI` | `mongodb+srv://...` |
| `JWT_SECRET` | `your_random_32_char_secret` |
| `CLIENT_URL` | `https://learnify.onrender.com` *(your render URL)* |
| `ADMIN_EMAIL` | `admin@learnify.com` |
| `ADMIN_PASSWORD` | `YourSecurePassword123!` |
| `CLOUDINARY_CLOUD_NAME` | from Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | from Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | from Cloudinary dashboard |
| `RAZORPAY_KEY_ID` | from Razorpay dashboard |
| `RAZORPAY_KEY_SECRET` | from Razorpay dashboard |
| `EMAIL_USER` | your Gmail |
| `EMAIL_PASS` | 16-char Gmail App Password |

6. Click **Create Web Service**

---

## Step 4: After Deploy

Your app will be live at: `https://learnify.onrender.com`

- **Student:** `https://learnify.onrender.com`
- **Admin:** `https://learnify.onrender.com/admin/login`

**Note:** Free tier sleeps after 15 min inactivity. First request takes ~30 sec to wake up.

---

## Step 5: Seed Data (Optional)

After deploy, run seed locally pointed to Atlas:

```bash
cd server
# Update .env MONGO_URI to Atlas URL
node seed.js
```

---

## Cloudinary Setup

1. [cloudinary.com](https://cloudinary.com) → Sign up free
2. Dashboard → copy Cloud Name, API Key, API Secret

---

## Razorpay Setup

1. [razorpay.com](https://razorpay.com) → Sign up
2. Settings → API Keys → Generate Live Keys
3. For testing use Test Keys (rzp_test_...)

---

## Gmail App Password

1. Google Account → Security → 2-Step Verification (enable)
2. App Passwords → Select app: Mail → Generate
3. Copy 16-character password
