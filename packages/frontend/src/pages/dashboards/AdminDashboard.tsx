import { useState, useEffect } from 'react';
import { Users, Globe, Settings, Shield, Activity, Database, UserPlus, AlertCircle, Loader2 } from 'lucide-react';
import { fetchAuthSession } from 'aws-amplify/auth';
import { AdminRegisterModal } from '../../components/AdminRegisterModal';

export function AdminDashboard() {
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [faculty, setFaculty] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      const baseUrl = import.meta.env.VITE_API_URL || 'https://cov49w67hk.execute-api.us-east-1.amazonaws.com/prod';

      const response = await fetch(`${baseUrl}/admin?action=list`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setFaculty(data);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Dynamic Calculations
  const totalUsers = faculty.length;
  const totalActive = faculty.filter(f => (f.status || 'active').toLowerCase() === 'active').length;
  
  const campusGroups = faculty.reduce((acc: any, f) => {
    const campus = f.campus || 'Other';
    if (!acc[campus]) acc[campus] = { name: campus, users: 0, active: 0 };
    acc[campus].users++;
    if ((f.status || 'active').toLowerCase() === 'active') acc[campus].active++;
    return acc;
  }, {});

  const campusList = Object.values(campusGroups);

  return (
    <div className="space-y-6 max-w-6xl animate-in fade-in duration-700">
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

      <AdminRegisterModal 
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
        onSuccess={fetchData}
      />

      {/* System Health Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: isLoading ? '...' : totalUsers.toLocaleString(), icon: <Users size={18} />, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Active Now', value: isLoading ? '...' : totalActive.toLocaleString(), icon: <Activity size={18} />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'All Campuses', value: campusList.length || 3, icon: <Globe size={18} />, color: 'text-violet-600', bg: 'bg-violet-50' },
          { label: 'System Health', value: '100%', icon: <Shield size={18} />, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all">
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
          <div className="p-5 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <Globe size={18} className="text-primary" />
              Campus Status
            </h2>
            {isLoading && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
          </div>
          <div className="divide-y divide-gray-50 max-h-[300px] overflow-y-auto">
            {campusList.length === 0 && !isLoading ? (
               <div className="p-10 text-center text-gray-400 font-medium">No campus data available.</div>
            ) : campusList.map((campus: any) => (
              <div key={campus.name} className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-800">{campus.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{campus.users} users · {campus.active} active</p>
                  </div>
                  <span className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    100% healthy
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

        {/* Recent Activity (Placeholders for Audit Logs) */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <Activity size={18} className="text-primary" />
              Recent System Events
            </h2>
          </div>
          <div className="divide-y divide-gray-50">
            {[
              { action: 'Directory Synchronized', detail: 'User management state perfectly aligned with DynamoDB', time: 'Just now', type: 'success' },
              { action: 'API Security Verified', detail: 'JWT authorization active for all admin endpoints', time: '1 min ago', type: 'info' }
            ].map((act, i) => (
              <div key={i} className="p-4 flex items-start gap-3">
                <div className={`w-7 h-7 rounded-lg ${act.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'} flex items-center justify-center flex-shrink-0 mt-0.5`}>
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
