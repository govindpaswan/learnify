import { useState, useEffect } from "react";
import { Star, Trash2, Eye } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../utils/api";

const StarRow = ({ rating }) => (
  <div className="flex gap-0.5">
    {[1,2,3,4,5].map(s => (
      <Star key={s} size={12} className={s <= rating ? "text-amber-400 fill-amber-400" : "text-slate-300 dark:text-slate-600"} />
    ))}
  </div>
);

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/reviews/admin/all")
      .then(r => setReviews(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const deleteReview = async (id) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    try {
      await api.delete(`/reviews/${id}`);
      setReviews(prev => prev.filter(r => r._id !== id));
      toast.success("Review deleted");
    } catch { toast.error("Delete failed"); }
  };

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Reviews</h1>
        <div className="flex items-center gap-2 card px-4 py-2">
          <Star size={16} className="text-amber-400 fill-amber-400" />
          <span className="font-bold text-slate-900 dark:text-white">{avgRating}</span>
          <span className="text-slate-500 text-sm">avg ({reviews.length} reviews)</span>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-surface-800 border-b border-slate-200 dark:border-slate-700">
              <tr>{["Student","Course","Rating","Review","Date","Action"].map(h => (
                <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-10 text-slate-400">Loading...</td></tr>
              ) : reviews.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-slate-400">No reviews yet</td></tr>
              ) : reviews.map(r => (
                <tr key={r._id} className="hover:bg-slate-50 dark:hover:bg-surface-800">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <img src={r.student?.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(r.student?.name||"U")}&background=6366f1&color=fff&size=32`} alt="" className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white text-xs">{r.student?.name}</div>
                        <div className="text-xs text-slate-400">{r.student?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 max-w-[140px]">
                    <div className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{r.course?.title}</div>
                  </td>
                  <td className="px-5 py-4">
                    <StarRow rating={r.rating} />
                    <span className="text-xs text-slate-500 mt-0.5 block">{r.rating}/5</span>
                  </td>
                  <td className="px-5 py-4 max-w-[220px]">
                    {r.title && <div className="font-semibold text-xs text-slate-800 dark:text-slate-200 mb-0.5">{r.title}</div>}
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{r.comment}</p>
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-500 whitespace-nowrap">
                    {new Date(r.createdAt).toLocaleDateString("en-IN")}
                  </td>
                  <td className="px-5 py-4">
                    <button onClick={() => deleteReview(r._id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-600">
                      <Trash2 size={14} />
                    </button>
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
