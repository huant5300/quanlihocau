"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Fish, Loader2, User, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error === "CredentialsSignin") {
          toast.error("Sai email hoặc mật khẩu");
        } else {
          toast.error("Lỗi hệ thống: " + result.error);
        }
      } else {
        toast.success("Đăng nhập thành công");
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error) {
      toast.error("Đã có lỗi xảy ra");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center p-4 selection:bg-primary/20 selection:text-primary relative overflow-hidden">
      {/* Background Decorative Elements (Ambient Glows) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/15 blur-[130px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[130px] rounded-full animate-pulse" />
        <div className="absolute top-[30%] right-[20%] w-[300px] h-[300px] bg-indigo-500/5 blur-[100px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-[440px] bg-white/[0.02] backdrop-blur-2xl border border-white/5 p-8 sm:p-10 rounded-[2.5rem] shadow-2xl relative z-10 shadow-primary/5"
      >
        {/* Quay lại trang chủ */}
        <div className="mb-6">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-450 hover:text-white transition-colors uppercase tracking-widest"
          >
            ← Quay lại trang chủ
          </Link>
        </div>

        {/* Logo */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white mb-4 shadow-xl shadow-primary/20 hover:scale-105 transition-all">
            <Fish size={32} />
          </div>
          <h1 className="text-2xl font-black text-white tracking-wider uppercase">Quản lý Hồ câu</h1>
          <p className="text-slate-400 text-xs font-semibold mt-2">Đăng nhập hệ thống quản lý ca câu</p>
          <div className="mt-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold uppercase tracking-widest text-[8px] px-3 py-1 rounded-full">
            BẢN BETA DO FOUNDER HUANTRAN SÁNG LẬP
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="email"
                placeholder="Email tài khoản"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-14 bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="password"
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-14 bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 bg-primary hover:bg-primary/95 text-white font-black uppercase tracking-widest text-xs rounded-2xl flex items-center justify-center gap-3 transition-all disabled:opacity-50 shadow-xl shadow-primary/20 active:scale-[0.98]"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : "Đăng nhập ngay"}
          </button>
        </form>

        <div className="mt-8 flex items-center gap-4">
          <div className="h-px flex-1 bg-white/5" />
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Hoặc</span>
          <div className="h-px flex-1 bg-white/5" />
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          type="button"
          className="w-full h-14 bg-white/[0.03] border border-white/10 text-slate-200 font-bold text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-3 mt-6 hover:bg-white/10 transition-all disabled:opacity-50 active:scale-[0.98]"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Tiếp tục với Google
        </button>

        {/* Footer */}
        <p className="text-center text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-8 leading-relaxed">
          Bằng cách đăng nhập, bạn đồng ý với <br /> 
          <a href="#" className="text-slate-400 hover:text-white underline transition-colors">Điều khoản</a> & <a href="#" className="text-slate-400 hover:text-white underline transition-colors">Chính sách</a>
        </p>
      </motion.div>
    </div>
  );
}
