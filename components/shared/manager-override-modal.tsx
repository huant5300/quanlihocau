"use client";

import React, { useState } from "react";
import { X, ShieldCheck, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface ManagerOverrideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApproved: (credentials: { username: string; password?: string }) => void;
  title?: string;
  description?: string;
}

export function ManagerOverrideModal({
  isOpen,
  onClose,
  onApproved,
  title = "Yêu cầu Quản lý Phê duyệt",
  description = "Thao tác này yêu cầu quyền của Quản lý hoặc Chủ Hồ để tiếp tục. Vui lòng xác thực tài khoản."
}: ManagerOverrideModalProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/v1/user/verify-manager", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(`Được phê duyệt bởi: ${data.name}`);
        onApproved({ username, password });
        // Reset form
        setUsername("");
        setPassword("");
        onClose();
      } else {
        toast.error(data.message || "Xác thực phê duyệt thất bại");
      }
    } catch (error) {
      toast.error("Lỗi kết nối máy chủ xác thực");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-background/80 backdrop-blur-md"
        />

        {/* Modal Box */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-md bg-card border border-border shadow-2xl rounded-[2rem] overflow-hidden flex flex-col z-10"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-border/50 flex items-center justify-between bg-card/50 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h3 className="text-base font-black uppercase tracking-tight">{title}</h3>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
                  Bảo mật chống thất thoát
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center hover:bg-accent/80 transition-all active:scale-90"
            >
              <X size={18} />
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              {description}
            </p>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                Tài khoản Quản lý / Chủ Hồ
              </label>
              <input
                type="text"
                placeholder="Email hoặc Tên đăng nhập"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full h-12 px-4 bg-accent/40 rounded-xl border border-border outline-none font-bold text-sm focus:border-primary text-foreground"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                Mật khẩu xác thực
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 px-4 bg-accent/40 rounded-xl border border-border outline-none font-bold text-sm focus:border-primary text-foreground"
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="h-12 bg-accent/50 hover:bg-accent rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
                disabled={isLoading}
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="h-12 bg-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                {isLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  "Xác nhận phê duyệt"
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
