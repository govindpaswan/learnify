const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// ── Models ────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema({
  name: String, email: { type: String, unique: true }, password: { type: String, select: false },
  role: { type: String, default: "student" }, avatar: { url: String, public_id: String },
  bio: String, phone: String, isVerified: { type: Boolean, default: true },
  isBlocked: { type: Boolean, default: false },
  enrolledCourses: [mongoose.Schema.Types.ObjectId],
  completedCourses: [mongoose.Schema.Types.ObjectId],
}, { timestamps: true });
userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
const User = mongoose.models.User || mongoose.model("User", userSchema);

const lessonSchema = new mongoose.Schema({
  course: mongoose.Schema.Types.ObjectId,
  title: String, description: String,
  videoUrl: { type: String, default: "" },
  videoPublicId: { type: String, default: "" },
  videoDuration: { type: Number, default: 0 },
  order: Number, isPreview: { type: Boolean, default: false },
  resources: Array,
}, { timestamps: true });
const Lesson = mongoose.models.Lesson || mongoose.model("Lesson", lessonSchema);

const courseSchema = new mongoose.Schema({
  title: String, slug: { type: String, unique: true },
  description: String, shortDescription: String,
  thumbnail: { url: String, public_id: String },
  instructor: String, instructorBio: String, instructorAvatar: String,
  category: String,
  level: { type: String, enum: ["Beginner", "Intermediate", "Advanced"] },
  language: { type: String, default: "English" },
  price: Number, discountPrice: { type: Number, default: 0 },
  isFree: { type: Boolean, default: false },
  duration: String, totalLessons: { type: Number, default: 0 },
  lessons: [mongoose.Schema.Types.ObjectId],
  requirements: [String], whatYouLearn: [String], tags: [String],
  rating: { type: Number, default: 4.5 },
  totalRatings: { type: Number, default: 0 },
  enrolledCount: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: true },
  certificate: { type: Boolean, default: true },
}, { timestamps: true });
const Course = mongoose.models.Course || mongoose.model("Course", courseSchema);

// ── Seed Data ─────────────────────────────────────────────────────

const COURSES = [
  // ── Web Development ──────────────────────────────────────────────
  {
    title: "Complete HTML & CSS Masterclass",
    shortDescription: "Learn to build professional websites with HTML5 and CSS3 — from absolute scratch.",
    description: "In this course you'll master all HTML5 elements, CSS3 styling, Flexbox, Grid, and responsive design. You'll practice with real-world projects covering forms, tables, semantic HTML, CSS animations, and media queries.",
    instructor: "Rahul Sharma",
    instructorBio: "10+ years of web development experience. Trained 50,000+ students.",
    category: "Web Development",
    level: "Beginner",
    price: 0,
    isFree: true,
    duration: "8h 30m",
    rating: 4.7,
    enrolledCount: 12500,
    tags: ["html", "css", "web design", "responsive", "frontend"],
    requirements: ["Computer aur internet connection", "Koi bhi prior coding knowledge nahi chahiye"],
    whatYouLearn: [
      "HTML5 ke saare tags aur elements",
      "CSS3 styling aur selectors",
      "Flexbox aur CSS Grid layout",
      "Responsive design with media queries",
      "CSS animations aur transitions",
      "Real-world website projects banana",
    ],
    thumbnail: {
      url: "https://images.unsplash.com/photo-1621839673705-6617adf9e890?w=800&h=450&fit=crop",
      public_id: "learnify/html-css",
    },
  },
  {
    title: "JavaScript — Zero to Hero",
    shortDescription: "Master Modern JavaScript (ES6+) — DOM manipulation, Fetch API, async/await and more.",
    description: "Learn JavaScript programming from beginner to advanced level. Starting from variables, functions, arrays and objects, all the way to ES6+ features like arrow functions, destructuring, promises, and async/await. Includes DOM manipulation, event handling, and Fetch API.",
    instructor: "Priya Menon",
    instructorBio: "Senior Frontend Developer at TechCorp Mumbai. JavaScript expert with 8 years of experience.",
    category: "Web Development",
    level: "Beginner",
    price: 1499,
    discountPrice: 799,
    duration: "22h 15m",
    rating: 4.8,
    enrolledCount: 9800,
    tags: ["javascript", "es6", "dom", "async", "frontend"],
    requirements: ["Basic HTML/CSS knowledge", "Text editor (VS Code recommended)"],
    whatYouLearn: [
      "JavaScript fundamentals — variables, loops, functions",
      "ES6+ modern features",
      "DOM manipulation aur events",
      "Fetch API aur AJAX",
      "Async/Await aur Promises",
      "Error handling best practices",
      "10+ mini projects",
    ],
    thumbnail: {
      url: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&h=450&fit=crop",
      public_id: "learnify/javascript",
    },
  },
  {
    title: "React.js Complete Guide 2024",
    shortDescription: "React 18 seekho — Hooks, Context, Redux, React Router sab ek jagah.",
    description: "The most comprehensive React.js course. Covers React 18 features, all Hooks (useState, useEffect, useContext, useRef, useCallback, useMemo), React Router v6, Context API, and Redux Toolkit. Build real-world projects like an e-commerce app and blog platform.",
    instructor: "Arjun Kapoor",
    instructorBio: "Full Stack Developer with 6 years of React experience. Works at a leading Mumbai startup.",
    category: "Web Development",
    level: "Intermediate",
    price: 2499,
    discountPrice: 1299,
    duration: "32h 45m",
    rating: 4.9,
    enrolledCount: 7200,
    tags: ["react", "hooks", "redux", "javascript", "frontend"],
    requirements: ["JavaScript basics (ES6+)", "HTML/CSS knowledge", "Node.js installed"],
    whatYouLearn: [
      "React components aur JSX",
      "All React Hooks in depth",
      "React Router v6 navigation",
      "Context API aur state management",
      "Redux Toolkit",
      "API integration with Axios",
      "Build 3 complete projects",
    ],
    thumbnail: {
      url: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=450&fit=crop",
      public_id: "learnify/react",
    },
  },
  {
    title: "Node.js & Express Backend Development",
    shortDescription: "REST APIs, MongoDB, JWT auth — poora backend development ek course mein.",
    description: "Learn to build production-ready backend APIs with Node.js and Express.js. Covers MongoDB and Mongoose database operations, JWT authentication, file uploads with Multer, email sending, and deployment on Render/Railway. The perfect foundation for MERN stack development.",
    instructor: "Neha Singh",
    instructorBio: "Backend Engineer with expertise in Node.js and cloud deployments.",
    category: "Web Development",
    level: "Intermediate",
    price: 1999,
    discountPrice: 1099,
    duration: "28h 0m",
    rating: 4.7,
    enrolledCount: 5600,
    tags: ["nodejs", "express", "mongodb", "api", "backend"],
    requirements: ["JavaScript knowledge required", "Basic understanding of HTTP"],
    whatYouLearn: [
      "Node.js fundamentals aur npm",
      "Express.js REST API banana",
      "MongoDB aur Mongoose",
      "JWT Authentication",
      "File uploads with Multer",
      "Email sending with Nodemailer",
      "Deploy on Render for free",
    ],
    thumbnail: {
      url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=450&fit=crop",
      public_id: "learnify/nodejs",
    },
  },
  // ── Data Science ─────────────────────────────────────────────────
  {
    title: "Python for Data Science — Beginner to Pro",
    shortDescription: "Python, Pandas, NumPy, Matplotlib — data science ki poori duniya.",
    description: "Python is the most popular language for Data Science. This course starts from Python basics and covers Pandas for data manipulation, NumPy for numerical computing, Matplotlib and Seaborn for visualization, and Scikit-learn for machine learning.",
    instructor: "Dr. Vikash Patel",
    instructorBio: "PhD in Data Science from IIT Bombay. Currently a Data Scientist at a Fortune 500 company.",
    category: "Data Science",
    level: "Beginner",
    price: 2999,
    discountPrice: 1499,
    duration: "40h 20m",
    rating: 4.8,
    enrolledCount: 8900,
    tags: ["python", "pandas", "numpy", "data science", "matplotlib"],
    requirements: ["Koi programming knowledge nahi chahiye", "Laptop with 4GB RAM minimum"],
    whatYouLearn: [
      "Python programming from scratch",
      "Pandas for data analysis",
      "NumPy for mathematical operations",
      "Data visualization with Matplotlib",
      "Exploratory Data Analysis (EDA)",
      "Intro to Machine Learning",
      "5 real-world data projects",
    ],
    thumbnail: {
      url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop",
      public_id: "learnify/python-ds",
    },
  },
  {
    title: "SQL & Database Management — Complete Course",
    shortDescription: "MySQL, PostgreSQL — queries, joins, indexing, stored procedures sab.",
    description: "Master SQL and relational database management. From basic SELECT queries to advanced JOINs, subqueries, indexes, stored procedures, triggers, and database design (normalization). Covers both MySQL and PostgreSQL. Best course for freshers.",
    instructor: "Sunita Verma",
    instructorBio: "Database Administrator with 12 years of experience. Oracle Certified Professional.",
    category: "Data Science",
    level: "Beginner",
    price: 1299,
    discountPrice: 699,
    duration: "18h 45m",
    rating: 4.6,
    enrolledCount: 6700,
    tags: ["sql", "mysql", "postgresql", "database", "queries"],
    requirements: ["Koi prior knowledge nahi chahiye", "MySQL ya PostgreSQL install karo"],
    whatYouLearn: [
      "SQL basics — SELECT, INSERT, UPDATE, DELETE",
      "JOINs — INNER, LEFT, RIGHT, FULL",
      "Subqueries aur CTEs",
      "Indexes aur query optimization",
      "Stored Procedures aur Functions",
      "Database design aur normalization",
    ],
    thumbnail: {
      url: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&h=450&fit=crop",
      public_id: "learnify/sql",
    },
  },
  // ── Mobile Development ───────────────────────────────────────────
  {
    title: "React Native — Build iOS & Android Apps",
    shortDescription: "Ek codebase se iOS aur Android apps banao — React Native ka complete guide.",
    description: "Learn to build cross-platform mobile apps with React Native. Use your React and JavaScript knowledge to create native iOS and Android apps. Covers navigation, state management, camera, location, push notifications, and App Store/Play Store publishing.",
    instructor: "Ravi Kumar",
    instructorBio: "Mobile App Developer with 50+ apps published on the App Store and Play Store.",
    category: "Mobile Development",
    level: "Intermediate",
    price: 3499,
    discountPrice: 1799,
    duration: "35h 10m",
    rating: 4.7,
    enrolledCount: 4300,
    tags: ["react native", "mobile", "ios", "android", "javascript"],
    requirements: ["React.js basics required", "Mac preferred for iOS development"],
    whatYouLearn: [
      "React Native setup aur architecture",
      "Core components aur styling",
      "Navigation with React Navigation",
      "State management with Redux",
      "Camera, GPS, aur device APIs",
      "Push notifications integration",
      "App Store aur Play Store publishing",
    ],
    thumbnail: {
      url: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=450&fit=crop",
      public_id: "learnify/react-native",
    },
  },
  // ── Design ───────────────────────────────────────────────────────
  {
    title: "UI/UX Design with Figma — Complete Bootcamp",
    shortDescription: "Figma se professional UI designs aur prototypes banao — job-ready skills.",
    description: "Figma is the most popular tool for UI/UX design. This course covers design principles, typography, color theory, wireframing, prototyping, design systems, and user research. Build portfolio-worthy projects and get ready for freelancing or a full-time design job.",
    instructor: "Anjali Nair",
    instructorBio: "Senior UX Designer at Flipkart with 7 years of experience. Worked with 30+ startups.",
    category: "Design",
    level: "Beginner",
    price: 1999,
    discountPrice: 999,
    duration: "24h 30m",
    rating: 4.9,
    enrolledCount: 5100,
    tags: ["figma", "ui design", "ux", "wireframe", "prototype"],
    requirements: ["Koi design experience nahi chahiye", "Figma free account"],
    whatYouLearn: [
      "Figma tools aur interface",
      "Design principles aur typography",
      "Color theory aur palettes",
      "Wireframing aur prototyping",
      "Design systems banana",
      "User research basics",
      "3 complete app designs",
    ],
    thumbnail: {
      url: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=450&fit=crop",
      public_id: "learnify/figma",
    },
  },
  // ── Machine Learning ─────────────────────────────────────────────
  {
    title: "Machine Learning with Python — Hands-On",
    shortDescription: "Scikit-learn, TensorFlow — ML algorithms se real models banao.",
    description: "This course covers everything from Machine Learning fundamentals to advanced deep learning. Includes supervised and unsupervised learning, regression, classification, clustering, neural networks, and real-world projects like house price prediction and image classification.",
    instructor: "Dr. Aditya Gupta",
    instructorBio: "ML Engineer at Google India. PhD from IIT Delhi. Trained 15,000+ students.",
    category: "Machine Learning",
    level: "Intermediate",
    price: 3999,
    discountPrice: 1999,
    duration: "45h 0m",
    rating: 4.8,
    enrolledCount: 6200,
    tags: ["machine learning", "python", "scikit-learn", "tensorflow", "ai"],
    requirements: ["Python basics required", "Basic math/statistics knowledge helpful"],
    whatYouLearn: [
      "ML fundamentals aur types",
      "Supervised learning algorithms",
      "Unsupervised learning — clustering",
      "Neural Networks basics",
      "TensorFlow aur Keras",
      "Model evaluation aur tuning",
      "5 industry projects",
    ],
    thumbnail: {
      url: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=450&fit=crop",
      public_id: "learnify/ml",
    },
  },
  // ── Finance ──────────────────────────────────────────────────────
  {
    title: "Stock Market & Investing for Beginners",
    shortDescription: "Share market basics, mutual funds, SIP — apna paisa invest karna seekho.",
    description: "Learn to invest in the Indian stock market (NSE/BSE). Covers fundamentals of investing, how to open a Demat account, technical and fundamental analysis basics, mutual funds and SIPs, and risk management. Also covers how to use Zerodha and Groww.",
    instructor: "CA Meera Joshi",
    instructorBio: "Chartered Accountant and SEBI Registered Investment Advisor with 15 years of experience.",
    category: "Finance",
    level: "Beginner",
    price: 1499,
    discountPrice: 799,
    duration: "15h 20m",
    rating: 4.6,
    enrolledCount: 11200,
    tags: ["stock market", "investing", "mutual funds", "sip", "finance"],
    requirements: ["Koi prior knowledge nahi chahiye", "Basic math samajh aati ho"],
    whatYouLearn: [
      "Stock market kaise kaam karta hai",
      "Demat account kaise open karein",
      "Fundamental analysis basics",
      "Technical analysis aur charts",
      "Mutual Funds aur SIP",
      "Risk management strategies",
      "Portfolio banana aur manage karna",
    ],
    thumbnail: {
      url: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=450&fit=crop",
      public_id: "learnify/stock-market",
    },
  },
  // ── Marketing ────────────────────────────────────────────────────
  {
    title: "Digital Marketing — Complete Masterclass",
    shortDescription: "SEO, Social Media, Google Ads, Email Marketing — sab ek course mein.",
    description: "The complete world of digital marketing in one course. Covers SEO, Social Media Marketing (Instagram, Facebook, LinkedIn), Google Ads and Facebook Ads, Email Marketing, Content Marketing, and Analytics. Perfect for freelancing or landing a job.",
    instructor: "Kavya Reddy",
    instructorBio: "Digital Marketing Consultant with 200+ clients. Google Partner Certified.",
    category: "Marketing",
    level: "Beginner",
    price: 1799,
    discountPrice: 899,
    duration: "20h 45m",
    rating: 4.7,
    enrolledCount: 8400,
    tags: ["seo", "social media", "google ads", "email marketing", "digital marketing"],
    requirements: ["Smartphone ya computer required", "Social media accounts helpful"],
    whatYouLearn: [
      "SEO on-page aur off-page",
      "Social Media Marketing strategy",
      "Google Ads campaigns banana",
      "Facebook aur Instagram Ads",
      "Email marketing funnels",
      "Content marketing",
      "Google Analytics use karna",
    ],
    thumbnail: {
      url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop",
      public_id: "learnify/digital-marketing",
    },
  },
  // ── Business ─────────────────────────────────────────────────────
  {
    title: "Excel & MIS Reporting — Professional Level",
    shortDescription: "Advanced Excel, VLOOKUP, Pivot Tables, MIS dashboards — job-ready skills.",
    description: "Master Excel to a professional level. Starting from basic functions, covering advanced formulas (VLOOKUP, INDEX-MATCH, IF conditions), Pivot Tables, Data validation, Macros (VBA basics), and building complete MIS reporting dashboards. Useful for HR, Finance, and Operations roles.",
    instructor: "Suresh Iyer",
    instructorBio: "MIS Manager with 12 years of experience in FMCG and IT companies.",
    category: "Business",
    level: "Beginner",
    price: 999,
    discountPrice: 499,
    duration: "14h 0m",
    rating: 4.8,
    enrolledCount: 15600,
    tags: ["excel", "mis", "pivot table", "vlookup", "dashboard"],
    requirements: ["Basic computer knowledge", "Microsoft Excel 2016 ya baad wala version"],
    whatYouLearn: [
      "Excel basics se advanced formulas",
      "VLOOKUP, INDEX-MATCH, SUMIF",
      "Pivot Tables aur Pivot Charts",
      "Conditional Formatting",
      "Data validation aur protection",
      "MIS dashboard banana",
      "Macros aur VBA basics",
    ],
    thumbnail: {
      url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop",
      public_id: "learnify/excel",
    },
  },
];

// Sample lessons for each course
const SAMPLE_LESSONS = [
  { title: "Course Introduction & Overview", description: "Complete course overview and setup guide.", order: 1, isPreview: true },
  { title: "Getting Started — Setup & Installation", description: "Setting up your development environment.", order: 2, isPreview: true },
  { title: "Core Concepts — Part 1", description: "Core concepts explained in depth.", order: 3, isPreview: false },
  { title: "Core Concepts — Part 2", description: "Practice with advanced fundamentals.", order: 4, isPreview: false },
  { title: "Hands-on Project — Starter", description: "Starting your first project.", order: 5, isPreview: false },
  { title: "Deep Dive — Advanced Topics", description: "Advanced features and techniques.", order: 6, isPreview: false },
  { title: "Real-World Project Build", description: "Build a complete project step by step.", order: 7, isPreview: false },
  { title: "Best Practices & Tips", description: "Industry best practices and pro tips.", order: 8, isPreview: false },
  { title: "Q&A — Common Mistakes to Avoid", description: "Common errors and their solutions.", order: 9, isPreview: false },
  { title: "Final Project & Certificate", description: "Complete the full project and earn your certificate!", order: 10, isPreview: false },
];

// ── Main Seed Function ────────────────────────────────────────────
async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    // Clear existing courses and lessons
    await Course.deleteMany({});
    await Lesson.deleteMany({});
    console.log("🗑️  Old courses & lessons cleared");

    // Seed Admin
    const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL || "admin@learnify.com" });
    if (!adminExists) {
      await User.create({
        name: "Super Admin",
        email: process.env.ADMIN_EMAIL || "admin@learnify.com",
        password: process.env.ADMIN_PASSWORD || "Admin@12345",
        role: "admin",
        isVerified: true,
      });
      console.log("👤 Admin seeded");
    }

    // Seed Courses + Lessons
    let courseCount = 0;
    let lessonCount = 0;

    for (const courseData of COURSES) {
      const slug = courseData.title
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-") + "-" + Date.now() + courseCount;

      const course = await Course.create({
        ...courseData,
        slug,
        totalLessons: SAMPLE_LESSONS.length,
        isPublished: true,
      });

      // Create lessons for this course
      const lessonIds = [];
      for (const lessonData of SAMPLE_LESSONS) {
        const lesson = await Lesson.create({
          ...lessonData,
          title: lessonData.title,
          description: `${courseData.title} — ${lessonData.description}`,
          course: course._id,
        });
        lessonIds.push(lesson._id);
        lessonCount++;
      }

      // Update course with lesson IDs
      await Course.findByIdAndUpdate(course._id, { lessons: lessonIds });

      console.log(`✅ Course created: ${course.title} (${SAMPLE_LESSONS.length} lessons)`);
      courseCount++;
    }

    console.log("\n🎉 SEED COMPLETE!");
    console.log(`📚 Courses: ${courseCount}`);
    console.log(`🎬 Lessons: ${lessonCount}`);
    console.log("\n📂 Categories seeded:");
    const cats = [...new Set(COURSES.map(c => c.category))];
    cats.forEach(c => console.log(`   • ${c}`));
    console.log("\n🔑 Admin Login:");
    console.log(`   Email: ${process.env.ADMIN_EMAIL || "admin@learnify.com"}`);
    console.log(`   Password: ${process.env.ADMIN_PASSWORD || "Admin@12345"}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seed();
