import React from 'react';
import { Zap, Plus, Calendar } from 'lucide-react';

export function Activities() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text flex items-center gap-2">
             Activities
          </h1>
          <p className="text-textMuted mt-1">Track your academic activities • AI auto-suggest coming soon</p>
        </div>
        <button className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg font-bold shadow-lg shadow-primary/20 transition-colors">
          <Plus size={20} />
          <span>Add Activity</span>
        </button>
      </div>

      {/* AI Banner */}
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
        <h3 className="text-primary font-bold flex items-center gap-2 mb-2">
          <Zap size={18} className="fill-primary" />
          AI Auto-Logging — Coming Soon
        </h3>
        <p className="text-textMuted text-sm leading-relaxed">
          PRAJNA will auto-detect activities from your calendar, email, and institutional systems (e.g. journal submissions, FDP certificates, meeting invites) and suggest them for one-click logging. Until then, manually add activities here and the AI assistant can help classify and map them to KPI categories.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center h-28">
          <h2 className="text-3xl font-black text-text">0</h2>
          <p className="text-textMuted text-xs mt-1 font-medium">Total</p>
        </div>
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center h-28">
          <h2 className="text-3xl font-black text-text">0</h2>
          <p className="text-textMuted text-xs mt-1 font-medium">Completed</p>
        </div>
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center h-28">
          <h2 className="text-3xl font-black text-text">0</h2>
          <p className="text-textMuted text-xs mt-1 font-medium">In Progress</p>
        </div>
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center h-28">
          <h2 className="text-3xl font-black text-text">0</h2>
          <p className="text-textMuted text-xs mt-1 font-medium">Planned</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-surface border border-border rounded-lg p-1 w-fit">
        <button className="px-4 py-1.5 bg-background text-text rounded-md font-medium text-sm shadow-sm">All</button>
        <button className="px-4 py-1.5 text-textMuted hover:text-text rounded-md font-medium text-sm">Research</button>
        <button className="px-4 py-1.5 text-textMuted hover:text-text rounded-md font-medium text-sm">Teaching</button>
        <button className="px-4 py-1.5 text-textMuted hover:text-text rounded-md font-medium text-sm">Conferences</button>
      </div>

      {/* Empty State */}
      <div className="bg-surface border border-border rounded-2xl p-12 h-64 shadow-sm flex flex-col items-center justify-center text-center mt-8">
        <div className="mb-4">
          <Calendar size={40} className="text-textMuted/50" />
        </div>
        <p className="text-textMuted text-sm font-medium">No activities found</p>
      </div>
    </div>
  );
}
