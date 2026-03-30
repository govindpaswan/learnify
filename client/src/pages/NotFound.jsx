import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-surface-950 p-6">
      <div className="text-center">
        <div className="font-display text-9xl font-bold text-primary-100 dark:text-primary-900 select-none">404</div>
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white -mt-6 mb-3">Page Not Found</h1>
        <p className="text-slate-500 mb-8">Oops! The page you're looking for doesn't exist.</p>
        <Link to="/" className="btn-primary"><ArrowLeft size={16} /> Back to Home</Link>
      </div>
    </div>
  );
}
