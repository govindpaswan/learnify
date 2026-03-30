import { useState, useEffect } from "react";
import api from "../../utils/api";

export default function AdminEnrollments() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/enrollments/admin/all").then(r => setEnrollments(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white mb-6">Enrollments</h1>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-surface-800 border-b border-slate-200 dark:border-slate-700">
              <tr>{["Student","Course","Progress","Enrolled On","Status"].map(h => (
                <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-8 text-slate-400">Loading...</td></tr>
              ) : enrollments.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-slate-400">No enrollments yet</td></tr>
              ) : enrollments.map(en => (
                <tr key={en._id} className="hover:bg-slate-50 dark:hover:bg-surface-800">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <img src={en.student?.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(en.student?.name||"U")}&background=6366f1&color=fff&size=40`} alt="" className="w-9 h-9 rounded-xl object-cover shrink-0" />
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">{en.student?.name}</div>
                        <div className="text-xs text-slate-500">{en.student?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 max-w-xs">
                    <div className="font-medium text-slate-800 dark:text-slate-200 truncate">{en.course?.title}</div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <div className="h-full rounded-full bg-primary-500" style={{width:`${en.progress||0}%`}} />
                      </div>
                      <span className="text-xs text-slate-500">{en.progress||0}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-500">{new Date(en.enrolledAt).toLocaleDateString("en-IN")}</td>
                  <td className="px-5 py-4">
                    <span className={`badge ${en.isCompleted ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400" : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"}`}>
                      {en.isCompleted ? "Completed" : "In Progress"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
