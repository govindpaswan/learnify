const asyncHandler = require("express-async-handler");
const Certificate  = require("../models/Certificate");
const User         = require("../models/User");
const { generateCertificatePDF } = require("../utils/pdfGenerator");

// @desc  Get my certificates
// @route GET /api/certificates/my
const getMyCertificates = asyncHandler(async (req, res) => {
  const certs = await Certificate.find({ student: req.user._id })
    .populate("course", "title thumbnail instructor")
    .sort("-issuedAt");
  res.json({ success: true, data: certs });
});

// @desc  Download PDF
// @route GET /api/certificates/download/:certId
const downloadCertificate = asyncHandler(async (req, res) => {
  const cert = await Certificate.findOne({ certificateId: req.params.certId })
    .populate("student", "name email")
    .populate("course",  "title instructor");

  if (!cert) { res.status(404); throw new Error("Certificate not found"); }

  const isOwner = cert.student._id.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== "admin") { res.status(403); throw new Error("Access denied"); }

  // Always use real student name from DB (not stored name, in case it was wrong)
  const studentUser = await User.findById(cert.student._id).select("name");

  generateCertificatePDF(res, {
    studentName:    studentUser?.name || cert.studentName,
    courseName:     cert.courseName   || cert.course?.title,
    instructorName: cert.instructorName || cert.course?.instructor,
    certificateId:  cert.certificateId,
    issuedAt:       cert.issuedAt,
  });
});

// @desc  Verify certificate (public)
// @route GET /api/certificates/verify/:certId
const verifyCertificate = asyncHandler(async (req, res) => {
  const cert = await Certificate.findOne({ certificateId: req.params.certId })
    .populate("student", "name avatar")
    .populate("course",  "title instructor thumbnail");

  if (!cert) return res.json({ success: false, valid: false, message: "Certificate not found or invalid" });

  // Fetch fresh student name from DB
  const studentUser = await User.findById(cert.student._id).select("name avatar");

  res.json({
    success: true,
    valid: true,
    data: {
      certificateId:  cert.certificateId,
      studentName:    studentUser?.name || cert.studentName,
      courseName:     cert.courseName   || cert.course?.title,
      instructorName: cert.instructorName || cert.course?.instructor,
      issuedAt:       cert.issuedAt,
      course:         cert.course,
      studentAvatar:  studentUser?.avatar?.url || null,
    },
  });
});

// @desc  All certificates (admin)
// @route GET /api/certificates/admin/all
const getAllCertificates = asyncHandler(async (req, res) => {
  const certs = await Certificate.find()
    .populate("student", "name email avatar")
    .populate("course",  "title")
    .sort("-issuedAt")
    .limit(500);
  res.json({ success: true, data: certs });
});

module.exports = { getMyCertificates, downloadCertificate, verifyCertificate, getAllCertificates };
