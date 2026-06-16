import React from 'react';
import { Target, Trophy, BarChart2, FileText } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function FacultyDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text flex items-center gap-2">
          Welcome back, {user?.name?.split(' ')[0] || 'Hemanth Reddy'} 👋
        </h1>
        <p className="text-textMuted mt-1">Here's your academic performance overview for 2024-25</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI Score */}
        <div className="bg-primary rounded-2xl p-6 shadow-lg shadow-primary/20 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <h3 className="text-white/80 text-xs font-bold uppercase tracking-wider">KPI Score</h3>
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Target size={16} className="text-white" />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-4xl font-black text-white">0<span className="text-2xl text-white/70 font-bold">/1000</span></h2>
            <p className="text-white/80 text-sm mt-1">Academic Year 2024-25</p>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="bg-white/20 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">↑ 12%</span>
            <span className="text-white/70 text-xs">vs last year</span>
          </div>
        </div>

        {/* Dept Rank */}
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <h3 className="text-textMuted text-xs font-bold uppercase tracking-wider">Dept. Rank</h3>
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <Trophy size={14} className="text-emerald-500" />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-4xl font-black text-text">#--</h2>
            <p className="text-textMuted text-sm mt-1">of 45 Faculty</p>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-bold px-2 py-1 rounded">↑ 5%</span>
            <span className="text-textMuted text-xs">positions up</span>
          </div>
        </div>

        {/* Percentile */}
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <h3 className="text-textMuted text-xs font-bold uppercase tracking-wider">Percentile</h3>
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <BarChart2 size={14} className="text-emerald-500" />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-4xl font-black text-text">--%</h2>
            <p className="text-textMuted text-sm mt-1">University-wide</p>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-bold px-2 py-1 rounded">↑ 8%</span>
            <span className="text-textMuted text-xs">improvement</span>
          </div>
        </div>

        {/* Pending */}
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <h3 className="text-textMuted text-xs font-bold uppercase tracking-wider">Pending</h3>
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <FileText size={14} className="text-emerald-500" />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-4xl font-black text-text">0</h2>
            <p className="text-textMuted text-sm mt-1">Evidence items</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface border border-border rounded-2xl p-6 h-80 shadow-sm flex flex-col">
          <h3 className="text-text font-bold mb-6 text-sm">KPI Score Trend</h3>
          <div className="flex-1 border-b border-l border-border/50 relative flex items-end ml-8">
            <div className="absolute top-0 -left-10 text-[10px] text-textMuted">1000 -</div>
            <div className="absolute top-1/4 -left-9 text-[10px] text-textMuted">750 -</div>
            <div className="absolute top-2/4 -left-9 text-[10px] text-textMuted">500 -</div>
            <div className="absolute top-3/4 -left-9 text-[10px] text-textMuted">250 -</div>
            <div className="absolute bottom-0 -left-6 text-[10px] text-textMuted">0 -</div>
            
            {/* Horizontal lines */}
            <div className="absolute top-0 left-0 w-full border-t border-dashed border-border/50"></div>
            <div className="absolute top-1/4 left-0 w-full border-t border-dashed border-border/50"></div>
            <div className="absolute top-2/4 left-0 w-full border-t border-dashed border-border/50"></div>
            <div className="absolute top-3/4 left-0 w-full border-t border-dashed border-border/50"></div>
          </div>
        </div>
        
        <div className="bg-surface border border-border rounded-2xl p-6 h-80 shadow-sm flex flex-col items-center justify-center">
          <h3 className="text-text font-bold self-start w-full text-sm">KPI Distribution</h3>
          {/* Radar chart mockup */}
          <div className="relative w-48 h-48 mt-4">
             <div className="absolute inset-0 border border-border/50 rounded-full" />
             <div className="absolute inset-4 border border-border/50 rounded-full" />
             <div className="absolute inset-8 border border-border/50 rounded-full" />
             <div className="absolute inset-12 border border-border/50 rounded-full" />
             
             {/* Lines */}
             <div className="absolute inset-0 flex items-center justify-center">
               <div className="w-full h-px bg-border/50 rotate-0" />
               <div className="w-full h-px bg-border/50 rotate-45" />
               <div className="w-full h-px bg-border/50 rotate-90" />
               <div className="w-full h-px bg-border/50 -rotate-45" />
             </div>
             
             {/* Labels */}
             <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] text-textMuted">Teaching</span>
             <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] text-textMuted">Prof. Dev.</span>
             <span className="absolute top-1/2 -left-10 -translate-y-1/2 text-[9px] text-textMuted">Admin</span>
             <span className="absolute top-1/2 -right-12 -translate-y-1/2 text-[9px] text-textMuted">Patents</span>
             <span className="absolute top-4 -right-8 text-[9px] text-textMuted">Research</span>
             <span className="absolute top-4 -left-10 text-[9px] text-textMuted">Industry</span>
             <span className="absolute bottom-4 -right-12 text-[9px] text-textMuted">Mentoring</span>
             <span className="absolute bottom-4 -left-12 text-[9px] text-textMuted">Outreach</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm min-h-[150px]">
          <h3 className="text-text font-bold text-sm">Quick Actions</h3>
        </div>
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm min-h-[150px]">
          <h3 className="text-text font-bold text-sm">Recent Activities</h3>
        </div>
      </div>
    </div>
  );
}
