// MyCourses.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Play, CheckCircle, BookOpen } from "lucide-react";
import api from "../../utils/api";

export default function MyCourses() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");

  useEffect(() => {
    api.get("/enrollments/my").then(r => setEnrollments(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = tab === "all" ? enrollments : tab === "progress" ? enrollments.filter(e => !e.isCompleted) : enrollments.filter(e => e.isCompleted);

  return (
    <div className="page-container py-8">
      <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white mb-6">My Courses</h1>
      <div className="flex gap-2 mb-6">
        {["all", "progress", "completed"].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${tab === t ? "bg-primary-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"}`}>{t === "progress" ? "In Progress" : t}</button>
        ))}
      </div>
      {loading ? <div className="text-center py-12 text-slate-500">Loading...</div> : filtered.length === 0 ? (
        <div className="text-center py-20"><div className="text-5xl mb-4">📚</div><p className="text-slate-500">No courses here yet.</p><Link to="/courses" className="btn-primary mt-4">Browse Courses</Link></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map(en => (
            <div key={en._id} className="card overflow-hidden group">
              <div className="relative aspect-video">
                <img src={en.course?.thumbnail?.url || "https://placehold.co/400x225/6366f1/white?text=Course"} alt={en.course?.title} className="w-full h-full object-cover" />
                {en.isCompleted && <div className="absolute inset-0 bg-emerald-900/60 flex items-center justify-center"><CheckCircle size={36} className="text-white" /></div>}
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1 line-clamp-2">{en.course?.title}</h3>
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-3">{en.course?.instructor}</div>
                <div className="progress-bar mb-1"><div className="progress-fill" style={{width:`${en.progress}%`}} /></div>
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-4">
                  <span>{en.completedLessons?.length}/{en.course?.totalLessons} lessons</span>
                  <span>{en.progress}%</span>
                </div>
                {en.isCompleted ? (
                  <Link to="/dashboard/certificates" className="btn-secondary w-full justify-center text-sm"><CheckCircle size={14} className="text-emerald-500" /> View Certificate</Link>
                ) : (
                  <Link to={`/learn/${en.course?._id}`} className="btn-primary w-full justify-center text-sm"><Play size={14} /> Continue Learning</Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
