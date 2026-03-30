const express = require("express");
const router = express.Router();
const { getMyEnrollments, getEnrollment, markLessonCompleted, getAllEnrollments } = require("../controllers/enrollmentController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/my", protect, getMyEnrollments);
router.get("/admin/all", protect, adminOnly, getAllEnrollments);
router.get("/:courseId", protect, getEnrollment);
router.post("/:courseId/complete-lesson/:lessonId", protect, markLessonCompleted);

module.exports = router;
