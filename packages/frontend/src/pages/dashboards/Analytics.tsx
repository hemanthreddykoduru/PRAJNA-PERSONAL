import React from 'react';
import { BarChart3 } from 'lucide-react';

export function Analytics() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-bold text-text flex items-center gap-2">
           Analytics
        </h1>
        <p className="text-textMuted mt-1">Performance insights, trends & KPI breakdown</p>
      </div>

      <div className="flex items-center gap-2 bg-surface border border-border rounded-lg p-1 w-fit">
        <button className="px-4 py-1.5 bg-background text-text rounded-md font-medium text-sm shadow-sm">Insights</button>
        <button className="px-4 py-1.5 text-textMuted hover:text-text rounded-md font-medium text-sm">KPI Breakdown</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Trend Over Years */}
        <div className="lg:col-span-2 bg-surface border border-border rounded-2xl p-6 h-80 shadow-sm flex flex-col">
          <h3 className="text-text font-bold mb-6 text-sm">Score Trend Over Years</h3>
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

        {/* Score Distribution */}
        <div className="lg:col-span-1 bg-surface border border-border rounded-2xl p-6 h-80 shadow-sm flex flex-col">
          <h3 className="text-text font-bold mb-6 text-sm">Score Distribution</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Benchmarking */}
        <div className="bg-surface border border-border rounded-2xl p-6 h-80 shadow-sm flex flex-col">
          <h3 className="text-text font-bold mb-6 text-sm">Benchmarking</h3>
          <div className="flex-1 border-b border-l border-border/50 relative flex items-end ml-8 gap-12 justify-center pb-0">
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

            {/* Bars */}
            <div className="w-24 bg-primary h-[60%] rounded-t-md z-10 relative group">
              <div className="absolute -bottom-6 w-full text-center text-[10px] text-textMuted">Dept. Avg</div>
            </div>
            <div className="w-24 bg-emerald-500 h-[80%] rounded-t-md z-10 relative group">
              <div className="absolute -bottom-6 w-full text-center text-[10px] text-textMuted">Top 10%</div>
            </div>
          </div>
        </div>

        {/* Year-on-Year Growth % */}
        <div className="bg-surface border border-border rounded-2xl p-6 h-80 shadow-sm flex flex-col">
          <h3 className="text-text font-bold mb-6 text-sm">Year-on-Year Growth %</h3>
        </div>
      </div>
    </div>
  );
}
