import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Award, CheckCircle, XCircle, Download, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

export default function VerifyCertificate() {
  const { certId } = useParams();
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    // Public API call - no token needed
    const baseURL = import.meta.env.VITE_API_URL || "/api";
    axios.get(`${baseURL}/certificates/verify/${certId}`)
      .then(r  => setResult(r.data))
      .catch(() => setResult({ valid: false }))
      .finally(() => setLoading(false));
  }, [certId]);

  const handleDownload = async () => {
    const token = localStorage.getItem("learnify-student-token") || localStorage.getItem("learnify-token");
    if (!token) {
      toast.error("Please log in as a student to download");
      return;
    }
    try {
      setDownloading(true);
      const baseURL = import.meta.env.VITE_API_URL || "/api";
      const res = await axios.get(`${baseURL}/certificates/download/${certId}`, {
        responseType: "blob",
        headers: { Authorization: `Bearer ${token}` },
      });
      const url = URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const a = document.createElement("a");
      a.href = url; a.download = `certificate-${certId}.pdf`; a.click();
      URL.revokeObjectURL(url);
    } catch { toast.error("Download failed"); }
    finally { setDownloading(false); }
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-12 h-12 rounded-full border-2 border-primary-200 border-t-primary-600 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-surface-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {result?.valid ? (
          <div className="card p-8 border-2 border-emerald-200 dark:border-emerald-800 animate-slide-up">
            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
                <CheckCircle size={42} className="text-emerald-500" />
              </div>
              <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white mb-1">Certificate Verified ✅</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">This certificate is authentic and was issued by Learnify.</p>
            </div>

            {/* Student Info */}
            <div className="flex items-center gap-4 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-2xl mb-5">
              {result.data.studentAvatar ? (
                <img src={result.data.studentAvatar} alt="" className="w-14 h-14 rounded-full object-cover shadow-md" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center shadow-md shrink-0">
                  <span className="text-white text-xl font-bold">
                    {result.data.studentName?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-0.5">Certificate Holder</div>
                <div className="font-display font-bold text-xl text-slate-900 dark:text-white">{result.data.studentName}</div>
              </div>
            </div>

            {/* Details */}
            <div className="bg-slate-50 dark:bg-surface-800 rounded-2xl p-5 space-y-3 mb-5">
              {[
                ["Course",         result.data.courseName],
                ["Instructor",     result.data.instructorName],
                ["Certificate ID", result.data.certificateId],
                ["Issued On",      new Date(result.data.issuedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between items-start gap-4 text-sm">
                  <span className="text-slate-400 dark:text-slate-500 shrink-0">{label}</span>
                  <span className={`font-semibold text-right ${label === "Certificate ID" ? "font-mono text-primary-600 dark:text-primary-400" : "text-slate-900 dark:text-white"}`}>
                    {value}
                  </span>
                </div>
              ))}
            </div>

            {/* ID Badge */}
            <div className="text-center mb-5">
              <div className="inline-flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 border-2 border-dashed border-amber-300 dark:border-amber-700 rounded-xl px-5 py-3">
                <Award size={18} className="text-amber-500" />
                <span className="font-mono font-bold text-amber-700 dark:text-amber-400 text-lg tracking-widest">{result.data.certificateId}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={handleDownload} disabled={downloading} className="btn-primary flex-1 justify-center py-3">
                <Download size={16} /> {downloading ? "Downloading..." : "Download PDF"}
              </button>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                target="_blank" rel="noreferrer"
                className="btn-secondary flex-1 justify-center py-3"
              >
                <ExternalLink size={16} /> Share on LinkedIn
              </a>
            </div>
            <p className="text-center text-xs text-slate-400 mt-4">
              Verified by <span className="text-primary-600 dark:text-primary-400 font-semibold">Learnify</span>
            </p>
          </div>
        ) : (
          <div className="card p-8 border-2 border-red-200 dark:border-red-800 text-center animate-slide-up">
            <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-5">
              <XCircle size={42} className="text-red-500" />
            </div>
            <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white mb-2">Certificate Not Found</h1>
            <p className="text-slate-500 dark:text-slate-400 mb-2">
              ID <span className="font-mono text-red-500">"{certId}"</span> is invalid or does not exist in our records.
            </p>
            <p className="text-sm text-slate-400 mb-6">A valid certificate ID "LRFY-" se shuru hota hai.</p>
            <Link to="/courses" className="btn-primary">Browse Courses</Link>
          </div>
        )}
      </div>
    </div>
  );
}
