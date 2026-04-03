import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Award, TrendingUp, Clock, ArrowRight, Play } from "lucide-react";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/enrollments/my"),
      api.get("/certificates/my"),
    ]).then(([e, c]) => {
      setEnrollments(e.data.data);
      setCerts(c.data.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const inProgress = enrollments.filter(e => !e.isCompleted);
  const completed = enrollments.filter(e => e.isCompleted);

  const stats = [
    { icon: BookOpen, label: "Enrolled Courses", value: enrollments.length, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
    { icon: TrendingUp, label: "In Progress", value: inProgress.length, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20" },
    { icon: Award, label: "Completed", value: completed.length, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
    { icon: Award, label: "Certificates", value: certs.length, color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-900/20" },
  ];

  return (
    <div className="page-container py-8">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white mb-1">
          Welcome back, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-slate-500 dark:text-slate-400">Track your progress and continue learning.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {stats.map(s => (
          <div key={s.label} className="card p-5">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon size={18} className={s.color} />
            </div>
            <div className="font-display font-bold text-2xl text-slate-900 dark:text-white">{loading ? "—" : s.value}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Continue Learning */}
      {inProgress.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white">Continue Learning</h2>
            <Link to="/dashboard/my-courses" className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">View all <ArrowRight size={14} /></Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {inProgress.slice(0, 3).map(en => (
              <div key={en._id} className="card overflow-hidden group hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img src={en.course?.thumbnail?.url || "https://placehold.co/400x225/6366f1/white?text=Course"} alt={en.course?.title} className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link to={`/learn/${en.course?._id}`} className="btn-primary text-sm py-2"><Play size={15} /> Resume</Link>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-2 line-clamp-1">{en.course?.title}</h3>
                  <div className="progress-bar mb-1">
                    <div className="progress-fill" style={{width: `${en.progress}%`}} />
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>{en.completedLessons?.length || 0}/{en.course?.totalLessons} lessons</span>
                    <span>{en.progress}% complete</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certificates */}
      {certs.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white">Recent Certificates</h2>
            <Link to="/dashboard/certificates" className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">View all <ArrowRight size={14} /></Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {certs.slice(0, 2).map(cert => (
              <div key={cert._id} className="card p-5 border-2 border-amber-200 dark:border-amber-800/50 flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/30">
                  <Award size={26} className="text-white" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-slate-900 dark:text-white text-sm truncate">{cert.courseName}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">ID: {cert.certificateId}</div>
                  <Link to={`/verify/${cert.certificateId}`} className="text-xs text-primary-600 dark:text-primary-400 hover:underline mt-1 block">Verify →</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {enrollments.length === 0 && !loading && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="font-display font-semibold text-xl text-slate-700 dark:text-slate-300 mb-2">No courses yet</h3>
          <p className="text-slate-500 mb-6">Explore our courses and start your learning journey today!</p>
          <Link to="/courses" className="btn-primary">Browse Courses</Link>
        </div>
      )}
    </div>
  );
}
