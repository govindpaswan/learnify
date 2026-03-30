const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    videoUrl: { type: String, default: "" },
    videoPublicId: { type: String, default: "" },
    videoDuration: { type: Number, default: 0 }, // seconds
    order: { type: Number, required: true },
    isPreview: { type: Boolean, default: false },
    resources: [
      {
        name: String,
        url: String,
        type: { type: String, enum: ["pdf", "link", "code", "other"] },
      },
    ],
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lesson", lessonSchema);
