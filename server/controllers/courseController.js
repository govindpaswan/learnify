const asyncHandler = require("express-async-handler");
const Course = require("../models/Course");
const Lesson = require("../models/Lesson");
const Enrollment = require("../models/Enrollment");
const { deleteFromCloudinary } = require("../config/cloudinary");

// @desc  Get all published courses
// @route GET /api/courses
// @access Public
const getCourses = asyncHandler(async (req, res) => {
  const { category, level, search, sort = "-createdAt", page = 1, limit = 12 } = req.query;

  const query = { isPublished: true };
  if (category) query.category = category;
  if (level) query.level = level;
  if (search) query.$or = [
    { title: { $regex: search, $options: "i" } },
    { description: { $regex: search, $options: "i" } },
    { tags: { $in: [new RegExp(search, "i")] } },
  ];

  const total = await Course.countDocuments(query);
  const courses = await Course.find(query)
    .select("-lessons")
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  res.json({
    success: true,
    data: courses,
    pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit), limit: parseInt(limit) },
  });
});

// @desc  Get single course by slug or id
// @route GET /api/courses/:id
// @access Public
const getCourse = asyncHandler(async (req, res) => {
  const course = await Course.findOne({
    $or: [{ slug: req.params.id }, { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }],
    isPublished: true,
  }).populate("lessons", "title order isPreview videoDuration");

  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }

  // Check if user enrolled
  let isEnrolled = false;
  let enrollment = null;
  if (req.user) {
    enrollment = await Enrollment.findOne({ student: req.user._id, course: course._id });
    isEnrolled = !!enrollment;
  }

  res.json({ success: true, data: { ...course.toObject(), isEnrolled, enrollment } });
});

// @desc  Get categories
// @route GET /api/courses/categories
// @access Public
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Course.distinct("category", { isPublished: true });
  res.json({ success: true, data: categories });
});

// ── Admin CRUD ─────────────────────────────────────────────────────

const getAllCoursesAdmin = asyncHandler(async (req, res) => {
  const courses = await Course.find().sort("-createdAt").select("-lessons");
  res.json({ success: true, data: courses });
});

const createCourse = asyncHandler(async (req, res) => {
  const courseData = { ...req.body };

  if (req.file) {
    courseData.thumbnail = { url: req.file.path, public_id: req.file.filename };
  }

  // Parse arrays
  ["requirements", "whatYouLearn", "tags"].forEach((field) => {
    if (typeof courseData[field] === "string") {
      try { courseData[field] = JSON.parse(courseData[field]); } catch { courseData[field] = []; }
    }
  });

  const course = await Course.create(courseData);
  res.status(201).json({ success: true, data: course });
});

const updateCourse = asyncHandler(async (req, res) => {
  let course = await Course.findById(req.params.id);
  if (!course) { res.status(404); throw new Error("Course not found"); }

  const updates = { ...req.body };

  if (req.file) {
    if (course.thumbnail?.public_id) await deleteFromCloudinary(course.thumbnail.public_id);
    updates.thumbnail = { url: req.file.path, public_id: req.file.filename };
  }

  ["requirements", "whatYouLearn", "tags"].forEach((field) => {
    if (typeof updates[field] === "string") {
      try { updates[field] = JSON.parse(updates[field]); } catch { delete updates[field]; }
    }
  });

  course = await Course.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  res.json({ success: true, data: course });
});

const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) { res.status(404); throw new Error("Course not found"); }

  if (course.thumbnail?.public_id) await deleteFromCloudinary(course.thumbnail.public_id);

  // Delete all lessons
  const lessons = await Lesson.find({ course: course._id });
  for (const lesson of lessons) {
    if (lesson.videoPublicId) await deleteFromCloudinary(lesson.videoPublicId, "video");
  }
  await Lesson.deleteMany({ course: course._id });
  await Enrollment.deleteMany({ course: course._id });
  await course.deleteOne();

  res.json({ success: true, message: "Course deleted successfully" });
});

module.exports = { getCourses, getCourse, getCategories, getAllCoursesAdmin, createCourse, updateCourse, deleteCourse };
