"use client";

import React, { useState } from "react";
import { Phone, User, CheckCircle2 } from "lucide-react";
import { cn } from "@/utils/utils";

interface CustomerSearchProps {
  phone: string;
  name: string;
  onPhoneChange: (val: string) => void;
  onNameChange: (val: string) => void;
}

export function CustomerSearch({ phone, name, onPhoneChange, onNameChange }: CustomerSearchProps) {
  const [isFound, setIsFound] = useState(false);

  const [customerInfo, setCustomerInfo] = useState<{visitCount: number, spent: number} | null>(null);

  // Real auto-detect logic
  const handlePhoneChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onPhoneChange(val);
    
    if (val.length >= 8) {
      try {
        const { customerService } = await import("@/services/api/customer-service");
        const customers = await customerService.getCustomers(val);
        if (customers && customers.length > 0) {
          const matched = customers[0];
          onNameChange(matched.full_name);
          setIsFound(true);
          setCustomerInfo({
            visitCount: matched.visit_count || 0,
            spent: matched.total_spent || 0
          });
        } else {
          setIsFound(false);
          setCustomerInfo(null);
        }
      } catch (error) {
        setIsFound(false);
        setCustomerInfo(null);
      }
    } else {
      setIsFound(false);
      setCustomerInfo(null);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Thông tin Khách hàng</h3>
      
      <div className="space-y-4">
        {/* Phone Input */}
        <div className="relative group">
          <Phone className={cn(
            "absolute left-4 top-1/2 -translate-y-1/2 transition-colors",
            isFound ? "text-green-500" : "text-muted-foreground group-focus-within:text-primary"
          )} size={20} />
          <input 
            type="tel"
            value={phone}
            onChange={handlePhoneChange}
            placeholder="Số điện thoại khách (VD: 09...)"
            className="w-full h-16 pl-12 pr-4 bg-accent/50 rounded-2xl border-2 border-transparent focus:border-primary/20 focus:bg-background outline-none transition-all font-black text-lg tracking-tight"
          />
          {isFound && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500 animate-in zoom-in">
              <CheckCircle2 size={24} />
            </div>
          )}
        </div>

        {/* Name Input */}
        <div className="relative group">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
          <input 
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Họ và tên khách hàng"
            className="w-full h-14 pl-12 pr-4 bg-accent/50 rounded-2xl border-2 border-transparent focus:border-primary/20 focus:bg-background outline-none transition-all font-bold"
          />
        </div>
      </div>

      {isFound && customerInfo && (
        <div className="p-4 bg-green-500/10 rounded-2xl border border-green-500/20 animate-in slide-in-from-top-2">
          <p className="text-[10px] font-black text-green-500 uppercase tracking-widest">Khách quen hệ thống</p>
          <p className="text-xs font-bold mt-1">Khách hàng này đã câu {customerInfo.visitCount} lần tại hồ. Tổng chi tiêu: {customerInfo.spent.toLocaleString()}đ.</p>
        </div>
      )}
    </div>
  );
}
