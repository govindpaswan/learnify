const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctOption: { type: Number, required: true }, // index 0-3
  explanation: { type: String, default: "" },
});

const quizSchema = new mongoose.Schema(
  {
    lesson: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson" },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    title: { type: String, required: true },
    questions: [questionSchema],
    passingScore: { type: Number, default: 70 }, // percentage
    timeLimit: { type: Number, default: 0 }, // minutes, 0=unlimited
  },
  { timestamps: true }
);

const quizAttemptSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
    answers: [Number],
    score: { type: Number, default: 0 },
    passed: { type: Boolean, default: false },
    timeTaken: Number, // seconds
  },
  { timestamps: true }
);

const Quiz = mongoose.model("Quiz", quizSchema);
const QuizAttempt = mongoose.model("QuizAttempt", quizAttemptSchema);

module.exports = { Quiz, QuizAttempt };
