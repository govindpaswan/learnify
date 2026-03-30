import { useState } from "react";
import { Outlet, NavLink, useNavigate, Link } from "react-router-dom";
import { LayoutDashboard, BookOpen, Users, CreditCard, Award, List, GraduationCap, Menu, X, LogOut, ChevronRight, MessageSquare, Settings } from "lucide-react";
import { useAdminAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { Sun, Moon } from "lucide-react";

const navItems = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/admin/courses", icon: BookOpen, label: "Courses" },
  { to: "/admin/users", icon: Users, label: "Users" },
  { to: "/admin/enrollments", icon: List, label: "Enrollments" },
  { to: "/admin/payments", icon: CreditCard, label: "Payments" },
  { to: "/admin/certificates", icon: Award, label: "Certificates" },
];

export default function AdminLayout() {
  const { user, logout } = useAdminAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logout(); navigate("/admin/login"); };

  const Sidebar = ({ mobile }) => (
    <div className={`${mobile ? "flex flex-col h-full" : "hidden lg:flex flex-col h-full"} bg-white dark:bg-surface-900 border-r border-slate-200 dark:border-slate-800`}>
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <Link to="/admin" className="flex items-center gap-2 font-display font-bold text-lg text-slate-900 dark:text-white">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center">
            <GraduationCap size={16} className="text-white" />
          </div>
          Learnify
        </Link>
        {mobile && <button onClick={() => setOpen(false)}><X size={20} className="text-slate-500" /></button>}
      </div>
      <div className="p-3 flex-1 overflow-y-auto">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">Menu</div>
        <nav className="space-y-1">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)}
              className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
              <Icon size={18} />{label}
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="p-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3 mb-3">
          <img src={user?.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name||"A")}&background=6366f1&color=fff`} alt="" className="w-9 h-9 rounded-xl object-cover" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user?.name}</div>
            <div className="text-xs text-slate-500 truncate">Administrator</div>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={toggleTheme} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />} {theme === "dark" ? "Light" : "Dark"}
          </button>
          <button onClick={handleLogout} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
            <LogOut size={14} /> Logout
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-surface-950 overflow-hidden">
      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setOpen(false)} />}
      {/* Mobile sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 transition-transform duration-300 lg:hidden ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <Sidebar mobile />
      </div>
      {/* Desktop sidebar */}
      <div className="w-64 shrink-0 hidden lg:block"><Sidebar /></div>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar mobile */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white dark:bg-surface-900 border-b border-slate-200 dark:border-slate-800">
          <button onClick={() => setOpen(true)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><Menu size={20} className="text-slate-600 dark:text-slate-400" /></button>
          <span className="font-display font-bold text-slate-900 dark:text-white">Admin Panel</span>
        </div>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
