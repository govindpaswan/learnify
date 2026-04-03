import { useState, useEffect } from "react";
import { Users, BookOpen, CreditCard, Award, TrendingUp, UserCheck } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import api from "../../utils/api";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/stats").then(r => setStats(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const chartData = stats?.monthlyRevenue?.map(m => ({
    month: MONTHS[m._id.month - 1],
    revenue: m.revenue,
    enrollments: m.count,
  })) || [];

  const cards = stats ? [
    { icon: Users, label: "Total Students", value: stats.totalUsers, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
    { icon: BookOpen, label: "Total Courses", value: stats.totalCourses, color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-900/20" },
    { icon: UserCheck, label: "Enrollments", value: stats.totalEnrollments, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20" },
    { icon: CreditCard, label: "Total Revenue", value: `₹${(stats.totalRevenue || 0).toLocaleString("en-IN")}`, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
    { icon: Award, label: "Certificates", value: stats.totalCertificates, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-900/20" },
  ] : [];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white mb-6">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        {loading ? [...Array(5)].map((_, i) => <div key={i} className="card p-5"><div className="skeleton h-10 w-10 rounded-xl mb-3" /><div className="skeleton h-7 w-16 mb-1" /><div className="skeleton h-4 w-24" /></div>) :
          cards.map(c => (
            <div key={c.label} className="card p-5">
              <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center mb-3`}><c.icon size={18} className={c.color} /></div>
              <div className="font-display font-bold text-2xl text-slate-900 dark:text-white">{c.value}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{c.label}</div>
            </div>
          ))
        }
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        <div className="card p-6">
          <h2 className="font-display font-semibold text-slate-900 dark:text-white mb-4">Monthly Revenue (₹)</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={v => [`₹${v}`, "Revenue"]} />
                <Bar dataKey="revenue" fill="#6366f1" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No revenue data yet</div>}
        </div>

        <div className="card p-6">
          <h2 className="font-display font-semibold text-slate-900 dark:text-white mb-4">Monthly Enrollments</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="enrollments" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: "#8b5cf6" }} />
              </LineChart>
            </ResponsiveContainer>
          ) : <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No enrollment data yet</div>}
        </div>
      </div>

      {/* Top Courses + Recent Enrollments */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="font-display font-semibold text-slate-900 dark:text-white mb-4">Top Courses</h2>
          {stats?.topCourses?.length > 0 ? (
            <div className="space-y-3">
              {stats.topCourses.map((c, i) => (
                <div key={c._id} className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-400 shrink-0">{i + 1}</span>
                  <img src={c.thumbnail?.url || "https://placehold.co/40x40/6366f1/white?text=C"} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{c.title}</div>
                    <div className="text-xs text-slate-500">{c.enrolledCount} enrolled</div>
                  </div>
                  <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">₹{c.price?.toLocaleString("en-IN")}</div>
                </div>
              ))}
            </div>
          ) : <div className="text-center text-slate-400 py-8 text-sm">No courses yet</div>}
        </div>

        <div className="card p-6">
          <h2 className="font-display font-semibold text-slate-900 dark:text-white mb-4">Recent Enrollments</h2>
          {stats?.recentEnrollments?.length > 0 ? (
            <div className="space-y-3">
              {stats.recentEnrollments.slice(0, 5).map(en => (
                <div key={en._id} className="flex items-center gap-3">
                  <img src={en.student?.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(en.student?.name||"U")}&background=6366f1&color=fff&size=40`} alt="" className="w-9 h-9 rounded-xl object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{en.student?.name}</div>
                    <div className="text-xs text-slate-500 truncate">{en.course?.title}</div>
                  </div>
                  <div className="text-xs text-slate-400">{new Date(en.enrolledAt).toLocaleDateString("en-IN")}</div>
                </div>
              ))}
            </div>
          ) : <div className="text-center text-slate-400 py-8 text-sm">No enrollments yet</div>}
        </div>
      </div>
    </div>
  );
}
