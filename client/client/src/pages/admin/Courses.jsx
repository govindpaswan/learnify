import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Edit, Trash2, BookOpen, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../utils/api";

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = () => {
    api.get("/courses/admin/all").then(r => setCourses(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchCourses(); }, []);

  const deleteCourse = async (id, title) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/courses/${id}`);
      toast.success("Course deleted");
      fetchCourses();
    } catch { toast.error("Delete failed"); }
  };

  const togglePublish = async (course) => {
    try {
      await api.put(`/courses/${course._id}`, { isPublished: !course.isPublished });
      toast.success(`Course ${!course.isPublished ? "published" : "unpublished"}`);
      fetchCourses();
    } catch { toast.error("Update failed"); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Courses</h1>
        <Link to="/admin/courses/new" className="btn-primary text-sm"><Plus size={16} /> New Course</Link>
      </div>

      {loading ? <div className="text-center py-12 text-slate-500">Loading...</div> : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-surface-800 border-b border-slate-200 dark:border-slate-700">
                <tr>{["Course","Category","Level","Price","Students","Status","Actions"].map(h => <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {courses.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12 text-slate-400">No courses yet. <Link to="/admin/courses/new" className="text-primary-600">Create one!</Link></td></tr>
                ) : courses.map(c => (
                  <tr key={c._id} className="hover:bg-slate-50 dark:hover:bg-surface-800">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img src={c.thumbnail?.url || "https://placehold.co/48x48/6366f1/white?text=C"} alt="" className="w-12 h-8 rounded-lg object-cover shrink-0" />
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white max-w-[200px] truncate">{c.title}</div>
                          <div className="text-xs text-slate-500">{c.instructor}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-400">{c.category}</td>
                    <td className="px-5 py-4"><span className="badge bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">{c.level}</span></td>
                    <td className="px-5 py-4 font-medium text-slate-900 dark:text-white">{c.isFree ? "Free" : `₹${c.price?.toLocaleString("en-IN")}`}</td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-400">{c.enrolledCount}</td>
                    <td className="px-5 py-4">
                      <span className={`badge ${c.isPublished ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}>
                        {c.isPublished ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => togglePublish(c)} title={c.isPublished ? "Unpublish" : "Publish"} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                          {c.isPublished ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                        <Link to={`/admin/courses/${c._id}/lessons`} title="Manage Lessons" className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-violet-600">
                          <BookOpen size={15} />
                        </Link>
                        <Link to={`/admin/courses/${c._id}/edit`} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-primary-600">
                          <Edit size={15} />
                        </Link>
                        <button onClick={() => deleteCourse(c._id, c.title)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-500 hover:text-red-600">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
