const express = require("express");
const router = express.Router();
const { getCourses, getCourse, getCategories, getAllCoursesAdmin, createCourse, updateCourse, deleteCourse } = require("../controllers/courseController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { uploadImage } = require("../config/cloudinary");

router.get("/", getCourses);
router.get("/categories", getCategories);
router.get("/admin/all", protect, adminOnly, getAllCoursesAdmin);
router.post("/", protect, adminOnly, uploadImage.single("thumbnail"), createCourse);
router.get("/:id", getCourse);
router.put("/:id", protect, adminOnly, uploadImage.single("thumbnail"), updateCourse);
router.delete("/:id", protect, adminOnly, deleteCourse);

module.exports = router;
