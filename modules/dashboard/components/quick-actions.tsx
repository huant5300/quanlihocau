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

export function QuickActions() {
  const actions = [
    { label: "Mở lượt câu", icon: Plus, color: "bg-primary text-white" },
    { label: "Quét mã QR", icon: ScanLine, color: "bg-blue-600 text-white" },
    { label: "Thêm khách", icon: UserPlus, color: "bg-slate-800 text-white" },
    { label: "Nhập hàng", icon: PackagePlus, color: "bg-slate-800 text-white" },
    { label: "Xuất báo cáo", icon: FileText, color: "bg-slate-800 text-white" },
  ];

  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
      {actions.map((action, index) => (
        <motion.button
          key={action.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
          className="flex flex-col items-center gap-2 min-w-[100px] group"
        >
          <div className={`w-14 h-14 ${action.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 active:scale-95 transition-all duration-300`}>
            <action.icon size={24} />
          </div>
          <span className="text-xs font-bold whitespace-nowrap">{action.label}</span>
        </motion.button>
      ))}
    </div>
  );
}
