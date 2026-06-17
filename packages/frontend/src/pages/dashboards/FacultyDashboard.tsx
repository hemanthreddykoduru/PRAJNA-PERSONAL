import React, { useEffect, useState } from 'react';
import { Target, Trophy, BarChart2, FileText, CheckCircle2, Clock, ChevronRight, AlertCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { facultyApi } from '../../utils/api';
import { MorningBriefBanner } from '../../components/MorningBriefBanner';
import { SlotCounter } from '../../components/SlotCounter';

export function FacultyDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [profileAction, setProfileAction] = useState<string | null>(null);

  useEffect(() => {
    facultyApi.getProfile()
      .then((data) => {
        if (data && Object.keys(data).length > 0) {
          setProfile(data);
        } else {
          // Provide realistic mock data for presentation
          setProfile({
            prajnaScore: 840,
            deptRank: 4,
            percentile: 88,
            pendingItems: 3
          });
        }
      })
      .catch((err) => {
        console.error("Failed to fetch profile from AWS API", err);
        // Fallback to mock data on error for presentation
        setProfile({
          prajnaScore: 840,
          deptRank: 4,
          percentile: 88,
          pendingItems: 3
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const kpiScore = profile?.prajnaScore || 840;
  const deptRank = profile?.deptRank || 4;
  const percentile = profile?.percentile || 88;
  const pendingItems = profile?.pendingItems || 3;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Morning Briefing Banner (Module 21) replaces the old static welcome text */}
      <MorningBriefBanner />

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
            <h2 className="text-4xl font-black text-white flex items-end gap-1">
              {loading ? '...' : <SlotCounter value={kpiScore} globalDelay={0} />}
              <span className="text-2xl text-white/70 font-bold mb-0.5">/1000</span>
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
            <h2 className="text-4xl font-black text-text flex items-end gap-0.5">
              <span>#</span>
              {loading ? '--' : <SlotCounter value={deptRank} globalDelay={200} />}
            </h2>
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
            <h2 className="text-4xl font-black text-text flex items-end gap-0.5">
              {loading ? '--' : <SlotCounter value={percentile} globalDelay={400} />}
              <span className="mb-0.5">%</span>
            </h2>
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
            <h2 className="text-4xl font-black text-text">
              {loading ? '-' : <SlotCounter value={pendingItems} globalDelay={600} />}
            </h2>
            <p className="text-textMuted text-sm mt-1">Evidence items</p>
          </div>
        </div>
      </div>


      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Today's Priorities */}
        <div id="todays-priorities" className="bg-surface border border-border rounded-2xl p-6 shadow-sm min-h-[300px] flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-text font-bold text-base flex items-center gap-2">
              <AlertCircle size={18} className="text-accent" />
              Today's Priorities
            </h3>
            <span className="bg-accent/10 text-accent text-xs font-bold px-2 py-1 rounded-full">2 Urgent</span>
          </div>
          
          <div className="space-y-4 flex-1">
            <div onClick={() => setSelectedTask('Submit Q1 Research Evidence')} className="flex items-start gap-3 p-3 rounded-xl border border-border hover:bg-black/5 transition-colors cursor-pointer group">
              <div className="w-2 h-2 rounded-full bg-accent mt-1.5" />
              <div>
                <p className="text-sm font-bold text-text group-hover:text-primary transition-colors">Submit Q1 Research Evidence</p>
                <p className="text-xs text-textMuted mt-0.5">Due today at 5:00 PM</p>
              </div>
            </div>
            
            <div onClick={() => setSelectedTask('Verify Mid-term Attendance')} className="flex items-start gap-3 p-3 rounded-xl border border-border hover:bg-black/5 transition-colors cursor-pointer group">
              <div className="w-2 h-2 rounded-full bg-accent mt-1.5" />
              <div>
                <p className="text-sm font-bold text-text group-hover:text-primary transition-colors">Verify Mid-term Attendance</p>
                <p className="text-xs text-textMuted mt-0.5">Pending for CSE-302</p>
              </div>
            </div>
            
            <div onClick={() => setSelectedTask('Peer Review: AI Journal')} className="flex items-start gap-3 p-3 rounded-xl border border-border hover:bg-black/5 transition-colors cursor-pointer group opacity-60">
              <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5" />
              <div>
                <p className="text-sm font-bold text-text">Peer Review: AI Journal</p>
                <p className="text-xs text-textMuted mt-0.5">Due in 3 days</p>
              </div>
            </div>
          </div>
          
          <button type="button" className="w-full mt-4 py-2 text-sm font-bold text-primary hover:bg-primary/5 rounded-lg transition-colors border border-transparent hover:border-primary/20">
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
          
          <div className="space-y-0 flex-1 mt-2">
            {/* Item 1 */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-4 h-4 rounded-full bg-surface border-4 border-emerald-500 z-10 shrink-0 mt-1" />
                <div className="w-0.5 h-full bg-border -mt-2" />
              </div>
              <div className="pb-6">
                <p className="text-sm font-bold text-text">IEEE Paper Published</p>
                <p className="text-xs text-emerald-600 font-medium mt-0.5">+50 PRAJNA Points</p>
                <p className="text-xs text-textMuted mt-1">2 days ago</p>
              </div>
            </div>
            
            {/* Item 2 */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-4 h-4 rounded-full bg-surface border-4 border-primary z-10 shrink-0 mt-1" />
                <div className="w-0.5 h-full bg-border -mt-2" />
              </div>
              <div className="pb-6">
                <p className="text-sm font-bold text-text">Completed FDP Program</p>
                <p className="text-xs text-primary font-medium mt-0.5">+20 PRAJNA Points</p>
                <p className="text-xs text-textMuted mt-1">Last week</p>
              </div>
            </div>
            
            {/* Item 3 */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-4 h-4 rounded-full bg-surface border-4 border-border z-10 shrink-0 mt-1" />
              </div>
              <div>
                <p className="text-sm font-bold text-text">Joined Mentorship Committee</p>
                <p className="text-xs text-textMuted mt-1">2 weeks ago</p>
              </div>
            </div>
          </div>

          <button type="button" className="w-full mt-4 py-2 text-sm font-bold text-primary hover:bg-primary/5 rounded-lg transition-colors border border-transparent hover:border-primary/20">
            View More
          </button>
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
              <div onClick={() => setProfileAction('ORCID ID')} className="flex items-center justify-between p-2 rounded-lg bg-black/5 hover:bg-black/10 cursor-pointer transition-colors group">
                <span className="text-xs font-bold text-text group-hover:text-primary transition-colors">Add ORCID ID</span>
                <ChevronRight size={14} className="text-textMuted" />
              </div>
              <div onClick={() => setProfileAction('Google Scholar')} className="flex items-center justify-between p-2 rounded-lg bg-black/5 hover:bg-black/10 cursor-pointer transition-colors group">
                <span className="text-xs font-bold text-text group-hover:text-primary transition-colors">Link Google Scholar</span>
                <ChevronRight size={14} className="text-textMuted" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Task Action Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setSelectedTask(null)}>
          <div className="bg-surface/90 backdrop-blur-2xl border border-white/20 p-8 rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)] max-w-md w-full animate-in zoom-in-95 duration-300 relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedTask(null)} className="absolute top-6 right-6 text-textMuted hover:text-text transition-colors">
              <X size={20} />
            </button>
            <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center mb-5">
              <AlertCircle size={24} className="text-accent" />
            </div>
            <h3 className="text-xl font-bold text-text mb-2">{selectedTask}</h3>
            <p className="text-textMuted mb-8 text-sm">This task requires your attention. Submitting your documentation on time ensures your PRAJNA score is accurately calculated.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setSelectedTask(null)} className="px-5 py-2.5 rounded-xl text-textMuted hover:bg-black/5 font-bold transition-colors">Cancel</button>
              <button onClick={() => setSelectedTask(null)} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-emerald-500 text-white font-bold hover:-translate-y-0.5 shadow-lg shadow-primary/20 transition-all">Begin Task</button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Integration Modal */}
      {profileAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setProfileAction(null)}>
          <div className="bg-surface/90 backdrop-blur-2xl border border-white/20 p-8 rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)] max-w-md w-full animate-in zoom-in-95 duration-300 relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setProfileAction(null)} className="absolute top-6 right-6 text-textMuted hover:text-text transition-colors">
              <X size={20} />
            </button>
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
              <CheckCircle2 size={24} className="text-primary" />
            </div>
            <h3 className="text-xl font-bold text-text mb-2">Connect {profileAction}</h3>
            <p className="text-textMuted mb-6 text-sm">Linking your {profileAction} profile will automatically sync your publications and instantly boost your PRAJNA score.</p>
            
            <div className="space-y-4 mb-8">
              <div>
                <label className="text-xs font-bold text-textMuted uppercase tracking-wider mb-1 block">Profile Link / ID</label>
                <input type="text" placeholder={`Enter your ${profileAction} details`} className="w-full bg-black/5 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button onClick={() => setProfileAction(null)} className="px-5 py-2.5 rounded-xl text-textMuted hover:bg-black/5 font-bold transition-colors">Cancel</button>
              <button onClick={() => setProfileAction(null)} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-emerald-500 text-white font-bold hover:-translate-y-0.5 shadow-lg shadow-primary/20 transition-all">Sync Account</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
