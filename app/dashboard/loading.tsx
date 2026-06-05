import React from "react";

export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2.5">
          <div className="h-8 w-64 bg-slate-200 dark:bg-zinc-800 rounded-xl" />
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-slate-200 dark:bg-zinc-800 rounded-md" />
            <div className="h-4 w-48 bg-slate-200 dark:bg-zinc-800 rounded-md" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-28 bg-slate-200 dark:bg-zinc-800 rounded-2xl" />
          <div className="h-10 w-36 bg-slate-200 dark:bg-zinc-800 rounded-2xl" />
        </div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div 
            key={i} 
            className="bg-white/5 border border-slate-200/10 dark:border-zinc-800/80 p-6 rounded-[2.5rem] relative overflow-hidden min-h-[140px] flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-200/10 dark:bg-zinc-800/50" />
            <div className="space-y-2 mt-4">
              <div className="h-3 w-24 bg-slate-200/20 dark:bg-zinc-800/40 rounded-full" />
              <div className="h-6 w-32 bg-slate-200/30 dark:bg-zinc-800/60 rounded-xl" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Charts & Activity */}
        <div className="lg:col-span-2 space-y-8">
          {/* Chart card */}
          <div className="bg-white/5 border border-slate-200/10 dark:border-zinc-800/80 p-8 rounded-[3rem] space-y-6">
            <div className="flex items-center justify-between">
              <div className="h-5 w-48 bg-slate-200/20 dark:bg-zinc-800/40 rounded-lg" />
              <div className="h-6 w-24 bg-slate-200/20 dark:bg-zinc-800/40 rounded-full" />
            </div>
            <div className="h-[280px] w-full bg-slate-200/5 dark:bg-zinc-800/20 rounded-2xl flex items-end justify-between p-4 gap-2">
              {[30, 45, 25, 60, 40, 80, 50].map((h, i) => (
                <div 
                  key={i} 
                  className="bg-slate-200/10 dark:bg-zinc-800/30 rounded-t-lg w-full" 
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white/5 border border-slate-200/10 dark:border-zinc-800/80 p-8 rounded-[3rem] space-y-6">
            <div className="h-5 w-56 bg-slate-200/20 dark:bg-zinc-800/40 rounded-lg" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-3xl bg-slate-200/5 dark:bg-zinc-800/10">
                  <div className="w-12 h-12 rounded-2xl bg-slate-200/10 dark:bg-zinc-800/30 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-40 bg-slate-200/20 dark:bg-zinc-800/40 rounded-md" />
                    <div className="h-3 w-20 bg-slate-200/10 dark:bg-zinc-800/20 rounded-md" />
                  </div>
                  <div className="h-4 w-16 bg-slate-200/20 dark:bg-zinc-800/40 rounded-md shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-8">
          {/* Lake Status Spot */}
          <div className="bg-white/5 border border-slate-200/10 dark:border-zinc-800/80 p-8 rounded-[3rem] space-y-6">
            <div className="h-5 w-40 bg-slate-200/20 dark:bg-zinc-800/40 rounded-lg" />
            <div className="space-y-4">
              <div className="flex justify-between">
                <div className="h-4 w-20 bg-slate-200/20 dark:bg-zinc-800/40 rounded-md" />
                <div className="h-5 w-16 bg-slate-200/20 dark:bg-zinc-800/40 rounded-full" />
              </div>
              <div className="w-full h-3 bg-slate-200/10 dark:bg-zinc-800/20 rounded-full" />
              <div className="h-3 w-44 bg-slate-200/10 dark:bg-zinc-800/20 rounded-full" />
            </div>
          </div>

          {/* Total Catches */}
          <div className="bg-white/5 border border-slate-200/10 dark:border-zinc-800/80 p-8 rounded-[3rem] space-y-4">
            <div className="h-5 w-48 bg-slate-200/20 dark:bg-zinc-800/40 rounded-lg mb-2" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-slate-200/5 dark:bg-zinc-800/10">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-lg bg-slate-200/15 dark:bg-zinc-800/30" />
                  <div className="h-4 w-20 bg-slate-200/20 dark:bg-zinc-800/40 rounded-md" />
                </div>
                <div className="h-5 w-12 bg-slate-200/20 dark:bg-zinc-800/40 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
