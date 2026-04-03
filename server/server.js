const express  = require("express");
const mongoose = require("mongoose");
const cors     = require("cors");
const helmet   = require("helmet");
const morgan   = require("morgan");
const rateLimit = require("express-rate-limit");
const path     = require("path");
const fs       = require("fs");
require("dotenv").config();

const app = express();

// CORS - allow all origins (Render, localhost, any frontend)
app.use(cors({ origin: true, credentials: true }));
app.options("*", cors({ origin: true, credentials: true }));

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" }, contentSecurityPolicy: false }));
app.use(morgan("dev"));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 500, standardHeaders: true, legacyHeaders: false }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API Routes
app.use("/api/auth",         require("./routes/authRoutes"));
app.use("/api/courses",      require("./routes/courseRoutes"));
app.use("/api/lessons",      require("./routes/lessonRoutes"));
app.use("/api/enrollments",  require("./routes/enrollmentRoutes"));
app.use("/api/payments",     require("./routes/paymentRoutes"));
app.use("/api/certificates", require("./routes/certificateRoutes"));
app.use("/api/admin",        require("./routes/adminRoutes"));
app.use("/api/quizzes",      require("./routes/quizRoutes"));
app.use("/api/reviews",      require("./routes/reviewRoutes"));
app.get("/api/health", (_, res) => res.json({ ok: true, time: new Date() }));

// Serve React build (single service deployment)
const dist = path.join(__dirname, "..", "client", "dist");
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get("*", (req, res) => res.sendFile(path.join(dist, "index.html")));
}

app.use(require("./middleware/errorMiddleware").errorHandler);

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB connected");
    // Seed admin
    try {
      const User = require("./models/User");
      if (process.env.ADMIN_EMAIL) {
        const exists = await User.findOne({ email: process.env.ADMIN_EMAIL });
        if (!exists) {
          await User.create({
            name: "Super Admin", email: process.env.ADMIN_EMAIL,
            password: process.env.ADMIN_PASSWORD || "Admin@12345",
            role: "admin", isVerified: true,
          });
          console.log("👤 Admin seeded:", process.env.ADMIN_EMAIL);
        }
      }
    } catch (e) { console.error("Seed error:", e.message); }

    app.listen(PORT, "0.0.0.0", () => console.log(`🚀 Server on port ${PORT}`));
  })
  .catch(err => { console.error("❌ DB error:", err.message); process.exit(1); });
