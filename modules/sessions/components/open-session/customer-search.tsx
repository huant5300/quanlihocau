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
    const targetName = customer.full_name || customer.name || "Khách quen";
    onNameChange(targetName);
    setIsFound(true);
    setCustomerInfo({
      visitCount: customer.visit_count || 0,
      spent: customer.total_spent || 0
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
        <div className="w-10 h-10 rounded-xl bg-accent/50 flex items-center justify-center text-muted-foreground">
          <User size={18} />
        </div>
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Thông tin khách hàng</h3>
      </div>
      
      <div className="relative">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Phone Input */}
          <div className="relative group">
            <Phone className={cn(
              "absolute left-4 top-1/2 -translate-y-1/2 transition-colors",
              isFound ? "text-green-500" : "text-muted-foreground group-focus-within:text-primary"
            )} size={20} />
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
              onChange={(e) => {
                onNameChange(e.target.value);
                searchCustomers(e.target.value);
                setIsFound(false);
              }}
              onFocus={() => name.length >= 2 && setShowSuggestions(true)}
              placeholder="Họ và tên khách hàng"
              className="w-full h-16 pl-12 pr-4 bg-accent/50 rounded-2xl border-2 border-transparent focus:border-primary/20 focus:bg-background outline-none transition-all font-bold"
            />
          </div>
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border shadow-2xl rounded-[1.5rem] overflow-hidden z-50 animate-in slide-in-from-top-2">
            <div className="p-3 bg-accent/30 border-b border-border/50">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Khách hàng cũ khớp với tìm kiếm</p>
            </div>
            <div className="max-h-60 overflow-y-auto no-scrollbar">
              {suggestions.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleSelectCustomer(c)}
                  className="w-full p-4 hover:bg-primary/5 flex items-center justify-between group transition-colors border-b border-border/10 last:border-0"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-white transition-all">
                      <History size={18} />
                    </div>
                    <div className="text-left">
                      <p className="font-black text-sm uppercase tracking-tight">{c.full_name}</p>
                      <p className="text-[10px] font-bold text-muted-foreground">{c.phone}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest">{c.visit_count || 0} Lượt câu</p>
                    <p className="text-[9px] font-bold text-muted-foreground">{(c.total_spent || 0).toLocaleString()}đ</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {isFound && customerInfo && (
        <div className="p-4 bg-green-500/10 rounded-2xl border border-green-500/20 animate-in slide-in-from-top-2 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 shrink-0">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-green-500 uppercase tracking-widest">Khách quen hệ thống</p>
            <p className="text-xs font-bold mt-0.5">Đã câu {customerInfo.visitCount} lần. Tổng chi tiêu: {customerInfo.spent.toLocaleString()}đ.</p>
          </div>
        </div>
      )}
    </div>
  );
}
