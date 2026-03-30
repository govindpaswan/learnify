import { useState, useEffect } from "react";
import { CreditCard, IndianRupee } from "lucide-react";
import api from "../../utils/api";

export default function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/payments/my").then(r => setPayments(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const total = payments.reduce((s, p) => s + p.amount / 100, 0);

  return (
    <div className="page-container py-8">
      <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white mb-6">Payment History</h1>
      {payments.length > 0 && (
        <div className="card p-5 mb-6 flex items-center gap-4 bg-gradient-to-r from-primary-50 to-violet-50 dark:from-primary-900/20 dark:to-violet-900/20 border-primary-200 dark:border-primary-800">
          <div className="w-12 h-12 rounded-xl bg-primary-600 flex items-center justify-center"><IndianRupee size={22} className="text-white" /></div>
          <div><div className="text-sm text-slate-500 dark:text-slate-400">Total Spent</div><div className="font-display font-bold text-2xl text-slate-900 dark:text-white">₹{total.toLocaleString("en-IN")}</div></div>
        </div>
      )}
      {loading ? <div className="text-center py-12 text-slate-500">Loading...</div> : payments.length === 0 ? (
        <div className="text-center py-20"><CreditCard size={48} className="text-slate-300 mx-auto mb-4" /><p className="text-slate-500">No payments yet.</p></div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-surface-800 border-b border-slate-200 dark:border-slate-700">
                <tr>{["Course", "Amount", "Payment ID", "Date", "Status"].map(h => <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {payments.map(p => (
                  <tr key={p._id} className="hover:bg-slate-50 dark:hover:bg-surface-800">
                    <td className="px-5 py-4 font-medium text-slate-900 dark:text-white max-w-[200px] truncate">{p.course?.title}</td>
                    <td className="px-5 py-4 text-slate-700 dark:text-slate-300 font-semibold">₹{(p.amount/100).toLocaleString("en-IN")}</td>
                    <td className="px-5 py-4 font-mono text-xs text-slate-500">{p.razorpayPaymentId || "—"}</td>
                    <td className="px-5 py-4 text-slate-500">{new Date(p.createdAt).toLocaleDateString("en-IN")}</td>
                    <td className="px-5 py-4"><span className="badge bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">Paid</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
