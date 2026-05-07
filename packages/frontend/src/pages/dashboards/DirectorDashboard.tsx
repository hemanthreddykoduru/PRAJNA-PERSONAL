import { Building2, Users, TrendingUp, CheckSquare, BarChart3, FileText, ArrowUpRight, Trophy } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const departments = [
  { name: 'Computer Science & Engineering', faculty: 24, avgScore: 72, platinum: 4, pending: 3 },
  { name: 'Electronics & Communication', faculty: 18, avgScore: 65, platinum: 2, pending: 1 },
  { name: 'Mechanical Engineering', faculty: 20, avgScore: 58, platinum: 1, pending: 5 },
  { name: 'Management Studies', faculty: 15, avgScore: 69, platinum: 3, pending: 2 },
];

export function DirectorDashboard() {
  const { user } = useAuth();
  const totalFaculty = departments.reduce((a, d) => a + d.faculty, 0);
  const avgScore = Math.round(departments.reduce((a, d) => a + d.avgScore, 0) / departments.length);

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">School Command Centre</h1>
          <p className="text-gray-500 mt-1">{user?.campus} Campus · School of Engineering & Technology</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors">
          <FileText size={16} />
          Generate NAAC Report
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Faculty', value: totalFaculty, icon: <Users size={18} />, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Departments', value: departments.length, icon: <Building2 size={18} />, color: 'text-violet-600', bg: 'bg-violet-50' },
          { label: 'School Avg Score', value: avgScore, icon: <TrendingUp size={18} />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Escalated Approvals', value: departments.reduce((a, d) => a + d.pending, 0), icon: <CheckSquare size={18} />, color: 'text-amber-600', bg: 'bg-amber-50' },
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

      {/* Department Breakdown */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            <BarChart3 size={18} className="text-primary" />
            Department Performance
          </h2>
          <a href="/dashboard/director/departments" className="text-primary text-xs font-semibold flex items-center gap-1 hover:underline">
            View all <ArrowUpRight size={12} />
          </a>
        </div>
        <div className="divide-y divide-gray-50">
          {departments.map(dept => (
            <div key={dept.name} className="p-5 hover:bg-gray-50/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-gray-800 text-sm truncate">{dept.name}</p>
                    <div className="flex items-center gap-3 ml-4 flex-shrink-0 text-xs text-gray-500">
                      <span>{dept.faculty} faculty</span>
                      <span className="flex items-center gap-1 text-amber-600">
                        <Trophy size={12} />
                        {dept.platinum} Platinum
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-primary to-emerald-400"
                        style={{ width: `${dept.avgScore}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-gray-700 w-10">{dept.avgScore}</span>
                    {dept.pending > 0 && (
                      <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        {dept.pending} pending
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Report Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'NAAC Report', sub: 'All 7 criteria, auto-populated', color: 'bg-blue-600' },
          { label: 'NIRF Report', sub: 'Teaching, Research, Perception', color: 'bg-violet-600' },
          { label: 'NBA Report', sub: 'Programme-specific outcomes', color: 'bg-emerald-600' },
        ].map(r => (
          <button key={r.label} className={`${r.color} text-white rounded-2xl p-5 text-left hover:opacity-90 transition-opacity shadow-sm`}>
            <FileText size={20} className="mb-3 opacity-80" />
            <p className="font-bold">{r.label}</p>
            <p className="text-white/70 text-xs mt-1">{r.sub}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
