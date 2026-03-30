const express = require("express");
const router = express.Router();
const { getCourseLessons, getLesson, createLesson, updateLesson, deleteLesson } = require("../controllers/lessonController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { uploadVideo } = require("../config/cloudinary");

router.get("/course/:courseId", protect, getCourseLessons);
router.get("/:id", protect, getLesson);
router.post("/", protect, adminOnly, uploadVideo.single("video"), createLesson);
router.put("/:id", protect, adminOnly, uploadVideo.single("video"), updateLesson);
router.delete("/:id", protect, adminOnly, deleteLesson);

module.exports = router;
