import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { CheckCircle, Circle, ChevronLeft, ChevronRight, Menu, Award, Play, Download } from "lucide-react";
import ReactPlayer from "react-player";
import toast from "react-hot-toast";
import api from "../../utils/api";

// Inline SVG arrows — guaranteed to show regardless of icon library issues
const ArrowLeft = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);
const ArrowRight = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

export default function LearnCourse() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [enrollment, setEnrollment] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [quizResult, setQuizResult] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [showCertBanner, setShowCertBanner] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [enRes, lesRes] = await Promise.all([
          api.get(`/enrollments/${courseId}`),
          api.get(`/lessons/course/${courseId}`),
        ]);
        const en = enRes.data.data;
        const ls = lesRes.data.data || [];
        setEnrollment(en);
        setLessons(ls);
        if (ls.length > 0) {
          const lastId = en.lastAccessedLesson;
          const idx = lastId ? ls.findIndex(l => l._id === lastId) : 0;
          setCurrentLesson(ls[Math.max(0, idx)]);
        }
        if (en.isCompleted && en.certificate) setShowCertBanner(true);
      } catch (err) {
        if (err.response?.status === 404) { toast.error("Not enrolled"); navigate("/courses"); }
      } finally { setLoading(false); }
    };
    load();
  }, [courseId]);

  useEffect(() => {
    if (!currentLesson) return;
    setQuiz(null); setQuizResult(null); setQuizAnswers([]);
    api.get(`/quizzes/lesson/${currentLesson._id}`)
      .then(r => { if (r.data.data) { setQuiz(r.data.data); setQuizAnswers(new Array(r.data.data.questions.length).fill(null)); } })
      .catch(() => {});
  }, [currentLesson]);

  const isCompleted = (id) => enrollment?.completedLessons?.includes(id);
  const currentIdx = lessons.findIndex(l => l._id === currentLesson?._id);
  const isFirst = currentIdx === 0;
  const isLast = currentIdx === lessons.length - 1;

  const goLesson = (l) => { setCurrentLesson(l); if (window.innerWidth < 768) setSidebarOpen(false); };
  const nextLesson = () => { if (!isLast) setCurrentLesson(lessons[currentIdx + 1]); };
  const prevLesson = () => { if (!isFirst) setCurrentLesson(lessons[currentIdx - 1]); };

  const markComplete = async () => {
    if (!currentLesson || marking || isCompleted(currentLesson._id)) return;
    try {
      setMarking(true);
      const { data } = await api.post(`/enrollments/${courseId}/complete-lesson/${currentLesson._id}`);
      setEnrollment(data.data);
      if (data.data.isCompleted) {
        toast.success("🏆 Course complete! Certificate issued!");
        setShowCertBanner(true);
        return;
      }
      toast.success("✅ Lesson complete! Next lesson loading...");
      if (currentIdx < lessons.length - 1) {
        setTimeout(() => setCurrentLesson(lessons[currentIdx + 1]), 700);
      }
    } catch { toast.error("Failed to mark complete"); }
    finally { setMarking(false); }
  };

  const downloadCert = async () => {
    try {
      setDownloading(true);
      const r = await api.get("/certificates/my");
      const cert = r.data.data.find(c => {
        const cid = c.course?._id || c.course;
        return cid?.toString() === courseId;
      });
      if (!cert) { toast.error("Certificate not found. Try from My Certificates page."); return; }
      const res = await api.get(`/certificates/download/${cert.certificateId}`, { responseType: "blob" });
      const url = URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const a = document.createElement("a");
      a.href = url; a.download = `certificate-${cert.certificateId}.pdf`;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(url);
      toast.success("Certificate downloaded!");
    } catch { toast.error("Download failed"); }
    finally { setDownloading(false); }
  };

  const submitQuiz = async () => {
    if (quizAnswers.some(a => a === null)) return toast.error("Answer all questions");
    try {
      const { data } = await api.post(`/quizzes/${quiz._id}/attempt`, { answers: quizAnswers, timeTaken: 0 });
      setQuizResult(data.data);
      if (data.data.passed) toast.success(`Passed! Score: ${data.data.score}%`);
      else toast.error(`Failed. Score: ${data.data.score}%`);
    } catch { toast.error("Failed to submit quiz"); }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950">
      <div className="w-10 h-10 rounded-full border-2 border-primary-200 border-t-primary-600 animate-spin" />
    </div>
  );

  const course = enrollment?.course;
  const progress = enrollment?.progress || 0;
  const completedCount = enrollment?.completedLessons?.length || 0;

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-white overflow-hidden">

      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-3 bg-slate-900 border-b border-slate-800 shrink-0">
        <button onClick={() => setSidebarOpen(v => !v)} className="p-2 rounded-lg hover:bg-slate-800 text-white">
          <Menu size={18} />
        </button>
        <Link to="/dashboard/my-courses" className="flex items-center gap-1 text-slate-400 hover:text-white text-sm">
          <ArrowLeft /> Back
        </Link>
        <div className="flex-1 text-center">
          <span className="text-sm font-medium text-slate-200 truncate">{course?.title || "..."}</span>
        </div>
        <span className="text-xs text-slate-400 shrink-0">{progress}% complete</span>
        {showCertBanner && (
          <Link to="/dashboard/certificates" className="flex items-center gap-1 text-amber-400 text-xs shrink-0">
            <Award size={14} /> Cert
          </Link>
        )}
      </div>

      {/* Certificate banner */}
      {showCertBanner && (
        <div className="bg-gradient-to-r from-amber-600 to-orange-500 px-4 py-2.5 flex items-center justify-between shrink-0">
          <span className="text-white font-medium text-sm">🎉 Course Complete! Certificate ready.</span>
          <div className="flex gap-2 items-center">
            <button
              onClick={downloadCert}
              disabled={downloading}
              className="flex items-center gap-1.5 bg-white text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-amber-50"
            >
              <Download size={13} />
              {downloading ? "..." : "Download PDF"}
            </button>
            <Link to="/dashboard/certificates" className="text-white/80 text-xs underline">View All</Link>
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar */}
        <aside className={`${sidebarOpen ? "w-72 lg:w-80" : "w-0"} transition-all duration-300 bg-slate-900 border-r border-slate-800 overflow-hidden shrink-0 flex flex-col`}>
          <div className="p-4 border-b border-slate-800 shrink-0">
            <div className="w-full bg-slate-800 rounded-full h-2 mb-2">
              <div className="h-2 rounded-full bg-primary-500 transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-slate-400">{completedCount} / {lessons.length} lessons completed</p>
          </div>
          <div className="flex-1 overflow-y-auto py-2">
            {lessons.length === 0 ? (
              <p className="text-center text-slate-500 text-sm py-8 px-4">No lessons found.<br/>Run seed script first.</p>
            ) : lessons.map((lesson, i) => {
              const done = isCompleted(lesson._id);
              const active = currentLesson?._id === lesson._id;
              return (
                <button
                  key={lesson._id}
                  onClick={() => goLesson(lesson)}
                  className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-slate-800 transition-colors border-l-2 ${active ? "bg-slate-800 border-primary-500" : "border-transparent"}`}
                >
                  <div className="mt-0.5 shrink-0">
                    {done
                      ? <CheckCircle size={17} className="text-emerald-400" />
                      : <Circle size={17} className={active ? "text-primary-400" : "text-slate-600"} />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug ${active ? "text-white font-medium" : done ? "text-slate-300" : "text-slate-400"}`}>
                      {i + 1}. {lesson.title}
                    </p>
                    {lesson.videoDuration > 0 && (
                      <p className="text-xs text-slate-600 mt-0.5">
                        {Math.floor(lesson.videoDuration / 60)}m
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Video */}
          <div className="bg-black flex-1 flex items-center justify-center overflow-hidden min-h-0">
            {currentLesson?.videoUrl ? (
              <div className="w-full h-full">
                <ReactPlayer
                  url={currentLesson.videoUrl}
                  width="100%"
                  height="100%"
                  controls
                  config={{ file: { attributes: { controlsList: "nodownload" } } }}
                />
              </div>
            ) : (
              <div className="text-center text-slate-500 p-8">
                <Play size={52} className="mx-auto mb-4 opacity-20" />
                <p className="text-sm">No video for this lesson</p>
                <p className="text-xs text-slate-600 mt-1">Add video URL from Admin panel</p>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="bg-slate-900 border-t border-slate-800 shrink-0">
            <div className="px-4 py-3 flex items-center gap-3">

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-white text-sm truncate">{currentLesson?.title || "Select a lesson"}</h2>
                <p className="text-xs text-slate-500 mt-0.5">Lesson {currentIdx + 1} of {lessons.length}</p>
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-2 shrink-0">

                {/* PREV button */}
                <button
                  onClick={prevLesson}
                  disabled={isFirst}
                  title="Previous lesson"
                  style={{
                    width: "38px", height: "38px",
                    borderRadius: "8px",
                    backgroundColor: isFirst ? "#1e293b" : "#334155",
                    opacity: isFirst ? 0.35 : 1,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    border: "none", cursor: isFirst ? "not-allowed" : "pointer",
                    color: "white",
                  }}
                >
                  <ArrowLeft />
                </button>

                {/* NEXT button */}
                <button
                  onClick={nextLesson}
                  disabled={isLast}
                  title="Next lesson"
                  style={{
                    width: "38px", height: "38px",
                    borderRadius: "8px",
                    backgroundColor: isLast ? "#1e293b" : "#334155",
                    opacity: isLast ? 0.35 : 1,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    border: "none", cursor: isLast ? "not-allowed" : "pointer",
                    color: "white",
                  }}
                >
                  <ArrowRight />
                </button>

                {/* Mark Complete / Next Lesson / All Done */}
                {isCompleted(currentLesson?._id) ? (
                  <button
                    onClick={isLast ? undefined : nextLesson}
                    style={{
                      display: "flex", alignItems: "center", gap: "6px",
                      padding: "8px 16px", borderRadius: "12px",
                      backgroundColor: isLast ? "#065f46" : "#059669",
                      color: "white", border: "none",
                      cursor: isLast ? "default" : "pointer",
                      fontSize: "13px", fontWeight: "500",
                    }}
                  >
                    <CheckCircle size={14} />
                    {isLast ? "All Done ✓" : "Next Lesson →"}
                  </button>
                ) : (
                  <button
                    onClick={markComplete}
                    disabled={marking || !currentLesson}
                    style={{
                      display: "flex", alignItems: "center", gap: "6px",
                      padding: "8px 16px", borderRadius: "12px",
                      backgroundColor: "#7c3aed",
                      color: "white", border: "none",
                      cursor: marking ? "not-allowed" : "pointer",
                      fontSize: "13px", fontWeight: "500",
                      opacity: marking ? 0.7 : 1,
                    }}
                  >
                    {marking ? "Saving..." : "Mark as Complete"}
                  </button>
                )}

                {/* Download cert */}
                {showCertBanner && (
                  <button
                    onClick={downloadCert}
                    disabled={downloading}
                    title="Download Certificate"
                    style={{
                      width: "38px", height: "38px", borderRadius: "8px",
                      backgroundColor: "#d97706", border: "none",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", color: "white",
                    }}
                  >
                    <Download size={15} />
                  </button>
                )}
              </div>
            </div>

            {currentLesson?.description && (
              <p className="px-4 pb-3 text-xs text-slate-500 leading-relaxed">{currentLesson.description}</p>
            )}

            {/* Quiz */}
            {quiz && (
              <div className="border-t border-slate-800 px-4 py-4 overflow-y-auto max-h-60">
                <h3 className="font-semibold text-white mb-3 text-sm">📝 {quiz.title}</h3>
                {quizResult ? (
                  <div className={`p-3 rounded-xl ${quizResult.passed ? "bg-emerald-900/30 border border-emerald-700" : "bg-red-900/30 border border-red-700"}`}>
                    <div className="font-bold text-sm mb-2">{quizResult.passed ? "✅ Passed!" : "❌ Failed"} — {quizResult.score}%</div>
                    {quizResult.result?.map((r, i) => (
                      <div key={i} className="text-xs mb-1">
                        <span className={r.isCorrect ? "text-emerald-400" : "text-red-400"}>{r.isCorrect ? "✓" : "✗"}</span> {r.question}
                        {!r.isCorrect && r.explanation && <div className="text-slate-400 ml-3">💡 {r.explanation}</div>}
                      </div>
                    ))}
                    <button onClick={() => { setQuizResult(null); setQuizAnswers(new Array(quiz.questions.length).fill(null)); }} className="mt-2 text-xs px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300">Retry</button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {quiz.questions.map((q, qi) => (
                      <div key={q._id}>
                        <p className="text-xs font-medium text-slate-200 mb-1.5">{qi + 1}. {q.question}</p>
                        <div className="grid grid-cols-2 gap-1.5">
                          {q.options.map((opt, oi) => (
                            <button key={oi} onClick={() => { const a = [...quizAnswers]; a[qi] = oi; setQuizAnswers(a); }}
                              className={`text-left px-3 py-2 rounded-lg text-xs ${quizAnswers[qi] === oi ? "bg-primary-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}>
                              {String.fromCharCode(65 + oi)}. {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                    <button onClick={submitQuiz} className="text-xs px-4 py-2 rounded-lg bg-primary-600 text-white font-medium">Submit Quiz</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
