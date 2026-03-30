import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Save, X, Plus, Trash2, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../utils/api";

const CATEGORIES = ["Web Development", "Mobile Development", "Data Science", "Machine Learning", "Design", "Marketing", "Business", "Photography", "Music", "Finance", "Other"];
const LEVELS = ["Beginner", "Intermediate", "Advanced"];

export default function AdminCourseForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [thumbnail, setThumbnail] = useState(null);
  const [preview, setPreview] = useState("");
  const [form, setForm] = useState({
    title: "", description: "", shortDescription: "", instructor: "", instructorBio: "",
    category: "Web Development", level: "Beginner", language: "English",
    price: "", discountPrice: "", duration: "", isFree: false, isPublished: false, certificate: true,
    requirements: [""], whatYouLearn: [""], tags: [""],
  });

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/courses/${id}`).then(r => {
      const c = r.data.data;
      setForm({
        title: c.title || "", description: c.description || "", shortDescription: c.shortDescription || "",
        instructor: c.instructor || "", instructorBio: c.instructorBio || "",
        category: c.category || "Web Development", level: c.level || "Beginner",
        language: c.language || "English", price: c.price || "", discountPrice: c.discountPrice || "",
        duration: c.duration || "", isFree: c.isFree || false, isPublished: c.isPublished || false, certificate: c.certificate !== false,
        requirements: c.requirements?.length ? c.requirements : [""],
        whatYouLearn: c.whatYouLearn?.length ? c.whatYouLearn : [""],
        tags: c.tags?.length ? c.tags : [""],
      });
      if (c.thumbnail?.url) setPreview(c.thumbnail.url);
    }).catch(() => toast.error("Course not found")).finally(() => setFetching(false));
  }, [id]);

  const set = (k, v) => setForm(f => ({...f, [k]: v}));
  const setArr = (key, i, val) => setForm(f => { const arr = [...f[key]]; arr[i] = val; return {...f, [key]: arr}; });
  const addArr = (key) => setForm(f => ({...f, [key]: [...f[key], ""]}));
  const removeArr = (key, i) => setForm(f => ({...f, [key]: f[key].filter((_, j) => j !== i)}));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.instructor || !form.category) return toast.error("Fill required fields");
    try {
      setLoading(true);
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (Array.isArray(v)) fd.append(k, JSON.stringify(v.filter(Boolean)));
        else fd.append(k, v);
      });
      if (thumbnail) fd.append("thumbnail", thumbnail);

      if (isEdit) await api.put(`/courses/${id}`, fd);
      else await api.post("/courses", fd);

      toast.success(`Course ${isEdit ? "updated" : "created"}!`);
      navigate("/admin/courses");
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
    finally { setLoading(false); }
  };

  if (fetching) return <div className="text-center py-12 text-slate-500">Loading...</div>;

  const ArrayField = ({ label, field, placeholder }) => (
    <div>
      <label className="label">{label}</label>
      <div className="space-y-2">
        {form[field].map((val, i) => (
          <div key={i} className="flex gap-2">
            <input className="input flex-1" value={val} placeholder={placeholder} onChange={e => setArr(field, i, e.target.value)} />
            {form[field].length > 1 && <button type="button" onClick={() => removeArr(field, i)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><Trash2 size={15} /></button>}
          </div>
        ))}
        <button type="button" onClick={() => addArr(field)} className="flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400 hover:underline"><Plus size={14} />Add {label.split(" ")[0]}</button>
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><ArrowLeft size={18} className="text-slate-600 dark:text-slate-400" /></button>
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">{isEdit ? "Edit Course" : "New Course"}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Thumbnail */}
        <div className="card p-6">
          <h2 className="font-display font-semibold text-slate-900 dark:text-white mb-4">Course Thumbnail</h2>
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="w-full sm:w-48 aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
              {preview ? <img src={preview} alt="preview" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No thumbnail</div>}
            </div>
            <div>
              <label className="btn-secondary text-sm cursor-pointer">
                Choose Image
                <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files[0]; if(f){setThumbnail(f); setPreview(URL.createObjectURL(f));} }} />
              </label>
              <p className="text-xs text-slate-500 mt-2">Recommended: 800×450px, max 5MB</p>
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div className="card p-6">
          <h2 className="font-display font-semibold text-slate-900 dark:text-white mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div><label className="label">Title *</label><input className="input" value={form.title} onChange={e => set("title", e.target.value)} placeholder="Complete Web Development Bootcamp" /></div>
            <div><label className="label">Short Description</label><input className="input" value={form.shortDescription} onChange={e => set("shortDescription", e.target.value)} placeholder="One-line summary of the course..." /></div>
            <div><label className="label">Full Description *</label><textarea className="input resize-none" rows={5} value={form.description} onChange={e => set("description", e.target.value)} placeholder="Provide a detailed course description..." /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Category *</label>
                <select className="input" value={form.category} onChange={e => set("category", e.target.value)}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Level *</label>
                <select className="input" value={form.level} onChange={e => set("level", e.target.value)}>
                  {LEVELS.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div><label className="label">Instructor Name *</label><input className="input" value={form.instructor} onChange={e => set("instructor", e.target.value)} /></div>
              <div><label className="label">Duration (e.g. "12h 30m")</label><input className="input" value={form.duration} onChange={e => set("duration", e.target.value)} /></div>
            </div>
            <div><label className="label">Instructor Bio</label><textarea className="input resize-none" rows={2} value={form.instructorBio} onChange={e => set("instructorBio", e.target.value)} /></div>
          </div>
        </div>

        {/* Pricing */}
        <div className="card p-6">
          <h2 className="font-display font-semibold text-slate-900 dark:text-white mb-4">Pricing</h2>
          <div className="flex items-center gap-3 mb-4">
            <input type="checkbox" id="isFree" checked={form.isFree} onChange={e => set("isFree", e.target.checked)} className="w-4 h-4 rounded accent-primary-600" />
            <label htmlFor="isFree" className="text-sm font-medium text-slate-700 dark:text-slate-300">This is a free course</label>
          </div>
          {!form.isFree && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="label">Original Price (₹)</label><input type="number" className="input" value={form.price} onChange={e => set("price", e.target.value)} placeholder="999" /></div>
              <div><label className="label">Discount Price (₹) <span className="text-slate-400 font-normal">optional</span></label><input type="number" className="input" value={form.discountPrice} onChange={e => set("discountPrice", e.target.value)} placeholder="799" /></div>
            </div>
          )}
        </div>

        {/* Curriculum Content */}
        <div className="card p-6 space-y-5">
          <h2 className="font-display font-semibold text-slate-900 dark:text-white">Curriculum & Content</h2>
          <ArrayField label="What You'll Learn" field="whatYouLearn" placeholder="Students will be able to..." />
          <ArrayField label="Requirements" field="requirements" placeholder="Basic knowledge of..." />
          <ArrayField label="Tags" field="tags" placeholder="javascript, react..." />
        </div>

        {/* Settings */}
        <div className="card p-6">
          <h2 className="font-display font-semibold text-slate-900 dark:text-white mb-4">Settings</h2>
          <div className="space-y-3">
            {[["isPublished", "Publish course (visible to students)"], ["certificate", "Issue certificate on completion"]].map(([k, l]) => (
              <div key={k} className="flex items-center gap-3">
                <input type="checkbox" id={k} checked={form[k]} onChange={e => set(k, e.target.checked)} className="w-4 h-4 rounded accent-primary-600" />
                <label htmlFor={k} className="text-sm text-slate-700 dark:text-slate-300">{l}</label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="btn-primary"><Save size={16} />{loading ? "Saving..." : isEdit ? "Update Course" : "Create Course"}</button>
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary"><X size={16} />Cancel</button>
        </div>
      </form>
    </div>
  );
}
