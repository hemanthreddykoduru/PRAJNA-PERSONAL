import React from 'react';
import { Trophy, Medal, Award } from 'lucide-react';

const mockLeaderboard = [
  { rank: 1, id: 'DK', name: 'Dr. Karthik Murthy', role: 'Professor', score: 892, percentile: '88%' },
  { rank: 2, id: 'DR', name: 'Dr. Rajesh Kumar', role: 'Professor', score: 847, percentile: '75%' },
  { rank: 3, id: 'DS', name: 'Dr. Sunita Patel', role: 'Professor', score: 791, percentile: '63%' },
  { rank: 4, id: 'DP', name: 'Dr. Priya Sharma', role: 'Associate Professor', score: 723, percentile: '50%' },
  { rank: 5, id: 'DM', name: 'Dr. Meera Krishnan', role: 'Associate Professor', score: 678, percentile: '40%' },
  { rank: 6, id: 'DV', name: 'Dr. Venkat Reddy', role: 'Assistant Professor', score: 612, percentile: '25%' },
];

export function Leaderboard() {
  const top3 = mockLeaderboard.slice(0, 3);
  const rest = mockLeaderboard.slice(3);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-bold text-text flex items-center gap-2">
          <Trophy className="text-amber-500" /> Leaderboard
        </h1>
        <p className="text-textMuted mt-1">See how you rank among your peers</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-surface border border-border rounded-lg p-1 w-fit">
        <button className="px-4 py-1.5 bg-background text-text rounded-md font-medium text-sm shadow-sm">Department</button>
        <button className="px-4 py-1.5 text-textMuted hover:text-text rounded-md font-medium text-sm">Research</button>
        <button className="px-4 py-1.5 text-textMuted hover:text-text rounded-md font-medium text-sm">Teaching</button>
        <button className="px-4 py-1.5 text-textMuted hover:text-text rounded-md font-medium text-sm">Innovation</button>
      </div>

      {/* Podium Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end mt-12 h-64">
        {/* Rank 2 */}
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-lg flex flex-col items-center justify-center relative h-56 transform translate-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-400 flex items-center justify-center text-white font-bold text-xl mb-4 shadow-lg shadow-slate-400/20">
            {top3[1].id}
          </div>
          <Medal className="text-slate-400 absolute -top-4 w-8 h-8" />
          <h3 className="font-bold text-text">{top3[1].name}</h3>
          <p className="text-textMuted text-xs mt-1">{top3[1].role}</p>
          <div className="mt-4 text-center">
            <span className="text-3xl font-black text-primary">{top3[1].score}</span>
            <p className="text-[10px] text-textMuted uppercase tracking-wider">points</p>
          </div>
        </div>

        {/* Rank 1 */}
        <div className="bg-amber-50/10 border-2 border-amber-500/50 rounded-2xl p-6 shadow-xl shadow-amber-500/10 flex flex-col items-center justify-center relative h-64 z-10 scale-105">
          <div className="w-20 h-20 rounded-full bg-amber-500 flex items-center justify-center text-white font-black text-2xl mb-4 shadow-lg shadow-amber-500/30">
            {top3[0].id}
          </div>
          <Trophy className="text-amber-500 absolute -top-6 w-12 h-12" />
          <h3 className="font-bold text-text text-lg">{top3[0].name}</h3>
          <p className="text-textMuted text-xs mt-1">{top3[0].role}</p>
          <div className="mt-6 text-center">
            <span className="text-4xl font-black text-primary">{top3[0].score}</span>
            <p className="text-[10px] text-textMuted uppercase tracking-wider">points</p>
          </div>
        </div>

        {/* Rank 3 */}
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-lg flex flex-col items-center justify-center relative h-52 transform translate-y-8">
          <div className="w-16 h-16 rounded-full bg-amber-700/80 flex items-center justify-center text-white font-bold text-xl mb-4 shadow-lg shadow-amber-700/20">
            {top3[2].id}
          </div>
          <Award className="text-amber-700/80 absolute -top-4 w-8 h-8" />
          <h3 className="font-bold text-text">{top3[2].name}</h3>
          <p className="text-textMuted text-xs mt-1">{top3[2].role}</p>
          <div className="mt-4 text-center">
            <span className="text-3xl font-black text-primary">{top3[2].score}</span>
            <p className="text-[10px] text-textMuted uppercase tracking-wider">points</p>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden mt-12">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-border text-xs font-bold text-textMuted uppercase tracking-wider">
          <div className="col-span-2">Rank</div>
          <div className="col-span-5">Faculty</div>
          <div className="col-span-3">Designation</div>
          <div className="col-span-1 text-right">Score</div>
          <div className="col-span-1 text-right">Percentile</div>
        </div>
        <div className="divide-y divide-border/50">
          {mockLeaderboard.map((user) => (
            <div key={user.rank} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/5 transition-colors">
              <div className="col-span-2 font-bold text-primary">#{user.rank}</div>
              <div className="col-span-5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                  {user.id}
                </div>
                <span className="font-bold text-text">{user.name}</span>
              </div>
              <div className="col-span-3 text-sm text-textMuted">{user.role}</div>
              <div className="col-span-1 text-right font-black text-text">{user.score}</div>
              <div className="col-span-1 text-right text-sm text-textMuted">{user.percentile}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
