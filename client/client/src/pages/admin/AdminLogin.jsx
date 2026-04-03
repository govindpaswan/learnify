import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Eye, EyeOff, Mail, Lock, GraduationCap } from "lucide-react";
import toast from "react-hot-toast";
import { useAdminAuth } from "../../context/AuthContext";

export default function AdminLogin() {
  const { login }   = useAdminAuth();
  const navigate    = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error("Please enter your email and password");
    try {
      setLoading(true);
      await login(form);
      toast.success("Welcome Admin! 👋");
      navigate("/admin");
    } catch (err) {
      // Handle both axios errors and plain errors
      const msg = err?.response?.data?.message || err?.message || "Login failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "radial-gradient(circle at 25% 25%, #6366f1 0%, transparent 50%), radial-gradient(circle at 75% 75%, #8b5cf6 0%, transparent 50%)" }} />
      </div>

      <div className="relative w-full max-w-md animate-slide-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center shadow-lg">
              <GraduationCap size={22} className="text-white" />
            </div>
            <span className="font-display font-bold text-xl text-white">Learnify</span>
          </div>
          <div className="inline-flex items-center gap-2 bg-primary-500/10 border border-primary-500/20 rounded-full px-4 py-1.5 mb-4">
            <Shield size={14} className="text-primary-400" />
            <span className="text-primary-300 text-sm font-medium">Admin Portal</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-white mb-2">Admin Sign In</h1>
          <p className="text-slate-400 text-sm">Restricted access — authorized personnel only</p>
        </div>

        {/* Card */}
        <div className="bg-surface-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Admin Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  className="w-full px-4 py-2.5 pl-10 bg-surface-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                  placeholder="admin@learnify.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPw ? "text" : "password"}
                  className="w-full px-4 py-2.5 pl-10 pr-10 bg-surface-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:pointer-events-none mt-2">
              <Shield size={18} />
              {loading ? "Signing in..." : "Sign In as Admin"}
            </button>
          </form>


        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          Student?{" "}
          <a href="/login" className="text-primary-500 hover:text-primary-400">
            Go to student login →
          </a>
        </p>
      </div>
    </div>
  );
}
