import React from 'react';
import { Crosshair, CheckCircle2, AlertTriangle, Flag, Plus, Target } from 'lucide-react';

export function Goals() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text flex items-center gap-2">
             Goals & Development Plans
          </h1>
          <p className="text-textMuted mt-1">Set targets and track your academic growth</p>
        </div>
        <button className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg font-bold shadow-lg shadow-primary/20 transition-colors">
          <Plus size={20} />
          <span>Create Goal</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Crosshair className="text-primary" size={24} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-text leading-none">0</h2>
            <p className="text-textMuted text-xs font-medium mt-1">Active Goals</p>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="text-emerald-500" size={24} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-text leading-none">0</h2>
            <p className="text-textMuted text-xs font-medium mt-1">Completed</p>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="text-amber-500" size={24} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-text leading-none">0</h2>
            <p className="text-textMuted text-xs font-medium mt-1">At Risk</p>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center flex-shrink-0">
            <Flag className="text-rose-500" size={24} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-text leading-none">0</h2>
            <p className="text-textMuted text-xs font-medium mt-1">Overdue</p>
          </div>
        </div>
      </div>

      {/* Empty State */}
      <div className="bg-surface border border-border rounded-2xl p-12 h-80 shadow-sm flex flex-col items-center justify-center text-center mt-8">
        <div className="w-16 h-16 rounded-full bg-background border border-border flex items-center justify-center mb-4">
          <Target size={32} className="text-textMuted" />
        </div>
        <p className="text-textMuted text-sm font-medium">No goals created yet. Start planning your academic growth!</p>
      </div>
    </div>
  );
}
