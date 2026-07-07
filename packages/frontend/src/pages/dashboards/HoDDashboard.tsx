import React, { useState } from 'react';
import { Users, CheckSquare, Clock, AlertTriangle, TrendingUp, Trophy, ArrowUpRight, Check, X, Sparkles, ShieldAlert, BarChart3, Search, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

const initialFaculty = [
  { name: 'Dr. Priya Sharma', score: 92, tier: 'Platinum', pending: 2, status: 'active', workload: 16, deptRank: 1, avatar: 'PS' },
  { name: 'Prof. Suresh Kumar', score: 84, tier: 'Platinum', pending: 0, status: 'active', workload: 12, deptRank: 2, avatar: 'SK' },
  { name: 'Prof. Ramesh Iyer', score: 58, tier: 'Silver', pending: 0, status: 'active', workload: 18, deptRank: 3, avatar: 'RI' },
  { name: 'Dr. Anita Rao', score: 38, tier: 'Bronze', pending: 1, status: 'attention', workload: 8, deptRank: 4, avatar: 'AR' },
];

const initialApprovals = [
  { id: 1, faculty: 'Dr. Priya Sharma', type: 'Research', title: 'Deep Learning in Healthcare Outcomes', venue: 'Scientific Reports', date: '2 days ago', cost: '—' },
  { id: 2, faculty: 'Dr. Anita Rao', type: 'FDP Certification', title: 'AI in Engineering Curriculum', venue: 'GITAM Academy Workshop', date: '4 days ago', cost: '—' },
];

export function HoDDashboard() {
  const { user } = useAuth();
  const [facultyList, setFacultyList] = useState(initialFaculty);
  const [approvals, setApprovals] = useState(initialApprovals);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'attention' | 'platinum'>('all');

  const handleApprove = (id: number) => {
    // Smoothly remove approved item
    setApprovals(prev => prev.filter(item => item.id !== id));
  };

  const handleReject = (id: number) => {
    setApprovals(prev => prev.filter(item => item.id !== id));
  };

  const filteredFaculty = facultyList.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (filterType === 'attention') return matchesSearch && f.status === 'attention';
    if (filterType === 'platinum') return matchesSearch && f.tier === 'Platinum';
    return matchesSearch;
  });

  const departmentAverage = Math.round(
    facultyList.reduce((acc, f) => acc + f.score, 0) / facultyList.length
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      
      {/* Premium Dashboard Header */}
      <motion.div 
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EDEDED] pb-6"
      >
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-[#007366]/10 text-[#007366] text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-xl">
              {user?.campus || 'Bengaluru'} Campus
            </span>
            <span className="text-gray-400 text-xs font-semibold">Department Management Portal</span>
          </div>
          <h1 className="text-3xl font-black text-[#1A1A1A] tracking-tight">Department Commander</h1>
          <p className="text-gray-500 mt-1.5 font-medium">
            Reviewing <span className="text-[#007366] font-bold">{user?.department || 'CSE'}</span> department operations & compliance records.
          </p>
        </div>

        {/* Action summary badge */}
        <div className="bg-[#F0E0C1]/50 border border-[#F0E0C1] p-4 rounded-3xl flex items-center gap-3">
          <div className="w-10 h-10 bg-[#007366] rounded-2xl flex items-center justify-center text-white shadow-md">
            <Sparkles size={18} />
          </div>
          <div>
            <p className="text-[11px] text-[#007366] font-black uppercase tracking-wider">AI Operations Health</p>
            <p className="text-sm font-extrabold text-[#1A1A1A] mt-0.5">Continuous Compliance Active</p>
          </div>
        </div>
      </motion.div>

      {/* Stats Counter Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Faculty', value: facultyList.length, icon: <Users size={18} />, color: 'text-[#007366]', bg: 'bg-[#007366]/5' },
          { label: 'Pending Approvals', value: approvals.length, icon: <Clock size={18} />, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Needing Attention', value: facultyList.filter(f => f.status === 'attention').length, icon: <AlertTriangle size={18} />, color: 'text-[#E33A0C]', bg: 'bg-red-50' },
          { label: 'Dept Average Score', value: `${departmentAverage} / 100`, icon: <TrendingUp size={18} />, color: 'text-violet-600', bg: 'bg-violet-50' },
        ].map((stat, idx) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: idx * 0.05 }}
            className="bg-white rounded-3xl p-5 border border-[#EDEDED] shadow-lg flex flex-col justify-between"
          >
            <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-3xl font-black text-[#1A1A1A] tracking-tighter leading-none">{stat.value}</p>
              <p className="text-xs text-gray-400 mt-2 font-semibold">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Dynamic Approval Queue (Hemanth Reddy Module 25) */}
        <div className="bg-white rounded-3xl border border-[#EDEDED] shadow-xl overflow-hidden lg:col-span-2 flex flex-col justify-between min-h-[480px]">
          <div>
            <div className="p-6 border-b border-[#EDEDED] flex items-center justify-between">
              <div>
                <h2 className="font-extrabold text-[#1A1A1A] text-lg tracking-tight flex items-center gap-2">
                  <CheckSquare size={20} className="text-amber-500" />
                  Departmental Approval Queue
                </h2>
                <p className="text-xs text-gray-400 mt-1">Reviewing publications, grants, and FDP certificates before score sync</p>
              </div>
              <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-xl text-xs font-black">
                {approvals.length} Pending
              </span>
            </div>

            <div className="divide-y divide-[#EDEDED] max-h-[380px] overflow-y-auto">
              <AnimatePresence initial={false}>
                {approvals.length > 0 ? (
                  approvals.map(item => (
                    <motion.div 
                      key={item.id}
                      initial={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0, padding: 0 }}
                      transition={{ duration: 0.3 }}
                      className="p-6 hover:bg-gray-50/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                            item.type === 'Research' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                          }`}>
                            {item.type}
                          </span>
                          <span className="text-gray-300 text-[10px]">·</span>
                          <span className="text-xs text-gray-400 font-semibold">{item.date}</span>
                        </div>
                        <h4 className="font-extrabold text-[#1A1A1A] text-sm mt-2 leading-snug">{item.title}</h4>
                        <p className="text-xs text-gray-500 mt-1 font-semibold">Submitted by: <span className="text-gray-800 font-bold">{item.faculty}</span></p>
                        <p className="text-[11px] text-gray-400 mt-1">{item.venue}</p>
                      </div>

                      <div className="flex items-center gap-3 self-end md:self-center">
                        <button 
                          onClick={() => handleApprove(item.id)}
                          className="px-4 py-2 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-xl text-xs font-black flex items-center gap-1.5 transition-colors"
                        >
                          <Check size={14} /> Approve
                        </button>
                        <button 
                          onClick={() => handleReject(item.id)}
                          className="px-4 py-2 bg-red-50 hover:bg-red-100 text-[#E33A0C] rounded-xl text-xs font-black flex items-center gap-1.5 transition-colors"
                        >
                          <X size={14} /> Reject
                        </button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-12 text-center text-gray-400 flex flex-col items-center justify-center gap-2"
                  >
                    <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center">
                      ✓
                    </div>
                    <p className="font-bold text-gray-700 text-sm">All Clear!</p>
                    <p className="text-xs text-gray-400 max-w-xs">No pending publication or certification approvals remaining in your queue.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="p-5 border-t border-[#EDEDED] bg-gray-50/50 flex justify-between items-center">
            <a href="/dashboard/hod/approvals" className="text-[#007366] text-xs font-black flex items-center gap-1.5 hover:underline">
              Enter Advanced Review Portal <ArrowUpRight size={14} />
            </a>
            <span className="text-[10px] text-gray-400 font-semibold italic flex items-center gap-1">
              <Sparkles size={11} className="text-[#007366]" /> Synced with central UGC accreditation
            </span>
          </div>
        </div>

        {/* Faculty Ranking Overview & Action Status */}
        <div className="bg-white rounded-3xl border border-[#EDEDED] shadow-xl p-6 flex flex-col justify-between min-h-[480px]">
          <div>
            <div className="mb-6">
              <h3 className="font-extrabold text-[#1A1A1A] text-lg tracking-tight flex items-center gap-2">
                <Trophy size={20} className="text-[#007366]" />
                Faculty Performance Tracker
              </h3>
              <p className="text-xs text-gray-400 mt-1">Live ranking based on active research, credentials, and compliance logs</p>
            </div>

            {/* Filter and Search */}
            <div className="space-y-3 mb-6">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-3 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search faculty..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-50/70 border border-[#EDEDED] focus:border-[#007366] focus:bg-white rounded-2xl py-2 pl-9 pr-4 text-xs font-semibold text-gray-700 outline-none transition-all"
                />
              </div>
              
              <div className="flex gap-2">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'attention', label: 'Alerts' },
                  { id: 'platinum', label: 'Platinum' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setFilterType(tab.id as any)}
                    className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${
                      filterType === tab.id 
                        ? 'bg-[#007366] text-white border-[#007366]' 
                        : 'border-[#EDEDED] text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Faculty List */}
            <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1">
              {filteredFaculty.map(f => (
                <div key={f.name} className="flex items-center gap-3 hover:bg-gray-50/50 p-2 rounded-2xl transition-colors">
                  <div className="w-10 h-10 rounded-2xl bg-[#007366]/5 text-[#007366] border border-[#EDEDED] font-extrabold flex items-center justify-center text-xs flex-shrink-0">
                    {f.avatar}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="font-extrabold text-[#1A1A1A] text-xs truncate leading-none">{f.name}</p>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                        f.status === 'attention' 
                          ? 'bg-red-50 text-[#E33A0C] border border-red-100' 
                          : 'bg-primary-50 text-primary-700 border border-primary-100'
                      }`}>
                        {f.tier}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full bg-[#007366]" style={{ width: `${f.score}%` }} />
                      </div>
                      <span className="text-[10px] font-extrabold text-gray-500 w-6 text-right">{f.score}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 border-t border-[#EDEDED] pt-4">
            <a href="/dashboard/hod/faculty" className="w-full bg-[#007366]/5 hover:bg-[#007366]/10 text-[#007366] py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all">
              Manage All Faculty Accounts
            </a>
          </div>
        </div>

      </div>

      {/* Credit Hour Workload Balance Monitor (SVG Chart) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-3xl p-6 border border-[#EDEDED] shadow-xl"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-extrabold text-[#1A1A1A] text-lg tracking-tight flex items-center gap-2">
              <BarChart3 size={20} className="text-[#007366]" />
              Workload Allocation Balance
            </h3>
            <p className="text-xs text-gray-400 mt-1">Comparing active semester credit hours per faculty member (Ideal limit: 12-16 credits)</p>
          </div>

          {/* Alert Status */}
          <div className="bg-red-50 border border-red-100 px-4 py-2.5 rounded-2xl flex items-center gap-2 self-start">
            <ShieldAlert size={16} className="text-[#E33A0C]" />
            <span className="text-xs text-[#E33A0C] font-extrabold">1 Faculty Overloaded</span>
          </div>
        </div>

        {/* Workload horizontal chart list */}
        <div className="space-y-4">
          {facultyList.map(f => {
            const percentage = (f.workload / 20) * 100;
            const isOverloaded = f.workload > 16;
            const isUnderloaded = f.workload < 10;
            
            let barColor = 'bg-[#007366]';
            if (isOverloaded) barColor = 'bg-[#E33A0C]';
            if (isUnderloaded) barColor = 'bg-amber-500';

            return (
              <div key={f.name} className="flex flex-col md:flex-row md:items-center justify-between gap-2 border border-gray-50 p-3.5 rounded-2xl">
                <div className="w-48 flex-shrink-0">
                  <p className="font-extrabold text-[#1A1A1A] text-xs leading-none">{f.name}</p>
                  <span className="text-[10px] text-gray-400 font-semibold mt-1 inline-block">Rank: {f.deptRank} in department</span>
                </div>
                
                <div className="flex-1 flex items-center gap-4">
                  <div className="flex-1 bg-gray-100 rounded-full h-3.5 relative overflow-hidden">
                    {/* Progress Fill */}
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${barColor}`} 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-xs font-black text-gray-700 w-16 flex-shrink-0">{f.workload} Credits</span>
                </div>

                <div className="w-24 text-right flex-shrink-0">
                  <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                    isOverloaded 
                      ? 'bg-red-50 text-[#E33A0C]' 
                      : isUnderloaded 
                      ? 'bg-amber-50 text-amber-600' 
                      : 'bg-primary-50 text-primary-600'
                  }`}>
                    {isOverloaded ? 'Overload' : isUnderloaded ? 'Underload' : 'Balanced'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

    </div>
  );
}
