"use client";

import React, { useState, useEffect, useRef } from "react";
import { Phone, User, CheckCircle2, History, Search } from "lucide-react";
import { cn } from "@/utils/utils";
import { customerService } from "@/services/api/customer-service";

interface CustomerSearchProps {
  phone: string;
  name: string;
  onPhoneChange: (val: string) => void;
  onNameChange: (val: string) => void;
}

export function CustomerSearch({ phone, name, onPhoneChange, onNameChange }: CustomerSearchProps) {
  const [isFound, setIsFound] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<{visitCount: number, spent: number} | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Automatic high-contrast instant lookup when typing 10 digits
  useEffect(() => {
    if (phone.length === 10 && !isFound) {
      const autoLookup = async () => {
        try {
          const results = await customerService.getCustomers(phone);
          if (results && results.length > 0) {
            const exactMatch = results.find((c: any) => c.phone === phone);
            if (exactMatch) {
              handleSelectCustomer(exactMatch);
            }
          }
        } catch (error) {
          console.error("Auto lookup failed", error);
        }
      };
      autoLookup();
    }
  }, [phone, isFound]);

  const searchCustomers = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      const results = await customerService.getCustomers(query);
      setSuggestions(results || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Search failed", error);
    }
  };

  function handleSelectCustomer(customer: any) {
    onPhoneChange(customer.phone || "");
    const targetName = customer.fullName || customer.full_name || customer.name || "Khách quen";
    onNameChange(targetName);
    setIsFound(true);
    setCustomerInfo({
      visitCount: customer.visitCount !== undefined ? customer.visitCount : (customer.visit_count || 0),
      spent: Number(customer.totalSpent !== undefined ? customer.totalSpent : (customer.total_spent || 0))
    });
    setShowSuggestions(false);

    // Jump focus down to the first available Ô số button to optimize staff flow!
    setTimeout(() => {
      const firstAvailableSpot = document.querySelector('button[title*="Chọn ô số"]') as HTMLButtonElement;
      if (firstAvailableSpot) {
        firstAvailableSpot.focus();
        firstAvailableSpot.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        const activeElement = document.activeElement as HTMLElement;
        if (activeElement) activeElement.blur();
      }
    }, 150);
  }

  return (
    <div className="space-y-6" ref={containerRef}>
      <div className="flex items-center gap-4 mb-2">
        <div className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary dark:text-primary-foreground font-bold">
          <User size={20} />
        </div>
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-800 dark:text-slate-200">Thông tin khách hàng</h3>
      </div>
      
      <div className="relative">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Phone Input */}
          <div className="relative group">
            <Phone className={cn(
              "absolute left-4 top-1/2 -translate-y-1/2 transition-colors z-10",
              isFound ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 group-focus-within:text-primary"
            )} size={22} />
            <input 
              type="tel"
              value={phone}
              onChange={(e) => {
                onPhoneChange(e.target.value);
                searchCustomers(e.target.value);
                setIsFound(false);
              }}
              onFocus={() => phone.length >= 2 && setShowSuggestions(true)}
              placeholder="Số điện thoại khách (VD: 09...)"
              className="w-full h-16 pl-12 pr-12 bg-slate-50 focus:bg-white text-slate-900 border-2 border-slate-300 focus:border-primary dark:bg-zinc-800 dark:focus:bg-zinc-900 dark:text-slate-100 dark:border-zinc-700 dark:focus:border-primary rounded-2xl outline-none transition-all font-black text-lg tracking-tight"
            />
            {isFound && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400 animate-in zoom-in z-10">
                <CheckCircle2 size={26} />
              </div>
            )}
          </div>

          {/* Name Input */}
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors z-10" size={22} />
            <input 
              type="text"
              value={name}
              onChange={(e) => {
                onNameChange(e.target.value);
                searchCustomers(e.target.value);
                setIsFound(false);
              }}
              onFocus={() => name.length >= 2 && setShowSuggestions(true)}
              placeholder="Họ và tên khách hàng"
              className="w-full h-16 pl-12 pr-4 bg-slate-50 focus:bg-white text-slate-900 border-2 border-slate-300 focus:border-primary dark:bg-zinc-800 dark:focus:bg-zinc-900 dark:text-slate-100 dark:border-zinc-700 dark:focus:border-primary rounded-2xl outline-none transition-all font-black text-lg"
            />
          </div>
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 border-2 border-slate-300 dark:border-zinc-700 shadow-2xl rounded-[1.5rem] overflow-hidden z-50 animate-in slide-in-from-top-2">
            <div className="p-3 bg-slate-100 dark:bg-zinc-800 border-b-2 border-slate-200 dark:border-zinc-700">
              <p className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">Khách hàng cũ khớp với tìm kiếm</p>
            </div>
            <div className="max-h-60 overflow-y-auto no-scrollbar">
              {suggestions.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleSelectCustomer(c)}
                  type="button"
                  className="w-full p-4 hover:bg-primary/10 dark:hover:bg-primary/20 flex items-center justify-between group transition-colors border-b border-slate-200 dark:border-zinc-850 last:border-0"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-700 dark:text-slate-300 group-hover:bg-primary group-hover:text-white transition-all">
                      <History size={20} />
                    </div>
                    <div className="text-left">
                      <p className="font-black text-base text-slate-900 dark:text-white uppercase tracking-tight">{c.fullName || c.full_name || "Khách quen"}</p>
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-400">{c.phone}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-primary dark:text-primary-foreground uppercase tracking-widest">{c.visitCount !== undefined ? c.visitCount : (c.visit_count || 0)} Lượt câu</p>
                    <p className="text-xs font-black text-slate-700 dark:text-slate-350">{Number(c.totalSpent !== undefined ? c.totalSpent : (c.total_spent || 0)).toLocaleString()}đ</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {isFound && customerInfo && (
        <div className="p-5 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border-2 border-emerald-400/55 dark:border-emerald-800/60 animate-in slide-in-from-top-2 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-700 dark:text-emerald-400 shrink-0">
            <CheckCircle2 size={26} />
          </div>
          <div>
            <p className="text-xs font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-widest">Khách quen hệ thống</p>
            <p className="text-base font-black text-emerald-900 dark:text-emerald-200 mt-0.5">
              Đã câu {customerInfo.visitCount} lần. Tổng chi tiêu tích lũy: {customerInfo.spent.toLocaleString()}đ.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
