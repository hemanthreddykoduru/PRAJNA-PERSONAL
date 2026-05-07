import React from 'react';
import { Upload, Database, CheckCircle2, AlertCircle, Clock, ChevronRight } from 'lucide-react';

const MIGRATIONS = [
  { id: 1, title: 'Faculty Master Data (Phase 1)', status: 'Completed', count: '1,451 records', date: 'May 04, 2026', type: 'success' },
  { id: 2, title: 'Department Hierarchies', status: 'Completed', count: '42 units', date: 'May 04, 2026', type: 'success' },
  { id: 3, title: 'Student Enrollment Sync (Q1)', status: 'In Progress', count: '12,400 / 18,000', date: 'Running now', type: 'warning' },
];

export function DataMigration() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Data Migration</h1>
          <p className="text-gray-500 mt-1">Bulk import tools and external system synchronization logs.</p>
        </div>
        <div className="flex gap-3">
           <button className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all">
             Download Template
           </button>
           <button className="bg-primary text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
            <Upload size={18} />
            Bulk Import (CSV)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Syncs', val: '142', icon: <Database />, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Success Rate', val: '99.4%', icon: <CheckCircle2 />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Sync Conflicts', val: '3', icon: <AlertCircle />, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
             <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center`}>
               {stat.icon}
             </div>
             <div>
               <p className="text-xl font-black text-gray-900">{stat.val}</p>
               <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{stat.label}</p>
             </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100">
           <h3 className="font-bold text-gray-800 flex items-center gap-2">
             <Clock size={18} className="text-primary" />
             Recent Migration Jobs
           </h3>
        </div>
        <div className="divide-y divide-gray-50">
          {MIGRATIONS.map(job => (
            <div key={job.id} className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-2 h-2 rounded-full ${
                  job.type === 'success' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                }`} />
                <div>
                  <p className="text-sm font-bold text-gray-900">{job.title}</p>
                  <p className="text-[10px] text-gray-500 font-medium">{job.count} · {job.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                 <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md ${
                   job.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                 }`}>
                   {job.status}
                 </span>
                 <ChevronRight size={16} className="text-gray-300" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
