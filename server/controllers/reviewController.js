const asyncHandler = require("express-async-handler");
const Review     = require("../models/Review");
const Enrollment = require("../models/Enrollment");

// @desc  Get all reviews for a course
// @route GET /api/reviews/course/:courseId
// @access Public
const getCourseReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ course: req.params.courseId })
    .populate("student", "name avatar")
    .sort("-createdAt")
    .limit(50);
  res.json({ success: true, data: reviews });
});

// @desc  Add review (enrolled students only)
// @route POST /api/reviews/course/:courseId
// @access Private (Student)
const addReview = asyncHandler(async (req, res) => {
  const { rating, comment, title } = req.body;
  const { courseId } = req.params;

  if (!rating || !comment) { res.status(400); throw new Error("Rating aur comment dono required hain"); }
  if (rating < 1 || rating > 5) { res.status(400); throw new Error("Rating 1-5 ke beech honi chahiye"); }

  // Check enrollment
  const enrollment = await Enrollment.findOne({ student: req.user._id, course: courseId });
  if (!enrollment) { res.status(403); throw new Error("Sirf enrolled students review de sakte hain"); }

  // Check existing
  const existing = await Review.findOne({ student: req.user._id, course: courseId });
  if (existing) { res.status(400); throw new Error("Aapne pehle se review de diya hai. Edit karo."); }

  const review = await Review.create({
    student: req.user._id,
    course: courseId,
    enrollment: enrollment._id,
    rating: parseInt(rating),
    title: title || "",
    comment,
    isVerified: true,
  });

  await review.populate("student", "name avatar");
  res.status(201).json({ success: true, data: review });
});

// @desc  Update own review
// @route PUT /api/reviews/:id
// @access Private
const updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) { res.status(404); throw new Error("Review nahi mili"); }
  if (review.student.toString() !== req.user._id.toString()) {
    res.status(403); throw new Error("Sirf apni review edit kar sakte ho");
  }

  const { rating, comment, title } = req.body;
  if (rating) review.rating = parseInt(rating);
  if (comment) review.comment = comment;
  if (title !== undefined) review.title = title;

  await review.save();
  await review.populate("student", "name avatar");
  res.json({ success: true, data: review });
});

// @desc  Delete review
// @route DELETE /api/reviews/:id
// @access Private (owner or admin)
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) { res.status(404); throw new Error("Review nahi mili"); }

  const isOwner = review.student.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== "admin") {
    res.status(403); throw new Error("Access denied");
  }

  await review.deleteOne();
  res.json({ success: true, message: "Review delete ho gayi" });
});

// @desc  Get my review for a course
// @route GET /api/reviews/my/:courseId
// @access Private
const getMyReview = asyncHandler(async (req, res) => {
  const review = await Review.findOne({ student: req.user._id, course: req.params.courseId });
  res.json({ success: true, data: review || null });
});

// @desc  Get all reviews (admin)
// @route GET /api/reviews/admin/all
// @access Admin
const getAllReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find()
    .populate("student", "name email avatar")
    .populate("course", "title")
    .sort("-createdAt")
    .limit(200);
  res.json({ success: true, data: reviews });
});

module.exports = { getCourseReviews, addReview, updateReview, deleteReview, getMyReview, getAllReviews };
