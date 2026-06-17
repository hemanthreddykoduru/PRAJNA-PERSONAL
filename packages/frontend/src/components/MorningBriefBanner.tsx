import React, { useEffect, useState } from 'react';
import { Sun, Moon, Sunrise, CheckCircle2, AlertCircle, Calendar, Sparkles, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function MorningBriefBanner() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [briefing, setBriefing] = useState<any>(null);

  const [greetingInfo, setGreetingInfo] = useState({ text: 'Good morning', icon: Sunrise, color: 'text-amber-500' });

  useEffect(() => {
    // Determine time of day
    const hour = new Date().getHours();
    let text = 'Good morning';
    let icon = Sunrise;
    let color = 'text-amber-500';

    if (hour >= 12 && hour < 17) {
      text = 'Good afternoon';
      icon = Sun;
      color = 'text-amber-400';
    } else if (hour >= 17 || hour < 5) {
      text = 'Good evening';
      icon = Moon;
      color = 'text-indigo-300';
    }

    setGreetingInfo({ text, icon, color });

    // Simulate API call to Module 21
    setTimeout(() => {
      setBriefing({
        greeting: `${text}, ${user?.name?.split(' ')[0] || 'Dr.'}!`,
        summary: "Welcome to a new day at PRAJNA. You're making excellent progress on your research goals.",
        agenda: [
          { icon: Calendar, text: "3 Classes Scheduled", type: "neutral", time: "9:00 AM" },
          { icon: AlertCircle, text: "1 Pending Approval", type: "urgent", time: "By 5 PM" },
          { icon: CheckCircle2, text: "FDP Verified (+20)", type: "success", time: "Done" }
        ],
        aiInsight: "💡 Pragati: You are only 15 points away from reaching the 'PRAJNA Fellow' tier!"
      });
      setLoading(false);
    }, 800); // Faster loading time for inline component
  }, [user]);

  if (loading) {
    return (
      <div className="w-full bg-surface border border-border rounded-3xl p-8 mb-8 animate-pulse flex flex-col gap-4">
        <div className="h-8 bg-black/5 dark:bg-white/5 rounded w-1/3" />
        <div className="h-4 bg-black/5 dark:bg-white/5 rounded w-2/3" />
        <div className="flex gap-4 mt-2">
          <div className="h-20 bg-black/5 dark:bg-white/5 rounded-xl w-1/3" />
          <div className="h-20 bg-black/5 dark:bg-white/5 rounded-xl w-1/3" />
          <div className="h-20 bg-black/5 dark:bg-white/5 rounded-xl w-1/3" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full bg-surface border border-border rounded-[2rem] shadow-sm mb-8 overflow-hidden group">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-primary/5 to-emerald-500/5" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/20 transition-colors duration-700" />
      
      <div className="relative p-8 lg:p-10 flex flex-col lg:flex-row gap-8 items-start lg:items-center">
        {/* Left Column: Greeting */}
        <div className="flex-1 animate-in slide-in-from-left-8 fade-in duration-700 ease-out">
          <div className="flex items-center gap-3 mb-2">
            <greetingInfo.icon size={28} className={`${greetingInfo.color} ${greetingInfo.icon === Moon ? 'animate-pulse' : 'animate-[spin_10s_linear_infinite]'}`} />
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              {briefing.greeting}
            </h1>
          </div>
          <p className="text-text font-medium text-lg mb-2">{briefing.summary}</p>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent/10 border border-accent/20 rounded-lg">
            <Sparkles size={14} className="text-accent" />
            <span className="text-sm font-bold text-accent">{briefing.aiInsight}</span>
          </div>
        </div>

        {/* Right Column: Quick Agenda Cards */}
        <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-4">
          {briefing.agenda.map((item: any, i: number) => {
            const Icon = item.icon;
            const colorClass = 
              item.type === 'urgent' ? 'text-rose-500 bg-rose-500/10 border-rose-500/20' :
              item.type === 'success' ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' :
              'text-indigo-500 bg-indigo-500/10 border-indigo-500/20';

            return (
              <div 
                key={i} 
                className="flex-1 lg:w-48 p-4 rounded-2xl bg-white/5 border border-border hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-in zoom-in-95 fade-in cursor-pointer"
                style={{ animationDelay: `${i * 150}ms`, animationFillMode: 'both' }}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colorClass}`}>
                  <Icon size={20} />
                </div>
                <h4 className="text-sm font-bold text-text mb-1">{item.text}</h4>
                <div className="flex items-center justify-between text-xs font-semibold text-textMuted">
                  <span>{item.time}</span>
                  <ChevronRight size={14} className="opacity-50" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
