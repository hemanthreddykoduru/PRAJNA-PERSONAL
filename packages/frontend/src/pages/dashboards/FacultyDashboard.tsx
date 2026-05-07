import React, { useEffect, useState } from 'react';
import { Zap, Trophy, CheckSquare, BookOpen, Award, ArrowUpRight, TrendingUp } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import type { UserRole } from '../../contexts/AuthContext';
import { facultyApi } from '../../utils/api';
import { MorningBriefing } from '../../components/MorningBriefing';

const TIER_CONFIG = {
  BRONZE: { label: 'Bronze', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', min: 0 },
  SILVER: { label: 'Silver', color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200', min: 41 },
  GOLD: { label: 'Gold', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', min: 61 },
  PLATINUM: { label: 'Platinum', color: 'text-cyan-700', bg: 'bg-cyan-50', border: 'border-cyan-200', min: 81 },
  PRAJNA_FELLOW: { label: 'PRAJNA Fellow', color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200', min: 96 },
};

const getTier = (score: number) => {
  if (score >= 96) return 'PRAJNA_FELLOW';
  if (score >= 81) return 'PLATINUM';
  if (score >= 61) return 'GOLD';
  if (score >= 41) return 'SILVER';
  return 'BRONZE';
};

export function FacultyDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    facultyApi.getProfile()
      .then(setProfile)
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, []);

  const score = profile?.prajnaScore ?? 0;
  const tierKey = getTier(score);
  const tier = TIER_CONFIG[tierKey];
  const nextTierEntry = Object.values(TIER_CONFIG).find(t => t.min > score);

  const todos = [
    { id: 1, label: 'Mark attendance for CSE-301', done: false },
    { id: 2, label: 'Submit FDP certificate for AI in Education', done: false },
    { id: 3, label: 'Review student feedback for last semester', done: true },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      <MorningBriefing 
        name={user?.name || 'Faculty'} 
        score={score} 
        scoreChange={2.4} 
        classesToday={3} 
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* PRAJNA Score Card */}
        <div className={`bg-white rounded-2xl p-6 border-2 ${tier.border} shadow-sm`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">PRAJNA Score</h3>
            <span className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 ${tier.bg} ${tier.color}`}>
              <Trophy size={12} />
              {tier.label}
            </span>
          </div>
          <div className="flex items-end gap-2 mb-3">
            <span className="text-6xl font-black text-gray-900">{loading ? '—' : score}</span>
            <span className="text-gray-400 mb-2 text-lg">/ 100</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
            <div
              className="h-2 rounded-full transition-all duration-1000"
              style={{ width: `${score}%`, background: 'linear-gradient(90deg, #007366, #00a896)' }}
            />
          </div>
          {nextTierEntry && (
            <p className="text-xs text-gray-500">{nextTierEntry.min - score} pts to next tier</p>
          )}
        </div>

        {/* Today's To-Do */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <CheckSquare size={18} className="text-primary" />
              Today's To-Do
            </h3>
            <span className="text-xs text-gray-400">{todos.filter(t => !t.done).length} remaining</span>
          </div>
          <div className="space-y-3">
            {todos.map(todo => (
              <div key={todo.id} className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${todo.done ? 'opacity-40' : 'hover:bg-gray-50'}`}>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${todo.done ? 'bg-primary border-primary' : 'border-gray-300'}`}>
                  {todo.done && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
                <span className={`text-sm ${todo.done ? 'line-through text-gray-400' : 'text-gray-700'}`}>{todo.label}</span>
                {!todo.done && <ArrowUpRight size={14} className="ml-auto text-gray-300" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: <BookOpen size={20} />, label: 'Teaching', sub: 'Manage classes', color: 'text-blue-600', bg: 'bg-blue-50', to: '/dashboard/faculty/teaching' },
          { icon: <Award size={20} />, label: 'Research', sub: 'Publications & grants', color: 'text-emerald-600', bg: 'bg-emerald-50', to: '/dashboard/faculty/research' },
          { icon: <TrendingUp size={20} />, label: 'Achievements', sub: 'Awards & talks', color: 'text-violet-600', bg: 'bg-violet-50', to: '/dashboard/faculty/achievements' },
          { icon: <Trophy size={20} />, label: 'Leaderboard', sub: 'Your dept rank', color: 'text-amber-600', bg: 'bg-amber-50', to: '/dashboard/faculty/leaderboard' },
        ].map(item => (
          <a key={item.label} href={item.to} className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-all group">
            <div className={`w-10 h-10 ${item.bg} ${item.color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
              {item.icon}
            </div>
            <p className="font-bold text-gray-800 text-sm">{item.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
