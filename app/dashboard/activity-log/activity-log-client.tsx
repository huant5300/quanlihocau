"use client";

import React, { useState } from "react";
import { ScrollText, Filter, User, Clock, Ticket, ShoppingBag, Fish, CreditCard, Users, FileText } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { motion } from "framer-motion";
import { cn } from "@/utils/utils";
import { useQuery } from "@tanstack/react-query";
import { axiosApiClient } from "@/services/api/axios-client";

interface ActivityLog {
  id: string;
  action: string;
  details: any;
  entityType: string | null;
  entityId: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
}

interface ActivityLogClientProps {
  initialLogs: ActivityLog[];
}

const actionLabels: Record<string, { label: string; icon: any; color: string }> = {
  START_SESSION: { label: "Tạo vé câu", icon: Ticket, color: "text-emerald-500 bg-emerald-500/10" },
  COMPLETE_SESSION: { label: "Hoàn tất phiên", icon: Ticket, color: "text-blue-500 bg-blue-500/10" },
  CANCEL_SESSION: { label: "Hủy phiên", icon: Ticket, color: "text-red-500 bg-red-500/10" },
  EXTEND_SESSION: { label: "Gia hạn giờ", icon: Clock, color: "text-purple-500 bg-purple-500/10" },
  ADD_PRODUCT: { label: "Thêm sản phẩm", icon: ShoppingBag, color: "text-orange-500 bg-orange-500/10" },
  FISH_BUYBACK: { label: "Thu cá", icon: Fish, color: "text-cyan-500 bg-cyan-500/10" },
  FISH_STOCK_ADD: { label: "Nhập cá", icon: Fish, color: "text-emerald-500 bg-emerald-500/10" },
  FISH_STOCK_DEAD: { label: "Cá chết", icon: Fish, color: "text-red-500 bg-red-500/10" },
  FISH_STOCK_ADD_MORE: { label: "Thả thêm cá", icon: Fish, color: "text-green-500 bg-green-500/10" },
  CHECKOUT: { label: "Thanh toán", icon: CreditCard, color: "text-green-500 bg-green-500/10" },
  PAYMENT: { label: "Thu tiền", icon: CreditCard, color: "text-emerald-500 bg-emerald-500/10" },
  REFUND: { label: "Hoàn tiền", icon: CreditCard, color: "text-red-500 bg-red-500/10" },
  CREATE_CUSTOMER: { label: "Tạo khách", icon: Users, color: "text-blue-500 bg-blue-500/10" },
  UPDATE_CUSTOMER: { label: "Sửa khách", icon: Users, color: "text-amber-500 bg-amber-500/10" },
  DELETE_CUSTOMER: { label: "Xóa khách", icon: Users, color: "text-red-500 bg-red-500/10" },
  SHIFT_CLOSE: { label: "Kết ca", icon: FileText, color: "text-violet-500 bg-violet-500/10" },
  SHIFT_CLOSE_FLAGGED: { label: "Kết ca - Lệch", icon: FileText, color: "text-red-500 bg-red-500/10" },
};

const entityTypeFilters = [
  { value: "", label: "Tất cả" },
  { value: "SESSION", label: "Vé câu" },
  { value: "PRODUCT", label: "Sản phẩm" },
  { value: "FISH", label: "Cá" },
  { value: "PAYMENT", label: "Thanh toán" },
  { value: "CUSTOMER", label: "Khách hàng" },
  { value: "SHIFT", label: "Kết ca" },
];

export function ActivityLogClient({ initialLogs }: ActivityLogClientProps) {
  const [selectedFilter, setSelectedFilter] = useState("");

  const { data: logs = initialLogs } = useQuery({
    queryKey: ["activity-logs", selectedFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedFilter) params.set("entityType", selectedFilter);
      params.set("limit", "100");
      const response = await axiosApiClient.get<any>(`/api/v1/activity-log?${params.toString()}`);
      if (!response.success) throw new Error(response.error?.message);
      return response.data?.data || response.data || [];
    },
    initialData: !selectedFilter ? initialLogs : undefined,
    staleTime: 10000,
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight uppercase flex items-center gap-3">
            <ScrollText size={28} className="text-primary" />
            Nhật Ký Hoạt Động
          </h1>
          <p className="text-xs text-muted-foreground font-bold mt-1">Ghi log toàn bộ thao tác trong hệ thống</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter size={16} className="text-muted-foreground" />
        {entityTypeFilters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setSelectedFilter(filter.value)}
            className={cn(
              "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              selectedFilter === filter.value
                ? "bg-primary text-white shadow-lg shadow-primary/20"
                : "bg-accent/50 text-muted-foreground hover:bg-accent"
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Log List */}
      <div className="glass-card rounded-[2rem] overflow-hidden">
        <div className="max-h-[70vh] overflow-y-auto">
          {logs.length > 0 ? (
            <div className="divide-y divide-border/30">
              {logs.map((log: ActivityLog, idx: number) => {
                const actionInfo = actionLabels[log.action] || {
                  label: log.action,
                  icon: ScrollText,
                  color: "text-slate-500 bg-slate-500/10",
                };
                const IconComp = actionInfo.icon;
                const colorParts = actionInfo.color.split(" ");

                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(idx * 0.02, 0.5) }}
                    className="flex items-center gap-4 p-4 hover:bg-accent/20 transition-colors"
                  >
                    {/* Icon */}
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", colorParts[1])}>
                      <IconComp size={18} className={colorParts[0]} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={cn("text-xs font-black uppercase tracking-wider", colorParts[0])}>
                          {actionInfo.label}
                        </span>
                        {log.entityType && (
                          <span className="text-[9px] font-bold text-muted-foreground bg-accent px-2 py-0.5 rounded">
                            {log.entityType}
                          </span>
                        )}
                      </div>
                      {log.details && (
                        <p className="text-[11px] text-muted-foreground font-medium mt-0.5 truncate max-w-[400px]">
                          {typeof log.details === "string" ? log.details : JSON.stringify(log.details).slice(0, 100)}
                        </p>
                      )}
                    </div>

                    {/* User */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-black">
                        {log.user.name?.[0] || "U"}
                      </div>
                      <span className="text-[10px] font-bold text-muted-foreground hidden md:block max-w-[100px] truncate">
                        {log.user.name || log.user.email || "System"}
                      </span>
                    </div>

                    {/* Time */}
                    <div className="text-right shrink-0">
                      <p className="text-[10px] font-black text-muted-foreground">
                        {format(new Date(log.createdAt), "HH:mm")}
                      </p>
                      <p className="text-[9px] text-muted-foreground">
                        {format(new Date(log.createdAt), "dd/MM/yy")}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center text-muted-foreground italic">
              Chưa có nhật ký hoạt động nào.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
