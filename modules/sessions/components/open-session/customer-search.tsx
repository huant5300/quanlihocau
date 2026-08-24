"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Phone, User, CheckCircle2, History, Search, Plus, Loader2 } from "lucide-react";
import { cn } from "@/utils/utils";
import { customerService } from "@/services/api/customer-service";
import { toast } from "sonner";

interface CustomerSearchProps {
  phone: string;
  name: string;
  onPhoneChange: (val: string) => void;
  onNameChange: (val: string) => void;
  onCustomerSelect?: (customerId: string) => void;
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

export function CustomerSearch({ phone, name, onPhoneChange, onNameChange, onCustomerSelect }: CustomerSearchProps) {
  const [isFound, setIsFound] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<{visitCount: number, spent: number} | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced search query (300ms)
  const debouncedQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search effect
  useEffect(() => {
    if (debouncedQuery.length >= 2 && !isFound) {
      searchCustomers(debouncedQuery);
    } else if (debouncedQuery.length < 2) {
      setSuggestions([]);
    }
  }, [debouncedQuery, isFound]);

  // Auto-lookup when typing 10 digits
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
    setIsSearching(true);
    try {
      const results = await customerService.getCustomers(query);
      setSuggestions(results || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setIsSearching(false);
    }
  };

  function handleSelectCustomer(customer: any) {
    onPhoneChange(customer.phone || "");
    const targetName = customer.fullName || customer.full_name || customer.name || "Khách quen";
    onNameChange(targetName);
    onCustomerSelect?.(customer.id);
    setIsFound(true);
    setCustomerInfo({
      visitCount: customer.visitCount !== undefined ? customer.visitCount : (customer.visit_count || 0),
      spent: Number(customer.totalSpent !== undefined ? customer.totalSpent : (customer.total_spent || 0))
    });
    setShowSuggestions(false);
    setSearchQuery("");
  }

  const handleCreateNewCustomer = async () => {
    if (!newCustomerName && !newCustomerPhone) {
      toast.error("Vui lòng nhập ít nhất tên hoặc số điện thoại");
      return;
    }
    setIsCreating(true);
    try {
      const result: any = await customerService.createCustomer({
        fullName: newCustomerName || "Khách mới",
        phone: newCustomerPhone || `temp_${Date.now()}`,
      });
      if (result) {
        handleSelectCustomer(result);
        setShowCreateForm(false);
        setNewCustomerName("");
        setNewCustomerPhone("");
        if (result.alreadyExisted) {
          toast.info(result.message || "Khách hàng đã có trong hệ thống, đã tự động chọn!");
        } else {
          toast.success("Đã tạo khách hàng mới!");
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Không thể tạo khách hàng");
    } finally {
      setIsCreating(false);
    }
  };

  const handleInputChange = (value: string, type: "phone" | "name") => {
    if (type === "phone") {
      onPhoneChange(value);
      setSearchQuery(value);
    } else {
      onNameChange(value);
      setSearchQuery(value);
    }
    setIsFound(false);
    if (value.length >= 2) {
      setShowSuggestions(true);
    }
  };

  const clearSelection = () => {
    setIsFound(false);
    setCustomerInfo(null);
    onPhoneChange("");
    onNameChange("");
    onCustomerSelect?.("");
    setSearchQuery("");
  };

  return (
    <div className="space-y-6" ref={containerRef}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary dark:text-primary-foreground font-bold">
            <User size={20} />
          </div>
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-800 dark:text-slate-200">Tìm khách hàng</h3>
        </div>
        {isFound && (
          <button
            type="button"
            onClick={clearSelection}
            className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-destructive transition-colors px-3 py-1.5 rounded-lg hover:bg-destructive/10"
          >
            Đổi khách
          </button>
        )}
      </div>

      {/* Google-style Search Bar */}
      {!isFound && (
        <div className="relative">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors z-10" size={22} />
            {isSearching && (
              <Loader2 className="absolute right-5 top-1/2 -translate-y-1/2 text-primary animate-spin z-10" size={18} />
            )}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleInputChange(e.target.value, e.target.value.match(/^\d/) ? "phone" : "name")}
              onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
              placeholder="Nhập tên hoặc số điện thoại khách hàng..."
              autoFocus
              className="w-full h-16 pl-14 pr-14 bg-slate-50 focus:bg-white text-slate-900 border-2 border-slate-300 focus:border-primary dark:bg-zinc-800 dark:focus:bg-zinc-900 dark:text-slate-100 dark:border-zinc-700 dark:focus:border-primary rounded-2xl outline-none transition-all font-bold text-base tracking-tight shadow-sm focus:shadow-lg"
            />
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 border-2 border-slate-300 dark:border-zinc-700 shadow-2xl rounded-[1.5rem] overflow-hidden z-50 animate-in slide-in-from-top-2">
              {suggestions.length > 0 && (
                <>
                  <div className="p-3 bg-slate-100 dark:bg-zinc-800 border-b-2 border-slate-200 dark:border-zinc-700">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">
                      Tìm thấy {suggestions.length} khách hàng
                    </p>
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
                </>
              )}

              {/* Create New Customer Button */}
              <div className="p-3 border-t-2 border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/50">
                {!showCreateForm ? (
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(true);
                      setNewCustomerPhone(searchQuery.match(/^\d/) ? searchQuery : "");
                      setNewCustomerName(!searchQuery.match(/^\d/) ? searchQuery : "");
                    }}
                    className="w-full h-14 rounded-2xl bg-primary/10 hover:bg-primary/20 text-primary font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <Plus size={16} />
                    Tạo khách hàng mới
                  </button>
                ) : (
                  <div className="space-y-3 animate-in slide-in-from-top-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary">Tạo khách hàng mới</p>
                    <input
                      type="text"
                      value={newCustomerName}
                      onChange={(e) => setNewCustomerName(e.target.value)}
                      placeholder="Tên khách (không bắt buộc)"
                      className="w-full h-12 px-4 bg-white dark:bg-zinc-900 rounded-xl border border-slate-300 dark:border-zinc-600 outline-none font-bold text-sm focus:border-primary text-slate-900 dark:text-white"
                    />
                    <input
                      type="tel"
                      value={newCustomerPhone}
                      onChange={(e) => setNewCustomerPhone(e.target.value)}
                      placeholder="Số điện thoại (không bắt buộc)"
                      className="w-full h-12 px-4 bg-white dark:bg-zinc-900 rounded-xl border border-slate-300 dark:border-zinc-600 outline-none font-bold text-sm focus:border-primary text-slate-900 dark:text-white"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowCreateForm(false)}
                        className="flex-1 h-14 rounded-2xl bg-slate-200 dark:bg-zinc-700 font-black text-xs uppercase tracking-widest hover:bg-slate-300 dark:hover:bg-zinc-600 transition-all"
                      >
                        Hủy
                      </button>
                      <button
                        type="button"
                        onClick={handleCreateNewCustomer}
                        disabled={isCreating}
                        className="flex-1 h-14 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.02] active:scale-95 transition-all"
                      >
                        {isCreating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                        Tạo ngay
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {suggestions.length === 0 && searchQuery.length >= 2 && !isSearching && (
                <div className="p-4 text-center text-sm text-muted-foreground italic">
                  Không tìm thấy khách hàng &quot;{searchQuery}&quot;
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Selected Customer Info */}
      {isFound && customerInfo && (
        <div className="p-5 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border-2 border-emerald-400/55 dark:border-emerald-800/60 animate-in slide-in-from-top-2 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-700 dark:text-emerald-400 shrink-0">
            <CheckCircle2 size={26} />
          </div>
          <div className="flex-1">
            <p className="text-xs font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-widest">
              {name || "Khách quen hệ thống"}
            </p>
            <p className="text-sm font-black text-emerald-900 dark:text-emerald-200 mt-0.5">
              {phone && <span>{phone} · </span>}
              Đã câu {customerInfo.visitCount} lần · Tổng: {customerInfo.spent.toLocaleString()}đ
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
