import { useState, useEffect } from "react";
import { IndianRupee } from "lucide-react";
import api from "../../utils/api";

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/payments/admin/all").then(r => { setPayments(r.data.data); setTotalRevenue(r.data.totalRevenue); }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white mb-6">Payments & Revenue</h1>
      <div className="card p-5 mb-6 flex items-center gap-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-200 dark:border-emerald-800">
        <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center"><IndianRupee size={22} className="text-white" /></div>
        <div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Total Revenue</div>
          <div className="font-display font-bold text-2xl text-slate-900 dark:text-white">₹{totalRevenue.toLocaleString("en-IN")}</div>
        </div>
        <div className="ml-auto text-right">
          <div className="text-sm text-slate-500">Total Transactions</div>
          <div className="font-bold text-slate-900 dark:text-white">{payments.length}</div>
        </div>
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-surface-800 border-b border-slate-200 dark:border-slate-700">
              <tr>{["Student","Course","Amount","Payment ID","Date","Status"].map(h => (
                <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? <tr><td colSpan={6} className="text-center py-8 text-slate-400">Loading...</td></tr>
              : payments.length === 0 ? <tr><td colSpan={6} className="text-center py-8 text-slate-400">No payments yet</td></tr>
              : payments.map(p => (
                <tr key={p._id} className="hover:bg-slate-50 dark:hover:bg-surface-800">
                  <td className="px-5 py-4">
                    <div className="font-medium text-slate-900 dark:text-white">{p.student?.name}</div>
                    <div className="text-xs text-slate-500">{p.student?.email}</div>
                  </td>
                  <td className="px-5 py-4 max-w-[160px] truncate text-slate-700 dark:text-slate-300">{p.course?.title}</td>
                  <td className="px-5 py-4 font-semibold text-emerald-600 dark:text-emerald-400">₹{(p.amount/100).toLocaleString("en-IN")}</td>
                  <td className="px-5 py-4 font-mono text-xs text-slate-500 max-w-[140px] truncate">{p.razorpayPaymentId || "—"}</td>
                  <td className="px-5 py-4 text-slate-500">{new Date(p.createdAt).toLocaleDateString("en-IN")}</td>
                  <td className="px-5 py-4"><span className="badge bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">Paid</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
