"use client";

import React from "react";
import { 
  Plus, 
  UserPlus, 
  PackagePlus, 
  FileText,
  ScanLine
} from "lucide-react";
import { motion } from "framer-motion";
import { useUIStore } from "@/stores/ui-store";

export function QuickActions() {
  const { setOpenSessionModalOpen } = useUIStore();

  const actions = [
    { id: "open", label: "Mở lượt câu", icon: Plus, color: "bg-primary text-white shadow-primary/30", onClick: () => setOpenSessionModalOpen(true) },
    { id: "qr", label: "Quét mã QR", icon: ScanLine, color: "bg-blue-600 text-white shadow-blue-600/30" },
    { id: "customer", label: "Thêm khách", icon: UserPlus, color: "bg-card text-foreground border border-border" },
    { id: "product", label: "Nhập hàng", icon: PackagePlus, color: "bg-card text-foreground border border-border" },
    { id: "report", label: "Báo cáo", icon: FileText, color: "bg-card text-foreground border border-border" },
  ];

  return (
    <div className="flex items-center gap-6 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
      {actions.map((action, index) => (
        <motion.button
          key={action.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          onClick={action.onClick}
          className="flex flex-col items-center gap-3 min-w-[100px] group outline-none"
        >
          <div className={`w-16 h-16 ${action.color} rounded-[1.5rem] flex items-center justify-center shadow-2xl group-hover:scale-110 active:scale-90 transition-all duration-300 min-h-[48px]`}>
            <action.icon size={26} strokeWidth={2.5} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
            {action.label}
          </span>
        </motion.button>
      ))}
    </div>
  );
}
