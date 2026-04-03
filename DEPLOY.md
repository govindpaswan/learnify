# Learnify — Fixed & Deployment Guide

## ✅ Bugs Fixed
1. **Blank screen / TypeError** — `AuthContext.jsx` had `action.payload.token` crash when payload was undefined. Added null guards in both student & admin LOGIN reducers.
2. **Double API call** — `Login.jsx` was hitting the backend twice (once manually, once via `login()`). Fixed to single call.
3. **Missing redirect** — Login now explicitly navigates to `/dashboard` after success.

---

## 🚀 Render.com (Single Service — Recommended)

**Build Command:**
```
npm install --prefix server && npm install --prefix client && npm run build --prefix client
```
**Start Command:**
```
node server/server.js
```

**Environment Variables to set on Render:**
```
NODE_ENV=production
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_secret_here
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=StrongPassword123
CLIENT_URL=https://your-app.onrender.com
```

The `client/.env.production` is already set to `VITE_API_URL=/api` ✅

---

## 🌐 VPS / cPanel (Separate Frontend + Backend)

### Backend
```bash
cd server && npm install
node server.js   # or: pm2 start server.js
```

### Frontend — Build Locally
```bash
# Set your backend URL first:
echo "VITE_API_URL=https://api.yourdomain.com/api" > client/.env.production

cd client && npm install && npm run build
# Upload client/dist/ to your public_html or subdomain folder
```

### ⚠️ SPA Routing — REQUIRED for non-Render hosting

**Nginx:**
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

**Apache / cPanel `.htaccess`** (place in dist/ folder):
```apache
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QSA,L]
```

Without this, refreshing any page other than `/` shows a blank screen.

---

## 🔑 First Login
- Admin: use `ADMIN_EMAIL` and `ADMIN_PASSWORD` from your env vars
- The admin account is auto-created on first server start
