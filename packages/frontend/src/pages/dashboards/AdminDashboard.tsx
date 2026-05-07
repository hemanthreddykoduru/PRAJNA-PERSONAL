import { useState } from 'react';
import { Users, Globe, Settings, Shield, Activity, Database, UserPlus, AlertCircle } from 'lucide-react';

const campuses = [
  { name: 'Bengaluru', users: 487, active: 412, health: 98 },
  { name: 'Vizag', users: 623, active: 589, health: 99 },
  { name: 'Hyderabad', users: 341, active: 298, health: 96 },
];

const recentActivity = [
  { action: 'New user created', detail: 'priya.sharma@gitam.edu — Faculty, CSE, Bengaluru', time: '5 min ago', type: 'info' },
  { action: 'Role updated', detail: 'ramesh.iyer@gitam.edu — Faculty → HoD', time: '1 hour ago', type: 'warning' },
  { action: 'Bulk import completed', detail: '48 faculty records imported for Vizag campus', time: '3 hours ago', type: 'success' },
  { action: 'System alert', detail: 'API Gateway latency spike detected — resolved', time: '5 hours ago', type: 'error' },
];

const activityColor = {
  info: 'bg-blue-100 text-blue-600',
  warning: 'bg-amber-100 text-amber-600',
  success: 'bg-emerald-100 text-emerald-600',
  error: 'bg-red-100 text-red-600',
};

export function AdminDashboard() {
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const totalUsers = campuses.reduce((a, c) => a + c.users, 0);
  const totalActive = campuses.reduce((a, c) => a + c.active, 0);

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">System Administration</h1>
          <p className="text-gray-500 mt-1">All Campuses · Full Access</p>
        </div>
        <button 
          onClick={() => setIsAddUserOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
        >
          <UserPlus size={16} />
          Add User
        </button>
      </div>

      {/* Add User Modal */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsAddUserOpen(false)} />
          <div className="bg-white rounded-3xl w-full max-w-md relative z-10 overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="bg-primary p-6 text-white">
              <h2 className="text-xl font-bold">Register New User</h2>
              <p className="text-white/70 text-sm mt-1">This user will receive a GITAM activation email.</p>
            </div>
            
            <form className="p-6 space-y-4" onSubmit={(e) => { e.preventDefault(); setIsAddUserOpen(false); }}>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Full Name</label>
                <input type="text" placeholder="Dr. John Doe" className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium" required />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email (GITAM ID)</label>
                <input type="email" placeholder="name@gitam.edu" className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Role</label>
                  <select className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium">
                    <option>Faculty</option>
                    <option>HoD</option>
                    <option>Director</option>
                    <option>IQAC</option>
                    <option>ProVC</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Campus</label>
                  <select className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium">
                    <option>Vizag</option>
                    <option>Bengaluru</option>
                    <option>Hyderabad</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-8">
                <button 
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="flex-1 py-3 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-primary text-white py-3 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* System Health */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: totalUsers, icon: <Users size={18} />, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Active Now', value: totalActive, icon: <Activity size={18} />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'All Campuses', value: 3, icon: <Globe size={18} />, color: 'text-violet-600', bg: 'bg-violet-50' },
          { label: 'System Health', value: '98%', icon: <Shield size={18} />, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className={`w-9 h-9 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
              {stat.icon}
            </div>
            <p className="text-3xl font-black text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Campus Status */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <Globe size={18} className="text-primary" />
              Campus Status
            </h2>
          </div>
          <div className="divide-y divide-gray-50">
            {campuses.map(campus => (
              <div key={campus.name} className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-800">{campus.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{campus.users} users · {campus.active} active</p>
                  </div>
                  <span className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    {campus.health}% healthy
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full bg-gradient-to-r from-primary to-emerald-400"
                    style={{ width: `${(campus.active / campus.users) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <Activity size={18} className="text-primary" />
              Recent Activity
            </h2>
          </div>
          <div className="divide-y divide-gray-50">
            {recentActivity.map((act, i) => (
              <div key={i} className="p-4 flex items-start gap-3">
                <div className={`w-7 h-7 rounded-lg ${activityColor[act.type as keyof typeof activityColor]} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <AlertCircle size={14} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-800">{act.action}</p>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{act.detail}</p>
                </div>
                <span className="text-[10px] text-gray-400 flex-shrink-0 mt-0.5">{act.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Admin Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: <Users size={20} />, label: 'Manage Users', to: '/dashboard/admin/users' },
          { icon: <Database size={20} />, label: 'Data Migration', to: '/dashboard/admin/migration' },
          { icon: <Settings size={20} />, label: 'System Settings', to: '/dashboard/admin/settings' },
          { icon: <Shield size={20} />, label: 'Audit Logs', to: '/dashboard/admin/audit' },
        ].map(action => (
          <a
            key={action.label}
            href={action.to}
            className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-primary/30 hover:shadow-md transition-all flex flex-col items-center text-center gap-3"
          >
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
              {action.icon}
            </div>
            <span className="text-sm font-semibold text-gray-700">{action.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
