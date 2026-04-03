import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { CheckCircle, Circle, ChevronLeft, ChevronRight, Menu, Award, Play, Download } from "lucide-react";
import ReactPlayer from "react-player";
import toast from "react-hot-toast";
import api from "../../utils/api";

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
        // Fetch enrollment + lessons separately so lessons always load
        const [enRes, lesRes] = await Promise.all([
          api.get(`/enrollments/${courseId}`),
          api.get(`/lessons/course/${courseId}`),
        ]);
        const en = enRes.data.data;
        const ls = lesRes.data.data || [];

        setEnrollment(en);
        setLessons(ls);

        if (ls.length > 0) {
          const lastAccessedId = en.lastAccessedLesson;
          const idx = lastAccessedId ? ls.findIndex(l => l._id === lastAccessedId) : 0;
          setCurrentLesson(ls[Math.max(0, idx)]);
        }

        // Show cert banner if already completed
        if (en.isCompleted && en.certificate) {
          setShowCertBanner(true);
        }
      } catch (err) {
        if (err.response?.status === 404) {
          toast.error("Not enrolled in this course");
          navigate("/courses");
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [courseId]);

  useEffect(() => {
    if (!currentLesson) return;
    setQuiz(null); setQuizResult(null); setQuizAnswers([]);
    api.get(`/quizzes/lesson/${currentLesson._id}`)
      .then(r => {
        if (r.data.data) {
          setQuiz(r.data.data);
          setQuizAnswers(new Array(r.data.data.questions.length).fill(null));
        }
      })
      .catch(() => {});
  }, [currentLesson]);

  const isCompleted = (lessonId) => enrollment?.completedLessons?.includes(lessonId);

  const currentIdx = lessons.findIndex(l => l._id === currentLesson?._id);
  const isFirstLesson = currentIdx === 0;
  const isLastLesson = currentIdx === lessons.length - 1;

  const goToLesson = (lesson) => {
    setCurrentLesson(lesson);
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const nextLesson = () => {
    if (currentIdx < lessons.length - 1) setCurrentLesson(lessons[currentIdx + 1]);
  };

  const prevLesson = () => {
    if (currentIdx > 0) setCurrentLesson(lessons[currentIdx - 1]);
  };

  // Mark lesson complete + auto-advance to next
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

      toast.success("✅ Lesson complete!");

      // Auto go to next lesson after short delay
      if (currentIdx < lessons.length - 1) {
        setTimeout(() => setCurrentLesson(lessons[currentIdx + 1]), 600);
      }
    } catch {
      toast.error("Failed to mark lesson as complete");
    } finally {
      setMarking(false);
    }
  };

  // Download certificate PDF
  const downloadCert = async () => {
    if (!enrollment?.certificate) return;
    try {
      setDownloading(true);
      // Get certificate ID — certificate could be object or string
      const certId = enrollment.certificate?.certificateId || enrollment.certificate;
      if (!certId) {
        // Fetch from certificates API
        const r = await api.get("/certificates/my");
        const cert = r.data.data.find(c => c.course?._id === courseId || c.course === courseId);
        if (!cert) { toast.error("Certificate not found"); return; }
        const res = await api.get(`/certificates/download/${cert.certificateId}`, { responseType: "blob" });
        triggerDownload(res.data, cert.certificateId);
      } else {
        const res = await api.get(`/certificates/download/${certId}`, { responseType: "blob" });
        triggerDownload(res.data, certId);
      }
      toast.success("Certificate downloaded!");
    } catch {
      toast.error("Download failed. Try from My Certificates page.");
    } finally {
      setDownloading(false);
    }
  };

  const triggerDownload = (blob, certId) => {
    const url = URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `learnify-certificate-${certId}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const submitQuiz = async () => {
    if (quizAnswers.some(a => a === null)) return toast.error("Please answer all questions");
    try {
      const { data } = await api.post(`/quizzes/${quiz._id}/attempt`, { answers: quizAnswers, timeTaken: 0 });
      setQuizResult(data.data);
      if (data.data.passed) toast.success(`Quiz passed! Score: ${data.data.score}%`);
      else toast.error(`Quiz failed. Score: ${data.data.score}%. Try again!`);
    } catch { toast.error("Failed to submit quiz"); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="w-10 h-10 rounded-full border-2 border-primary-200 border-t-primary-600 animate-spin" />
      </div>
    );
  }

  const course = enrollment?.course;
  const completedCount = enrollment?.completedLessons?.length || 0;
  const progress = enrollment?.progress || 0;

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-white overflow-hidden">

      {/* ── Top Bar ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-3 bg-slate-900 border-b border-slate-800 shrink-0">
        <button
          onClick={() => setSidebarOpen(v => !v)}
          className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          title="Toggle sidebar"
        >
          <Menu size={18} />
        </button>

        <Link
          to="/dashboard/my-courses"
          className="flex items-center gap-1 text-slate-400 hover:text-white text-sm transition-colors"
        >
          <ChevronLeft size={16} /> Back
        </Link>

        <div className="flex-1 text-center">
          <span className="text-sm font-medium text-slate-200 truncate">{course?.title || "Loading..."}</span>
        </div>

        <span className="text-xs text-slate-400 shrink-0">{progress}% complete</span>

        {(enrollment?.isCompleted || showCertBanner) && (
          <Link
            to="/dashboard/certificates"
            className="flex items-center gap-1 text-amber-400 hover:text-amber-300 text-xs shrink-0 transition-colors"
          >
            <Award size={14} /> Certificate
          </Link>
        )}
      </div>

      {/* ── Certificate Banner ──────────────────────────────────── */}
      {showCertBanner && (
        <div className="bg-gradient-to-r from-amber-600 to-orange-500 px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Award size={20} className="text-white" />
            <span className="text-white font-medium text-sm">🎉 Course Complete! Your certificate is ready.</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={downloadCert}
              disabled={downloading}
              className="flex items-center gap-1.5 bg-white text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-amber-50 transition-colors"
            >
              <Download size={13} />
              {downloading ? "Downloading..." : "Download PDF"}
            </button>
            <Link
              to="/dashboard/certificates"
              className="text-white/80 hover:text-white text-xs underline"
            >
              View All
            </Link>
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">

        {/* ── Sidebar ─────────────────────────────────────────────── */}
        <aside
          className={`${sidebarOpen ? "w-72 lg:w-80" : "w-0"} transition-all duration-300 bg-slate-900 border-r border-slate-800 overflow-hidden shrink-0 flex flex-col`}
        >
          {/* Progress */}
          <div className="p-4 border-b border-slate-800 shrink-0">
            <div className="w-full bg-slate-800 rounded-full h-2 mb-2">
              <div
                className="h-2 rounded-full bg-primary-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-xs text-slate-400">
              {completedCount} / {lessons.length} lessons completed
            </div>
          </div>

          {/* Lessons list */}
          <div className="flex-1 overflow-y-auto py-2">
            {lessons.length === 0 ? (
              <div className="text-center text-slate-500 text-sm py-8 px-4">
                No lessons available
              </div>
            ) : (
              lessons.map((lesson, i) => {
                const done = isCompleted(lesson._id);
                const active = currentLesson?._id === lesson._id;
                return (
                  <button
                    key={lesson._id}
                    onClick={() => goToLesson(lesson)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-800
                      ${active ? "bg-slate-800 border-l-2 border-primary-500" : "border-l-2 border-transparent"}`}
                  >
                    <div className="shrink-0 mt-0.5">
                      {done
                        ? <CheckCircle size={17} className="text-emerald-400" />
                        : <Circle size={17} className={active ? "text-primary-400" : "text-slate-600"} />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-snug truncate ${active ? "text-white font-medium" : done ? "text-slate-300" : "text-slate-400"}`}>
                        {i + 1}. {lesson.title}
                      </p>
                      {lesson.videoDuration > 0 && (
                        <p className="text-xs text-slate-600 mt-0.5">
                          {Math.floor(lesson.videoDuration / 60)}m {lesson.videoDuration % 60}s
                        </p>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* ── Main Content ─────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Video area */}
          <div className="bg-black flex-1 flex items-center justify-center overflow-hidden min-h-0">
            {currentLesson?.videoUrl ? (
              <div className="w-full h-full">
                <ReactPlayer
                  url={currentLesson.videoUrl}
                  width="100%"
                  height="100%"
                  controls
                  playing={false}
                  config={{ file: { attributes: { controlsList: "nodownload" } } }}
                />
              </div>
            ) : (
              <div className="text-center text-slate-500 p-8">
                <Play size={52} className="mx-auto mb-4 opacity-20" />
                <p className="text-sm">No video available for this lesson</p>
                <p className="text-xs text-slate-600 mt-1">Add a video URL from Admin panel</p>
              </div>
            )}
          </div>

          {/* ── Bottom Controls ──────────────────────────────────── */}
          <div className="bg-slate-900 border-t border-slate-800 shrink-0">
            <div className="px-4 py-3 flex items-center justify-between gap-3">

              {/* Lesson info */}
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-white text-sm truncate">{currentLesson?.title}</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Lesson {currentIdx + 1} of {lessons.length}
                </p>
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center gap-2 shrink-0">

                {/* ← Prev */}
                <button
                  onClick={prevLesson}
                  disabled={isFirstLesson}
                  title="Previous lesson"
                  className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  <ChevronLeft size={18} className="text-white" />
                </button>

                {/* → Next */}
                <button
                  onClick={nextLesson}
                  disabled={isLastLesson}
                  title="Next lesson"
                  className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  <ChevronRight size={18} className="text-white" />
                </button>

                {/* Mark Complete / Next / Completed */}
                {isCompleted(currentLesson?._id) ? (
                  <button
                    onClick={isLastLesson ? undefined : nextLesson}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all
                      ${isLastLesson
                        ? "bg-emerald-800/50 text-emerald-400 cursor-default"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                      }`}
                  >
                    <CheckCircle size={14} />
                    {isLastLesson ? "All Done ✓" : "Next Lesson →"}
                  </button>
                ) : (
                  <button
                    onClick={markComplete}
                    disabled={marking}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {marking ? (
                      <>
                        <div className="w-3 h-3 rounded-full border border-white/30 border-t-white animate-spin" />
                        Saving...
                      </>
                    ) : "Mark as Complete"}
                  </button>
                )}

                {/* Download cert button if completed */}
                {(enrollment?.isCompleted || showCertBanner) && (
                  <button
                    onClick={downloadCert}
                    disabled={downloading}
                    title="Download Certificate"
                    className="w-9 h-9 rounded-lg bg-amber-600 hover:bg-amber-700 disabled:opacity-50 transition-colors flex items-center justify-center"
                  >
                    <Download size={15} className="text-white" />
                  </button>
                )}
              </div>
            </div>

            {/* Lesson description */}
            {currentLesson?.description && (
              <div className="px-4 pb-3">
                <p className="text-xs text-slate-500 leading-relaxed">{currentLesson.description}</p>
              </div>
            )}

            {/* ── Quiz ──────────────────────────────────────────── */}
            {quiz && (
              <div className="border-t border-slate-800 px-4 py-4 overflow-y-auto max-h-64">
                <h3 className="font-semibold text-white mb-3 text-sm">📝 Quiz: {quiz.title}</h3>
                {quizResult ? (
                  <div className={`p-3 rounded-xl ${quizResult.passed ? "bg-emerald-900/30 border border-emerald-700" : "bg-red-900/30 border border-red-700"}`}>
                    <div className="font-bold text-sm mb-2">
                      {quizResult.passed ? "✅ Passed!" : "❌ Failed"} — Score: {quizResult.score}%
                    </div>
                    <div className="space-y-1.5">
                      {quizResult.result?.map((r, i) => (
                        <div key={i} className="text-xs">
                          <span className={r.isCorrect ? "text-emerald-400" : "text-red-400"}>{r.isCorrect ? "✓" : "✗"}</span>
                          {" "}{r.question}
                          {!r.isCorrect && r.explanation && (
                            <div className="text-slate-400 ml-3 mt-0.5">💡 {r.explanation}</div>
                          )}
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => { setQuizResult(null); setQuizAnswers(new Array(quiz.questions.length).fill(null)); }}
                      className="mt-3 text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    >
                      Retry Quiz
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {quiz.questions.map((q, qi) => (
                      <div key={q._id}>
                        <p className="text-xs font-medium text-slate-200 mb-2">{qi + 1}. {q.question}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {q.options.map((opt, oi) => (
                            <button
                              key={oi}
                              onClick={() => { const a = [...quizAnswers]; a[qi] = oi; setQuizAnswers(a); }}
                              className={`text-left px-3 py-2 rounded-lg text-xs transition-colors
                                ${quizAnswers[qi] === oi
                                  ? "bg-primary-600 text-white"
                                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}
                            >
                              {String.fromCharCode(65 + oi)}. {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                    <button onClick={submitQuiz} className="text-xs px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium transition-colors">
                      Submit Quiz
                    </button>
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
