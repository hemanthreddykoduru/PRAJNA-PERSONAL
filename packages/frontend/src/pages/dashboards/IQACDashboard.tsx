import React from 'react';
import { ShieldCheck, AlertTriangle, FileText, BarChart3, Users, Globe, Download, TrendingUp } from 'lucide-react';

const CRITERIA = [
  { id: 1, name: 'Curricular Aspects', score: 85, status: 'Healthy' },
  { id: 2, name: 'Teaching-Learning', score: 92, status: 'Healthy' },
  { id: 3, name: 'Research & Innovation', score: 45, status: 'Needs Attention' },
  { id: 4, name: 'Infrastructure', score: 78, status: 'Healthy' },
  { id: 5, name: 'Student Support', score: 88, status: 'Healthy' },
  { id: 6, name: 'Governance & Leadership', score: 62, status: 'Improving' },
  { id: 7, name: 'Institutional Values', score: 95, status: 'Healthy' },
];

export function IQACDashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">IQAC Command Center</h1>
          <p className="text-gray-500 mt-1 font-medium">Real-time NAAC/NIRF Readiness Monitoring</p>
        </div>
        <button className="bg-primary text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-105 transition-all">
          <Download size={18} />
          Generate Compliance Report
        </button>
      </div>

      {/* Readiness Speedometer Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <ShieldCheck size={200} />
          </div>
          <div className="relative z-10">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-8">Overall Institutional Readiness</h3>
            <div className="flex items-end gap-6">
              <div className="text-8xl font-black text-primary leading-none">82%</div>
              <div className="pb-2">
                <div className="flex items-center gap-2 text-emerald-500 font-bold mb-1">
                  <TrendingUp size={18} />
                  <span>+4.2% this month</span>
                </div>
                <p className="text-gray-500 font-medium text-sm">Target: 95% for A++ Grade</p>
              </div>
            </div>
            
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'AQAR Status', val: 'Submitted', status: 'success' },
                { label: 'SSR Draft', val: '72% Ready', status: 'warning' },
                { label: 'Faculty Data', val: 'Verified', status: 'success' },
              ].map(stat => (
                <div key={stat.label} className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                  <p className="text-lg font-bold text-gray-800">{stat.val}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-primary rounded-3xl p-8 text-white shadow-xl shadow-primary/10 flex flex-col justify-between">
          <div>
            <h3 className="text-white/60 text-xs font-bold uppercase tracking-widest mb-6">Auditor Alert</h3>
            <AlertTriangle className="text-secondary mb-4" size={32} />
            <h4 className="text-xl font-bold mb-2 leading-tight">Criteria 3: Research Gap Detected</h4>
            <p className="text-white/70 text-sm leading-relaxed">
              3 departments have not updated their patent filings for Q1. This may impact NIRF Ranking scores.
            </p>
          </div>
          <button className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-bold text-sm transition-colors border border-white/10 mt-6">
            View Department Breakdown
          </button>
        </div>
      </div>

      {/* 7 Criteria Grid */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-900 ml-1">NAAC 7-Criteria Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {CRITERIA.map(c => (
            <div key={c.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:border-primary/20 transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                  <span className="font-black">C{c.id}</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${
                  c.score > 80 ? 'bg-emerald-50 text-emerald-600' : 
                  c.score > 60 ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                }`}>
                  {c.status}
                </span>
              </div>
              <h4 className="font-bold text-gray-800 text-sm mb-3 line-clamp-1">{c.name}</h4>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${
                      c.score > 80 ? 'bg-emerald-500' : 
                      c.score > 60 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${c.score}%` }}
                  />
                </div>
                <span className="text-sm font-black text-gray-900">{c.score}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: <Users />, label: 'Faculty Compliance', val: '98%', sub: '2 pending verification' },
          { icon: <FileText />, label: 'Document Vault', val: '1,245', sub: 'Files ready for audit' },
          { icon: <Globe />, label: 'Campus Sync', val: 'Synced', sub: 'Last update: 2m ago' },
        ].map(m => (
          <div key={m.label} className="flex items-center gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-12 h-12 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center">
              {m.icon}
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-0.5">{m.label}</p>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-gray-800">{m.val}</span>
                <span className="text-[10px] text-emerald-500 font-bold">{m.sub}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
