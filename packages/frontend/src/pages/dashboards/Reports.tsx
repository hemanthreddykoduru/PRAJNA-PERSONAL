import React from 'react';
import { FileText, Calendar, Building, BarChart, Award, GraduationCap, Building2, Download } from 'lucide-react';

const reports = [
  { id: 1, title: 'Faculty KPI Report', desc: 'Complete KPI scores and evidence summary', badge: 'Personal', color: 'bg-blue-500/20 text-blue-400', icon: FileText },
  { id: 2, title: 'Annual Performance Report', desc: 'Year-wise performance analysis', badge: 'Personal', color: 'bg-blue-500/20 text-blue-400', icon: Calendar },
  { id: 3, title: 'Department KPI Report', desc: 'Department-wide KPI aggregation', badge: 'Department', color: 'bg-purple-500/20 text-purple-400', icon: Building },
  { id: 4, title: 'Publication Report', desc: 'Research publications summary', badge: 'Research', color: 'bg-emerald-500/20 text-emerald-400', icon: BarChart },
  { id: 5, title: 'Patent Report', desc: 'Patents and IPR submissions', badge: 'Research', color: 'bg-emerald-500/20 text-emerald-400', icon: Award },
  { id: 6, title: 'Promotion Eligibility Report', desc: 'Readiness for next promotion', badge: 'Career', color: 'bg-orange-500/20 text-orange-400', icon: GraduationCap },
  { id: 7, title: 'Evidence Report', desc: 'All uploaded evidence with status', badge: 'Personal', color: 'bg-blue-500/20 text-blue-400', icon: FileText },
  { id: 8, title: 'NAAC Report', desc: 'NAAC accreditation contribution', badge: 'Institutional', color: 'bg-teal-500/20 text-teal-400', icon: Building2 },
];

export function Reports() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-bold text-text flex items-center gap-2">
           Reports
        </h1>
        <p className="text-textMuted mt-1">Generate and download performance reports</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-surface border border-border rounded-lg p-1 w-fit flex-wrap">
        <button className="px-4 py-1.5 bg-background text-text rounded-md font-medium text-sm shadow-sm">All</button>
        <button className="px-4 py-1.5 text-textMuted hover:text-text rounded-md font-medium text-sm">Personal</button>
        <button className="px-4 py-1.5 text-textMuted hover:text-text rounded-md font-medium text-sm">Department</button>
        <button className="px-4 py-1.5 text-textMuted hover:text-text rounded-md font-medium text-sm">Research</button>
        <button className="px-4 py-1.5 text-textMuted hover:text-text rounded-md font-medium text-sm">Career</button>
        <button className="px-4 py-1.5 text-textMuted hover:text-text rounded-md font-medium text-sm">Institutional</button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {reports.map((report) => (
          <div key={report.id} className="bg-surface border border-border rounded-2xl p-6 shadow-sm hover:border-primary/50 transition-colors">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-background border border-border flex items-center justify-center flex-shrink-0">
                <report.icon className="text-primary" size={24} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-text text-lg flex items-center gap-2">
                      {report.title}
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${report.color}`}>
                        {report.badge}
                      </span>
                    </h3>
                    <p className="text-textMuted text-sm mt-1">{report.desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-6">
                  <button className="flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors">
                    <Download size={16} />
                    PDF
                  </button>
                  <button className="flex items-center gap-1.5 bg-transparent hover:bg-white/5 text-text border border-border px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                    <Download size={16} />
                    Excel
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
