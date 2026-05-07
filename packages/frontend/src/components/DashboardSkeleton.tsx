import React from 'react';

export const DashboardSkeleton = () => {
  return (
    <div className="fixed inset-0 z-[9999] bg-slate-50 flex animate-pulse">
      {/* Sidebar Skeleton */}
      <aside className="w-64 bg-primary/20 hidden md:flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-black/5">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-white/20 rounded w-24" />
              <div className="h-2 bg-white/10 rounded w-16" />
            </div>
          </div>
        </div>
        <div className="p-4 space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-10 bg-white/10 rounded-xl w-full" />
          ))}
        </div>
      </aside>

      {/* Main Content Skeleton */}
      <main className="flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
          <div className="h-4 bg-gray-100 rounded w-32" />
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gray-100 rounded-full" />
            <div className="w-24 h-8 bg-gray-100 rounded-xl" />
          </div>
        </header>

        <div className="p-8 space-y-8">
          {/* Hero/Briefing Skeleton */}
          <div className="h-48 bg-gray-200 rounded-3xl w-full" />
          
          {/* Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-32 bg-gray-100 rounded-2xl w-full" />
            <div className="h-32 bg-gray-100 rounded-2xl w-full" />
            <div className="h-32 bg-gray-100 rounded-2xl w-full" />
          </div>

          {/* List Skeleton */}
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-100 rounded-2xl w-full" />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};
