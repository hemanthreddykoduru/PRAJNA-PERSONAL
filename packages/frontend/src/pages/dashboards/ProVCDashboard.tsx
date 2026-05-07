import { Building2, Users, TrendingUp, BarChart3, Globe, Trophy } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const schools = [
  { name: 'Engineering & Technology', depts: 8, faculty: 142, avgScore: 68, trend: '+4%' },
  { name: 'Management Studies', depts: 4, faculty: 56, avgScore: 71, trend: '+2%' },
  { name: 'Sciences & Humanities', depts: 6, faculty: 78, avgScore: 63, trend: '+7%' },
  { name: 'Law & Governance', depts: 3, faculty: 34, avgScore: 74, trend: '+1%' },
];

export function ProVCDashboard() {
  const { user } = useAuth();
  const totalFaculty = schools.reduce((a, s) => a + s.faculty, 0);
  const campusAvg = Math.round(schools.reduce((a, s) => a + s.avgScore, 0) / schools.length);

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Campus Command Centre</h1>
        <p className="text-gray-500 mt-1 capitalize">{user?.campus} Campus · Pro Vice-Chancellor View</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Faculty', value: totalFaculty, icon: <Users size={18} />, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Schools', value: schools.length, icon: <Building2 size={18} />, color: 'text-violet-600', bg: 'bg-violet-50' },
          { label: 'Campus Avg Score', value: campusAvg, icon: <TrendingUp size={18} />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Cross-Campus Rank', value: '#2', icon: <Globe size={18} />, color: 'text-amber-600', bg: 'bg-amber-50' },
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

      {/* Schools Performance */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            <BarChart3 size={18} className="text-primary" />
            School Performance — Campus Overview
          </h2>
        </div>
        <div className="divide-y divide-gray-50">
          {schools.map(school => (
            <div key={school.name} className="p-5 hover:bg-gray-50/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-gray-800 text-sm">{school.name}</p>
                    <div className="flex items-center gap-3 ml-4 text-xs flex-shrink-0">
                      <span className="text-gray-500">{school.depts} depts · {school.faculty} faculty</span>
                      <span className="text-emerald-600 font-bold">{school.trend}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-primary to-emerald-400"
                        style={{ width: `${school.avgScore}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-gray-700 w-10">{school.avgScore}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Campus-wide Benchmarking */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-white rounded-2xl p-6">
        <h2 className="font-bold mb-1 flex items-center gap-2">
          <Trophy size={18} className="text-yellow-300" />
          Cross-Campus Benchmarking
        </h2>
        <p className="text-white/70 text-sm mb-4">Comparing {user?.campus} with other GITAM campuses</p>
        <div className="grid grid-cols-3 gap-4">
          {[
            { campus: 'Bengaluru', score: 72, highlight: user?.campus === 'bengaluru' },
            { campus: 'Vizag', score: 68, highlight: user?.campus === 'vizag' },
            { campus: 'Hyderabad', score: 74, highlight: user?.campus === 'hyderabad' },
          ].map(c => (
            <div key={c.campus} className={`rounded-xl p-4 text-center ${c.highlight ? 'bg-white/20 ring-2 ring-white/50' : 'bg-white/10'}`}>
              <p className="text-2xl font-black">{c.score}</p>
              <p className="text-white/70 text-xs mt-1 capitalize">{c.campus}</p>
              {c.highlight && <span className="text-yellow-300 text-[10px] font-bold mt-1 block">YOUR CAMPUS</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
