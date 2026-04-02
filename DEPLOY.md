# 🚀 Learnify — Render Deployment (ONE Service)

## Architecture
One Render service hosts EVERYTHING:
- Express API at `/api/*`
- React frontend at all other routes

## Step 1: Push to GitHub

```bash
cd learnify
git init
git add .
git commit -m "Learnify v1.0"
git remote add origin https://github.com/YOUR/learnify.git
git push -u origin main
```

## Step 2: Create ONE Web Service on Render

1. render.com → **New Web Service**
2. Connect GitHub repo
3. Settings:

| Field | Value |
|-------|-------|
| Root Directory | *(empty)* |
| Build Command | `npm run build` |
| Start Command | `npm start` |
| Region | Singapore |
| Plan | Free |

## Step 3: Add Environment Variables

In Render → Environment tab:

```
NODE_ENV       = production
PORT           = 10000
MONGO_URI      = mongodb+srv://user:pass@cluster.mongodb.net/learnify
JWT_SECRET     = make_this_32_chars_random_string_here
CLIENT_URL     = https://YOUR-APP-NAME.onrender.com
ADMIN_EMAIL    = admin@learnify.com
ADMIN_PASSWORD = YourSecurePassword123!

CLOUDINARY_CLOUD_NAME  = your_cloud_name
CLOUDINARY_API_KEY     = your_api_key
CLOUDINARY_API_SECRET  = your_api_secret

RAZORPAY_KEY_ID     = rzp_live_xxxxxx
RAZORPAY_KEY_SECRET = your_secret

EMAIL_HOST = smtp.gmail.com
EMAIL_PORT = 587
EMAIL_USER = you@gmail.com
EMAIL_PASS = 16_char_app_password
EMAIL_FROM = Learnify <you@gmail.com>
```

## Step 4: Deploy!

Click "Create Web Service" → wait 5-10 min for first build.

Your URLs:
- Site: `https://your-app.onrender.com`
- Admin: `https://your-app.onrender.com/admin/login`
- API: `https://your-app.onrender.com/api/health`

---

## If You Deployed as 2 Separate Services (Frontend + Backend)

Add this env var in the **Frontend** service on Render:

```
VITE_API_URL = https://YOUR-BACKEND.onrender.com/api
```

Then redeploy the frontend service.

Also add in **Backend** service:
```
CLIENT_URL = https://YOUR-FRONTEND.onrender.com
```
