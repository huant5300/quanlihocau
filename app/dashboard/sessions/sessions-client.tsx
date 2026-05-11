"use client";

import React from "react";
import { SessionCard } from "@/modules/sessions/components/session-card";
import { SessionEmptyState } from "@/modules/sessions/components/session-empty-state";
import { RealtimeStatusBar } from "@/modules/dashboard/widgets/realtime-status-bar";
import { Plus } from "lucide-react";
import { useUIStore } from "@/stores/ui-store";
import { FishingSession } from "@/modules/sessions/types/session.types";
import { motion, AnimatePresence } from "framer-motion";

interface SessionsClientProps {
  initialSessions: FishingSession[];
}

export function SessionsClient({ initialSessions: sessions }: SessionsClientProps) {
  const { setOpenSessionModalOpen } = useUIStore();

  return (
    <div className="space-y-6">
      <RealtimeStatusBar />

      {sessions.length === 0 ? (
        <SessionEmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          <AnimatePresence mode="popLayout">
            {sessions.map((session) => (
              <motion.div
                key={session.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <SessionCard session={session} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
      
      {/* Floating Action Button for Mobile */}
      <button
        onClick={() => setOpenSessionModalOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center lg:hidden z-50 hover:scale-110 active:scale-95 transition-all"
      >
        <Plus size={32} strokeWidth={3} />
      </button>
    </div>
  );
}
