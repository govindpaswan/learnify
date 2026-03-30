import { Link } from "react-router-dom";
import { Star, Clock, Users, BookOpen, Lock } from "lucide-react";

export default function CourseCard({ course, enrolled }) {
  const price = course.discountPrice > 0 ? course.discountPrice : course.price;
  return (
    <Link to={`/courses/${course.slug || course._id}`} className="card group hover:shadow-xl hover:shadow-slate-200/60 dark:hover:shadow-black/30 hover:-translate-y-1 transition-all duration-300 overflow-hidden block">
      <div className="relative overflow-hidden aspect-video bg-slate-100 dark:bg-slate-800">
        <img
          src={course.thumbnail?.url || "https://placehold.co/800x450/6366f1/white?text=Course"}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="badge bg-white/90 dark:bg-surface-800/90 text-slate-700 dark:text-slate-200 text-xs">{course.level}</span>
          {course.isFree && <span className="badge bg-emerald-500 text-white">Free</span>}
        </div>
        {enrolled && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="bg-white text-slate-900 text-xs font-semibold px-3 py-1.5 rounded-full">Continue Learning →</span>
          </div>
        )}
      </div>
      <div className="p-5">
        <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wide">{course.category}</span>
        <h3 className="font-display font-semibold text-slate-900 dark:text-white mt-1 mb-2 line-clamp-2 leading-snug group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{course.title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">{course.shortDescription || course.description}</p>
        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-4">
          <span className="flex items-center gap-1"><BookOpen size={12} />{course.totalLessons} lessons</span>
          <span className="flex items-center gap-1"><Clock size={12} />{course.duration}</span>
          <span className="flex items-center gap-1"><Users size={12} />{course.enrolledCount}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star size={14} className="text-amber-400 fill-amber-400" />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{course.rating?.toFixed(1) || "New"}</span>
          </div>
          {enrolled ? (
            <span className="badge bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">Enrolled</span>
          ) : (
            <div className="text-right">
              {course.isFree || price === 0 ? (
                <span className="font-display font-bold text-emerald-600 dark:text-emerald-400">Free</span>
              ) : (
                <div>
                  <span className="font-display font-bold text-slate-900 dark:text-white">₹{price.toLocaleString("en-IN")}</span>
                  {course.discountPrice > 0 && <span className="text-xs text-slate-400 line-through ml-1">₹{course.price.toLocaleString("en-IN")}</span>}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
