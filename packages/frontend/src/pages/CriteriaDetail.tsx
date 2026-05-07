import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, FileText, CheckCircle2, AlertCircle, ExternalLink, Shield } from 'lucide-react';

const CRITERIA_DATA: Record<string, any> = {
  '1': { title: 'Curricular Aspects', score: 85, evidenceCount: 142, status: 'Ready' },
  '2': { title: 'Teaching-Learning & Evaluation', score: 92, evidenceCount: 850, status: 'Ready' },
  '3': { title: 'Research, Innovations & Extension', score: 78, evidenceCount: 312, status: 'Needs Review' },
  '4': { title: 'Infrastructure & Learning Resources', score: 95, evidenceCount: 120, status: 'Ready' },
  '5': { title: 'Student Support & Progression', score: 88, evidenceCount: 430, status: 'Ready' },
  '6': { title: 'Governance, Leadership & Management', score: 82, evidenceCount: 95, status: 'Needs Review' },
  '7': { title: 'Institutional Values & Best Practices', score: 90, evidenceCount: 64, status: 'Ready' },
};

const SAMPLE_EVIDENCE = [
  { id: 1, faculty: 'Dr. Ramesh Iyer', department: 'CSE', document: 'Journal_Publication_Scopus.pdf', date: 'Oct 12, 2023', type: 'Research Paper' },
  { id: 2, faculty: 'Dr. Priya Sharma', department: 'ECE', document: 'Patent_Filling_Copy.pdf', date: 'Nov 05, 2023', type: 'Patent' },
  { id: 3, faculty: 'Prof. Ankit Verma', department: 'CSE', document: 'Research_Grant_Proposal.pdf', date: 'Dec 01, 2023', type: 'Grant' },
];

export function CriteriaDetail() {
  const { id } = useParams();
  const criteria = CRITERIA_DATA[id || '3'];

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Link to="/dashboard/iqac" className="flex items-center gap-2 text-primary font-bold text-sm hover:translate-x-[-4px] transition-transform">
        <ChevronLeft size={18} />
        Back to Command Center
      </Link>

      {/* Header Card */}
      <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm flex justify-between items-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-primary text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
              Criteria {id}
            </span>
            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${
              criteria.status === 'Ready' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
            }`}>
              {criteria.status}
            </span>
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">{criteria.title}</h1>
          <p className="text-gray-500 mt-2 max-w-xl">
            Live aggregation of all institutional evidence supporting NAAC Criteria {id}. Data is synced in real-time from faculty activity logs.
          </p>
        </div>

        <div className="text-right relative z-10">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Criteria Score</p>
          <div className="text-6xl font-black text-primary">{criteria.score}<span className="text-xl text-gray-300">/100</span></div>
        </div>
      </div>

      {/* Evidence Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
           <h3 className="font-bold text-gray-800 flex items-center gap-2">
             <Shield size={20} className="text-primary" />
             Verified Evidence Log ({criteria.evidenceCount} Files)
           </h3>
           <div className="flex gap-2">
              <button className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold shadow-lg shadow-primary/20">
                Download Audit Report
              </button>
           </div>
        </div>
        
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
            <tr>
              <th className="px-6 py-4">Faculty Member</th>
              <th className="px-6 py-4">Evidence Type</th>
              <th className="px-6 py-4">Document</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4 text-right">Verification</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {SAMPLE_EVIDENCE.map(item => (
              <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-bold text-gray-900">{item.faculty}</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{item.department}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-[10px] font-black text-primary bg-primary/5 px-2 py-1 rounded-md uppercase tracking-wider">
                    {item.type}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors cursor-pointer">
                    <FileText size={16} />
                    <span className="text-xs font-bold">{item.document}</span>
                    <ExternalLink size={12} className="text-gray-300" />
                  </div>
                </td>
                <td className="px-6 py-4 text-xs font-bold text-gray-500">{item.date}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end items-center gap-2 text-emerald-500 font-black text-[10px] uppercase tracking-widest">
                    <CheckCircle2 size={14} />
                    Verified
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Empty State / Pagination */}
        <div className="p-8 border-t border-gray-50 bg-gray-50/30 flex flex-col items-center">
           <AlertCircle size={32} className="text-gray-300 mb-3" />
           <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Showing 3 of {criteria.evidenceCount} documents</p>
           <button className="mt-4 text-primary font-bold text-sm hover:underline">
             View All Documents
           </button>
        </div>
      </div>
    </div>
  );
}
