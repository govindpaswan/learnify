const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Check if Cloudinary is properly configured
const isCloudinaryConfigured = () =>
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET &&
  !process.env.CLOUDINARY_CLOUD_NAME.includes("your_") &&
  !process.env.CLOUDINARY_API_KEY.includes("your_");

// Ensure upload dirs exist
const ensureDir = (dir) => { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); };

// ── LOCAL DISK STORAGE (fallback when Cloudinary not configured) ──
const localImageStorage = multer.diskStorage({
  destination: (req, file, cb) => { ensureDir("uploads/images"); cb(null, "uploads/images"); },
  filename: (req, file, cb) => { cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "-")); },
});

const localVideoStorage = multer.diskStorage({
  destination: (req, file, cb) => { ensureDir("uploads/videos"); cb(null, "uploads/videos"); },
  filename: (req, file, cb) => { cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "-")); },
});

const localAvatarStorage = multer.diskStorage({
  destination: (req, file, cb) => { ensureDir("uploads/avatars"); cb(null, "uploads/avatars"); },
  filename: (req, file, cb) => { cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "-")); },
});

// Middleware to normalize local file to cloudinary-like format
const normalizeLocalFile = (req, res, next) => {
  if (req.file && !req.file.path.startsWith("http")) {
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    req.file.path = `${baseUrl}/${req.file.path.replace(/\\/g, "/")}`;
    req.file.filename = req.file.filename;
  }
  next();
};

let uploadImage, uploadVideo, uploadAvatar, cloudinary, deleteFromCloudinary;

if (isCloudinaryConfigured()) {
  // ── CLOUDINARY MODE ──────────────────────────────────────────────
  cloudinary = require("cloudinary").v2;
  const { CloudinaryStorage } = require("multer-storage-cloudinary");

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const imageStorage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "learnify/images",
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      transformation: [{ width: 800, height: 600, crop: "limit", quality: "auto" }],
    },
  });

  const videoStorage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "learnify/videos",
      resource_type: "video",
      allowed_formats: ["mp4", "mov", "avi", "mkv", "webm"],
    },
  });

  const avatarStorage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "learnify/avatars",
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      transformation: [{ width: 200, height: 200, crop: "fill", gravity: "face", quality: "auto" }],
    },
  });

  uploadImage  = multer({ storage: imageStorage,  limits: { fileSize: 5  * 1024 * 1024 } });
  uploadVideo  = multer({ storage: videoStorage,  limits: { fileSize: 500 * 1024 * 1024 } });
  uploadAvatar = multer({ storage: avatarStorage, limits: { fileSize: 2  * 1024 * 1024 } });

  deleteFromCloudinary = async (publicId, resourceType = "image") => {
    try { await cloudinary.uploader.destroy(publicId, { resource_type: resourceType }); }
    catch (err) { console.error("Cloudinary delete error:", err.message); }
  };

  console.log("☁️  Cloudinary storage configured");
} else {
  // ── LOCAL DISK MODE ──────────────────────────────────────────────
  uploadImage  = multer({ storage: localImageStorage,  limits: { fileSize: 5  * 1024 * 1024 } });
  uploadVideo  = multer({ storage: localVideoStorage,  limits: { fileSize: 500 * 1024 * 1024 } });
  uploadAvatar = multer({ storage: localAvatarStorage, limits: { fileSize: 2  * 1024 * 1024 } });
  cloudinary   = null;

  deleteFromCloudinary = async (publicId) => {
    try {
      const filePath = publicId.replace(/^.*\/uploads\//, "uploads/");
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch (err) { console.error("Local file delete error:", err.message); }
  };

  console.log("💾  Local disk storage configured (Cloudinary not set)");
}

module.exports = { cloudinary, uploadImage, uploadVideo, uploadAvatar, deleteFromCloudinary, normalizeLocalFile };
