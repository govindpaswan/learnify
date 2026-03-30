const express = require("express");
const router = express.Router();
const { createOrder, devEnroll, verifyPayment, getMyPayments, getAllPayments } = require("../controllers/paymentController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.post("/create-order", protect, createOrder);
router.post("/dev-enroll", protect, devEnroll);
router.post("/verify", protect, verifyPayment);
router.get("/my", protect, getMyPayments);
router.get("/admin/all", protect, adminOnly, getAllPayments);

module.exports = router;
