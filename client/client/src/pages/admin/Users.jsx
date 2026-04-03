// Admin Users Page
import { useState, useEffect } from "react";
import { Search, ShieldOff, Shield, Trash2, User } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../utils/api";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchUsers = () => {
    api.get(`/admin/users${search ? `?search=${search}` : ""}`).then(r => setUsers(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, [search]);

  const toggleBlock = async (user) => {
    try {
      const { data } = await api.put(`/admin/users/${user._id}/block`);
      toast.success(`User ${data.isBlocked ? "blocked" : "unblocked"}`);
      fetchUsers();
    } catch { toast.error("Failed"); }
  };

  const deleteUser = async (id, name) => {
    if (!confirm(`Delete user "${name}"?`)) return;
    try { await api.delete(`/admin/users/${id}`); toast.success("User deleted"); fetchUsers(); }
    catch { toast.error("Delete failed"); }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white mb-6">Users</h1>
      <div className="relative mb-5">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input className="input pl-10 max-w-xs" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-surface-800 border-b border-slate-200 dark:border-slate-700">
              <tr>{["User","Email","Joined","Status","Actions"].map(h => <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? <tr><td colSpan={5} className="text-center py-8 text-slate-400">Loading...</td></tr> :
                users.length === 0 ? <tr><td colSpan={5} className="text-center py-8 text-slate-400">No users found</td></tr> :
                users.map(u => (
                  <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-surface-800">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img src={u.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=6366f1&color=fff&size=40`} alt="" className="w-9 h-9 rounded-xl object-cover" />
                        <span className="font-medium text-slate-900 dark:text-white">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-400">{u.email}</td>
                    <td className="px-5 py-4 text-slate-500">{new Date(u.createdAt).toLocaleDateString("en-IN")}</td>
                    <td className="px-5 py-4">
                      <span className={`badge ${u.isBlocked ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"}`}>
                        {u.isBlocked ? "Blocked" : "Active"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => toggleBlock(u)} title={u.isBlocked ? "Unblock" : "Block"} className={`p-1.5 rounded-lg transition-colors ${u.isBlocked ? "hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-slate-400 hover:text-emerald-600" : "hover:bg-orange-50 dark:hover:bg-orange-900/20 text-slate-400 hover:text-orange-600"}`}>
                          {u.isBlocked ? <Shield size={15} /> : <ShieldOff size={15} />}
                        </button>
                        <button onClick={() => deleteUser(u._id, u.name)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-600">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
