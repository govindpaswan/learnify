const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    student:    { type: mongoose.Schema.Types.ObjectId, ref: "User",   required: true },
    course:     { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    enrollment: { type: mongoose.Schema.Types.ObjectId, ref: "Enrollment" },
    rating:     { type: Number, required: true, min: 1, max: 5 },
    title:      { type: String, default: "" },
    comment:    { type: String, required: true, trim: true },
    isVerified: { type: Boolean, default: false }, // enrolled student's review
  },
  { timestamps: true }
);

// One review per student per course
reviewSchema.index({ student: 1, course: 1 }, { unique: true });

// Auto-update course rating after save/delete
reviewSchema.statics.updateCourseRating = async function(courseId) {
  const Course = require("./Course");
  const stats = await this.aggregate([
    { $match: { course: courseId } },
    { $group: { _id: "$course", avgRating: { $avg: "$rating" }, totalRatings: { $sum: 1 } } },
  ]);
  if (stats.length > 0) {
    await Course.findByIdAndUpdate(courseId, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      totalRatings: stats[0].totalRatings,
    });
  } else {
    await Course.findByIdAndUpdate(courseId, { rating: 0, totalRatings: 0 });
  }
};

reviewSchema.post("save",   function() { this.constructor.updateCourseRating(this.course); });
reviewSchema.post("deleteOne", { document: true }, function() { this.constructor.updateCourseRating(this.course); });

module.exports = mongoose.model("Review", reviewSchema);
