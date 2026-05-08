"use client";

import React from "react";
import { cn } from "@/utils/utils";
import { PaymentMethod } from "../types/payment.types";
import { Banknote, CreditCard, QrCode } from "lucide-react";
import { motion } from "framer-motion";

interface PaymentMethodSelectorProps {
  selected: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
}

export function PaymentMethodSelector({ selected, onSelect }: PaymentMethodSelectorProps) {
  const methods: { id: PaymentMethod, label: string, icon: any }[] = [
    { id: "Cash", label: "Tiền mặt", icon: Banknote },
    { id: "Bank Transfer", label: "Chuyển khoản", icon: CreditCard },
    { id: "QR Payment", label: "Quét mã QR", icon: QrCode },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Phương thức thanh toán</h3>
      <div className="grid grid-cols-3 gap-3">
        {methods.map((m) => (
          <motion.button
            key={m.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(m.id)}
            className={cn(
              "flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all",
              selected === m.id 
                ? "border-primary bg-primary/10 text-primary shadow-lg shadow-primary/20" 
                : "border-transparent bg-accent/50 text-muted-foreground"
            )}
          >
            <m.icon size={24} strokeWidth={2.5} />
            <span className="text-[10px] font-black uppercase tracking-tight">{m.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
