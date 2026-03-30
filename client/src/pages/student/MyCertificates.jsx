import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Award, Download, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../utils/api";

export default function MyCertificates() {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/certificates/my").then(r => setCerts(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleDownload = async (certId) => {
    try {
      const res = await api.get(`/certificates/download/${certId}`, { responseType: "blob" });
      const url = URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const a = document.createElement("a"); a.href = url; a.download = `certificate-${certId}.pdf`; a.click();
      URL.revokeObjectURL(url);
    } catch { toast.error("Download failed"); }
  };

  return (
    <div className="page-container py-8">
      <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white mb-6">My Certificates</h1>
      {loading ? <div className="text-center py-12 text-slate-500">Loading...</div> : certs.length === 0 ? (
        <div className="text-center py-20">
          <Award size={56} className="text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="font-display font-semibold text-xl text-slate-700 dark:text-slate-300 mb-2">No certificates yet</h3>
          <p className="text-slate-500">Complete a course to earn your first certificate!</p>
          <Link to="/dashboard/my-courses" className="btn-primary mt-4">View My Courses</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certs.map(cert => (
            <div key={cert._id} className="card p-6 border-2 border-amber-200 dark:border-amber-800/50 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/30">
                  <Award size={30} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-bold text-slate-900 dark:text-white mb-1 truncate">{cert.courseName}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Instructor: {cert.instructorName}</p>
                  <p className="text-xs text-slate-400 mb-1">Issued: {new Date(cert.issuedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
                  <div className="font-mono text-xs bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 px-2 py-1 rounded-lg inline-block">{cert.certificateId}</div>
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => handleDownload(cert.certificateId)} className="btn-primary text-sm flex-1 justify-center py-2.5">
                  <Download size={14} /> Download PDF
                </button>
                <Link to={`/verify/${cert.certificateId}`} target="_blank" className="btn-secondary text-sm px-4 py-2.5">
                  <ExternalLink size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
