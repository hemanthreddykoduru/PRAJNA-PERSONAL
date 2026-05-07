import React, { useEffect, useState } from 'react';
import { Zap, Trophy, Target, ArrowUpRight } from 'lucide-react';
import { facultyApi } from '../utils/api';

export function FacultyDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    facultyApi.getProfile()
      .then(setProfile)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const score = profile?.prajnaScore || 0;
  const tier = profile?.currentTier || 'BRONZE';

  if (loading) return <div className="p-12 text-center text-gray-400">Syncing with PRAJNA Cloud...</div>;

  return (
    <div className="space-y-6">
      {/* Morning Briefing Banner */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-border flex items-start space-x-4">
        <div className="bg-accent/10 p-3 rounded-lg text-accent">
          <Zap size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-text mb-2">Good morning, {profile?.name || 'Faculty'}!</h2>
          <p className="text-gray-600">
            {score < 50 
              ? `You're ${50 - score} points away from the Silver tier. Submit your pending research papers to boost your score!`
              : `You are performing excellently in the ${tier} tier. Keep up the research work to maintain your ranking!`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Score Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-border col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text">PRAJNA Score</h3>
            <span className="text-primary font-bold flex items-center capitalize">
               <Trophy size={16} className="mr-1" />
               {tier.toLowerCase()} Tier
            </span>
          </div>
          <div className="flex items-end space-x-2 mb-2">
            <span className="text-5xl font-extrabold text-text">{score}</span>
            <span className="text-gray-500 mb-1">/ 100</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2.5 mb-2">
            <div className="bg-primary h-2.5 rounded-full transition-all duration-1000" style={{ width: `${score}%` }}></div>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Rank: #-- in Dept | #-- in Campus
          </p>
        </div>

        {/* Todo List */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-border col-span-1 md:col-span-2">
          <h3 className="text-lg font-semibold text-text mb-4 flex items-center">
            <Target size={20} className="mr-2 text-primary" />
            Today's To-Do
          </h3>
          <div className="space-y-3">
            {[
              "Mark attendance (CSE-301)",
              "Submit FDP certificate for 'AI in Education'",
              "Review student feedback for previous semester"
            ].map((task, i) => (
              <div key={i} className="flex items-center p-3 hover:bg-secondary/50 rounded-lg transition-colors border border-transparent hover:border-border cursor-pointer">
                <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary" />
                <span className="ml-3 text-text">{task}</span>
                <ArrowUpRight size={16} className="ml-auto text-gray-400" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
