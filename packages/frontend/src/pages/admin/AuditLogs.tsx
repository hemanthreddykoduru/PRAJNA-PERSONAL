import React from 'react';
import { Shield, Search, Terminal, AlertCircle, Info, Filter } from 'lucide-react';

const LOGS = [
  { id: 1, action: 'User Permissions Changed', user: 'admin_sys', detail: 'ramesh.iyer@gitam.edu — Role changed from Faculty to HoD', time: '2 mins ago', type: 'info' },
  { id: 2, action: 'Bulk Import Started', user: 'admin_sys', detail: 'Importing student_master_q2.csv (18,000 records)', time: '15 mins ago', type: 'warning' },
  { id: 3, action: 'Security Policy Update', user: 'system_root', detail: 'Forced SSO Login enabled globally', time: '1 hour ago', type: 'info' },
  { id: 4, action: 'Failed Login Attempt', user: 'unknown', detail: 'IP 192.168.1.1 — 3 failed attempts for user@gitam.edu', time: '3 hours ago', type: 'error' },
];

export function AuditLogs() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Audit Logs</h1>
          <p className="text-gray-500 mt-1">Immutable history of all administrative actions and security events.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all">
          <Terminal size={18} />
          Live Stream (Console)
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4">
           <div className="flex-1 relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
             <input type="text" placeholder="Search logs by action, user or details..." className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20" />
           </div>
           <div className="flex gap-2">
             <button className="p-2 border border-gray-100 rounded-xl hover:bg-gray-50 text-gray-400">
               <Filter size={20} />
             </button>
           </div>
        </div>

        <div className="divide-y divide-gray-50">
          {LOGS.map(log => (
            <div key={log.id} className="p-5 flex items-start gap-4 hover:bg-gray-50/50 transition-colors">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                log.type === 'error' ? 'bg-red-50 text-red-500' : 
                log.type === 'warning' ? 'bg-amber-50 text-amber-500' : 'bg-blue-50 text-blue-500'
              }`}>
                {log.type === 'error' ? <AlertCircle size={20} /> : <Shield size={20} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-bold text-gray-900">{log.action}</h4>
                  <span className="text-[10px] text-gray-400 font-bold font-mono">{log.time}</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed mb-2">{log.detail}</p>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Performed by</span>
                  <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-bold font-mono">{log.user}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
