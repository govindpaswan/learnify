const express = require("express");
const mongoose = require("mongoose");
const cors    = require("cors");
const helmet  = require("helmet");
const morgan  = require("morgan");
const rateLimit = require("express-rate-limit");
const path    = require("path");
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

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(morgan("dev"));
app.use(cors({ origin: [process.env.CLIENT_URL || "https://learnify-server-lhub.onrender.com"], credentials: true }));
app.use(rateLimit({ windowMs: 15*60*1000, max: 500, message: { success: false, message: "Too many requests." } }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth",         authRoutes);
app.use("/api/courses",      courseRoutes);
app.use("/api/lessons",      lessonRoutes);
app.use("/api/enrollments",  enrollmentRoutes);
app.use("/api/payments",     paymentRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/admin",        adminRoutes);
app.use("/api/quizzes",      quizRoutes);
app.use("/api/reviews",      reviewRoutes);

app.get("/api/health", (req, res) => res.json({ status: "OK" }));
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅  MongoDB connected");
    await seedAdmin();
    app.listen(PORT, () => console.log(`🚀  Server running on port ${PORT}`));
  })
  .catch((err) => { console.error("❌  MongoDB error:", err.message); process.exit(1); });

async function seedAdmin() {
  try {
    const User = require("./models/User");
    const exists = await User.findOne({ email: process.env.ADMIN_EMAIL });
    if (!exists && process.env.ADMIN_EMAIL) {
      await User.create({
        name: "Super Admin", email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD || "Admin@12345",
        role: "admin", isVerified: true,
      });
      console.log("👤  Admin seeded →", process.env.ADMIN_EMAIL);
    }
  } catch (err) { console.error("Seed error:", err.message); }
}
