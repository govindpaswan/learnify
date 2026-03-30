const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");

// Protect routes - verify JWT
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token provided");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      res.status(401);
      throw new Error("User not found");
    }

    if (req.user.isBlocked) {
      res.status(403);
      throw new Error("Your account has been blocked. Contact support.");
    }

    next();
  } catch (err) {
    res.status(401);
    throw new Error("Not authorized, invalid token");
  }
});

// Admin only
const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    res.status(403);
    throw new Error("Access denied: Admins only");
  }
  next();
};

// Student only
const studentOnly = (req, res, next) => {
  if (req.user?.role !== "student") {
    res.status(403);
    throw new Error("Access denied: Students only");
  }
  next();
};

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "30d",
  });
};

module.exports = { protect, adminOnly, studentOnly, generateToken };
