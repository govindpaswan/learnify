const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const Payment = require("../models/Payment");
const Certificate = require("../models/Certificate");

// @desc  Admin dashboard stats
// @route GET /api/admin/stats
// @access Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalCourses, totalEnrollments, payments, certificates] = await Promise.all([
    User.countDocuments({ role: "student" }),
    Course.countDocuments(),
    Enrollment.countDocuments(),
    Payment.find({ status: "paid" }).select("amount createdAt"),
    Certificate.countDocuments(),
  ]);

  const totalRevenue = payments.reduce((sum, p) => sum + p.amount / 100, 0);

  // Monthly revenue (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlyRevenue = await Payment.aggregate([
    { $match: { status: "paid", createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        revenue: { $sum: { $divide: ["$amount", 100] } },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  // Top courses by enrollment
  const topCourses = await Course.find().sort("-enrolledCount").limit(5).select("title enrolledCount price thumbnail");

  // Recent enrollments
  const recentEnrollments = await Enrollment.find()
    .populate("student", "name email avatar")
    .populate("course", "title")
    .sort("-enrolledAt")
    .limit(10);

  res.json({
    success: true,
    data: {
      totalUsers,
      totalCourses,
      totalEnrollments,
      totalRevenue,
      totalCertificates: certificates,
      monthlyRevenue,
      topCourses,
      recentEnrollments,
    },
  });
});

// @desc  Get all users
// @route GET /api/admin/users
// @access Admin
const getAllUsers = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 20 } = req.query;
  const query = { role: "student" };
  if (search) query.$or = [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }];

  const total = await User.countDocuments(query);
  const users = await User.find(query)
    .select("-password")
    .sort("-createdAt")
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  res.json({ success: true, data: users, total });
});

// @desc  Block/Unblock user
// @route PUT /api/admin/users/:id/block
// @access Admin
const toggleBlockUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) { res.status(404); throw new Error("User not found"); }
  if (user.role === "admin") { res.status(400); throw new Error("Cannot block admin"); }

  user.isBlocked = !user.isBlocked;
  await user.save();
  res.json({ success: true, message: `User ${user.isBlocked ? "blocked" : "unblocked"}`, isBlocked: user.isBlocked });
});

// @desc  Delete user
// @route DELETE /api/admin/users/:id
// @access Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) { res.status(404); throw new Error("User not found"); }
  if (user.role === "admin") { res.status(400); throw new Error("Cannot delete admin"); }
  await user.deleteOne();
  res.json({ success: true, message: "User deleted" });
});

module.exports = { getDashboardStats, getAllUsers, toggleBlockUser, deleteUser };
