import { useState, useRef } from "react";
import { Save, Lock, User, Camera, Eye, EyeOff, Shield, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../utils/api";
import { useAdminAuth } from "../../context/AuthContext";

export default function AdminSettings() {
  const { user, updateUser } = useAdminAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [profileLoading, setProfileLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const fileRef = useRef();

  const [profile, setProfile] = useState({
    name:  user?.name  || "",
    email: user?.email || "",
    bio:   user?.bio   || "",
    phone: user?.phone || "",
  });

  const [pw, setPw] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      setProfileLoading(true);
      const fd = new FormData();
      fd.append("name",  profile.name);
      fd.append("bio",   profile.bio);
      fd.append("phone", profile.phone);
      if (avatarFile) fd.append("avatar", avatarFile);
      const { data } = await api.put("/auth/profile", fd);
      if (updateUser) updateUser(data.data);
      toast.success("Profile updated successfully! ✅");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally { setProfileLoading(false); }
  };

  const handlePasswordChange = async (e) => {
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
    } catch (err) {
      toast.error(err.response?.data?.message || "Password change failed");
    } finally { setPwLoading(false); }
  };

  const avatarSrc = preview || user?.avatar?.url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "A")}&background=6366f1&color=fff&size=200`;

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "password", label: "Change Password", icon: Lock },
  ];

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
          <Shield size={20} className="text-primary-600 dark:text-primary-400" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage your admin account</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-surface-800 rounded-xl mb-6">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === id
                ? "bg-white dark:bg-surface-700 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <form onSubmit={handleProfileSave} className="card p-6 space-y-5">
          {/* Avatar */}
          <div className="flex items-center gap-5 pb-5 border-b border-slate-100 dark:border-slate-700">
            <div className="relative">
              <img src={avatarSrc} alt="avatar" className="w-20 h-20 rounded-2xl object-cover shadow-lg" />
              <button
                type="button"
                onClick={() => fileRef.current.click()}
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-primary-600 hover:bg-primary-700 text-white flex items-center justify-center shadow-lg transition-colors"
              >
                <Camera size={14} />
              </button>
              <input
                ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={e => {
                  const f = e.target.files[0];
                  if (f) { setAvatarFile(f); setPreview(URL.createObjectURL(f)); }
                }}
              />
            </div>
            <div>
              <div className="font-display font-bold text-slate-900 dark:text-white text-lg">{user?.name}</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</div>
              <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-xs font-semibold">
                <Shield size={10} /> Administrator
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Full Name</label>
              <input className="input" value={profile.name}
                onChange={e => setProfile({...profile, name: e.target.value})} placeholder="Admin Name" />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" value={profile.phone}
                onChange={e => setProfile({...profile, phone: e.target.value})} placeholder="+91 XXXXX XXXXX" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Email <span className="text-slate-400 font-normal text-xs">(readonly)</span></label>
              <input className="input opacity-60 cursor-not-allowed" value={profile.email} readOnly />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Bio</label>
              <textarea className="input resize-none" rows={3} value={profile.bio}
                onChange={e => setProfile({...profile, bio: e.target.value})}
                placeholder="Write something about yourself..." />
            </div>
          </div>

          <button type="submit" disabled={profileLoading} className="btn-primary">
            <Save size={16} /> {profileLoading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      )}

      {/* Password Tab */}
      {activeTab === "password" && (
        <form onSubmit={handlePasswordChange} className="card p-6 space-y-5">
          <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
            <Lock size={18} className="text-amber-500 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-700 dark:text-amber-400">
              <strong>Security tip:</strong> Use a strong password — include uppercase, lowercase, numbers, and symbols.
            </div>
          </div>

          {[
            { key: "currentPassword", label: "Current Password",  ph: "Enter your current password" },
            { key: "newPassword",     label: "New Password",       ph: "Minimum 6 characters" },
            { key: "confirmPassword", label: "Confirm New Password", ph: "Confirm your new password" },
          ].map(({ key, label, ph }) => (
            <div key={key}>
              <label className="label">{label}</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPw[key.replace("Password","").replace("confirm","confirm").toLowerCase()] ? "text" : "password"}
                  className="input pl-10 pr-10"
                  placeholder={ph}
                  value={pw[key]}
                  onChange={e => setPw({...pw, [key]: e.target.value})}
                />
                <button type="button"
                  onClick={() => {
                    const k = key === "currentPassword" ? "current" : key === "newPassword" ? "new" : "confirm";
                    setShowPw(s => ({...s, [k]: !s[k]}));
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPw[key === "currentPassword" ? "current" : key === "newPassword" ? "new" : "confirm"]
                    ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {key === "newPassword" && pw.newPassword.length > 0 && (
                <div className="mt-1.5 flex gap-1">
                  {[
                    pw.newPassword.length >= 6,
                    /[A-Z]/.test(pw.newPassword),
                    /[0-9]/.test(pw.newPassword),
                    /[^a-zA-Z0-9]/.test(pw.newPassword),
                  ].map((ok, i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${ok ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-700"}`} />
                  ))}
                </div>
              )}
            </div>
          ))}

          {pw.newPassword && pw.confirmPassword && (
            <div className={`flex items-center gap-2 text-sm ${pw.newPassword === pw.confirmPassword ? "text-emerald-600" : "text-red-500"}`}>
              <CheckCircle size={14} />
              {pw.newPassword === pw.confirmPassword ? "Passwords match ✅" : "Passwords do not match"}
            </div>
          )}

          <button type="submit" disabled={pwLoading} className="btn-primary">
            <Lock size={16} /> {pwLoading ? "Updating..." : "Change Password"}
          </button>
        </form>
      )}
    </div>
  );
}
