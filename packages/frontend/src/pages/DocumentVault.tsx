import React, { useState, useRef } from 'react';
import { FileText, Upload, Shield, Clock, Download, Trash2, Search, Filter, Lock, CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiRequest } from '../utils/api';

const DOCUMENTS = [
  { id: 1, name: 'Journal_Publication_Scopus.pdf', category: 'Criteria 3: Research', size: '1.2 MB', date: 'Oct 12, 2023', verified: true },
  { id: 2, name: 'FDP_Certificate_AI_Ethics.jpg', category: 'Criteria 6: Governance', size: '2.4 MB', date: 'Nov 05, 2023', verified: true },
  { id: 3, name: 'Patent_Filling_Copy_2023.pdf', category: 'Criteria 3: Research', size: '4.1 MB', date: 'Yesterday', verified: false },
  { id: 4, name: 'Student_Feedback_Analysis.xlsx', category: 'Criteria 1: Curricular', size: '0.8 MB', date: 'Last week', verified: true },
];

export function DocumentVault() {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocuments = async () => {
    try {
      const data = await apiRequest('/documents');
      setDocuments(data);
    } catch (err) {
      console.error("Failed to fetch documents:", err);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.sub) return;

    setIsUploading(true);
    try {
      // 1. Get Presigned URL (and save metadata)
      const { uploadUrl, key } = await apiRequest('/documents/upload-url', {
        method: 'POST',
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          fileSize: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
          module: 'vault'
        })
      });

      // 2. Upload directly to S3
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type }
      });

      if (!uploadRes.ok) throw new Error('S3 Upload failed');
      
      await fetchDocuments(); // Refresh list
      alert(`Success: Evidence "${file.name}" uploaded to PRAJNA Vault.`);
    } catch (err: any) {
      console.error(err);
      alert("Upload failed: " + err.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        onChange={handleFileUpload}
      />
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Document Vault</h1>
          <p className="text-gray-500 mt-1 font-medium">Encrypted evidence storage for NAAC/NIRF accreditation.</p>
        </div>
        <div className="flex gap-3">
           <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 shadow-sm shadow-emerald-500/5">
             <Shield size={14} className="animate-pulse" />
             AES-256 Secured
           </div>
           <button 
             onClick={() => fileInputRef.current?.click()}
             disabled={isUploading}
             className="bg-primary text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
           >
            {isUploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
            {isUploading ? 'Syncing...' : 'Upload Evidence'}
          </button>
        </div>
      </div>

      {/* Storage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { 
            label: 'Total Files', 
            val: isLoading ? '...' : documents.length.toString(), 
            icon: <FileText />, 
            color: 'text-blue-600', 
            bg: 'bg-blue-50' 
          },
          { 
            label: 'Storage Used', 
            val: isLoading ? '...' : (documents.reduce((acc, doc) => acc + (parseFloat(doc.fileSize) || 0), 0)).toFixed(2) + ' MB', 
            icon: <Shield />, 
            color: 'text-violet-600', 
            bg: 'bg-violet-50' 
          },
          { 
            label: 'Verified Evidence', 
            val: isLoading ? '...' : documents.filter(d => d.status === 'VERIFIED').length.toString(), 
            icon: <CheckCircle2 />, 
            color: 'text-emerald-600', 
            bg: 'bg-emerald-50' 
          },
          { 
            label: 'Pending Audit', 
            val: isLoading ? '...' : documents.filter(d => d.status !== 'VERIFIED').length.toString(), 
            icon: <Clock />, 
            color: 'text-amber-600', 
            bg: 'bg-amber-50' 
          },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm flex items-center gap-5 group hover:border-primary/20 hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300">
             <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
               {stat.icon}
             </div>
             <div>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.15em] mb-0.5">{stat.label}</p>
                <p className="text-2xl font-black text-gray-900 tracking-tight">{stat.val}</p>
             </div>
          </div>
        ))}
      </div>

      {/* File Explorer */}
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
        <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" placeholder="Search evidence vault..." className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all" />
          </div>
          <button className="p-3 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 text-gray-400 transition-all shadow-sm">
             <Filter size={20} />
          </button>
        </div>

        <table className="w-full text-left">
          <thead className="bg-white text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50">
            <tr>
              <th className="px-8 py-5">Evidence Name</th>
              <th className="px-8 py-5 text-center">NAAC Criteria</th>
              <th className="px-8 py-5 text-center">Size</th>
              <th className="px-8 py-5 text-center">Status</th>
              <th className="px-8 py-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-8 py-20 text-center">
                  <Loader2 className="animate-spin mx-auto text-primary mb-4" size={32} />
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Opening Secure Vault...</p>
                </td>
              </tr>
            ) : documents.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-8 py-20 text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
                    <Shield size={32} className="text-gray-200" />
                  </div>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Vault is Empty</p>
                  <p className="text-xs text-gray-400 mt-1">Upload your first evidence to begin.</p>
                </td>
              </tr>
            ) : documents.map((doc, idx) => (
              <tr key={doc.SK} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-primary/10 text-primary rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                      <FileText size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-gray-900 group-hover:text-primary transition-colors">{doc.fileName}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">
                        {new Date(doc.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6 text-center">
                   <span className="text-[10px] font-black text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full uppercase tracking-widest border border-gray-200/50">
                     {doc.module?.toUpperCase() || 'GENERAL'}
                   </span>
                </td>
                <td className="px-8 py-6 text-center text-xs font-bold text-gray-500">{doc.fileSize}</td>
                <td className="px-8 py-6 text-center">
                  {doc.status === 'VERIFIED' ? (
                    <div className="flex items-center justify-center gap-1.5 text-emerald-500 text-[10px] font-black uppercase tracking-widest bg-emerald-50/50 py-1.5 rounded-full border border-emerald-100">
                      <CheckCircle2 size={12} />
                      Verified
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-1.5 text-amber-500 text-[10px] font-black uppercase tracking-widest bg-amber-50/50 py-1.5 rounded-full border border-amber-100">
                      <Clock size={12} />
                      Pending
                    </div>
                  )}
                </td>
                <td className="px-8 py-6 text-right">
                   <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button className="p-2.5 bg-white border border-gray-100 hover:border-primary hover:text-primary text-gray-400 rounded-xl transition-all shadow-sm">
                       <Download size={16} />
                     </button>
                     <button className="p-2.5 bg-white border border-gray-100 hover:border-red-500 hover:text-red-500 text-gray-400 rounded-xl transition-all shadow-sm">
                       <Trash2 size={16} />
                     </button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* NAAC Integration Banner */}
      <div className="bg-primary rounded-[32px] p-10 text-white flex items-center justify-between shadow-2xl shadow-primary/20 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:scale-150 transition-transform duration-700" />
        <div className="flex items-center gap-8 relative z-10">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-[24px] flex items-center justify-center border border-white/20 shadow-inner">
            <Shield size={40} className="text-secondary animate-bounce-slow" />
          </div>
          <div>
            <h3 className="text-2xl font-black tracking-tight">Inspection Readiness</h3>
            <p className="text-white/70 text-sm mt-1 font-medium">128 verified documents are automatically linked to the 7 NAAC criteria.</p>
          </div>
        </div>
        <button className="bg-white text-primary px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-secondary hover:text-white transition-all shadow-xl shadow-black/10 relative z-10">
          Generate NAAC Portfolio
        </button>
      </div>
    </div>
  );
}
