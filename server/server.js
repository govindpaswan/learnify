const express   = require("express");
const mongoose  = require("mongoose");
const cors      = require("cors");
const helmet    = require("helmet");
const morgan    = require("morgan");
const rateLimit = require("express-rate-limit");
const path      = require("path");
require("dotenv").config();

const authRoutes        = require("./routes/authRoutes");
const courseRoutes      = require("./routes/courseRoutes");
const lessonRoutes      = require("./routes/lessonRoutes");
const enrollmentRoutes  = require("./routes/enrollmentRoutes");
const paymentRoutes     = require("./routes/paymentRoutes");
const certificateRoutes = require("./routes/certificateRoutes");
const adminRoutes       = require("./routes/adminRoutes");
const quizRoutes        = require("./routes/quizRoutes");
const reviewRoutes      = require("./routes/reviewRoutes");
const { errorHandler }  = require("./middleware/errorMiddleware");

const app  = express();
const isProd = process.env.NODE_ENV === "production";

// ── Security ───────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false,  // Allow React app assets
}));
app.use(morgan(isProd ? "combined" : "dev"));

// ── CORS ───────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:3000",
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));

// ── Rate Limiting ──────────────────────────────────────────────────
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProd ? 300 : 1000,
  message: { success: false, message: "Too many requests, please try again later." },
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ── Static uploads ─────────────────────────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── API Routes ─────────────────────────────────────────────────────
app.use("/api/auth",         authRoutes);
app.use("/api/courses",      courseRoutes);
app.use("/api/lessons",      lessonRoutes);
app.use("/api/enrollments",  enrollmentRoutes);
app.use("/api/payments",     paymentRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/admin",        adminRoutes);
app.use("/api/quizzes",      quizRoutes);
app.use("/api/reviews",      reviewRoutes);

app.get("/api/health", (req, res) => res.json({
  status: "OK",
  env: process.env.NODE_ENV,
  timestamp: new Date().toISOString(),
}));

// ── Serve React Frontend in Production ────────────────────────────
if (isProd) {
  const clientBuild = path.join(__dirname, "../client/dist");
  app.use(express.static(clientBuild));
  // All non-API routes → serve React index.html (SPA support)
  app.get("*", (req, res) => {
    if (!req.path.startsWith("/api")) {
      res.sendFile(path.join(clientBuild, "index.html"));
    }
  });
}

// ── Error Handler ──────────────────────────────────────────────────
app.use(errorHandler);

// ── Start ──────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅  MongoDB connected");
    await seedAdmin();
    app.listen(PORT, "0.0.0.0", () =>
      console.log(`🚀  Server running on port ${PORT} [${process.env.NODE_ENV}]`)
    );
  })
  .catch((err) => {
    console.error("❌  MongoDB error:", err.message);
    process.exit(1);
  });

async function seedAdmin() {
  try {
    const User = require("./models/User");
    const exists = await User.findOne({ email: process.env.ADMIN_EMAIL });
    if (!exists && process.env.ADMIN_EMAIL) {
      await User.create({
        name: "Super Admin",
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD || "Admin@12345",
        role: "admin",
        isVerified: true,
      });
      console.log("👤  Admin seeded →", process.env.ADMIN_EMAIL);
    }
  } catch (err) { console.error("Seed error:", err.message); }
}
