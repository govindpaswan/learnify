import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, Trash2, Edit, Save, X, ArrowLeft, Upload, Play, HelpCircle, Video, Eye } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../utils/api";

export default function AdminLessons() {
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse]     = useState(null);
  const [lessons, setLessons]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editLesson, setEdit]   = useState(null);
  const [saving, setSaving]     = useState(false);
  const [form, setForm] = useState({ title: "", description: "", order: 1, isPreview: false });
  const [video, setVideo]   = useState(null);
  const [progress, setProgress] = useState(0);
  const fileRef = useRef();

  const fetchAll = async () => {
    try {
      const [c, l] = await Promise.all([
        api.get(`/courses/${courseId}`),
        api.get(`/lessons/course/${courseId}`),
      ]);
      setCourse(c.data.data);
      setLessons(l.data.data);
    } catch { toast.error("Failed to load"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const resetForm = () => {
    setForm({ title: "", description: "", order: lessons.length + 1, isPreview: false });
    setVideo(null); setEdit(null); setShowForm(false); setProgress(0);
    if (fileRef.current) fileRef.current.value = "";
  };

  const openEdit = (lesson) => {
    setEdit(lesson);
    setForm({ title: lesson.title, description: lesson.description || "", order: lesson.order, isPreview: lesson.isPreview });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error("Title required");
    try {
      setSaving(true);
      setProgress(0);
      const fd = new FormData();
      fd.append("course", courseId);
      fd.append("title", form.title);
      fd.append("description", form.description);
      fd.append("order", form.order);
      fd.append("isPreview", form.isPreview);
      if (video) fd.append("video", video);

      const config = {
        onUploadProgress: (e) => setProgress(Math.round((e.loaded * 100) / e.total)),
        headers: { "Content-Type": "multipart/form-data" },
      };

      if (editLesson) await api.put(`/lessons/${editLesson._id}`, fd, config);
      else            await api.post("/lessons", fd, config);

      toast.success(editLesson ? "Lesson updated successfully!" : "Lesson added successfully!");
      fetchAll();
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally { setSaving(false); setProgress(0); }
  };

  const deleteLesson = async (id) => {
    if (!confirm("Are you sure you want to delete this lesson?")) return;
    try { await api.delete(`/lessons/${id}`); toast.success("Deleted"); fetchAll(); }
    catch { toast.error("Delete failed"); }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 rounded-full border-2 border-primary-200 border-t-primary-600 animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><ArrowLeft size={18} className="text-slate-600 dark:text-slate-400" /></button>
        <div className="flex-1">
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Manage Lessons</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{course?.title}</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary text-sm shrink-0">
          <Plus size={16} /> Add Lesson
        </button>
      </div>

      {/* Lesson Form */}
      {showForm && (
        <div className="card p-6 mb-6 border-2 border-primary-200 dark:border-primary-800/50 animate-slide-up">
          <h2 className="font-display font-semibold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
            {editLesson ? <><Edit size={18} className="text-primary-500" /> Edit Lesson</> : <><Plus size={18} className="text-primary-500" /> New Lesson</>}
          </h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="label">Lesson Title *</label>
                <input className="input" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Introduction to React Hooks" />
              </div>
              <div>
                <label className="label">Order Number</label>
                <input type="number" min="1" className="input" value={form.order} onChange={e => setForm({...form, order: e.target.value})} />
              </div>
            </div>

            <div>
              <label className="label">Description</label>
              <textarea className="input resize-none" rows={2} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Brief description of this lesson..." />
            </div>

            {/* Video Upload */}
            <div>
              <label className="label">Video File (MP4, MOV, AVI — max 500MB)</label>
              <div
                onClick={() => fileRef.current.click()}
                className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 dark:hover:bg-primary-900/10 transition-all"
              >
                {video ? (
                  <div className="flex items-center justify-center gap-3">
                    <Video size={24} className="text-primary-500" />
                    <div className="text-left">
                      <div className="font-medium text-slate-900 dark:text-white text-sm">{video.name}</div>
                      <div className="text-xs text-slate-500">{(video.size / 1024 / 1024).toFixed(1)} MB</div>
                    </div>
                    <button type="button" onClick={(e) => { e.stopPropagation(); setVideo(null); if(fileRef.current) fileRef.current.value = ""; }} className="ml-2 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500">
                      <X size={16} />
                    </button>
                  </div>
                ) : editLesson?.videoUrl ? (
                  <div>
                    <Play size={28} className="text-primary-400 mx-auto mb-1" />
                    <div className="text-sm text-slate-700 dark:text-slate-300 font-medium">Video uploaded ✅</div>
                    <div className="text-xs text-slate-400 mt-1">Choose a new file to replace the current video</div>
                  </div>
                ) : (
                  <div>
                    <Upload size={28} className="text-slate-400 mx-auto mb-2" />
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300">Click to upload video</div>
                    <div className="text-xs text-slate-400 mt-1">MP4, MOV, AVI, MKV formats supported</div>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="video/*" className="hidden" onChange={e => { if(e.target.files[0]) setVideo(e.target.files[0]); }} />

              {/* Upload Progress */}
              {saving && progress > 0 && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Uploading video...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary-500 to-violet-500 rounded-full transition-all duration-300" style={{width:`${progress}%`}} />
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-surface-900 rounded-xl">
              <input type="checkbox" id="isPreview" checked={form.isPreview} onChange={e => setForm({...form, isPreview: e.target.checked})} className="w-4 h-4 rounded accent-primary-600" />
              <label htmlFor="isPreview" className="text-sm text-slate-700 dark:text-slate-300">
                <span className="font-medium">Free Preview</span> — Non-enrolled students bhi ye lesson dekh sakte hain
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving} className="btn-primary text-sm">
                <Save size={14} /> {saving ? (progress > 0 ? `Uploading ${progress}%...` : "Saving...") : editLesson ? "Update Lesson" : "Add Lesson"}
              </button>
              <button type="button" onClick={resetForm} className="btn-secondary text-sm"><X size={14} /> Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Lessons List */}
      {lessons.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-5xl mb-4">🎬</div>
          <h3 className="font-display font-semibold text-slate-700 dark:text-slate-300 mb-2">No lessons yet</h3>
          <p className="text-slate-500 mb-5">Add your first lesson to this course</p>
          <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary text-sm"><Plus size={16} /> Add First Lesson</button>
        </div>
      ) : (
        <div className="space-y-3">
          {[...lessons].sort((a, b) => a.order - b.order).map((lesson) => (
            <div key={lesson._id} className="card p-4 flex items-center gap-4 hover:shadow-md transition-shadow group">
              <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center shrink-0 font-display font-bold text-primary-600 dark:text-primary-400 text-sm">
                {lesson.order}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-slate-900 dark:text-white truncate">{lesson.title}</span>
                  {lesson.isPreview && <span className="badge bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs shrink-0">Free Preview</span>}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-3">
                  {lesson.videoUrl
                    ? <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400"><Play size={10} /> Video ready</span>
                    : <span className="text-amber-500">⚠ No video</span>}
                  {lesson.description && <span className="truncate max-w-[200px]">{lesson.description}</span>}
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                {lesson.videoUrl && (
                  <a href={lesson.videoUrl} target="_blank" rel="noreferrer" title="Preview video" className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-emerald-600">
                    <Eye size={15} />
                  </a>
                )}
                <button onClick={() => navigate(`/admin/courses/${courseId}/lessons/${lesson._id}/quiz`)} title="Add Quiz" className="p-1.5 rounded-lg hover:bg-violet-50 dark:hover:bg-violet-900/20 text-slate-400 hover:text-violet-600">
                  <HelpCircle size={15} />
                </button>
                <button onClick={() => openEdit(lesson)} className="p-1.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 text-slate-400 hover:text-primary-600">
                  <Edit size={15} />
                </button>
                <button onClick={() => deleteLesson(lesson._id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-600">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 text-sm text-blue-700 dark:text-blue-400">
        💡 <strong>Tip:</strong> After configuring Cloudinary, videos will be saved to cloud storage. Currently saving to local server.
      </div>
    </div>
  );
}
