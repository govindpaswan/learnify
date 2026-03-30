const asyncHandler = require("express-async-handler");
const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");
const Lesson = require("../models/Lesson");
const Certificate = require("../models/Certificate");
const User = require("../models/User");
const { sendEmail, certificateEmailTemplate } = require("../utils/email");

// @desc  Get student enrollments
// @route GET /api/enrollments/my
// @access Private
const getMyEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({ student: req.user._id })
    .populate("course", "title thumbnail slug instructor duration totalLessons")
    .populate("certificate", "certificateId issuedAt")
    .sort("-enrolledAt");

  res.json({ success: true, data: enrollments });
});

// @desc  Get enrollment detail
// @route GET /api/enrollments/:courseId
// @access Private
const getEnrollment = asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findOne({ student: req.user._id, course: req.params.courseId })
    .populate({ path: "course", populate: { path: "lessons", options: { sort: { order: 1 } } } })
    .populate("certificate");

  if (!enrollment) { res.status(404); throw new Error("Enrollment not found"); }

  res.json({ success: true, data: enrollment });
});

// @desc  Mark lesson as completed
// @route POST /api/enrollments/:courseId/complete-lesson/:lessonId
// @access Private
const markLessonCompleted = asyncHandler(async (req, res) => {
  const { courseId, lessonId } = req.params;

  const enrollment = await Enrollment.findOne({ student: req.user._id, course: courseId });
  if (!enrollment) { res.status(404); throw new Error("Not enrolled in this course"); }

  if (!enrollment.completedLessons.includes(lessonId)) {
    enrollment.completedLessons.push(lessonId);
    enrollment.lastAccessedLesson = lessonId;
  }

  // Calculate progress
  const course = await Course.findById(courseId);
  enrollment.progress = Math.round((enrollment.completedLessons.length / course.totalLessons) * 100);

  // Check completion
  if (enrollment.progress >= 100 && !enrollment.isCompleted) {
    enrollment.isCompleted = true;
    enrollment.completedAt = new Date();

    // Update user
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { completedCourses: courseId },
    });
    await Course.findByIdAndUpdate(courseId);

    // Generate certificate
    const cert = await Certificate.create({
      student: req.user._id,
      course: courseId,
      enrollment: enrollment._id,
      studentName: req.user.name,
      courseName: course.title,
      instructorName: course.instructor,
    });

    enrollment.certificate = cert._id;

    // Send email
    try {
      await sendEmail({
        to: req.user.email,
        subject: `🏆 Certificate: ${course.title}`,
        html: certificateEmailTemplate(req.user.name, course.title, cert.certificateId),
      });
    } catch (e) { console.error("Certificate email error:", e.message); }
  }

  await enrollment.save();
  res.json({ success: true, data: enrollment });
});

// @desc  Get all enrollments (admin)
// @route GET /api/enrollments
// @access Admin
const getAllEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find()
    .populate("student", "name email avatar")
    .populate("course", "title thumbnail price")
    .sort("-enrolledAt")
    .limit(200);

  res.json({ success: true, data: enrollments });
});

module.exports = { getMyEnrollments, getEnrollment, markLessonCompleted, getAllEnrollments };
