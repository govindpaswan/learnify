const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const certificateSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    enrollment: { type: mongoose.Schema.Types.ObjectId, ref: "Enrollment", required: true },
    certificateId: { type: String, unique: true, default: () => "LRFY-" + uuidv4().slice(0, 8).toUpperCase() },
    issuedAt: { type: Date, default: Date.now },
    studentName: String,
    courseName: String,
    instructorName: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Certificate", certificateSchema);
