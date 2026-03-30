import { useState } from "react";
import { Link } from "react-router-dom";
import { GraduationCap, Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error("Please fill in all fields");
    if (form.password.length < 6) return toast.error("Password must be at least 6 characters");
    if (form.password !== form.confirmPassword) return toast.error("Passwords do not match");
    try {
      setLoading(true);
      await register({ name: form.name, email: form.email, password: form.password });
      toast.success("Account created successfully! 🎉");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally { setLoading(false); }
  };

  const set = (k, v) => setForm(f => ({...f, [k]: v}));

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-violet-600 to-primary-700 flex-col justify-center items-center text-white p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{backgroundImage:"radial-gradient(circle at 70% 30%, #ffffff 0%, transparent 50%)"}} />
        <div className="relative text-center">
          <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-6">
            <GraduationCap size={40} />
          </div>
          <h2 className="font-display text-4xl font-bold mb-4">Start Learning Today</h2>
          <p className="text-violet-100 text-lg max-w-sm">Join 50,000+ learners. Get certified. Advance your career.</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 bg-white dark:bg-surface-950">
        <div className="w-full max-w-md animate-slide-up">
          <div className="flex items-center gap-2 font-display font-bold text-xl mb-8 lg:hidden text-slate-900 dark:text-white">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center">
              <GraduationCap size={18} className="text-white" />
            </div>
            Learnify
          </div>
          <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white mb-2">Create Account</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8">Already have an account? <Link to="/login" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">Sign in</Link></p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input className="input pl-10" placeholder="John Doe" value={form.name} onChange={e => set("name", e.target.value)} />
              </div>
            </div>
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="email" className="input pl-10" placeholder="you@example.com" value={form.email} onChange={e => set("email", e.target.value)} />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type={showPw ? "text" : "password"} className="input pl-10 pr-10" placeholder="Min 6 characters" value={form.password} onChange={e => set("password", e.target.value)} />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"><EyeOff size={16} /></button>
              </div>
            </div>
            <div>
              <label className="label">Confirm Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="password" className="input pl-10" placeholder="Repeat password" value={form.confirmPassword} onChange={e => set("confirmPassword", e.target.value)} />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 mt-2">
              {loading ? "Creating account..." : "Create Free Account"}
            </button>
          </form>
          <p className="text-xs text-slate-400 dark:text-slate-500 text-center mt-4">
            By registering, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
