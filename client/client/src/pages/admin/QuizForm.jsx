import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, Trash2, Save, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../utils/api";

const emptyQ = { question: "", options: ["", "", "", ""], correctOption: 0, explanation: "" };

export default function AdminQuizForm() {
  const { id: courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [form, setForm] = useState({ title: "Lesson Quiz", passingScore: 70, timeLimit: 0, questions: [{ ...emptyQ, options: ["","","",""] }] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get(`/quizzes/lesson/${lessonId}`).then(r => {
      if (r.data.data) { setQuiz(r.data.data); setForm({ ...r.data.data }); }
    }).catch(() => {}).finally(() => setLoading(false));
  }, [lessonId]);

  const setQ = (qi, field, val) => setForm(f => { const qs = [...f.questions]; qs[qi] = { ...qs[qi], [field]: val }; return { ...f, questions: qs }; });
  const setOpt = (qi, oi, val) => setForm(f => { const qs = [...f.questions]; qs[qi] = { ...qs[qi], options: qs[qi].options.map((o, i) => i === oi ? val : o) }; return { ...f, questions: qs }; });
  const addQ = () => setForm(f => ({ ...f, questions: [...f.questions, { ...emptyQ, options: ["","","",""] }] }));
  const removeQ = (i) => setForm(f => ({ ...f, questions: f.questions.filter((_, j) => j !== i) }));

  const handleSave = async (e) => {
    e.preventDefault();
    for (const q of form.questions) {
      if (!q.question.trim()) return toast.error("All questions must have text");
      if (q.options.some(o => !o.trim())) return toast.error("All answer options must be filled in");
    }
    try {
      setSaving(true);
      const payload = { ...form, lesson: lessonId, course: courseId };
      if (quiz) await api.put(`/quizzes/${quiz._id}`, payload);
      else await api.post("/quizzes", payload);
      toast.success("Quiz saved!");
      navigate(-1);
    } catch { toast.error("Save failed"); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="text-center py-12 text-slate-500">Loading...</div>;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><ArrowLeft size={18} className="text-slate-600 dark:text-slate-400" /></button>
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">{quiz ? "Edit Quiz" : "Create Quiz"}</h1>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        <div className="card p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1"><label className="label">Quiz Title</label><input className="input" value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div>
            <div><label className="label">Passing Score (%)</label><input type="number" className="input" value={form.passingScore} onChange={e => setForm({...form, passingScore: e.target.value})} /></div>
            <div><label className="label">Time Limit (min, 0=∞)</label><input type="number" className="input" value={form.timeLimit} onChange={e => setForm({...form, timeLimit: e.target.value})} /></div>
          </div>
        </div>

        {form.questions.map((q, qi) => (
          <div key={qi} className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="font-display font-semibold text-slate-900 dark:text-white">Question {qi + 1}</span>
              {form.questions.length > 1 && <button type="button" onClick={() => removeQ(qi)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 size={15} /></button>}
            </div>
            <div className="space-y-3">
              <div><label className="label">Question Text</label><input className="input" value={q.question} onChange={e => setQ(qi, "question", e.target.value)} placeholder="Type your question here..." /></div>
              <div>
                <label className="label">Options (select correct one)</label>
                <div className="space-y-2">
                  {q.options.map((opt, oi) => (
                    <div key={oi} className="flex items-center gap-2">
                      <input type="radio" name={`correct-${qi}`} checked={q.correctOption === oi} onChange={() => setQ(qi, "correctOption", oi)} className="w-4 h-4 accent-primary-600 shrink-0" />
                      <input className="input flex-1" placeholder={`Option ${String.fromCharCode(65+oi)}`} value={opt} onChange={e => setOpt(qi, oi, e.target.value)} />
                    </div>
                  ))}
                </div>
              </div>
              <div><label className="label">Explanation (shown after answering)</label><input className="input" value={q.explanation} onChange={e => setQ(qi, "explanation", e.target.value)} placeholder="Explanation for the correct answer..." /></div>
            </div>
          </div>
        ))}

        <button type="button" onClick={addQ} className="btn-secondary w-full justify-center"><Plus size={16} />Add Question</button>

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="btn-primary"><Save size={16} />{saving ? "Saving..." : "Save Quiz"}</button>
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
}
