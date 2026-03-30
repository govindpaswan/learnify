const asyncHandler = require("express-async-handler");
const Lesson = require("../models/Lesson");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const { deleteFromCloudinary } = require("../config/cloudinary");

// @desc  Get lessons for a course (student must be enrolled for non-preview)
// @route GET /api/lessons/course/:courseId
// @access Private/Public
const getCourseLessons = asyncHandler(async (req, res) => {
  const lessons = await Lesson.find({ course: req.params.courseId }).sort("order");

  if (!req.user) {
    return res.json({ success: true, data: lessons.map(l => ({ ...l.toObject(), videoUrl: l.isPreview ? l.videoUrl : null })) });
  }

  const enrollment = await Enrollment.findOne({ student: req.user._id, course: req.params.courseId });
  const isAdmin = req.user.role === "admin";

  const data = lessons.map((l) => ({
    ...l.toObject(),
    videoUrl: isAdmin || enrollment || l.isPreview ? l.videoUrl : null,
    locked: !isAdmin && !enrollment && !l.isPreview,
  }));

  res.json({ success: true, data });
});

// @desc  Get single lesson
// @route GET /api/lessons/:id
// @access Private
const getLesson = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findById(req.params.id).populate("quiz");
  if (!lesson) { res.status(404); throw new Error("Lesson not found"); }

  if (req.user.role !== "admin" && !lesson.isPreview) {
    const enrollment = await Enrollment.findOne({ student: req.user._id, course: lesson.course });
    if (!enrollment) { res.status(403); throw new Error("Please enroll to access this lesson"); }
  }

  res.json({ success: true, data: lesson });
});

// @desc  Create lesson (admin)
// @route POST /api/lessons
// @access Admin
const createLesson = asyncHandler(async (req, res) => {
  const { course, title, description, order, isPreview } = req.body;

  const lessonData = { course, title, description, order: parseInt(order), isPreview: isPreview === "true" };

  if (req.file) {
    lessonData.videoUrl = req.file.path;
    lessonData.videoPublicId = req.file.filename;
  }

  const lesson = await Lesson.create(lessonData);

  await Course.findByIdAndUpdate(course, {
    $push: { lessons: lesson._id },
    $inc: { totalLessons: 1 },
  });

  res.status(201).json({ success: true, data: lesson });
});

// @desc  Update lesson (admin)
// @route PUT /api/lessons/:id
// @access Admin
const updateLesson = asyncHandler(async (req, res) => {
  let lesson = await Lesson.findById(req.params.id);
  if (!lesson) { res.status(404); throw new Error("Lesson not found"); }

  const updates = { ...req.body };
  if (updates.order) updates.order = parseInt(updates.order);
  if (updates.isPreview !== undefined) updates.isPreview = updates.isPreview === "true" || updates.isPreview === true;

  if (req.file) {
    if (lesson.videoPublicId) await deleteFromCloudinary(lesson.videoPublicId, "video");
    updates.videoUrl = req.file.path;
    updates.videoPublicId = req.file.filename;
  }

  lesson = await Lesson.findByIdAndUpdate(req.params.id, updates, { new: true });
  res.json({ success: true, data: lesson });
});

// @desc  Delete lesson (admin)
// @route DELETE /api/lessons/:id
// @access Admin
const deleteLesson = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findById(req.params.id);
  if (!lesson) { res.status(404); throw new Error("Lesson not found"); }

  if (lesson.videoPublicId) await deleteFromCloudinary(lesson.videoPublicId, "video");

  await Course.findByIdAndUpdate(lesson.course, {
    $pull: { lessons: lesson._id },
    $inc: { totalLessons: -1 },
  });

  await lesson.deleteOne();
  res.json({ success: true, message: "Lesson deleted" });
});

module.exports = { getCourseLessons, getLesson, createLesson, updateLesson, deleteLesson };
