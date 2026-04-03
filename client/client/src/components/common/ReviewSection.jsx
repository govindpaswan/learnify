import { useState, useEffect } from "react";
import { Star, Edit, Trash2, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

const StarRating = ({ value, onChange, size = 24, readonly = false }) => (
  <div className="flex gap-1">
    {[1,2,3,4,5].map((star) => (
      <button key={star} type="button" disabled={readonly}
        onClick={() => onChange && onChange(star)}
        className={`transition-transform ${!readonly ? "hover:scale-125 cursor-pointer" : "cursor-default"}`}>
        <Star size={size} className={star <= value ? "text-amber-400 fill-amber-400" : "text-slate-300 dark:text-slate-600"} />
      </button>
    ))}
  </div>
);

const RatingBar = ({ star, count, total }) => (
  <div className="flex items-center gap-3 text-sm">
    <span className="w-4 text-slate-600 dark:text-slate-400 text-right">{star}</span>
    <Star size={13} className="text-amber-400 fill-amber-400 shrink-0" />
    <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
      <div className="h-full bg-amber-400 rounded-full transition-all duration-500"
        style={{ width: total > 0 ? `${(count / total) * 100}%` : "0%" }} />
    </div>
    <span className="w-6 text-slate-500 text-xs">{count}</span>
  </div>
);

const RATING_LABELS = ["", "Very Bad 😞", "Okay 😐", "Good 🙂", "Very Good 😊", "Excellent! 🤩"];

export default function ReviewSection({ courseId, courseRating, totalRatings, isEnrolled }) {
  const { isAuthenticated, user } = useAuth();
  const [reviews, setReviews]   = useState([]);
  const [myReview, setMyReview] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm]   = useState({ rating: 5, title: "", comment: "" });
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    fetchReviews();
    if (isAuthenticated && user?.role === "student") fetchMyReview();
  }, [courseId, isAuthenticated]);

  const fetchReviews = async () => {
    try { const { data } = await api.get(`/reviews/course/${courseId}`); setReviews(data.data); }
    catch { } finally { setLoading(false); }
  };

  const fetchMyReview = async () => {
    try {
      const { data } = await api.get(`/reviews/my/${courseId}`);
      if (data.data) { setMyReview(data.data); setForm({ rating: data.data.rating, title: data.data.title || "", comment: data.data.comment }); }
    } catch { }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.comment.trim()) return toast.error("Please write a review comment");
    try {
      setSubmitting(true);
      if (editMode && myReview) {
        const { data } = await api.put(`/reviews/${myReview._id}`, form);
        setMyReview(data.data);
        toast.success("Review updated! ✅");
      } else {
        const { data } = await api.post(`/reviews/course/${courseId}`, form);
        setMyReview(data.data);
        toast.success("Review submitted! 🎉");
      }
      setShowForm(false); setEditMode(false); fetchReviews();
    } catch (err) { toast.error(err.response?.data?.message || "Failed to submit review"); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete your review?")) return;
    try {
      await api.delete(`/reviews/${myReview._id}`);
      setMyReview(null); setForm({ rating: 5, title: "", comment: "" });
      toast.success("Review deleted"); fetchReviews();
    } catch { toast.error("Delete failed"); }
  };

  const dist = [5,4,3,2,1].map(s => ({ star: s, count: reviews.filter(r => r.rating === s).length }));
  const formatDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
          <MessageSquare size={20} className="text-primary-500" />
          Student Reviews
          <span className="text-slate-400 font-normal text-base">({totalRatings || reviews.length})</span>
        </h2>
        {isEnrolled && !myReview && (
          <button onClick={() => { setShowForm(true); setEditMode(false); }} className="btn-primary text-sm py-2">
            <Star size={14} /> Write a Review
          </button>
        )}
      </div>

      {/* Rating Summary */}
      {reviews.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-6 p-5 bg-slate-50 dark:bg-surface-900 rounded-2xl mb-6">
          <div className="text-center shrink-0">
            <div className="font-display font-bold text-6xl text-slate-900 dark:text-white leading-none">{(courseRating || 0).toFixed(1)}</div>
            <StarRating value={Math.round(courseRating || 0)} size={18} readonly />
            <div className="text-sm text-slate-500 mt-1">{reviews.length} reviews</div>
          </div>
          <div className="flex-1 space-y-2 justify-center flex flex-col">
            {dist.map(({ star, count }) => <RatingBar key={star} star={star} count={count} total={reviews.length} />)}
          </div>
        </div>
      )}

      {/* My Review Card */}
      {myReview && !showForm && (
        <div className="mb-6 p-4 border-2 border-primary-200 dark:border-primary-800/50 rounded-2xl bg-primary-50/30 dark:bg-primary-900/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wide">Your Review</span>
            <div className="flex gap-2">
              <button onClick={() => { setShowForm(true); setEditMode(true); }} className="p-1.5 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 text-primary-500"><Edit size={14} /></button>
              <button onClick={handleDelete} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"><Trash2 size={14} /></button>
            </div>
          </div>
          <StarRating value={myReview.rating} size={16} readonly />
          {myReview.title && <div className="font-semibold text-slate-900 dark:text-white text-sm mt-1">{myReview.title}</div>}
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{myReview.comment}</p>
        </div>
      )}

      {/* Review Form */}
      {showForm && (
        <div className="mb-6 card p-5 border-2 border-primary-200 dark:border-primary-800/50 animate-slide-up">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">{editMode ? "Edit Your Review" : "Write a Review"}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Rating *</label>
              <StarRating value={form.rating} onChange={r => setForm({...form, rating: r})} size={28} />
              <div className="text-xs text-slate-500 mt-1">{RATING_LABELS[form.rating]}</div>
            </div>
            <div>
              <label className="label">Review Title <span className="text-slate-400 font-normal">(optional)</span></label>
              <input className="input" placeholder="e.g. Excellent course!" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
            </div>
            <div>
              <label className="label">Your Experience *</label>
              <textarea className="input resize-none" rows={4} placeholder="How did this course help you? What did you like? What could be improved?" value={form.comment} onChange={e => setForm({...form, comment: e.target.value})} required />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={submitting} className="btn-primary text-sm">
                {submitting ? "Submitting..." : editMode ? "Update Review" : "Submit Review"}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditMode(false); }} className="btn-secondary text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Not enrolled message */}
      {!isEnrolled && isAuthenticated && (
        <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-sm text-amber-700 dark:text-amber-400">
          💡 Enroll in this course to leave a review
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-3 p-4 rounded-xl bg-slate-50 dark:bg-surface-900">
              <div className="skeleton w-10 h-10 rounded-full shrink-0" />
              <div className="flex-1 space-y-2"><div className="skeleton h-4 w-32" /><div className="skeleton h-3 w-full" /></div>
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-10">
          <div className="text-4xl mb-3">⭐</div>
          <p className="text-slate-500 dark:text-slate-400">No reviews yet. Be the first to review this course!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r._id} className="flex gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-surface-900 hover:bg-slate-100 dark:hover:bg-surface-800 transition-colors">
              <img src={r.student?.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(r.student?.name || "U")}&background=6366f1&color=fff&size=40`}
                alt={r.student?.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white text-sm">{r.student?.name}</span>
                    {r.isVerified && <span className="ml-2 badge bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs">✓ Verified</span>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StarRating value={r.rating} size={13} readonly />
                    <span className="text-xs text-slate-400">{formatDate(r.createdAt)}</span>
                  </div>
                </div>
                {r.title && <div className="font-medium text-slate-800 dark:text-slate-200 text-sm mt-1">{r.title}</div>}
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{r.comment}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
