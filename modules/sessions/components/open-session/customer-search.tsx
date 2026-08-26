"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Phone, User, CheckCircle2, History, Search, Plus, Loader2, Sparkles, X } from "lucide-react";
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

  // Debounced search query (250ms)
  const debouncedQuery = useDebounce(searchQuery, 250);

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
    if (debouncedQuery.trim().length >= 2 && !isFound) {
      searchCustomers(debouncedQuery.trim());
    } else if (debouncedQuery.trim().length < 2) {
      setSuggestions([]);
    }
  }, [debouncedQuery, isFound]);

  // Auto-lookup when typing 10 digits
  useEffect(() => {
    if (phone && phone.length === 10 && !isFound) {
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
    const customerPhone = customer.phone?.startsWith("KH_") ? "" : (customer.phone || "");
    const targetName = customer.fullName || customer.full_name || customer.name || "Khách quen";
    
    onPhoneChange(customerPhone);
    onNameChange(targetName);
    onCustomerSelect?.(customer.id);
    setIsFound(true);
    setCustomerInfo({
      visitCount: customer.visitCount !== undefined ? Number(customer.visitCount) : (Number(customer.visit_count) || 0),
      spent: Number(customer.totalSpent !== undefined ? customer.totalSpent : (customer.total_spent || 0))
    });
    setShowSuggestions(false);
    setShowCreateForm(false);
    setSearchQuery("");
  }

  const handleCreateNewCustomer = async () => {
    const trimmedName = newCustomerName.trim();
    const trimmedPhone = newCustomerPhone.trim();

    if (!trimmedName && !trimmedPhone) {
      toast.error("Vui lòng nhập ít nhất Tên khách hoặc Số điện thoại");
      return;
    }

    setIsCreating(true);
    try {
      const result: any = await customerService.createCustomer({
        fullName: trimmedName || "Khách quen",
        phone: trimmedPhone,
      });

      if (result) {
        handleSelectCustomer(result);
        setShowCreateForm(false);
        setNewCustomerName("");
        setNewCustomerPhone("");
        if (result.alreadyExisted) {
          toast.info(result.message || "Khách hàng đã có trong hệ thống, đã tự động chọn!");
        } else {
          toast.success(`Đã thêm khách hàng "${result.fullName || trimmedName}"! 🎉`);
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
    setShowCreateForm(false);
  };

  return (
    <div className="space-y-4" ref={containerRef}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary dark:text-primary-foreground font-bold">
            <User size={18} />
          </div>
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-800 dark:text-slate-200">
            Thông tin Cần thủ / Khách hàng
          </h3>
        </div>
        {isFound && (
          <button
            type="button"
            onClick={clearSelection}
            className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-destructive transition-colors px-3 py-1.5 rounded-lg hover:bg-destructive/10"
          >
            Đổi khách khác
          </button>
        )}
      </div>

      {/* Search Input */}
      {!isFound && (
        <div className="relative">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors z-10" size={18} />
            {isSearching && (
              <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 text-primary animate-spin z-10" size={16} />
            )}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                const val = e.target.value;
                handleInputChange(val, val.match(/^\d/) ? "phone" : "name");
              }}
              onFocus={() => {
                if (searchQuery.length >= 2) setShowSuggestions(true);
              }}
              placeholder="Nhập tên hoặc số điện thoại để tìm kiếm..."
              autoFocus
              className="w-full h-14 pl-12 pr-12 bg-slate-50 focus:bg-white text-slate-900 border-2 border-slate-300 focus:border-primary dark:bg-zinc-800 dark:focus:bg-zinc-900 dark:text-slate-100 dark:border-zinc-700 dark:focus:border-primary rounded-2xl outline-none transition-all font-bold text-sm shadow-xs"
            />
          </div>

          {/* Create Customer Inline Card */}
          <div className="mt-3 p-4 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-2xl space-y-3">
            {!showCreateForm ? (
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                  Khách mới chưa có trong danh bạ?
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(true);
                    setNewCustomerPhone(searchQuery.match(/^\d/) ? searchQuery : "");
                    setNewCustomerName(!searchQuery.match(/^\d/) ? searchQuery : "");
                  }}
                  className="h-9 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[11px] uppercase tracking-wider rounded-xl flex items-center gap-1.5 shadow-sm shadow-emerald-600/20 transition-all active:scale-95 cursor-pointer"
                >
                  <Plus size={14} />
                  <span>+ Thêm khách mới</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3 animate-in slide-in-from-top-2">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-700 pb-2">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <Sparkles size={14} />
                    Tạo thông tin khách hàng mới
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-500">Họ và tên khách</label>
                    <input
                      type="text"
                      value={newCustomerName}
                      onChange={(e) => setNewCustomerName(e.target.value)}
                      placeholder="Vd: Nguyễn Văn A"
                      className="w-full h-11 px-3.5 bg-white dark:bg-zinc-900 rounded-xl border border-slate-300 dark:border-zinc-600 outline-none font-bold text-xs focus:border-emerald-500 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-500">Số điện thoại</label>
                    <input
                      type="tel"
                      value={newCustomerPhone}
                      onChange={(e) => setNewCustomerPhone(e.target.value)}
                      placeholder="Vd: 0912345678"
                      className="w-full h-11 px-3.5 bg-white dark:bg-zinc-900 rounded-xl border border-slate-300 dark:border-zinc-600 outline-none font-bold text-xs focus:border-emerald-500 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 h-10 rounded-xl bg-slate-200 dark:bg-zinc-700 font-bold text-xs text-slate-700 dark:text-zinc-300 hover:bg-slate-300 transition-all"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateNewCustomer}
                    disabled={isCreating}
                    className="flex-1 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/25 disabled:opacity-50 transition-all active:scale-95 cursor-pointer"
                  >
                    {isCreating ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                    <span>Lưu khách hàng</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-16 left-0 right-0 mt-1 bg-white dark:bg-zinc-900 border-2 border-slate-300 dark:border-zinc-700 shadow-2xl rounded-2xl overflow-hidden z-50 animate-in slide-in-from-top-1">
              <div className="p-2.5 bg-slate-100 dark:bg-zinc-800 border-b border-slate-200 dark:border-zinc-700 flex justify-between items-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">
                  Tìm thấy {suggestions.length} cần thủ phù hợp
                </p>
                <button 
                  type="button" 
                  onClick={() => setShowSuggestions(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="max-h-56 overflow-y-auto no-scrollbar divide-y divide-slate-100 dark:divide-zinc-800">
                {suggestions.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleSelectCustomer(c)}
                    type="button"
                    className="w-full p-3.5 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 flex items-center justify-between group transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-700 dark:text-slate-300 group-hover:bg-emerald-600 group-hover:text-white transition-all font-bold text-xs">
                        {c.fullName?.[0]?.toUpperCase() || "K"}
                      </div>
                      <div>
                        <p className="font-black text-sm text-slate-900 dark:text-white">{c.fullName || "Khách quen"}</p>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 font-mono">{c.phone?.startsWith("KH_") ? "Chưa có SĐT" : c.phone}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase">
                        {c.visitCount !== undefined ? c.visitCount : (c.visit_count || 0)} ca câu
                      </p>
                      <p className="text-[11px] font-black text-slate-700 dark:text-slate-300">
                        {Number(c.totalSpent !== undefined ? c.totalSpent : (c.total_spent || 0)).toLocaleString()}đ
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Selected Customer Card Preview */}
      {isFound && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border-2 border-emerald-500/40 animate-in zoom-in-95 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-base shadow-sm">
              {name?.[0]?.toUpperCase() || "K"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-slate-900 dark:text-white uppercase">{name || "Khách quen"}</span>
                <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 uppercase">Đã chọn</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-zinc-400 font-medium mt-0.5">
                {phone ? <span>{phone} · </span> : null}
                {customerInfo ? `Đã câu ${customerInfo.visitCount} lần (Tổng chi: ${customerInfo.spent.toLocaleString()}đ)` : "Khách mới"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={clearSelection}
            className="h-8 px-3 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold hover:bg-slate-100 transition-colors"
          >
            Đổi
          </button>
        </div>
      )}
    </div>
  );
}
