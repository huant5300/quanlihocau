"use client";

import React from "react";
import { Plus, Search, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { sessionService } from "@/services/api/session-service";
import { SessionRow } from "@/modules/sessions/components/session-row";
import { SessionCardSkeleton } from "@/modules/sessions/skeletons/session-skeleton";
import { SessionEmptyState } from "@/modules/sessions/components/session-empty-state";
import { useUIStore } from "@/stores/ui-store";
import { cn } from "@/utils/utils";

interface SessionsClientProps {
  initialSessions: any[];
}

export function SessionsClient({ initialSessions }: SessionsClientProps) {
  const { setOpenSessionModalOpen } = useUIStore();
  const [searchQuery, setSearchQuery] = React.useState("");

  const { data: sessions = initialSessions, isLoading } = useQuery({
    queryKey: ["active-sessions"],
    queryFn: () => sessionService.getSessions("ACTIVE"),
    refetchInterval: 30000, // Refresh every 30 seconds for "real-time" feel
  });

  const filteredSessions = sessions.filter((s: any) => 
    s.area?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.customer?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.hut_number?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Search & Actions Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md group">
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm ô số, khách hàng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-16 pl-14 pr-6 bg-card/50 backdrop-blur-md rounded-[2rem] border border-border/50 focus:border-primary/30 outline-none font-bold text-sm transition-all shadow-xl shadow-black/5"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="h-16 px-6 bg-card/50 backdrop-blur-md rounded-2xl border border-border/50 flex items-center justify-center hover:bg-accent transition-all active:scale-95">
            <Filter size={20} />
          </button>
          <button 
            onClick={() => setOpenSessionModalOpen(true)}
            className="flex-1 md:flex-none h-16 px-8 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Plus size={20} />
            Mở lượt câu
          </button>
        </div>
      </div>

      {/* Sessions List (Single Row Layout) */}
      {isLoading && sessions.length === 0 ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-24 bg-card/20 animate-pulse rounded-[2rem]" />
          ))}
        </div>
      ) : filteredSessions.length > 0 ? (
        <div className="flex flex-col gap-4">
          <AnimatePresence mode="popLayout">
            {filteredSessions.map((session: any) => (
              <SessionRow 
                key={session.id} 
                session={{
                  ...session,
                  hut_number: session.area?.name || "N/A",
                  customer_name: session.customer?.fullName || "Khách lẻ",
                  phone: session.customer?.phone,
                  total_amount: Number(session.sessionAmount || 0),
                  session_products: session.invoices?.[0]?.items?.map((item: any) => ({
                    id: item.id,
                    name: item.description,
                    quantity: item.quantity,
                    price: Number(item.unitPrice)
                  })) || [],
                  fish_buybacks: session.fishCatches?.map((c: any) => ({
                    id: c.id,
                    total_price: Number(c.totalAmount)
                  })) || []
                }} 
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <SessionEmptyState />
      )}
    </div>
  );
}
