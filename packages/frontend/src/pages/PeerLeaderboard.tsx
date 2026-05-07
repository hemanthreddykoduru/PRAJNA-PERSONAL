import React, { useState } from 'react';
import { Trophy, Medal, Star, TrendingUp, Search, Filter, ArrowUpRight, Award } from 'lucide-react';

const TOP_FACULTY = [
  { id: 1, name: 'Dr. Ramesh Iyer', dept: 'Computer Science', score: 942, rank: 1, avatar: 'RI', trend: '+12' },
  { id: 2, name: 'Dr. Priya Sharma', dept: 'Artificial Intelligence', score: 915, rank: 2, avatar: 'PS', trend: '+8' },
  { id: 3, name: 'Prof. Ankit Verma', dept: 'Mechanical Engineering', score: 890, rank: 3, avatar: 'AV', trend: '+15' },
  { id: 4, name: 'Dr. Sneha Reddy', dept: 'Computer Science', score: 875, rank: 4, avatar: 'SR', trend: '+5' },
  { id: 5, name: 'Prof. Vikram Singh', dept: 'Data Science', score: 860, rank: 5, avatar: 'VS', trend: '+22' },
];

const RISING_STARS = [
  { name: 'Dr. Amit Shah', dept: 'Cyber Security', improvement: '+45 pts', reason: '3 Patents Filed' },
  { name: 'Prof. Kavita Rao', dept: 'Information Tech', improvement: '+38 pts', reason: 'A+ Teaching Score' },
];

export default function PeerLeaderboard() {
  const [filter, setFilter] = useState('All Departments');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Peer Leaderboard</h1>
          <p className="text-gray-500 mt-1 font-medium">Celebrate excellence and track your professional growth relative to peers.</p>
        </div>
        <div className="bg-amber-50 border border-amber-100 px-6 py-3 rounded-2xl flex items-center gap-3">
          <Trophy className="text-amber-500" size={24} />
          <div>
            <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest leading-none">Your Rank</p>
            <p className="text-xl font-black text-amber-900">#42 <span className="text-xs font-bold text-amber-600/60 ml-1">in GITAM</span></p>
          </div>
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
        {/* Rank 2 */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center order-2 md:order-1 h-72 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-4 left-4">
             <Medal className="text-gray-300" size={32} />
          </div>
          <div className="w-20 h-20 bg-gray-50 rounded-2xl mx-auto mb-4 flex items-center justify-center text-2xl font-black text-gray-400 border-2 border-gray-100">
            {TOP_FACULTY[1].avatar}
          </div>
          <h3 className="font-bold text-gray-900">{TOP_FACULTY[1].name}</h3>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">{TOP_FACULTY[1].dept}</p>
          <div className="text-2xl font-black text-primary">{TOP_FACULTY[1].score}</div>
        </div>

        {/* Rank 1 */}
        <div className="bg-primary p-10 rounded-[40px] shadow-2xl shadow-primary/20 text-center order-1 md:order-2 h-80 flex flex-col justify-center relative scale-105 border-4 border-white/20">
          <div className="absolute top-6 left-1/2 -translate-x-1/2 -translate-y-12">
             <div className="bg-amber-400 p-3 rounded-full shadow-xl">
               <Trophy className="text-white" size={32} />
             </div>
          </div>
          <div className="w-24 h-24 bg-white/20 rounded-3xl mx-auto mb-4 flex items-center justify-center text-3xl font-black text-white border-2 border-white/30">
            {TOP_FACULTY[0].avatar}
          </div>
          <h3 className="font-bold text-white text-lg">{TOP_FACULTY[0].name}</h3>
          <p className="text-xs text-white/60 font-bold uppercase tracking-wider mb-2">{TOP_FACULTY[0].dept}</p>
          <div className="text-4xl font-black text-secondary">{TOP_FACULTY[0].score}</div>
        </div>

        {/* Rank 3 */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center order-3 h-64 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-4 right-4">
             <Award className="text-amber-600/30" size={32} />
          </div>
          <div className="w-16 h-16 bg-amber-50 rounded-2xl mx-auto mb-4 flex items-center justify-center text-xl font-black text-amber-600 border-2 border-amber-100">
            {TOP_FACULTY[2].avatar}
          </div>
          <h3 className="font-bold text-gray-900">{TOP_FACULTY[2].name}</h3>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">{TOP_FACULTY[2].dept}</p>
          <div className="text-2xl font-black text-primary">{TOP_FACULTY[2].score}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2 px-2">
            <h3 className="text-xl font-bold text-gray-900">Leaderboard Rankings</h3>
            <div className="flex items-center gap-3">
               <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                 <input type="text" placeholder="Find peer..." className="pl-9 pr-4 py-2 bg-white border border-gray-100 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all w-48" />
               </div>
               <button className="p-2 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-primary transition-colors">
                 <Filter size={18} />
               </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Rank</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Faculty</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Score</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {TOP_FACULTY.map(f => (
                  <tr key={f.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${
                        f.rank === 1 ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'
                      }`}>
                        #{f.rank}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-[10px] font-bold text-gray-400">
                          {f.avatar}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 text-sm">{f.name}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{f.dept}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-black text-gray-900">{f.score}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <span className="inline-flex items-center gap-1 text-emerald-500 font-bold text-xs">
                         <ArrowUpRight size={12} />
                         {f.trend}
                       </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar: Rising Stars */}
        <div className="space-y-6">
          <div className="bg-secondary p-8 rounded-3xl relative overflow-hidden">
            <Star className="absolute top-[-20px] right-[-20px] text-primary/5 rotate-12" size={120} />
            <h3 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
              <TrendingUp size={24} />
              Rising Stars
            </h3>
            <div className="space-y-4">
              {RISING_STARS.map(star => (
                <div key={star.name} className="bg-white/50 backdrop-blur-sm p-5 rounded-2xl border border-white/50">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-gray-900">{star.name}</h4>
                    <span className="text-emerald-500 font-black text-xs">{star.improvement}</span>
                  </div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">{star.dept}</p>
                  <div className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md inline-block font-bold">
                    {star.reason}
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-8 text-xs text-primary/60 italic font-medium">
              Based on activity over the last 30 days. Keep pushing!
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
             <h4 className="font-bold text-gray-800 mb-4">How is this calculated?</h4>
             <p className="text-xs text-gray-500 leading-relaxed">
               The PRAJNA score is a composite index of Teaching (40%), Research (40%), and Professional Development (20%). Ranks are updated every 24 hours.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
