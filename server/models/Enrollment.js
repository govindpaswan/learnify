const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
    completedLessons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lesson" }],
    progress: { type: Number, default: 0 }, // percentage
    isCompleted: { type: Boolean, default: false },
    completedAt: Date,
    certificate: { type: mongoose.Schema.Types.ObjectId, ref: "Certificate" },
    lastAccessedLesson: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson" },
    enrolledAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model("Enrollment", enrollmentSchema);
