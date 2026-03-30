const asyncHandler = require("express-async-handler");
const crypto = require("crypto");
const Payment = require("../models/Payment");
const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");
const User = require("../models/User");
const { sendEmail, enrollmentEmailTemplate } = require("../utils/email");

// Razorpay only init if real keys present
let razorpay = null;
const isRazorpayConfigured = () =>
  process.env.RAZORPAY_KEY_ID &&
  !process.env.RAZORPAY_KEY_ID.includes("xxxx") &&
  process.env.RAZORPAY_KEY_SECRET &&
  !process.env.RAZORPAY_KEY_SECRET.includes("your_");

if (isRazorpayConfigured()) {
  const Razorpay = require("razorpay");
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

// helper: enroll student
const doEnroll = async (studentId, courseId, paymentId = null) => {
  const enrollment = await Enrollment.create({ student: studentId, course: courseId, payment: paymentId });
  await User.findByIdAndUpdate(studentId, { $addToSet: { enrolledCourses: courseId } });
  await Course.findByIdAndUpdate(courseId, { $inc: { enrolledCount: 1 } });
  return enrollment;
};

// @desc  Create order OR dev-mode direct enroll
// @route POST /api/payments/create-order
// @access Private
const createOrder = asyncHandler(async (req, res) => {
  const { courseId } = req.body;
  const course = await Course.findById(courseId);
  if (!course) { res.status(404); throw new Error("Course not found"); }

  const alreadyEnrolled = await Enrollment.findOne({ student: req.user._id, course: courseId });
  if (alreadyEnrolled) { res.status(400); throw new Error("Already enrolled in this course"); }

  const price = course.discountPrice > 0 ? course.discountPrice : course.price;
  const amount = price * 100;

  // ── FREE COURSE ───────────────────────────────────────────────────
  if (amount === 0 || course.isFree) {
    const enrollment = await doEnroll(req.user._id, courseId);
    try {
      await sendEmail({
        to: req.user.email,
        subject: `Enrolled: ${course.title}`,
        html: enrollmentEmailTemplate(req.user.name, course.title, courseId),
      });
    } catch (e) { /* email optional */ }
    return res.json({ success: true, free: true, data: enrollment });
  }

  // ── DEV MODE (no real Razorpay keys) ────────────────────────────
  if (!isRazorpayConfigured()) {
    return res.json({
      success: true,
      devMode: true,
      data: {
        courseId,
        courseName: course.title,
        amount,
        studentName: req.user.name,
        studentEmail: req.user.email,
        message: "Dev mode — Razorpay keys not configured. Use test enrollment.",
      },
    });
  }

  // ── REAL RAZORPAY ─────────────────────────────────────────────────
  const receipt = `rcpt_${req.user._id}_${Date.now()}`.slice(0, 40);
  const order = await razorpay.orders.create({ amount, currency: "INR", receipt });

  const payment = await Payment.create({
    student: req.user._id,
    course: courseId,
    razorpayOrderId: order.id,
    amount,
    receipt,
  });

  res.json({
    success: true,
    data: {
      orderId: order.id,
      amount,
      currency: "INR",
      paymentId: payment._id,
      keyId: process.env.RAZORPAY_KEY_ID,
      courseName: course.title,
      studentName: req.user.name,
      studentEmail: req.user.email,
    },
  });
});

// @desc  Dev mode direct enroll (no payment verification needed)
// @route POST /api/payments/dev-enroll
// @access Private
const devEnroll = asyncHandler(async (req, res) => {
  const { courseId } = req.body;
  if (isRazorpayConfigured()) {
    res.status(400); throw new Error("Dev enroll disabled in production mode");
  }
  const course = await Course.findById(courseId);
  if (!course) { res.status(404); throw new Error("Course not found"); }

  const alreadyEnrolled = await Enrollment.findOne({ student: req.user._id, course: courseId });
  if (alreadyEnrolled) { res.status(400); throw new Error("Already enrolled"); }

  const payment = await Payment.create({
    student: req.user._id,
    course: courseId,
    razorpayOrderId: "dev_" + Date.now(),
    razorpayPaymentId: "dev_pay_" + Date.now(),
    razorpaySignature: "dev_sig",
    amount: (course.discountPrice || course.price) * 100,
    status: "paid",
    receipt: "dev_receipt_" + Date.now(),
  });

  const enrollment = await doEnroll(req.user._id, courseId, payment._id);
  try {
    await sendEmail({
      to: req.user.email,
      subject: `Enrolled: ${course.title}`,
      html: enrollmentEmailTemplate(req.user.name, course.title, courseId),
    });
  } catch (e) { /* email optional */ }

  res.json({ success: true, message: "Dev enrollment successful!", data: enrollment });
});

// @desc  Verify real Razorpay payment
// @route POST /api/payments/verify
// @access Private
const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, courseId } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    res.status(400); throw new Error("Payment verification failed");
  }

  const payment = await Payment.findOneAndUpdate(
    { razorpayOrderId: razorpay_order_id },
    { razorpayPaymentId: razorpay_payment_id, razorpaySignature: razorpay_signature, status: "paid" },
    { new: true }
  );

  const enrollment = await doEnroll(req.user._id, courseId, payment._id);
  const course = await Course.findById(courseId);
  try {
    await sendEmail({
      to: req.user.email,
      subject: `Enrolled: ${course.title}`,
      html: enrollmentEmailTemplate(req.user.name, course.title, courseId),
    });
  } catch (e) { /* email optional */ }

  res.json({ success: true, message: "Payment verified, enrollment successful!", data: enrollment });
});

// @desc  My payment history
// @route GET /api/payments/my
const getMyPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ student: req.user._id, status: "paid" })
    .populate("course", "title thumbnail instructor")
    .sort("-createdAt");
  res.json({ success: true, data: payments });
});

// @desc  All payments (admin)
// @route GET /api/payments/admin/all
const getAllPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ status: "paid" })
    .populate("student", "name email")
    .populate("course", "title price")
    .sort("-createdAt")
    .limit(500);
  const totalRevenue = payments.reduce((sum, p) => sum + p.amount / 100, 0);
  res.json({ success: true, data: payments, totalRevenue });
});

module.exports = { createOrder, devEnroll, verifyPayment, getMyPayments, getAllPayments };
