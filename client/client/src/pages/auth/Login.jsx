import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, Eye, EyeOff, Mail, Lock, Shield } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

export default function Login() {
  const { login }   = useAuth();
  const navigate    = useNavigate();
  const [form, setForm]   = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error("Please fill in all fields");
    try {
      setLoading(true);

      // First check role without logging in
      const BASE = import.meta.env.VITE_API_URL || "/api";
      const { data: check } = await axios.post(`${BASE}/auth/login`, form);

      if (check.data.role === "admin") {
        // Admin trying to login from student page → redirect
        toast.error("This is an admin account. Please use the Admin Login page.");
        setTimeout(() => navigate("/admin/login"), 1500);
        return;
      }

      await login(form);
      toast.success("Welcome back! 👋");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid credentials");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-600 to-violet-700 flex-col justify-center items-center text-white p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{backgroundImage:"radial-gradient(circle at 30% 70%, #ffffff 0%, transparent 50%)"}} />
        <div className="relative text-center">
          <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-6">
            <GraduationCap size={40} className="text-white" />
          </div>
          <h2 className="font-display text-4xl font-bold mb-4">Welcome Back!</h2>
          <p className="text-primary-100 text-lg max-w-sm">Continue your learning journey. Your progress awaits you.</p>
          <div className="mt-10 grid grid-cols-2 gap-4 text-center">
            {[["500+","Courses"],["50K+","Learners"],["30K+","Certs"],["4.8","Rating"]].map(([v,l]) => (
              <div key={l} className="bg-white/10 rounded-xl p-4">
                <div className="font-display font-bold text-2xl">{v}</div>
                <div className="text-sm text-primary-200">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white dark:bg-surface-950">
        <div className="w-full max-w-md animate-slide-up">
          <div className="flex items-center gap-2 font-display font-bold text-xl text-slate-900 dark:text-white mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center">
              <GraduationCap size={18} className="text-white" />
            </div>
            Learnify
          </div>

          <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white mb-2">Sign In</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">Sign up free</Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="email" className="input pl-10" placeholder="you@example.com"
                  value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type={showPw ? "text" : "password"} className="input pl-10 pr-10" placeholder="••••••••"
                  value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Admin link - subtle */}
          <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-5">
            Are you an admin?{" "}
            <Link to="/admin/login" className="text-primary-500 hover:text-primary-400 font-medium">Admin login →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
