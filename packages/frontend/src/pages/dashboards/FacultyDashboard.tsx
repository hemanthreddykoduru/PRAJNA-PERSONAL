import React, { useEffect, useState } from 'react';
import { Target, Trophy, BarChart2, FileText, CheckCircle2, Clock, ChevronRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { facultyApi } from '../../utils/api';

export function FacultyDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    facultyApi.getProfile()
      .then(setProfile)
      .catch((err) => {
        console.error("Failed to fetch profile from AWS API", err);
        setProfile(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const kpiScore = profile?.prajnaScore ?? 0;
  const deptRank = profile?.deptRank ?? '--';
  const percentile = profile?.percentile ?? '--';
  const pendingItems = profile?.pendingItems ?? 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text flex items-center gap-2">
          Welcome back, {user?.name?.split(' ')[0] || 'Hemanth Reddy'} 👋
        </h1>
        <p className="text-textMuted mt-1">Here's your academic performance overview for 2024-25</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* PRAJNA Score */}
        <div className="bg-primary rounded-2xl p-6 shadow-lg shadow-primary/20 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <h3 className="text-white/80 text-xs font-bold uppercase tracking-wider">PRAJNA Score</h3>
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Target size={16} className="text-white" />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-4xl font-black text-white">
              {loading ? '...' : kpiScore}
              <span className="text-2xl text-white/70 font-bold">/1000</span>
            </h2>
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
            <h2 className="text-4xl font-black text-text">#{loading ? '--' : deptRank}</h2>
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
            <h2 className="text-4xl font-black text-text">{loading ? '--' : percentile}%</h2>
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
            <h2 className="text-4xl font-black text-text">{loading ? '-' : pendingItems}</h2>
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
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Today's Priorities */}
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm min-h-[300px] flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-text font-bold text-base flex items-center gap-2">
              <AlertCircle size={18} className="text-accent" />
              Today's Priorities
            </h3>
            <span className="bg-accent/10 text-accent text-xs font-bold px-2 py-1 rounded-full">2 Urgent</span>
          </div>
          
          <div className="space-y-4 flex-1">
            <div className="flex items-start gap-3 p-3 rounded-xl border border-border hover:bg-black/5 transition-colors cursor-pointer group">
              <div className="w-2 h-2 rounded-full bg-accent mt-1.5" />
              <div>
                <p className="text-sm font-bold text-text group-hover:text-primary transition-colors">Submit Q1 Research Evidence</p>
                <p className="text-xs text-textMuted mt-0.5">Due today at 5:00 PM</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 rounded-xl border border-border hover:bg-black/5 transition-colors cursor-pointer group">
              <div className="w-2 h-2 rounded-full bg-accent mt-1.5" />
              <div>
                <p className="text-sm font-bold text-text group-hover:text-primary transition-colors">Verify Mid-term Attendance</p>
                <p className="text-xs text-textMuted mt-0.5">Pending for CSE-302</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 rounded-xl border border-border hover:bg-black/5 transition-colors cursor-pointer group opacity-60">
              <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5" />
              <div>
                <p className="text-sm font-bold text-text">Peer Review: AI Journal</p>
                <p className="text-xs text-textMuted mt-0.5">Due in 3 days</p>
              </div>
            </div>
          </div>
          
          <button className="w-full mt-4 py-2 text-sm font-bold text-primary hover:bg-primary/5 rounded-lg transition-colors border border-transparent hover:border-primary/20">
            View All Tasks
          </button>
        </div>

        {/* Personal Timeline */}
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm min-h-[300px] flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-text font-bold text-base flex items-center gap-2">
              <Clock size={18} className="text-primary" />
              Personal Timeline
            </h3>
          </div>
          
          <div className="relative pl-6 space-y-6 before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent flex-1">
            <div className="relative">
              <div className="absolute -left-[33px] w-4 h-4 rounded-full bg-surface border-4 border-emerald-500 mt-1" />
              <p className="text-sm font-bold text-text">IEEE Paper Published</p>
              <p className="text-xs text-emerald-600 font-medium mt-0.5">+50 PRAJNA Points</p>
              <p className="text-xs text-textMuted mt-1">2 days ago</p>
            </div>
            
            <div className="relative">
              <div className="absolute -left-[33px] w-4 h-4 rounded-full bg-surface border-4 border-primary mt-1" />
              <p className="text-sm font-bold text-text">Completed FDP Program</p>
              <p className="text-xs text-emerald-600 font-medium mt-0.5">+20 PRAJNA Points</p>
              <p className="text-xs text-textMuted mt-1">Last week</p>
            </div>
            
            <div className="relative">
              <div className="absolute -left-[33px] w-4 h-4 rounded-full bg-surface border-4 border-border mt-1" />
              <p className="text-sm font-bold text-text">Joined Mentorship Committee</p>
              <p className="text-xs text-textMuted mt-1">2 weeks ago</p>
            </div>
          </div>
        </div>

        {/* Profile Completeness */}
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm min-h-[300px] flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-text font-bold text-base flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-500" />
              Profile Completeness
            </h3>
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="relative w-32 h-32 flex items-center justify-center mb-4">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                {/* Background Circle */}
                <circle cx="18" cy="18" r="16" fill="none" className="stroke-current text-border" strokeWidth="2" />
                {/* Progress Circle (85%) */}
                <circle cx="18" cy="18" r="16" fill="none" className="stroke-current text-emerald-500" strokeWidth="3" strokeDasharray="100 100" strokeDashoffset="15" strokeLinecap="round" />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-text">85%</span>
              </div>
            </div>
            
            <p className="text-sm text-text font-medium px-4">Your profile is looking great! Add these final touches to reach 100%:</p>
            
            <div className="mt-4 w-full space-y-2 text-left">
              <div className="flex items-center justify-between p-2 rounded-lg bg-black/5 hover:bg-black/10 cursor-pointer transition-colors group">
                <span className="text-xs font-bold text-text group-hover:text-primary transition-colors">Add ORCID ID</span>
                <ChevronRight size={14} className="text-textMuted" />
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-black/5 hover:bg-black/10 cursor-pointer transition-colors group">
                <span className="text-xs font-bold text-text group-hover:text-primary transition-colors">Link Google Scholar</span>
                <ChevronRight size={14} className="text-textMuted" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
