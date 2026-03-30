import { useState, useRef } from "react";
import { Camera, Save, Lock, User, Eye, EyeOff, CheckCircle, Shield } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [form, setForm]    = useState({ name: user?.name || "", bio: user?.bio || "", phone: user?.phone || "" });
  const [pw, setPw]        = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [loading, setLoading]   = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [preview, setPreview]   = useState(null);
  const [file, setFile]         = useState(null);
  const [showPw, setShowPw]     = useState({ current: false, new: false, confirm: false });
  const fileRef = useRef();

  const handleProfile = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append("avatar", file);
      const { data } = await api.put("/auth/profile", fd);
      updateUser(data.data);
      toast.success("Profile updated successfully! ✅");
    } catch (err) { toast.error(err.response?.data?.message || "Update failed"); }
    finally { setLoading(false); }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    if (!pw.currentPassword) return toast.error("Current password required");
    if (pw.newPassword.length < 6) return toast.error("New password min 6 characters");
    if (pw.newPassword !== pw.confirmPassword) return toast.error("Passwords do not match");
    try {
      setPwLoading(true);
      await api.put("/auth/change-password", {
        currentPassword: pw.currentPassword,
        newPassword: pw.newPassword,
      });
      toast.success("Password changed successfully! 🔐");
      setPw({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
    finally { setPwLoading(false); }
  };

  const avatar = preview || user?.avatar?.url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "U")}&background=6366f1&color=fff&size=200`;

  const pwStrength = [
    pw.newPassword.length >= 6,
    /[A-Z]/.test(pw.newPassword),
    /[0-9]/.test(pw.newPassword),
    /[^a-zA-Z0-9]/.test(pw.newPassword),
  ];
  const strengthColors = ["bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-emerald-500"];
  const strengthScore  = pwStrength.filter(Boolean).length;
  const strengthLabels = ["Weak", "Fair", "Good", "Strong"];

  return (
    <div className="page-container py-8 max-w-2xl">
      <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white mb-6">My Profile</h1>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-surface-800 rounded-xl mb-6">
        {[{ id:"profile", label:"Profile", icon:User }, { id:"password", label:"Change Password", icon:Lock }].map(({ id, label, icon:Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === id
                ? "bg-white dark:bg-surface-700 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            }`}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <form onSubmit={handleProfile} className="card p-6 md:p-8 space-y-5">
          {/* Avatar */}
          <div className="flex flex-col sm:flex-row items-center gap-5 pb-5 border-b border-slate-100 dark:border-slate-700">
            <div className="relative">
              <img src={avatar} alt="Avatar" className="w-24 h-24 rounded-2xl object-cover shadow-lg" />
              <button type="button" onClick={() => fileRef.current.click()}
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-primary-600 hover:bg-primary-700 text-white flex items-center justify-center shadow-lg transition-colors">
                <Camera size={14} />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={e => { const f = e.target.files[0]; if (f) { setFile(f); setPreview(URL.createObjectURL(f)); } }} />
            </div>
            <div>
              <div className="font-display font-bold text-slate-900 dark:text-white text-xl">{user?.name}</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</div>
              <div className="text-xs text-slate-400 mt-1">Click camera icon to change photo</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="label">Full Name</label>
              <input className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Your name" /></div>
            <div><label className="label">Phone</label>
              <input className="input" placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
            <div className="sm:col-span-2">
              <label className="label">Email <span className="text-slate-400 font-normal text-xs">(cannot be changed)</span></label>
              <input className="input opacity-60 cursor-not-allowed" value={user?.email || ""} readOnly /></div>
            <div className="sm:col-span-2"><label className="label">Bio</label>
              <textarea className="input resize-none" rows={3} placeholder="Write something about yourself..."
                value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} /></div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary">
            <Save size={16} />{loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      )}

      {/* Password Tab */}
      {activeTab === "password" && (
        <form onSubmit={handlePassword} className="card p-6 md:p-8 space-y-5">
          <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
            <Shield size={18} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700 dark:text-amber-400">
              <strong>Security tip:</strong> Use a strong password — include uppercase, lowercase, numbers, and symbols.
            </p>
          </div>

          {/* Current Password */}
          <div>
            <label className="label">Current Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type={showPw.current ? "text" : "password"} className="input pl-10 pr-10"
                placeholder="Enter your current password"
                value={pw.currentPassword} onChange={e => setPw({...pw, currentPassword: e.target.value})} />
              <button type="button" onClick={() => setShowPw(s => ({...s, current: !s.current}))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPw.current ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="label">New Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type={showPw.new ? "text" : "password"} className="input pl-10 pr-10"
                placeholder="Min 6 characters"
                value={pw.newPassword} onChange={e => setPw({...pw, newPassword: e.target.value})} />
              <button type="button" onClick={() => setShowPw(s => ({...s, new: !s.new}))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPw.new ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {/* Strength bar */}
            {pw.newPassword.length > 0 && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[0,1,2,3].map(i => (
                    <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i < strengthScore ? strengthColors[strengthScore - 1] : "bg-slate-200 dark:bg-slate-700"}`} />
                  ))}
                </div>
                <span className={`text-xs font-medium ${["text-red-500","text-orange-500","text-yellow-500","text-emerald-500"][strengthScore - 1] || "text-slate-400"}`}>
                  {strengthScore > 0 ? strengthLabels[strengthScore - 1] : ""}
                </span>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="label">Confirm New Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type={showPw.confirm ? "text" : "password"} className="input pl-10 pr-10"
                placeholder="Repeat new password"
                value={pw.confirmPassword} onChange={e => setPw({...pw, confirmPassword: e.target.value})} />
              <button type="button" onClick={() => setShowPw(s => ({...s, confirm: !s.confirm}))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPw.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {pw.newPassword && pw.confirmPassword && (
            <div className={`flex items-center gap-2 text-sm font-medium ${pw.newPassword === pw.confirmPassword ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
              <CheckCircle size={14} />
              {pw.newPassword === pw.confirmPassword ? "Passwords match ✅" : "Passwords do not match"}
            </div>
          )}

          <button type="submit" disabled={pwLoading} className="btn-primary">
            <Lock size={16} />{pwLoading ? "Changing..." : "Change Password"}
          </button>
        </form>
      )}
    </div>
  );
}
