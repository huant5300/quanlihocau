"use client";

import React, { useState } from "react";
import {
  Plus,
  Search,
  SlidersHorizontal,
  Clock,
  CheckCircle2,
  AlertTriangle,
  LayoutGrid,
  List,
  RefreshCw,
  Fish
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { sessionService } from "@/services/api/session-service";
import { SessionCard } from "@/modules/sessions/components/session-card";
import { SessionRow } from "@/modules/sessions/components/session-row";
import { SessionEmptyState } from "@/modules/sessions/components/session-empty-state";
import { useUIStore } from "@/stores/ui-store";
import { cn } from "@/utils/utils";

interface SessionsClientProps {
  initialSessions: any[];
}

const FILTERS = [
  { label: "Tất cả", value: "ALL", icon: LayoutGrid },
  { label: "Đang câu", value: "ACTIVE", icon: Clock },
  { label: "Quá giờ", value: "OVERDUE", icon: AlertTriangle },
  { label: "Hoàn thành", value: "COMPLETED", icon: CheckCircle2 },
];

export function SessionsClient({ initialSessions }: SessionsClientProps) {
  const { setOpenSessionModalOpen } = useUIStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: sessions = initialSessions, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["active-sessions"],
    queryFn: () => sessionService.getSessions(activeFilter === "ALL" ? undefined : activeFilter),
    refetchInterval: 15000,
  });

  const filteredSessions = sessions.filter((s: any) => {
    const areaName = s.area?.name || "";
    const customerName = s.customer?.fullName || "Khách lẻ";
    const customerPhone = s.customer?.phone || "";
    const query = searchQuery.toLowerCase();
    const matchSearch =
      areaName.toLowerCase().includes(query) ||
      customerName.toLowerCase().includes(query) ||
      customerPhone.toLowerCase().includes(query);

    if (activeFilter === "ALL") return matchSearch;
    return matchSearch && s.status === activeFilter;
  });

  return (
    <div className="space-y-5 select-none">
      
      {/* ── HEADER CARD: Title + Actions + Filters ── */}
      <div className="bg-white dark:bg-zinc-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-2xs space-y-4">
        
        {/* Title row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Quản lý Ca câu & Chòi câu
              </h1>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {sessions.length} chòi đang mở
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              Theo dõi đồng hồ tính giờ realtime, thêm đồ uống/mồi, gia hạn ca và kết thúc thu tiền
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* View Mode Toggle (Grid / List) */}
            <div className="flex bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl border border-slate-200/60 dark:border-zinc-700/60">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-1.5 rounded-lg transition-all",
                  viewMode === "grid"
                    ? "bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-2xs"
                    : "text-slate-500 hover:text-slate-900 dark:text-zinc-400"
                )}
                title="Xem dạng thẻ lưới"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-1.5 rounded-lg transition-all",
                  viewMode === "list"
                    ? "bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-2xs"
                    : "text-slate-500 hover:text-slate-900 dark:text-zinc-400"
                )}
                title="Xem dạng danh sách"
              >
                <List size={16} />
              </button>
            </div>

            {/* Refresh Button */}
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="h-9 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              title="Làm mới ca câu"
            >
              <RefreshCw size={14} className={cn(isFetching && "animate-spin text-emerald-600")} />
              <span className="hidden sm:inline">Làm mới</span>
            </button>

            {/* Open Session Button */}
            <button
              onClick={() => setOpenSessionModalOpen(true)}
              className="h-9 px-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-emerald-600/25 transition-all"
            >
              <Plus size={16} className="stroke-[2.5]" />
              <span>Vào ca câu mới</span>
            </button>
          </div>
        </div>

        {/* Search + Filter tabs */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between pt-2 border-t border-slate-100 dark:border-zinc-800/80">
          
          {/* Search Input */}
          <div className="relative flex-1 max-w-sm">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Tìm số chòi, tên cần thủ, số điện thoại..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-8 pr-3 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200/80 dark:border-zinc-700 rounded-xl text-xs text-slate-800 dark:text-zinc-200 placeholder:text-slate-400 outline-none focus:border-emerald-500 transition-all"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 custom-scrollbar">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setActiveFilter(f.value)}
                className={cn(
                  "h-8 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0",
                  activeFilter === f.value
                    ? "bg-emerald-600 text-white shadow-2xs"
                    : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200/80"
                )}
              >
                <f.icon size={13} />
                <span>{f.label}</span>
              </button>
            ))}
          </div>

        </div>

      </div>

      {/* ── CONTENT AREA: SESSIONS GRID OR LIST ── */}
      <div>
        {isLoading && sessions.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-44 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/60 dark:border-zinc-800 animate-pulse" />
            ))}
          </div>
        ) : filteredSessions.length > 0 ? (
          viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredSessions.map((session: any) => (
                  <SessionCard key={session.id} session={session} />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-2xs space-y-3">
              <AnimatePresence mode="popLayout">
                {filteredSessions.map((session: any) => (
                  <SessionRow key={session.id} session={session} />
                ))}
              </AnimatePresence>
            </div>
          )
        ) : (
          <SessionEmptyState />
        )}
      </div>

    </div>
  );
}
