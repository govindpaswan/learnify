const asyncHandler = require("express-async-handler");
const { Quiz, QuizAttempt } = require("../models/Quiz");
const Enrollment = require("../models/Enrollment");

// @desc  Get quiz for a lesson
// @route GET /api/quizzes/lesson/:lessonId
// @access Private
const getLessonQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findOne({ lesson: req.params.lessonId });
  if (!quiz) return res.json({ success: true, data: null });

  // Hide correct answers
  const safeQuiz = {
    ...quiz.toObject(),
    questions: quiz.questions.map(q => ({ _id: q._id, question: q.question, options: q.options })),
  };
  res.json({ success: true, data: safeQuiz });
});

// @desc  Submit quiz attempt
// @route POST /api/quizzes/:quizId/attempt
// @access Private
const submitQuiz = asyncHandler(async (req, res) => {
  const { answers, timeTaken } = req.body;
  const quiz = await Quiz.findById(req.params.quizId);
  if (!quiz) { res.status(404); throw new Error("Quiz not found"); }

  let correct = 0;
  quiz.questions.forEach((q, i) => {
    if (answers[i] === q.correctOption) correct++;
  });

  const score = Math.round((correct / quiz.questions.length) * 100);
  const passed = score >= quiz.passingScore;

  const attempt = await QuizAttempt.create({
    student: req.user._id,
    quiz: quiz._id,
    answers,
    score,
    passed,
    timeTaken,
  });

  // Return with explanations
  const result = quiz.questions.map((q, i) => ({
    question: q.question,
    options: q.options,
    yourAnswer: answers[i],
    correctAnswer: q.correctOption,
    isCorrect: answers[i] === q.correctOption,
    explanation: q.explanation,
  }));

  res.json({ success: true, data: { score, passed, correct, total: quiz.questions.length, result, attemptId: attempt._id } });
});

// @desc  Create quiz (admin)
// @route POST /api/quizzes
// @access Admin
const createQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.create(req.body);
  res.status(201).json({ success: true, data: quiz });
});

// @desc  Update quiz (admin)
// @route PUT /api/quizzes/:id
// @access Admin
const updateQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!quiz) { res.status(404); throw new Error("Quiz not found"); }
  res.json({ success: true, data: quiz });
});

// @desc  Delete quiz (admin)
// @route DELETE /api/quizzes/:id
// @access Admin
const deleteQuiz = asyncHandler(async (req, res) => {
  await Quiz.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Quiz deleted" });
});

// @desc  Get my quiz attempts
// @route GET /api/quizzes/my-attempts
// @access Private
const getMyAttempts = asyncHandler(async (req, res) => {
  const attempts = await QuizAttempt.find({ student: req.user._id })
    .populate("quiz", "title passingScore")
    .sort("-createdAt");
  res.json({ success: true, data: attempts });
});

module.exports = { getLessonQuiz, submitQuiz, createQuiz, updateQuiz, deleteQuiz, getMyAttempts };
