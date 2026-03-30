import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Clock, Users, Star, BookOpen, Award, CheckCircle, Lock, Play, ShoppingCart, Zap } from "lucide-react";
import toast from "react-hot-toast";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/common/Spinner";
import ReviewSection from "../components/common/ReviewSection";

export default function CourseDetail() {
  const { slug } = useParams();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [devModal, setDevModal] = useState(false);

  useEffect(() => {
    api.get(`/courses/${slug}`)
      .then(r => setCourse(r.data.data))
      .catch(() => toast.error("Course not found"))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleEnroll = async () => {
    if (!isAuthenticated) return navigate("/login");
    try {
      setEnrolling(true);
      const { data } = await api.post("/payments/create-order", { courseId: course._id });

      // Free course
      if (data.free) {
        toast.success("Enrolled successfully! 🎉");
        navigate(`/learn/${course._id}`);
        return;
      }

      // Dev mode - no Razorpay configured
      if (data.devMode) {
        setDevModal(true);
        return;
      }

      // Real Razorpay
      const options = {
        key: data.data.keyId,
        amount: data.data.amount,
        currency: data.data.currency,
        name: "Learnify",
        description: data.data.courseName,
        order_id: data.data.orderId,
        handler: async (response) => {
          try {
            await api.post("/payments/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              courseId: course._id,
            });
            toast.success("Payment successful! 🎉");
            navigate(`/learn/${course._id}`);
          } catch { toast.error("Payment verification failed."); }
        },
        prefill: { name: user?.name, email: user?.email },
        theme: { color: "#6366f1" },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || "Enrollment failed");
    } finally { setEnrolling(false); }
  };

  const handleDevEnroll = async () => {
    try {
      setEnrolling(true);
      await api.post("/payments/dev-enroll", { courseId: course._id });
      toast.success("Test enrollment successful! 🎉");
      setDevModal(false);
      navigate(`/learn/${course._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally { setEnrolling(false); }
  };

  if (loading) return <Spinner size="lg" className="py-32" />;
  if (!course) return <div className="text-center py-32 text-slate-500">Course not found</div>;

  const price = course.discountPrice > 0 ? course.discountPrice : course.price;
  const discount = course.discountPrice > 0 ? Math.round((1 - course.discountPrice / course.price) * 100) : 0;
  const lessons = course.lessons || [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-surface-900">
      {/* Dev Mode Modal */}
      {devModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="card p-6 max-w-sm w-full animate-slide-up">
            <div className="w-14 h-14 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4">
              <Zap size={26} className="text-amber-500" />
            </div>
            <h3 className="font-display font-bold text-xl text-center text-slate-900 dark:text-white mb-2">Dev Mode — Test Enrollment</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-5">
              Razorpay payment keys are not configured. Use test enrollment to access the course directly.<br/>
              <span className="text-xs mt-1 block">Real payment ke liye <strong>.env</strong> mein Razorpay keys daalo.</span>
            </p>
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 mb-5 text-sm">
              <div className="font-semibold text-amber-800 dark:text-amber-400 mb-1">Course: {course.title}</div>
              <div className="text-amber-700 dark:text-amber-500">Price: ₹{price.toLocaleString("en-IN")} (TEST MODE)</div>
            </div>
            <div className="flex gap-3">
              <button onClick={handleDevEnroll} disabled={enrolling} className="btn-primary flex-1 justify-center">
                {enrolling ? "Enrolling..." : "✅ Test Enroll"}
              </button>
              <button onClick={() => setDevModal(false)} className="btn-secondary px-4">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 to-primary-950 text-white py-12 md:py-16">
        <div className="page-container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
            <div className="lg:col-span-2">
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="badge bg-primary-500/20 text-primary-300 border border-primary-500/30">{course.category}</span>
                <span className="badge bg-white/10 text-white/80">{course.level}</span>
                {course.language && <span className="badge bg-white/10 text-white/80">{course.language}</span>}
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold mb-4 leading-tight">{course.title}</h1>
              <p className="text-slate-300 text-base mb-6 line-clamp-3">{course.shortDescription || course.description}</p>
              <div className="flex flex-wrap items-center gap-5 text-sm text-slate-400">
                <span className="flex items-center gap-1.5"><Star size={15} className="text-amber-400 fill-amber-400" />{course.rating?.toFixed(1)} rating</span>
                <span className="flex items-center gap-1.5"><Users size={15} />{course.enrolledCount?.toLocaleString()} enrolled</span>
                <span className="flex items-center gap-1.5"><BookOpen size={15} />{course.totalLessons} lessons</span>
                <span className="flex items-center gap-1.5"><Clock size={15} />{course.duration}</span>
              </div>
              <div className="mt-4 text-sm text-slate-400">
                Instructor: <span className="text-white font-medium">{course.instructor}</span>
              </div>
            </div>

            {/* Enrollment Card */}
            <div className="card p-6 shadow-2xl lg:sticky lg:top-24">
              <div className="aspect-video rounded-xl overflow-hidden mb-5 bg-slate-100">
                <img src={course.thumbnail?.url || `https://placehold.co/600x340/6366f1/white?text=${encodeURIComponent(course.title)}`} alt={course.title} className="w-full h-full object-cover" />
              </div>
              <div className="mb-4">
                {course.isFree || price === 0 ? (
                  <span className="font-display font-bold text-3xl text-emerald-600 dark:text-emerald-400">Free</span>
                ) : (
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="font-display font-bold text-3xl text-slate-900 dark:text-white">₹{price.toLocaleString("en-IN")}</span>
                    {course.discountPrice > 0 && (
                      <>
                        <span className="text-slate-400 line-through text-lg">₹{course.price.toLocaleString("en-IN")}</span>
                        <span className="badge bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">{discount}% OFF</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {course.isEnrolled ? (
                <Link to={`/learn/${course._id}`} className="btn-primary w-full justify-center mb-3">
                  <Play size={18} /> Continue Learning
                </Link>
              ) : (
                <button onClick={handleEnroll} disabled={enrolling} className="btn-primary w-full justify-center mb-3 py-3 text-base">
                  {enrolling ? "Processing..." : course.isFree || price === 0
                    ? <><BookOpen size={18} /> Enroll Free</>
                    : <><ShoppingCart size={18} /> Buy Now</>}
                </button>
              )}

              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400 mt-3">
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-emerald-500 shrink-0" /> Lifetime access</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-emerald-500 shrink-0" /> Certificate on completion</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-emerald-500 shrink-0" /> {course.totalLessons} video lessons</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-emerald-500 shrink-0" /> Mobile & desktop friendly</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="page-container py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6">
            {/* What you'll learn */}
            {course.whatYouLearn?.length > 0 && (
              <div className="card p-6">
                <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white mb-4">What You'll Learn</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {course.whatYouLearn.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <CheckCircle size={15} className="text-emerald-500 mt-0.5 shrink-0" /> {item}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Requirements */}
            {course.requirements?.length > 0 && (
              <div className="card p-6">
                <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white mb-4">Requirements</h2>
                <ul className="space-y-2">
                  {course.requirements.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2 shrink-0" /> {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Curriculum */}
            <div className="card p-6">
              <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white mb-4">
                Course Curriculum <span className="text-slate-400 font-normal text-base">({lessons.length} lessons)</span>
              </h2>
              <div className="space-y-2">
                {lessons.map((lesson, i) => (
                  <div key={lesson._id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-surface-900 hover:bg-slate-100 dark:hover:bg-surface-800 transition-colors">
                    <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
                      {lesson.isPreview || course.isEnrolled
                        ? <Play size={12} className="text-primary-600 dark:text-primary-400" />
                        : <Lock size={12} className="text-slate-400" />}
                    </div>
                    <span className="text-sm text-slate-700 dark:text-slate-300 flex-1">{lesson.title}</span>
                    <div className="flex items-center gap-2">
                      {lesson.isPreview && <span className="badge bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs">Preview</span>}
                      {lesson.videoDuration > 0 && <span className="text-xs text-slate-400">{Math.floor(lesson.videoDuration / 60)}m</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="card p-6">
              <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white mb-4">About This Course</h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">{course.description}</p>
            </div>

            {/* Reviews */}
            <ReviewSection
              courseId={course._id}
              courseRating={course.rating}
              totalRatings={course.totalRatings}
              isEnrolled={!!course.isEnrolled}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <div className="card p-6">
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-4">Your Instructor</h3>
              <div className="flex items-center gap-3 mb-3">
                <img src={course.instructorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(course.instructor)}&background=6366f1&color=fff&size=80`} alt={course.instructor} className="w-14 h-14 rounded-full object-cover" />
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">{course.instructor}</div>
                  <div className="text-xs text-slate-500">Expert Instructor</div>
                </div>
              </div>
              {course.instructorBio && <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{course.instructorBio}</p>}
            </div>

            {course.certificate && (
              <div className="card p-5 border-2 border-amber-200 dark:border-amber-800/50">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                    <Award className="text-amber-600 dark:text-amber-400" size={20} />
                  </div>
                  <h3 className="font-display font-bold text-slate-900 dark:text-white">Certificate Included</h3>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Complete all lessons to earn a verified PDF certificate with unique ID.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
