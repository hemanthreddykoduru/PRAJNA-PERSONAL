import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Eye, AlertCircle, MessageSquare } from 'lucide-react';
import { apiRequest } from '../utils/api';

interface PendingApproval {
  PK: string;
  SK: string;
  id: string;
  title: string;
  journal?: string;
  year?: number;
  authors?: string[];
  submittedAt: string;
  facultyId: string;
  type: string;
}

const ApprovalsPage: React.FC = () => {
  const [items, setItems] = useState<PendingApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApprovals = async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/approvals');
      setItems(data.map((item: any) => ({
          ...item,
          id: item.SK.split('#').pop() // Extract ID from SK STATUS#PENDING#<id>
      })));
      setError(null);
    } catch (err: any) {
      console.error('Fetch Approvals Error:', err);
      setError('Failed to load approval queue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleDecision = async (item: PendingApproval, action: 'APPROVED' | 'REJECTED') => {
    const comment = action === 'REJECTED' 
        ? prompt(`Reason for rejection for "${item.title}":`) 
        : `Approved by HoD on ${new Date().toLocaleDateString()}`;

    if (action === 'REJECTED' && comment === null) return; // User cancelled prompt

    try {
      await apiRequest(`/approvals/${item.id}/action`, {
        method: 'POST',
        body: JSON.stringify({ action, comment })
      });
      
      // Optimistic UI update
      setItems(items.filter(i => i.id !== item.id));
      alert(`Success: ${item.title} has been ${action.toLowerCase()}.`);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Approval Queue</h1>
          <p className="text-gray-500 mt-1 font-medium italic">PRAJNA Intelligence · Department Level Access</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-2xl text-xs font-bold border border-emerald-100 flex items-center gap-2">
            <CheckCircle size={14} />
            Verified Items
          </div>
          <div className="bg-amber-50 text-amber-700 px-4 py-2 rounded-2xl text-xs font-bold border border-amber-100 flex items-center gap-2">
            <Clock size={14} />
            {items.length} Pending
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
        <div className="p-8 border-b border-gray-50 bg-gray-50/30 flex justify-between items-center">
          <h2 className="text-lg font-black text-primary flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <Clock className="w-5 h-5" />
            </div>
            Active Requests
          </h2>
          <button 
            onClick={fetchApprovals}
            className="text-xs font-bold text-gray-400 hover:text-primary transition-colors uppercase tracking-widest"
          >
            Refresh Queue
          </button>
        </div>

        {loading ? (
          <div className="p-24 text-center">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Fetching cloud data...</p>
          </div>
        ) : error ? (
            <div className="p-24 text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4 opacity-20" />
                <p className="text-gray-500 font-bold">{error}</p>
                <button onClick={fetchApprovals} className="mt-4 text-primary font-bold text-sm underline">Try Again</button>
            </div>
        ) : items.length === 0 ? (
          <div className="p-24 text-center">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-emerald-500" />
            </div>
            <p className="text-gray-900 font-black text-xl">All Clear!</p>
            <p className="text-gray-500 mt-1">No pending approvals for your department.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Submission Details</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Faculty Member</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Category</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Review Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {items.map((item) => (
                  <tr key={item.id} className="group hover:bg-gray-50/80 transition-all duration-300">
                    <td className="px-8 py-6">
                      <div className="font-bold text-gray-900 text-base leading-tight group-hover:text-primary transition-colors">{item.title}</div>
                      <div className="text-gray-400 mt-1 flex items-center gap-2">
                        {item.journal && <><span className="font-bold text-gray-500">{item.journal}</span> •</>}
                        <span>Submitted {new Date(item.submittedAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-white font-black text-sm shadow-lg shadow-primary/20">
                          {item.facultyId.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div className="font-bold text-gray-900">{item.facultyId.split('@')[0]}</div>
                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{item.facultyId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
                        {item.type || 'Research'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleDecision(item, 'APPROVED')}
                          className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-black shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </button>
                        <button 
                          onClick={() => handleDecision(item, 'REJECTED')}
                          className="flex items-center gap-2 bg-white text-red-500 border border-red-100 px-4 py-2 rounded-xl text-xs font-black hover:bg-red-50 active:scale-95 transition-all"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <div className="bg-gradient-to-br from-primary/5 to-transparent p-8 rounded-[32px] border border-primary/10 relative overflow-hidden">
           <MessageSquare className="absolute -right-4 -bottom-4 text-primary/5 w-32 h-32 rotate-12" />
           <AlertCircle className="text-primary w-8 h-8 mb-4" />
           <h3 className="font-black text-gray-900 text-lg mb-2">Did you know?</h3>
           <p className="text-sm text-gray-500 leading-relaxed font-medium">
             Your decisions impact the **Departmental Rankings** and **Campus Metrics** in real-time. Verify with care!
           </p>
        </div>
      </div>
    </div>
  );
};

export default ApprovalsPage;
