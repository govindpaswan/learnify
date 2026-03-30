import { useState, useEffect } from "react";
import { Award, Download } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../utils/api";

export default function AdminCertificates() {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/certificates/admin/all").then(r => setCerts(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const download = async (certId) => {
    try {
      const res = await api.get(`/certificates/download/${certId}`, { responseType: "blob" });
      const url = URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const a = document.createElement("a"); a.href = url; a.download = `cert-${certId}.pdf`; a.click();
      URL.revokeObjectURL(url);
    } catch { toast.error("Download failed"); }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white mb-6">Certificates</h1>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-surface-800 border-b border-slate-200 dark:border-slate-700">
              <tr>{["Student","Course","Certificate ID","Issued On","Download"].map(h => (
                <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? <tr><td colSpan={5} className="text-center py-8 text-slate-400">Loading...</td></tr>
              : certs.length === 0 ? <tr><td colSpan={5} className="text-center py-8 text-slate-400">No certificates issued yet</td></tr>
              : certs.map(c => (
                <tr key={c._id} className="hover:bg-slate-50 dark:hover:bg-surface-800">
                  <td className="px-5 py-4">
                    <div className="font-medium text-slate-900 dark:text-white">{c.student?.name}</div>
                    <div className="text-xs text-slate-500">{c.student?.email}</div>
                  </td>
                  <td className="px-5 py-4 max-w-[180px] truncate text-slate-700 dark:text-slate-300">{c.course?.title}</td>
                  <td className="px-5 py-4 font-mono text-xs">
                    <span className="bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 px-2 py-1 rounded-lg">{c.certificateId}</span>
                  </td>
                  <td className="px-5 py-4 text-slate-500">{new Date(c.issuedAt).toLocaleDateString("en-IN")}</td>
                  <td className="px-5 py-4">
                    <button onClick={() => download(c.certificateId)} className="flex items-center gap-1.5 text-xs text-primary-600 dark:text-primary-400 hover:underline">
                      <Download size={13} /> PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
