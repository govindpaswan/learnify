import { useState } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { GraduationCap, Sun, Moon, Menu, X, LayoutDashboard, LogOut, User, BookOpen, Award, ChevronDown } from "lucide-react";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen]       = useState(false);
  const [userMenu, setUserMenu] = useState(false);

  const handleLogout = () => { logout(); navigate("/"); setUserMenu(false); };

  const scrollTo = (id) => {
    setOpen(false);
    if (location.pathname === "/") {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate(`/#${id}`);
    }
  };

  const navLinks = [
    { label: "Courses",  to: "/courses"  },
    { label: "Services", scroll: "services" },
    { label: "About",    scroll: "about"    },
    { label: "Contact",  scroll: "contact"  },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-surface-950/90 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60">
      <div className="page-container">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-display font-bold text-xl text-slate-900 dark:text-white shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
              <GraduationCap size={18} className="text-white" />
            </div>
            Learnify
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ label, to, scroll }) =>
              to ? (
                <NavLink key={label} to={to} className={({ isActive }) => `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? "text-primary-600 bg-primary-50 dark:bg-primary-900/20 dark:text-primary-400" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"}`}>
                  {label}
                </NavLink>
              ) : (
                <button key={label} onClick={() => scrollTo(scroll)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  {label}
                </button>
              )
            )}
            {isAuthenticated && user?.role === "student" && (
              <NavLink to="/dashboard" className={({ isActive }) => `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? "text-primary-600 bg-primary-50 dark:bg-primary-900/20 dark:text-primary-400" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"}`}>
                Dashboard
              </NavLink>
            )}
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title={theme === "dark" ? "Light mode" : "Dark mode"}>
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {isAuthenticated ? (
              <div className="relative">
                <button onClick={() => setUserMenu(!userMenu)} className="flex items-center gap-2 p-1 pr-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <img src={user?.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name||"U")}&background=6366f1&color=fff`} alt={user?.name} className="w-8 h-8 rounded-lg object-cover" />
                  <span className="hidden sm:block text-sm font-medium text-slate-700 dark:text-slate-200 max-w-[100px] truncate">{user?.name}</span>
                  <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
                </button>
                {userMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserMenu(false)} />
                    <div className="absolute right-0 mt-2 w-52 card shadow-xl z-20 py-1.5 animate-fade-in">
                      {user?.role === "admin" ? (
                        <Link to="/admin" onClick={() => setUserMenu(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
                          <LayoutDashboard size={15} /> Admin Panel
                        </Link>
                      ) : (
                        <>
                          <Link to="/dashboard/profile" onClick={() => setUserMenu(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                            <User size={15} /> Profile
                          </Link>
                          <Link to="/dashboard/my-courses" onClick={() => setUserMenu(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                            <BookOpen size={15} /> My Courses
                          </Link>
                          <Link to="/dashboard/certificates" onClick={() => setUserMenu(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                            <Award size={15} /> Certificates
                          </Link>
                        </>
                      )}
                      <hr className="my-1 border-slate-100 dark:border-slate-700" />
                      <button onClick={handleLogout} className="flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 w-full">
                        <LogOut size={15} /> Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login"    className="btn-secondary py-2 text-sm">Login</Link>
                <Link to="/register" className="btn-primary py-2 text-sm">Get Started</Link>
              </div>
            )}
            <button className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setOpen(!open)}>
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {open && (
          <div className="md:hidden pb-4 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1 animate-fade-in">
            {navLinks.map(({ label, to, scroll }) =>
              to ? (
                <Link key={label} to={to} onClick={() => setOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">{label}</Link>
              ) : (
                <button key={label} onClick={() => scrollTo(scroll)} className="block w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">{label}</button>
              )
            )}
            {isAuthenticated && user?.role === "student" && (
              <Link to="/dashboard" onClick={() => setOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">Dashboard</Link>
            )}
            {!isAuthenticated && (
              <>
                <Link to="/login"    onClick={() => setOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300">Login</Link>
                <Link to="/register" onClick={() => setOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm font-medium text-primary-600 dark:text-primary-400 font-semibold">Get Started Free →</Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
