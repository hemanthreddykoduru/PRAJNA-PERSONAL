import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  FileText, 
  User, 
  Calendar, 
  Search,
  Filter,
  ChevronRight,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { facultyApi } from '../utils/api';

interface PendingItem {
  PK: string;
  SK: string;
  title: string;
  journal?: string;
  authors?: string[];
  submittedAt: string;
  status: string;
  facultyId: string;
  doi?: string;
}

const ApprovalsPage: React.FC = () => {
  const [items, setItems] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingItems();
  }, []);

  const fetchPendingItems = async () => {
    try {
      const data = await (facultyApi as any).get('/approvals');
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch approvals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (item: PendingItem, action: 'APPROVED' | 'REJECTED') => {
    setProcessingId(item.SK);
    try {
      await (facultyApi as any).post(`/approvals/${encodeURIComponent(item.SK)}/action`, {
        pk: item.PK,
        sk: item.SK,
        action
      });
      // Optimistic Update
      setItems(prev => prev.filter(i => i.SK !== item.SK));
    } catch (err) {
      console.error('Action failed:', err);
      alert('Failed to process approval. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.facultyId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Approvals Command Centre</h1>
          <p className="text-gray-500 mt-1 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#007366]" />
            Verify and validate faculty research contributions
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text"
              placeholder="Search faculty or title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#007366]/20 focus:border-[#007366] transition-all w-64 outline-none"
            />
          </div>
          <button className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <Filter className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { label: 'Pending Reviews', value: items.length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Verified Today', value: 12, icon: CheckCircle, color: 'text-[#007366]', bg: 'bg-[#007366]/5' },
          { label: 'Avg. Turnaround', value: '4.2h', icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' }
        ].map((stat, i) => (
          <div key={i} className={`${stat.bg} p-6 rounded-2xl border border-white shadow-sm flex items-center justify-between`}>
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color} mt-1`}>{stat.value}</p>
            </div>
            <stat.icon className={`w-8 h-8 ${stat.color} opacity-40`} />
          </div>
        ))}
      </div>

      {/* Approval List */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
          <h2 className="font-bold text-gray-800">Review Queue</h2>
          <span className="px-3 py-1 bg-[#007366] text-white text-xs font-bold rounded-full">
            {filteredItems.length} REQUESTS
          </span>
        </div>

        <div className="divide-y divide-gray-50">
          <AnimatePresence mode="popLayout">
            {loading ? (
              <div className="p-20 flex flex-col items-center justify-center text-gray-400">
                <div className="w-12 h-12 border-4 border-[#007366] border-t-transparent rounded-full animate-spin mb-4" />
                <p>Loading queue...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="p-20 flex flex-col items-center justify-center text-gray-400">
                <CheckCircle className="w-16 h-16 opacity-10 mb-4" />
                <p className="text-lg font-medium text-gray-500">Inbox Zero!</p>
                <p className="text-sm">All pending research submissions have been processed.</p>
              </div>
            ) : (
              filteredItems.map((item) => (
                <motion.div
                  key={item.SK}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className="p-8 hover:bg-gray-50/50 transition-colors group"
                >
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Item Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase rounded">
                          RESEARCH PUB
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <User className="w-3 h-3" />
                          {item.facultyId}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          {new Date(item.submittedAt).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#007366] transition-colors leading-snug mb-2">
                        {item.title}
                      </h3>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-gray-400" />
                          {item.journal}
                        </div>
                        {item.doi && (
                          <span className="text-[#007366] font-mono text-xs">DOI: {item.doi}</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleAction(item, 'REJECTED')}
                        disabled={processingId === item.SK}
                        className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-2xl hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all disabled:opacity-50"
                      >
                        <XCircle className="w-5 h-5" />
                        Reject
                      </button>
                      <button
                        onClick={() => handleAction(item, 'APPROVED')}
                        disabled={processingId === item.SK}
                        className="flex items-center gap-2 px-8 py-3 bg-[#007366] text-white font-bold rounded-2xl hover:bg-[#00594C] shadow-lg shadow-[#007366]/20 transition-all disabled:opacity-50 transform hover:-translate-y-0.5"
                      >
                        {processingId === item.SK ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <CheckCircle className="w-5 h-5" />
                        )}
                        Approve Publication
                      </button>
                      <button className="p-3 text-gray-400 hover:text-gray-600 transition-colors">
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ApprovalsPage;
