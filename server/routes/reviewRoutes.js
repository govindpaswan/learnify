const express = require("express");
const router  = express.Router();
const {
  getCourseReviews, addReview, updateReview,
  deleteReview, getMyReview, getAllReviews,
} = require("../controllers/reviewController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/course/:courseId",         getCourseReviews);
router.get("/my/:courseId",    protect,  getMyReview);
router.post("/course/:courseId", protect, addReview);
router.put("/:id",             protect,  updateReview);
router.delete("/:id",          protect,  deleteReview);
router.get("/admin/all", protect, adminOnly, getAllReviews);

module.exports = router;
