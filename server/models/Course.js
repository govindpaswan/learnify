const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },
    description: { type: String, required: true },
    shortDescription: { type: String, default: "" },
    thumbnail: {
      url: { type: String, default: "" },
      public_id: { type: String, default: "" },
    },
    instructor: { type: String, required: true },
    instructorBio: { type: String, default: "" },
    instructorAvatar: { type: String, default: "" },
    category: { type: String, required: true },
    level: { type: String, enum: ["Beginner", "Intermediate", "Advanced"], default: "Beginner" },
    language: { type: String, default: "English" },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, default: 0 },
    isFree: { type: Boolean, default: false },
    duration: { type: String, default: "0h 0m" },
    totalLessons: { type: Number, default: 0 },
    lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lesson" }],
    requirements: [String],
    whatYouLearn: [String],
    tags: [String],
    rating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
    enrolledCount: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
    certificate: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Auto-generate slug
courseSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-") + "-" + Date.now();
  }
  next();
});

module.exports = mongoose.model("Course", courseSchema);
