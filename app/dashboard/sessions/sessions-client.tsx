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

  const { data: sessions = initialSessions, isLoading } = useQuery({
    queryKey: ["active-sessions"],
    queryFn: () => sessionService.getSessions("ACTIVE"),
    refetchInterval: 30000,
  });

  const filteredSessions = sessions.filter((s: any) => {
    const areaName = s.area?.name || "";
    const customerName = s.customer?.fullName || "Khách lẻ";
    const query = searchQuery.toLowerCase();
    const matchSearch =
      areaName.toLowerCase().includes(query) ||
      customerName.toLowerCase().includes(query);

    if (activeFilter === "ALL") return matchSearch;
    return matchSearch && s.status === activeFilter;
  });

  return (
    <div className="relative min-h-screen bg-gray-50">
      {/* ======= DESKTOP HEADER (hidden on mobile) ======= */}
      <div className="hidden md:flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-gray-900">
              Quản lý Lượt câu
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {sessions.length} ô đang hoạt động
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View toggle */}
            <div className="flex bg-white border border-gray-200 rounded-xl p-1 gap-1 shadow-sm">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  viewMode === "grid"
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-400 hover:text-gray-600"
                )}
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  viewMode === "list"
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-400 hover:text-gray-600"
                )}
              >
                <List size={18} />
              </button>
            </div>

            <button
              onClick={() => setOpenSessionModalOpen(true)}
              className="flex items-center gap-2 h-11 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-md shadow-blue-200 active:scale-95 transition-all"
            >
              <Plus size={18} />
              Mở lượt câu mới
            </button>
          </div>
        </div>

        {/* Desktop Search + Filters */}
        <div className="flex gap-3 items-center">
          <div className="relative flex-1 max-w-sm">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Tìm ô số, khách hàng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          <div className="flex gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setActiveFilter(f.value)}
                className={cn(
                  "h-10 px-4 rounded-xl text-sm font-semibold border transition-all flex items-center gap-1.5",
                  activeFilter === f.value
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-200"
                    : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                )}
              >
                <f.icon size={14} />
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ======= MOBILE HEADER (hidden on desktop) ======= */}
      <div className="md:hidden sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm px-4 pt-4 pb-3 space-y-3">
        {/* Title row */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Đang hoạt động
            </p>
            <p className="text-xl font-black text-gray-900">
              {sessions.length} lượt câu
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
              className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500"
            >
              {viewMode === "grid" ? <List size={18} /> : <LayoutGrid size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Tìm ô số, tên khách..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-10 pr-4 bg-gray-100 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 border border-transparent transition-all"
          />
        </div>

        {/* Mobile horizontal filter pills */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setActiveFilter(f.value)}
              className={cn(
                "flex-shrink-0 h-8 px-3.5 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5",
                activeFilter === f.value
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-500 border-gray-200"
              )}
            >
              <f.icon size={12} />
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ======= SESSIONS CONTENT ======= */}
      <div className="px-4 md:px-0 pt-4 pb-28 md:pb-4">
        {isLoading && sessions.length === 0 ? (
          <div
            className={cn(
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
                : "space-y-3"
            )}
          >
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-48 bg-white rounded-2xl animate-pulse border border-gray-100"
              />
            ))}
          </div>
        ) : filteredSessions.length > 0 ? (
          <AnimatePresence mode="popLayout">
            <div
              className={cn(
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
                  : "space-y-3"
              )}
            >
              {filteredSessions.map((session: any) => {
                const mappedSession = {
                  ...session,
                  hut_number: session.area?.name || "N/A",
                  customer_name: session.customer?.fullName || "Khách lẻ",
                  phone: session.customer?.phone,
                  total_amount: Number(session.sessionAmount || 0),
                  session_products:
                    session.invoices?.[0]?.items?.map((item: any) => ({
                      id: item.id,
                      name: item.description,
                      quantity: item.quantity,
                      price: Number(item.unitPrice),
                    })) || [],
                  fish_buybacks:
                    session.fishCatches?.map((c: any) => ({
                      id: c.id,
                      total_price: Number(c.totalAmount),
                      weight: Number(c.weight || 0),
                      fish_name: c.fishType?.name || "Cá",
                    })) || [],
                };

                return viewMode === "grid" ? (
                  <SessionCard key={session.id} session={mappedSession} />
                ) : (
                  <SessionRow key={session.id} session={mappedSession} />
                );
              })}
            </div>
          </AnimatePresence>
        ) : (
          <SessionEmptyState />
        )}
      </div>

      {/* ======= MOBILE BOTTOM NAVIGATION BAR (fixed) ======= */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex items-center px-4 py-2 gap-3">
          {/* Filter shortcut */}
          <div className="flex gap-2 flex-1 overflow-x-auto no-scrollbar">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setActiveFilter(f.value)}
                className={cn(
                  "flex-shrink-0 flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all",
                  activeFilter === f.value
                    ? "text-blue-600"
                    : "text-gray-400"
                )}
              >
                <f.icon
                  size={20}
                  strokeWidth={activeFilter === f.value ? 2.5 : 1.5}
                />
                <span className="text-[9px] font-black tracking-wider">
                  {f.label}
                </span>
              </button>
            ))}
          </div>

          {/* Primary CTA button */}
          <button
            onClick={() => setOpenSessionModalOpen(true)}
            className="flex-shrink-0 flex items-center gap-2 h-12 px-5 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-200 active:scale-95 transition-all"
          >
            <Plus size={18} />
            <span className="text-xs font-black tracking-wide uppercase">Mở câu</span>
          </button>
        </div>
      </div>
    </div>
  );
}
