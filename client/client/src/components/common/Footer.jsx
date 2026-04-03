import { Link } from "react-router-dom";
import { GraduationCap, Github, Twitter, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 dark:bg-surface-950 text-slate-400 mt-20">
      <div className="page-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 font-display font-bold text-xl text-white mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center">
                <GraduationCap size={18} className="text-white" />
              </div>
              Learnify
            </Link>
            <p className="text-sm leading-relaxed max-w-xs">Master new skills with expert instructors. Learn at your own pace and earn verified certificates.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/courses" className="hover:text-white transition-colors">Browse Courses</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Get Started</Link></li>
              <li><Link to="/verify/LRFY-SAMPLE" className="hover:text-white transition-colors">Verify Certificate</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Connect</h4>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-primary-600 transition-colors"><Github size={16} /></a>
              <a href="#" className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-primary-600 transition-colors"><Twitter size={16} /></a>
              <a href="#" className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-primary-600 transition-colors"><Linkedin size={16} /></a>
            </div>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-slate-800 text-center text-xs">
          © {new Date().getFullYear()} Learnify. Built with ❤️ for learners everywhere.
        </div>
      </div>
    </footer>
  );
}
