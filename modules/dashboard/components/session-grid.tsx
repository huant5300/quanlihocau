"use client";

import React from "react";
import { Waves } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SessionGridProps {
  children: React.ReactNode;
  isEmpty: boolean;
  count: number;
}

import { EmptyState } from "@/components/shared/states";

export function SessionGrid({ children, isEmpty, count }: SessionGridProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-black">Lượt câu đang hoạt động</h2>
          <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-xs font-bold">
            {count}
          </span>
        </div>
        <button className="text-sm font-bold text-primary hover:underline transition-all">
          Xem tất cả
        </button>
      </div>

      <AnimatePresence mode="wait">
        {isEmpty ? (
          <EmptyState 
            title="Chưa có lượt câu nào" 
            description="Hãy nhấn vào nút 'Mở lượt câu' để bắt đầu một phiên câu cá mới."
            icon={<Waves size={48} />}
          />
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
