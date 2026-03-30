const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const { generateToken } = require("../middleware/authMiddleware");
const { deleteFromCloudinary } = require("../config/cloudinary");

// @desc  Register student
// @route POST /api/auth/register
// @access Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please provide name, email, and password");
  }
  if (password.length < 6) {
    res.status(400);
    throw new Error("Password must be at least 6 characters");
  }

  const exists = await User.findOne({ email });
  if (exists) {
    res.status(400);
    throw new Error("Email already registered");
  }

  const user = await User.create({ name, email, password, role: "student", isVerified: true });

  res.status(201).json({
    success: true,
    message: "Registration successful",
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      token: generateToken(user._id),
    },
  });
});

// @desc  Login
// @route POST /api/auth/login
// @access Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Please provide email and password");
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  if (user.isBlocked) {
    res.status(403);
    throw new Error("Your account has been blocked. Contact support.");
  }

  res.json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      bio: user.bio,
      phone: user.phone,
      token: generateToken(user._id),
    },
  });
});

// @desc  Get logged-in user profile
// @route GET /api/auth/me
// @access Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate("enrolledCourses", "title thumbnail slug")
    .populate("completedCourses", "title thumbnail slug");

  res.json({ success: true, data: user });
});

// @desc  Update profile
// @route PUT /api/auth/profile
// @access Private
const updateProfile = asyncHandler(async (req, res) => {
  const { name, bio, phone } = req.body;
  const user = await User.findById(req.user._id);

  if (name) user.name = name;
  if (bio !== undefined) user.bio = bio;
  if (phone !== undefined) user.phone = phone;

  // Handle avatar upload
  if (req.file) {
    if (user.avatar?.public_id) {
      await deleteFromCloudinary(user.avatar.public_id);
    }
    user.avatar = {
      url: req.file.path,
      public_id: req.file.filename,
    };
  }

  const updated = await user.save();
  res.json({
    success: true,
    message: "Profile updated",
    data: {
      _id: updated._id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      avatar: updated.avatar,
      bio: updated.bio,
      phone: updated.phone,
    },
  });
});

// @desc  Change password
// @route PUT /api/auth/change-password
// @access Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select("+password");

  if (!(await user.matchPassword(currentPassword))) {
    res.status(400);
    throw new Error("Current password is incorrect");
  }
  if (newPassword.length < 6) {
    res.status(400);
    throw new Error("New password must be at least 6 characters");
  }

  user.password = newPassword;
  await user.save();
  res.json({ success: true, message: "Password changed successfully" });
});

module.exports = { register, login, getMe, updateProfile, changePassword };
