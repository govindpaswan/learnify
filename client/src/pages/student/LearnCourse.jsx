import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { CheckCircle, Circle, ChevronLeft, ChevronRight, Menu, X, Award, Play } from "lucide-react";
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

  useEffect(() => {
    const load = async () => {
      try {
        const [enRes, lesRes] = await Promise.all([
          api.get(`/enrollments/${courseId}`),
          api.get(`/lessons/course/${courseId}`),
        ]);
        const en = enRes.data.data;
        const ls = lesRes.data.data;
        setEnrollment(en);
        setLessons(ls);
        if (ls.length > 0) {
          const lastAccessed = en.lastAccessedLesson;
          const idx = lastAccessed ? ls.findIndex(l => l._id === lastAccessed) : 0;
          setCurrentLesson(ls[Math.max(0, idx)]);
        }
      } catch (err) {
        if (err.response?.status === 404) { toast.error("Not enrolled in this course"); navigate("/courses"); }
      } finally { setLoading(false); }
    };
    load();
  }, [courseId]);

  useEffect(() => {
    if (!currentLesson) return;
    setQuiz(null); setQuizResult(null); setQuizAnswers([]);
    api.get(`/quizzes/lesson/${currentLesson._id}`).then(r => {
      if (r.data.data) { setQuiz(r.data.data); setQuizAnswers(new Array(r.data.data.questions.length).fill(null)); }
    }).catch(() => {});
  }, [currentLesson]);

  const isCompleted = (lessonId) => enrollment?.completedLessons?.includes(lessonId);

  // ✅ FIX: Mark complete + auto go to next lesson
  const markComplete = async () => {
    if (!currentLesson || marking || isCompleted(currentLesson._id)) return;
    try {
      setMarking(true);
      const { data } = await api.post(`/enrollments/${courseId}/complete-lesson/${currentLesson._id}`);
      setEnrollment(data.data);

      if (data.data.isCompleted) {
        toast.success("🏆 Course completed! Your certificate has been issued!");
        return;
      }

      toast.success("Lesson complete! ✅ Next lesson loading...");

      // Auto go to next lesson
      const currentIdx = lessons.findIndex(l => l._id === currentLesson._id);
      if (currentIdx < lessons.length - 1) {
        setTimeout(() => {
          setCurrentLesson(lessons[currentIdx + 1]);
        }, 800);
      }
    } catch { toast.error("Failed to mark lesson as complete"); }
    finally { setMarking(false); }
  };

  const submitQuiz = async () => {
    if (quizAnswers.some(a => a === null)) return toast.error("Please answer all questions before submitting");
    try {
      const { data } = await api.post(`/quizzes/${quiz._id}/attempt`, { answers: quizAnswers, timeTaken: 0 });
      setQuizResult(data.data);
      if (data.data.passed) toast.success(`Quiz passed! Score: ${data.data.score}%`);
      else toast.error(`Quiz failed. Score: ${data.data.score}%. Try again!`);
    } catch { toast.error("Failed to submit quiz"); }
  };

  const gotoLesson = (lesson) => { setCurrentLesson(lesson); setSidebarOpen(false); };

  const nextLesson = () => {
    const idx = lessons.findIndex(l => l._id === currentLesson?._id);
    if (idx < lessons.length - 1) setCurrentLesson(lessons[idx + 1]);
  };

  const prevLesson = () => {
    const idx = lessons.findIndex(l => l._id === currentLesson?._id);
    if (idx > 0) setCurrentLesson(lessons[idx - 1]);
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="w-10 h-10 rounded-full border-2 border-primary-200 border-t-primary-600 animate-spin" /></div>;

  const course = enrollment?.course;
  const currentIdx = lessons.findIndex(l => l._id === currentLesson?._id);
  const isLastLesson = currentIdx === lessons.length - 1;
  const isFirstLesson = currentIdx === 0;

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-white overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center gap-3 px-4 py-3 bg-slate-900 border-b border-slate-800 shrink-0">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors">
          <Menu size={18} />
        </button>
        <Link to="/dashboard/my-courses" className="flex items-center gap-1 text-slate-400 hover:text-white text-sm">
          <ChevronLeft size={16} />Back
        </Link>
        <div className="flex-1 text-center">
          <span className="text-sm font-medium text-slate-200 truncate">{course?.title}</span>
        </div>
        <div className="text-xs text-slate-400">{enrollment?.progress || 0}% complete</div>
        {enrollment?.certificate && (
          <Link to="/dashboard/certificates" className="flex items-center gap-1 text-amber-400 hover:text-amber-300 text-xs">
            <Award size={14} /> Certificate
          </Link>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? "w-72 lg:w-80" : "w-0"} transition-all duration-300 bg-slate-900 border-r border-slate-800 overflow-hidden shrink-0 flex flex-col`}>
          <div className="p-4 border-b border-slate-800">
            <div className="progress-bar"><div className="progress-fill" style={{width:`${enrollment?.progress||0}%`}} /></div>
            <div className="text-xs text-slate-400 mt-1.5">{enrollment?.completedLessons?.length || 0}/{lessons.length} lessons completed</div>
          </div>
          <div className="flex-1 overflow-y-auto py-2">
            {lessons.map((lesson, i) => (
              <button
                key={lesson._id}
                onClick={() => gotoLesson(lesson)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-800 transition-colors ${currentLesson?._id === lesson._id ? "bg-slate-800 border-l-2 border-primary-500" : ""}`}
              >
                <div className="shrink-0">
                  {isCompleted(lesson._id)
                    ? <CheckCircle size={18} className="text-emerald-400" />
                    : <Circle size={18} className={currentLesson?._id === lesson._id ? "text-primary-400" : "text-slate-600"} />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm truncate ${currentLesson?._id === lesson._id ? "text-white font-medium" : "text-slate-400"}`}>
                    {i + 1}. {lesson.title}
                  </div>
                  {lesson.videoDuration > 0 && <div className="text-xs text-slate-600">{Math.floor(lesson.videoDuration/60)}m</div>}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Video */}
          <div className="bg-black flex-1 flex items-center justify-center overflow-hidden">
            {currentLesson?.videoUrl ? (
              <div className="w-full h-full max-h-[calc(100vh-200px)]">
                <ReactPlayer
                  url={currentLesson.videoUrl}
                  width="100%"
                  height="100%"
                  controls
                  playing={false}
                  config={{file:{attributes:{controlsList:"nodownload"}}}}
                />
              </div>
            ) : (
              <div className="text-center text-slate-500 p-8">
                <Play size={48} className="mx-auto mb-4 opacity-30" />
                <p>No video available for this lesson</p>
              </div>
            )}
          </div>

          {/* Bottom Controls */}
          <div className="bg-slate-900 border-t border-slate-800 p-4 shrink-0 overflow-y-auto max-h-[45vh]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1 min-w-0 mr-4">
                <h2 className="font-display font-semibold text-white truncate">{currentLesson?.title}</h2>
                <p className="text-xs text-slate-400 mt-0.5">{currentLesson?.description}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {/* Prev */}
                <button
                  onClick={prevLesson}
                  disabled={isFirstLesson}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 transition-colors"
                  title="Previous lesson"
                >
                  <ChevronLeft size={16} />
                </button>

                {/* Next */}
                <button
                  onClick={nextLesson}
                  disabled={isLastLesson}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 transition-colors"
                  title="Next lesson"
                >
                  <ChevronRight size={16} />
                </button>

                {/* Mark Complete / Completed */}
                {isCompleted(currentLesson?._id) ? (
                  <button
                    onClick={nextLesson}
                    disabled={isLastLesson}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition-all disabled:opacity-50 disabled:cursor-default"
                  >
                    <CheckCircle size={14} />
                    {isLastLesson ? "Completed ✓" : "Next Lesson →"}
                  </button>
                ) : (
                  <button
                    onClick={markComplete}
                    disabled={marking}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white transition-all disabled:opacity-60"
                  >
                    {marking ? "Saving..." : "Mark as Complete"}
                  </button>
                )}
              </div>
            </div>

            {/* Lesson number indicator */}
            <div className="text-xs text-slate-500 mb-3">
              Lesson {currentIdx + 1} of {lessons.length}
            </div>

            {/* Quiz */}
            {quiz && (
              <div className="mt-4 border-t border-slate-800 pt-4">
                <h3 className="font-semibold text-white mb-4">Quiz: {quiz.title}</h3>
                {quizResult ? (
                  <div className={`p-4 rounded-xl mb-4 ${quizResult.passed ? "bg-emerald-900/30 border border-emerald-700" : "bg-red-900/30 border border-red-700"}`}>
                    <div className="font-bold text-lg mb-2">{quizResult.passed ? "✅ Passed!" : "❌ Failed"} — Score: {quizResult.score}%</div>
                    <div className="space-y-2">
                      {quizResult.result.map((r, i) => (
                        <div key={i} className="text-sm">
                          <span className={r.isCorrect ? "text-emerald-400" : "text-red-400"}>{r.isCorrect ? "✓" : "✗"}</span> {r.question}
                          {!r.isCorrect && r.explanation && <div className="text-slate-400 text-xs ml-4">💡 {r.explanation}</div>}
                        </div>
                      ))}
                    </div>
                    <button onClick={() => { setQuizResult(null); setQuizAnswers(new Array(quiz.questions.length).fill(null)); }} className="btn-secondary text-sm mt-3">
                      Retry Quiz
                    </button>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {quiz.questions.map((q, qi) => (
                      <div key={q._id}>
                        <div className="text-sm font-medium text-slate-200 mb-2">{qi + 1}. {q.question}</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {q.options.map((opt, oi) => (
                            <button
                              key={oi}
                              onClick={() => { const a = [...quizAnswers]; a[qi] = oi; setQuizAnswers(a); }}
                              className={`text-left px-4 py-2.5 rounded-lg text-sm transition-colors ${quizAnswers[qi] === oi ? "bg-primary-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}
                            >
                              {String.fromCharCode(65 + oi)}. {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                    <button onClick={submitQuiz} className="btn-primary text-sm">Submit Quiz</button>
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
