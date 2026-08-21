"use client";

import React from "react";
import { Phone, Calendar, ArrowRight, Wallet, User } from "lucide-react";
import { motion } from "framer-motion";
import { Customer as PrismaCustomer } from "@prisma/client";

interface CustomerCardProps {
  customer: PrismaCustomer;
  onClick?: (customer: PrismaCustomer) => void;
}

export function CustomerCard({ customer, onClick }: CustomerCardProps) {
  return (
    <motion.div
      layout
      whileHover={{ y: -2 }}
      onClick={() => onClick?.(customer)}
      className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-2xs flex flex-col gap-4 cursor-pointer group transition-all"
    >
      {/* Header: Name & Phone */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-extrabold text-base shrink-0">
            {customer.fullName?.charAt(0)?.toUpperCase() || "K"}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate group-hover:text-emerald-600 transition-colors">
              {customer.fullName}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="flex items-center gap-1 text-slate-500 text-xs">
                <Phone size={11} />
                <span>{customer.phone || "---"}</span>
              </div>
              {Number(customer.debtBalance) > 0 && (
                <span className="bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded text-[10px] font-bold border border-rose-200">
                  Nợ: {Number(customer.debtBalance).toLocaleString()} đ
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-slate-50 dark:bg-zinc-800/60 rounded-xl p-3 border border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-1.5 text-slate-400 mb-0.5">
            <Wallet size={12} />
            <span className="text-[10px] font-bold">Tổng chi tiêu</span>
          </div>
          <p className="font-extrabold text-slate-900 dark:text-white">{Number(customer.totalSpent || 0).toLocaleString()} đ</p>
        </div>
        <div className="bg-slate-50 dark:bg-zinc-800/60 rounded-xl p-3 border border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-1.5 text-slate-400 mb-0.5">
            <Calendar size={12} />
            <span className="text-[10px] font-bold">Lượt câu</span>
          </div>
          <p className="font-extrabold text-slate-900 dark:text-white">{customer.visitCount || 0} lần</p>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-zinc-800 text-xs">
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 font-medium">Tham gia từ</span>
          <span className="text-[11px] font-bold text-slate-700 dark:text-zinc-300">
            {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString("vi-VN") : "---"}
          </span>
        </div>
        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-500 group-hover:bg-emerald-600 group-hover:text-white transition-all">
          <ArrowRight size={14} />
        </div>
      </div>
    </motion.div>
  );
}

