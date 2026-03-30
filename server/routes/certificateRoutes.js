const express = require("express");
const router = express.Router();
const { getMyCertificates, downloadCertificate, verifyCertificate, getAllCertificates } = require("../controllers/certificateController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/my", protect, getMyCertificates);
router.get("/verify/:certId", verifyCertificate);
router.get("/download/:certId", protect, downloadCertificate);
router.get("/admin/all", protect, adminOnly, getAllCertificates);

module.exports = router;
