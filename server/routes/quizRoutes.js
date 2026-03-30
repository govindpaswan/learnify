const express = require("express");
const router = express.Router();
const { getLessonQuiz, submitQuiz, createQuiz, updateQuiz, deleteQuiz, getMyAttempts } = require("../controllers/quizController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/my-attempts", protect, getMyAttempts);
router.get("/lesson/:lessonId", protect, getLessonQuiz);
router.post("/:quizId/attempt", protect, submitQuiz);
router.post("/", protect, adminOnly, createQuiz);
router.put("/:id", protect, adminOnly, updateQuiz);
router.delete("/:id", protect, adminOnly, deleteQuiz);

module.exports = router;
