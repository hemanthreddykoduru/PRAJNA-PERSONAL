import React from 'react';
import { Users, CheckSquare, Clock, AlertTriangle, TrendingUp, Trophy, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const mockFaculty = [
  { name: 'Dr. Priya Sharma', score: 78, tier: 'Gold', pending: 2, status: 'active' },
  { name: 'Prof. Ramesh Iyer', score: 55, tier: 'Silver', pending: 0, status: 'active' },
  { name: 'Dr. Anita Rao', score: 32, tier: 'Bronze', pending: 1, status: 'attention' },
  { name: 'Prof. Suresh Kumar', score: 88, tier: 'Platinum', pending: 0, status: 'active' },
];

const pendingApprovals = [
  { id: 1, faculty: 'Dr. Priya Sharma', type: 'Research', title: 'Deep Learning in Healthcare', journal: 'Scientific Reports', submitted: '2 days ago' },
  { id: 2, faculty: 'Dr. Anita Rao', type: 'FDP', title: 'AI in Education Workshop', submitted: '4 days ago' },
];

export function HoDDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900">Department Dashboard</h1>
        <p className="text-gray-500 mt-1">
          {user?.department} · {user?.campus} Campus · <span className="text-primary font-semibold">{mockFaculty.length} Faculty Members</span>
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Faculty', value: mockFaculty.length, icon: <Users size={18} />, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Pending Approvals', value: pendingApprovals.length, icon: <Clock size={18} />, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Needing Attention', value: mockFaculty.filter(f => f.status === 'attention').length, icon: <AlertTriangle size={18} />, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Dept Avg Score', value: Math.round(mockFaculty.reduce((a, f) => a + f.score, 0) / mockFaculty.length), icon: <TrendingUp size={18} />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
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
        {/* Approval Queue */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <CheckSquare size={18} className="text-amber-500" />
              Approval Queue
            </h2>
            <span className="bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full text-xs font-bold">
              {pendingApprovals.length} Pending
            </span>
          </div>
          <div className="divide-y divide-gray-50">
            {pendingApprovals.map(item => (
              <div key={item.id} className="p-5 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{item.title}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{item.faculty} · {item.submitted}</p>
                    <span className="mt-2 inline-block bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                      {item.type}
                    </span>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button className="w-8 h-8 bg-emerald-50 hover:bg-emerald-100 rounded-lg text-emerald-600 flex items-center justify-center transition-colors">
                      ✓
                    </button>
                    <button className="w-8 h-8 bg-red-50 hover:bg-red-100 rounded-lg text-red-500 flex items-center justify-center transition-colors">
                      ✗
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-gray-50">
            <a href="/dashboard/hod/approvals" className="text-primary text-sm font-semibold flex items-center gap-1 hover:underline">
              View all approvals <ArrowUpRight size={14} />
            </a>
          </div>
        </div>

        {/* Faculty Overview */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <Users size={18} className="text-primary" />
              Faculty Overview
            </h2>
          </div>
          <div className="divide-y divide-gray-50">
            {mockFaculty.map(f => (
              <div key={f.name} className="p-5 flex items-center gap-4 hover:bg-gray-50/50 transition-colors">
                <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm flex-shrink-0">
                  {f.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm truncate">{f.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full bg-primary" style={{ width: `${f.score}%` }} />
                    </div>
                    <span className="text-xs text-gray-500 w-8">{f.score}</span>
                  </div>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                  f.status === 'attention' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
                }`}>
                  {f.tier}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
