const express   = require("express");
const mongoose  = require("mongoose");
const cors      = require("cors");
const helmet    = require("helmet");
const morgan    = require("morgan");
const rateLimit = require("express-rate-limit");
const path      = require("path");
const fs        = require("fs");
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

const app    = express();
const isProd = process.env.NODE_ENV === "production";

// ── CORS ──────────────────────────────────────────────────────────
app.use(cors({
  origin: true,           // allow ALL origins (safe behind Render)
  credentials: true,
  methods: ["GET","POST","PUT","DELETE","OPTIONS","PATCH"],
  allowedHeaders: ["Content-Type","Authorization"],
}));

// ── Middleware ────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" }, contentSecurityPolicy: false }));
app.use(morgan(isProd ? "combined" : "dev"));
app.use(rateLimit({ windowMs: 15*60*1000, max: 500 }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── API Routes ────────────────────────────────────────────────────
app.use("/api/auth",         authRoutes);
app.use("/api/courses",      courseRoutes);
app.use("/api/lessons",      lessonRoutes);
app.use("/api/enrollments",  enrollmentRoutes);
app.use("/api/payments",     paymentRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/admin",        adminRoutes);
app.use("/api/quizzes",      quizRoutes);
app.use("/api/reviews",      reviewRoutes);
app.get("/api/health", (_, res) => res.json({ status: "OK", time: new Date() }));

// ── Serve React Frontend ──────────────────────────────────────────
// client/dist is built during Render build step
const distPath = path.join(__dirname, "..", "client", "dist");
if (fs.existsSync(distPath)) {
  console.log("📦  Serving React from:", distPath);
  app.use(express.static(distPath));
  // All non-API routes → React app
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
} else {
  console.log("⚠️   No client/dist found - API only mode");
  app.get("/", (_, res) => res.json({ message: "Learnify API running", health: "/api/health" }));
}

// ── Error Handler ─────────────────────────────────────────────────
app.use(errorHandler);

// ── Start Server ──────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT) || 5000;
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅  MongoDB connected");
    await seedAdmin();
    app.listen(PORT, "0.0.0.0", () =>
      console.log(`🚀  Learnify running on port ${PORT}`)
    );
  })
  .catch(err => { console.error("❌  DB error:", err.message); process.exit(1); });

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
      console.log("👤  Admin seeded:", process.env.ADMIN_EMAIL);
    }
  } catch (e) { console.error("Seed error:", e.message); }
}
