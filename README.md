# 🎓 Learnify – Full-Stack MERN Online Learning Platform

A complete online learning platform with student enrollment, video lessons, quizzes, Razorpay payments, PDF certificates, and a full admin panel.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | MongoDB (Mongoose) |
| Auth | JWT (JSON Web Tokens) |
| Payments | Razorpay |
| Storage | Cloudinary |
| PDF | PDFKit |
| Email | Nodemailer (Gmail) |

---

## 📦 Project Structure

```
learnify/
├── client/               ← React Frontend (Vite + Tailwind)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Courses.jsx
│   │   │   ├── CourseDetail.jsx
│   │   │   ├── VerifyCertificate.jsx
│   │   │   ├── auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   └── Register.jsx
│   │   │   ├── student/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── MyCourses.jsx
│   │   │   │   ├── LearnCourse.jsx
│   │   │   │   ├── MyCertificates.jsx
│   │   │   │   ├── Profile.jsx
│   │   │   │   └── PaymentHistory.jsx
│   │   │   └── admin/
│   │   │       ├── AdminLayout.jsx
│   │   │       ├── Dashboard.jsx
│   │   │       ├── Courses.jsx
│   │   │       ├── CourseForm.jsx
│   │   │       ├── Lessons.jsx
│   │   │       ├── QuizForm.jsx
│   │   │       ├── Users.jsx
│   │   │       ├── Enrollments.jsx
│   │   │       ├── Payments.jsx
│   │   │       └── Certificates.jsx
│   │   ├── components/
│   │   │   └── common/
│   │   │       ├── Navbar.jsx
│   │   │       ├── Footer.jsx
│   │   │       ├── CourseCard.jsx
│   │   │       └── Spinner.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   └── utils/
│   │       └── api.js
│   └── index.html
└── server/               ← Node.js + Express Backend
    ├── controllers/
    │   ├── authController.js
    │   ├── courseController.js
    │   ├── lessonController.js
    │   ├── enrollmentController.js
    │   ├── paymentController.js
    │   ├── certificateController.js
    │   ├── adminController.js
    │   └── quizController.js
    ├── models/
    │   ├── User.js
    │   ├── Course.js
    │   ├── Lesson.js
    │   ├── Enrollment.js
    │   ├── Payment.js
    │   ├── Certificate.js
    │   └── Quiz.js
    ├── routes/
    │   ├── authRoutes.js
    │   ├── courseRoutes.js
    │   ├── lessonRoutes.js
    │   ├── enrollmentRoutes.js
    │   ├── paymentRoutes.js
    │   ├── certificateRoutes.js
    │   ├── adminRoutes.js
    │   └── quizRoutes.js
    ├── middleware/
    │   ├── authMiddleware.js
    │   └── errorMiddleware.js
    ├── config/
    │   └── cloudinary.js
    ├── utils/
    │   ├── email.js
    │   └── pdfGenerator.js
    └── server.js
```

---

## ⚙️ Setup Guide

### Step 1 — Prerequisites

- Node.js v18+
- MongoDB Atlas account (free tier)
- Cloudinary account (free tier)
- Razorpay account (test mode)
- Gmail account (for email)

---

### Step 2 — Clone & Install

```bash
# Install all dependencies
cd server && npm install
cd ../client && npm install
```

---

### Step 3 — Environment Variables

**Server** — Copy `server/.env.example` to `server/.env` and fill in:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/learnify
JWT_SECRET=your_super_secret_min_32_chars
JWT_EXPIRE=30d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_16_char_app_password
EMAIL_FROM=Learnify <your_gmail@gmail.com>

CLIENT_URL=http://localhost:5173
ADMIN_EMAIL=admin@learnify.com
ADMIN_PASSWORD=Admin@12345
```

**Client** — Copy `client/.env.example` to `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

---

### Step 4 — Add Razorpay Script to index.html

In `client/index.html`, add before `</body>`:
```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

---

### Step 5 — Run Development

```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

---

### Step 6 — Admin Login

```
Email:    admin@learnify.com
Password: Admin@12345
```
(Auto-seeded on first server start)

---

## 🔌 API Reference

### Auth
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | /api/auth/register | Public | Register student |
| POST | /api/auth/login | Public | Login |
| GET | /api/auth/me | Private | Get profile |
| PUT | /api/auth/profile | Private | Update profile |
| PUT | /api/auth/change-password | Private | Change password |

### Courses
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | /api/courses | Public | List published courses |
| GET | /api/courses/:id | Public | Course details |
| GET | /api/courses/categories | Public | All categories |
| POST | /api/courses | Admin | Create course |
| PUT | /api/courses/:id | Admin | Update course |
| DELETE | /api/courses/:id | Admin | Delete course |

### Payments
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | /api/payments/create-order | Private | Create Razorpay order |
| POST | /api/payments/verify | Private | Verify payment + enroll |
| GET | /api/payments/my | Private | Student payment history |
| GET | /api/payments/admin/all | Admin | All payments |

### Certificates
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | /api/certificates/my | Private | My certificates |
| GET | /api/certificates/download/:certId | Private | Download PDF |
| GET | /api/certificates/verify/:certId | Public | Verify certificate |
| GET | /api/certificates/admin/all | Admin | All certificates |

---

## 🌐 Deployment

### Frontend — Vercel
```bash
cd client
npm run build
# Deploy dist/ to Vercel
# Set VITE_API_URL=https://your-backend.onrender.com/api
```

### Backend — Render
1. Connect GitHub repo
2. Set Build Command: `cd server && npm install`
3. Set Start Command: `cd server && node server.js`
4. Add all environment variables in Render dashboard

### Database — MongoDB Atlas
1. Create free cluster
2. Add `0.0.0.0/0` to IP whitelist (or Render's IP)
3. Copy connection string to MONGO_URI

---

## ✨ Features Summary

- ✅ JWT Authentication (Student + Admin roles)
- ✅ Responsive dark/light mode UI
- ✅ Course browsing with search & filters
- ✅ Razorpay payment integration
- ✅ Free course enrollment
- ✅ Video lessons with progress tracking
- ✅ Quiz system with explanations
- ✅ PDF certificate generation
- ✅ Certificate verification page
- ✅ Email notifications (enrollment + certificate)
- ✅ Admin dashboard with charts
- ✅ Admin: manage courses, lessons, quizzes
- ✅ Admin: manage users (block/unblock/delete)
- ✅ Cloudinary for images & videos
- ✅ Mobile-first responsive design
