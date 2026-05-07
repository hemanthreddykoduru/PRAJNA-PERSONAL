import React from 'react';
import { Sparkles, ArrowUpRight, Calendar, Clock } from 'lucide-react';

interface BriefingProps {
  name: string;
  score: number;
  scoreChange: number;
  classesToday: number;
}

export const MorningBriefing: React.FC<BriefingProps> = ({ name, score, scoreChange, classesToday }) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#007366] to-[#005a50] rounded-3xl p-8 text-white shadow-xl">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/10 rounded-full -ml-20 -mb-20 blur-2xl" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase flex items-center gap-1.5">
              <Sparkles size={12} className="text-secondary" />
              AI Daily Briefing
            </div>
            <span className="text-white/40 text-xs font-medium">May 6, 2026</span>
          </div>
          
          <h2 className="text-4xl font-bold mb-2">Good morning, Dr. {name}!</h2>
          <p className="text-white/70 text-lg max-w-xl leading-relaxed">
            Your PRAJNA score is <span className="text-secondary font-bold">{score}</span>. 
            That's a <span className="text-emerald-400 font-bold">+{scoreChange} pt</span> increase from yesterday! 
            You have {classesToday} classes scheduled today.
          </p>
        </div>

        <div className="flex gap-4">
          <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10 flex flex-col items-center min-w-[120px]">
            <Clock className="text-secondary mb-2" size={20} />
            <span className="text-xs text-white/60 font-medium uppercase">Next Class</span>
            <span className="text-lg font-bold">10:00 AM</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10 flex flex-col items-center min-w-[120px]">
            <Calendar className="text-secondary mb-2" size={20} />
            <span className="text-xs text-white/60 font-medium uppercase">Reminders</span>
            <span className="text-lg font-bold">2 Pending</span>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col md:flex-row gap-4">
        <button className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 group">
          View Today's Roadmap
          <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
        
        <div className="flex-1 bg-white/5 backdrop-blur-sm border border-white/5 rounded-xl px-4 py-2 flex items-center gap-3">
          <div className="w-8 h-8 bg-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Sparkles size={14} className="text-secondary" />
          </div>
          <p className="text-[11px] text-white/80 font-medium italic">
            "Your contribution to GITAM research last month was outstanding. Today's focus on the CSE-301 lab will inspire the next generation of engineers. Let's make it count!"
          </p>
        </div>
      </div>
    </div>
  );
};
