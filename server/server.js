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


// ── Security ───────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false,
}));
app.use(morgan(isProd ? "combined" : "dev"));


// ── ✅ FIXED CORS (IMPORTANT) ──────────────────────
app.use(cors({
  origin: true,              // ⚡ allow all origins (fix CORS issue)
  credentials: true,
}));

// ✅ Preflight fix (VERY IMPORTANT)
app.options("*", cors());


// ── Rate Limiting ─────────────────────────────────
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProd ? 300 : 1000,
}));


// ── Body Parser ───────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));


// ── Static uploads ────────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// ── API Routes ────────────────────────────────────
app.use("/api/auth",         authRoutes);
app.use("/api/courses",      courseRoutes);
app.use("/api/lessons",      lessonRoutes);
app.use("/api/enrollments",  enrollmentRoutes);
app.use("/api/payments",     paymentRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/admin",        adminRoutes);
app.use("/api/quizzes",      quizRoutes);
app.use("/api/reviews",      reviewRoutes);


// ── Health Check ──────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    env: process.env.NODE_ENV,
  });
});


// ── Serve React Frontend ──────────────────────────
if (isProd) {
  const clientBuild = path.join(__dirname, "../client/dist");

  app.use(express.static(clientBuild));

  app.get("*", (req, res) => {
    if (!req.path.startsWith("/api")) {
      res.sendFile(path.join(clientBuild, "index.html"));
    }
  });
}


// ── Error Handler ─────────────────────────────────
app.use(errorHandler);


// ── Start Server ──────────────────────────────────
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB connected");
    await seedAdmin();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB error:", err.message);
  });


// ── Seed Admin ────────────────────────────────────
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

      console.log("👤 Admin created");
    }
  } catch (err) {
    console.error("Seed error:", err.message);
  }
}
