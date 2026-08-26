"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Fish, Loader2, User, Lock, Phone, Eye, EyeOff, Mail, Sparkles, MapPin, Building2, Check, ArrowRight, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { VIETNAM_PROVINCES } from "@/utils/vietnam-provinces";

type MainTab = "login" | "register";

export default function LoginPage() {
  const router = useRouter();
  const [mainTab, setMainTab] = useState<MainTab>("login");

  // Login states
  const [loginId, setLoginId] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register states - Step 1
  const [regStep, setRegStep] = useState<1 | 2>(1);
  const [regPhone, setRegPhone] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regName, setRegName] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regMethod, setRegMethod] = useState<"phone" | "email">("phone");

  // Register states - Step 2 (Cấu hình hồ câu bắt buộc)
  const [lakeName, setLakeName] = useState("");
  const [lakePhone, setLakePhone] = useState("");
  const [lakeProvince, setLakeProvince] = useState("TP. Hồ Chí Minh");
  const [lakeAddress, setLakeAddress] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [lockedError, setLockedError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ── ĐĂNG NHẬP BẰNG SỐ ĐIỆN THOẠI / EMAIL + MẬT KHẨU ──
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLockedError(false);
    
    if (!loginId.trim() || !loginPassword) {
      toast.error("Vui lòng nhập số điện thoại (hoặc email) và mật khẩu");
      return;
    }
    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        email: loginId.trim(),
        password: loginPassword,
        redirect: false,
      });
      if (result?.error) {
        if (result.error.includes("LOCKED_ACCOUNT") || result.error.includes("AccessDenied")) {
           setLockedError(true);
           toast.error("Tài khoản đã bị khóa!");
        } else {
           toast.error("Sai số điện thoại / email hoặc mật khẩu. Vui lòng thử lại!");
        }
      } else {
        toast.success("Đăng nhập thành công! 🎉");
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      toast.error("Đã có lỗi xảy ra khi kết nối máy chủ.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── BƯỚC 1: XÁC THỰC TÀI KHOẢN ──
  const handleNextToStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim()) {
      toast.error("Vui lòng nhập họ và tên của bạn");
      return;
    }
    if (regMethod === "phone" && !regPhone.trim()) {
      toast.error("Vui lòng nhập số điện thoại");
      return;
    }
    if (regMethod === "email" && !regEmail.trim()) {
      toast.error("Vui lòng nhập địa chỉ email");
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }
    if (regPassword !== regConfirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    // Tự động điền SĐT hồ câu từ bước 1 nếu có
    if (!lakePhone && regPhone) {
      setLakePhone(regPhone);
    }
    if (!lakeName) {
      setLakeName(`Hồ câu ${regName.trim()}`);
    }

    setRegStep(2);
  };

  // ── BƯỚC 2: HOÀN TẤT ĐĂNG KÝ & TẠO HỒ CÂU ──
  const handleFinalRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!lakeName.trim()) {
      toast.error("Vui lòng nhập tên hồ câu của bạn");
      return;
    }
    const finalLakePhone = (lakePhone || regPhone).trim();
    if (!finalLakePhone) {
      toast.error("Vui lòng nhập số điện thoại liên hệ của hồ câu");
      return;
    }
    if (!agreeTerms) {
      toast.error("Vui lòng đồng ý với Quy định sử dụng & Chính sách");
      return;
    }

    setIsLoading(true);
    try {
      const payload: any = {
        name: regName.trim(),
        password: regPassword,
        lakeName: lakeName.trim(),
        lakePhone: finalLakePhone,
        lakeProvince: lakeProvince,
        lakeAddress: lakeAddress.trim(),
      };
      if (regMethod === "email") {
        payload.email = regEmail.trim();
        payload.phone = finalLakePhone;
      } else {
        payload.phone = regPhone.trim();
      }

      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Đăng ký thất bại");
      } else {
        toast.success("Đăng ký thành công! Đang tự động vào hệ thống...");
        const loginIdentifier = regMethod === "email" ? regEmail.trim() : regPhone.trim();
        const result = await signIn("credentials", {
          email: loginIdentifier,
          password: regPassword,
          redirect: false,
        });
        if (!result?.error) {
          router.push("/dashboard");
          router.refresh();
        } else {
          setMainTab("login");
          setLoginId(loginIdentifier);
          toast.info("Đã tạo tài khoản, vui lòng đăng nhập.");
        }
      }
    } catch {
      toast.error("Đã có lỗi xảy ra trong quá trình đăng ký.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => signIn("google", { callbackUrl: "/dashboard" });

  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/15 blur-[130px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[130px] rounded-full animate-pulse" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-[480px] bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-2xl shadow-emerald-950/20 relative z-10 overflow-hidden"
      >
        {/* Back link */}
        <div className="px-8 pt-6 pb-0 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-widest">
            ← Trang chủ
          </Link>
          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            Dùng thử 5 ngày Free
          </span>
        </div>

        {/* Logo Brand */}
        <div className="flex flex-col items-center pt-3 pb-5 px-8">
          <div className="w-13 h-13 bg-emerald-500 rounded-2xl flex items-center justify-center text-white mb-2.5 shadow-xl shadow-emerald-500/25 hover:scale-105 transition-transform">
            <Fish size={26} />
          </div>
          <h1 className="text-xl font-black text-white tracking-wider uppercase">Quản lý Hồ câu</h1>
          <p className="text-[11px] text-slate-400 mt-0.5">Phần mềm quản lý hồ câu chuyên nghiệp</p>
        </div>

        {/* ── MAIN TABS: ĐĂNG NHẬP | ĐĂNG KÝ ── */}
        <div className="px-8">
          <div className="flex bg-white/[0.05] border border-white/10 p-1 rounded-2xl mb-5">
            {(["login", "register"] as MainTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setMainTab(tab);
                  setShowLoginPassword(false);
                  setShowRegPassword(false);
                  setRegStep(1);
                }}
                className={`flex-1 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-200 cursor-pointer ${
                  mainTab === tab
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {tab === "login" ? "Đăng nhập" : "Đăng ký"}
              </button>
            ))}
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div className="px-8 pb-8">
          <AnimatePresence mode="wait">

            {/* ════════════════ TAB ĐĂNG NHẬP ════════════════ */}
            {mainTab === "login" && (
              <motion.div
                key="login-tab"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <form onSubmit={handleLogin} className="space-y-3.5">
                  {/* Locked Account Warning Box */}
                  <AnimatePresence>
                    {lockedError && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, scale: 0.95 }}
                        animate={{ opacity: 1, height: "auto", scale: 1 }}
                        exit={{ opacity: 0, height: 0, scale: 0.95 }}
                        className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-2 overflow-hidden"
                      >
                        <div className="flex gap-3 items-start">
                          <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center shrink-0 mt-0.5">
                            <Lock size={16} />
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-red-500 uppercase tracking-tight">
                              Tài khoản đã bị khóa
                            </h4>
                            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                              Tài khoản hoặc gói dịch vụ của bạn đã hết hạn. Vui lòng thanh toán gia hạn hoặc liên hệ hỗ trợ để tiếp tục sử dụng phần mềm.
                            </p>
                            <a
                              href="https://zalo.me/0855550813"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-red-500 hover:bg-red-400 text-white text-xs font-bold rounded-lg transition-colors shadow-lg shadow-red-500/25"
                            >
                              <Phone size={14} />
                              Liên hệ CSKH / Nạp tiền
                            </a>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Ô nhập Số điện thoại hoặc Email */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                      Số điện thoại hoặc Email
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
                      <input
                        type="text"
                        autoComplete="username"
                        placeholder="Số điện thoại (0855550813) hoặc Email"
                        value={loginId}
                        onChange={(e) => setLoginId(e.target.value)}
                        className="w-full h-12 bg-white/[0.04] border border-white/10 rounded-xl pl-11 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm font-medium"
                        required
                      />
                    </div>
                  </div>

                  {/* Ô nhập Mật khẩu */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                      Mật khẩu
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
                      <input
                        type={showLoginPassword ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="Mật khẩu của bạn"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full h-12 bg-white/[0.04] border border-white/10 rounded-xl pl-11 pr-11 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm font-medium"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Nút Đăng nhập */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-emerald-500 hover:bg-emerald-400 text-white font-black uppercase tracking-widest text-xs rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/25 active:scale-[0.98] cursor-pointer"
                  >
                    {isLoading ? <Loader2 className="animate-spin" size={18} /> : "ĐĂNG NHẬP VÀO HỆ THỐNG →"}
                  </button>
                </form>

                {/* Divider + Google */}
                <div className="pt-2 flex items-center gap-3">
                  <div className="h-px flex-1 bg-white/10" />
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">hoặc</span>
                  <div className="h-px flex-1 bg-white/10" />
                </div>

                <button
                  onClick={handleGoogleLogin}
                  type="button"
                  className="w-full h-11 bg-white/[0.04] border border-white/10 text-slate-300 font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2.5 hover:bg-white/8 transition-all active:scale-[0.98] cursor-pointer"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Tiếp tục với Google
                </button>

                <p className="text-center text-[10px] text-slate-400 pt-1">
                  Chưa có tài khoản riêng?{" "}
                  <button 
                    type="button" 
                    onClick={() => { setMainTab("register"); setRegStep(1); }} 
                    className="text-emerald-400 font-bold hover:underline"
                  >
                    Đăng ký dùng thử 5 ngày miễn phí
                  </button>
                </p>
              </motion.div>
            )}

            {/* ════════════════ TAB ĐĂNG KÝ ════════════════ */}
            {mainTab === "register" && (
              <motion.div
                key="register-tab"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* ── BƯỚC 1: THÔNG TIN TÀI KHOẢN ── */}
                {regStep === 1 && (
                  <form onSubmit={handleNextToStep2} className="space-y-3">
                    {/* Switch phương thức đăng ký */}
                    <div className="flex gap-2 mb-2">
                      <button
                        type="button"
                        onClick={() => setRegMethod("phone")}
                        className={`flex-1 py-1.5 text-[11px] font-bold rounded-xl border transition-all cursor-pointer ${
                          regMethod === "phone"
                            ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                            : "border-white/10 text-slate-400"
                        }`}
                      >
                        📱 Đăng ký bằng SĐT
                      </button>
                      <button
                        type="button"
                        onClick={() => setRegMethod("email")}
                        className={`flex-1 py-1.5 text-[11px] font-bold rounded-xl border transition-all cursor-pointer ${
                          regMethod === "email"
                            ? "bg-blue-500/20 border-blue-500/50 text-blue-400"
                            : "border-white/10 text-slate-400"
                        }`}
                      >
                        ✉️ Đăng ký bằng Email
                      </button>
                    </div>

                    {/* Họ và tên */}
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                        Họ và tên của bạn <span className="text-rose-400">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
                        <input
                          type="text"
                          placeholder="Vd: Nguyễn Văn Huân"
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          className="w-full h-11 bg-white/[0.04] border border-white/10 rounded-xl pl-11 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-xs font-medium"
                          required
                        />
                      </div>
                    </div>

                    {/* SĐT hoặc Email */}
                    {regMethod === "phone" ? (
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                          Số điện thoại cá nhân <span className="text-rose-400">*</span>
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
                          <input
                            type="tel"
                            placeholder="Số điện thoại của bạn (vd: 0912345678)"
                            value={regPhone}
                            onChange={(e) => setRegPhone(e.target.value)}
                            className="w-full h-11 bg-white/[0.04] border border-white/10 rounded-xl pl-11 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-xs font-medium"
                            required
                          />
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                          Địa chỉ Email <span className="text-rose-400">*</span>
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
                          <input
                            type="email"
                            placeholder="Địa chỉ Email của bạn"
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                            className="w-full h-11 bg-white/[0.04] border border-white/10 rounded-xl pl-11 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-xs font-medium"
                            required
                          />
                        </div>
                      </div>
                    )}

                    {/* Mật khẩu */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                          Mật khẩu <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type={showRegPassword ? "text" : "password"}
                          placeholder="Mật khẩu (≥6 ký tự)"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          className="w-full h-11 bg-white/[0.04] border border-white/10 rounded-xl px-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-all text-xs font-medium"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                          Nhập lại mật khẩu <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type={showRegPassword ? "text" : "password"}
                          placeholder="Xác nhận"
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          className="w-full h-11 bg-white/[0.04] border border-white/10 rounded-xl px-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-all text-xs font-medium"
                          required
                        />
                      </div>
                    </div>

                    {/* Nút Tiếp tục bước 2 */}
                    <button
                      type="submit"
                      className="w-full h-12 bg-emerald-500 hover:bg-emerald-400 text-white font-black uppercase tracking-widest text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/25 active:scale-[0.98] cursor-pointer mt-2"
                    >
                      <span>TIẾP TỤC: THIẾT LẬP HỒ CÂU</span>
                      <ArrowRight size={16} />
                    </button>
                  </form>
                )}

                {/* ── BƯỚC 2: CẬP NHẬT THÔNG TIN HỒ CÂU BẮT BUỘC (NHƯ GIAO DIỆN SAPO) ── */}
                {regStep === 2 && (
                  <form onSubmit={handleFinalRegister} className="space-y-3 animate-in slide-in-from-right-4">
                    {/* Header Chào mừng cá nhân hóa */}
                    <div className="bg-emerald-500/10 border border-emerald-500/25 p-3 rounded-2xl">
                      <h3 className="text-xs font-black uppercase text-emerald-400 tracking-wide flex items-center gap-1.5">
                        <Sparkles size={14} />
                        {regName.toUpperCase()} ƠI, HÃY CẬP NHẬT THÔNG TIN HỒ CÂU
                      </h3>
                      <p className="text-[11px] text-slate-300 mt-0.5">
                        Thông tin này dùng để hiển thị trên hóa đơn và kích hoạt tài khoản dùng thử.
                      </p>
                    </div>

                    {/* Tên hồ câu */}
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                        Tên hồ câu của bạn <span className="text-rose-400">*</span>
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
                        <input
                          type="text"
                          placeholder="Ví dụ: Hồ câu KIM THÔNG, Hồ câu Đại Nam..."
                          value={lakeName}
                          onChange={(e) => setLakeName(e.target.value)}
                          className="w-full h-11 bg-white/[0.04] border border-white/10 rounded-xl pl-11 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-xs font-medium"
                          required
                        />
                      </div>
                    </div>

                    {/* Số điện thoại liên hệ của hồ câu */}
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                        Số điện thoại liên hệ hồ <span className="text-rose-400">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
                        <input
                          type="tel"
                          placeholder="Số điện thoại quản lý hồ câu"
                          value={lakePhone}
                          onChange={(e) => setLakePhone(e.target.value)}
                          className="w-full h-11 bg-white/[0.04] border border-white/10 rounded-xl pl-11 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-xs font-medium"
                          required
                        />
                      </div>
                    </div>

                    {/* Dropdown Tỉnh/Thành phố */}
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                        Bạn ở tỉnh / thành phố nào? <span className="text-rose-400">*</span>
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
                        <select
                          value={lakeProvince}
                          onChange={(e) => setLakeProvince(e.target.value)}
                          className="w-full h-11 bg-[#0c1222] border border-white/10 rounded-xl pl-11 pr-4 text-white focus:outline-none focus:border-emerald-500 transition-all text-xs font-bold appearance-none cursor-pointer"
                        >
                          {VIETNAM_PROVINCES.map((p) => (
                            <option key={p} value={p} className="bg-slate-900 text-white">
                              {p}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Địa chỉ chi tiết (Đường, Xã, Huyện) */}
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                        Địa chỉ chi tiết (Tùy chọn)
                      </label>
                      <input
                        type="text"
                        placeholder="Số nhà, Tên đường, Xã/Phường, Quận/Huyện"
                        value={lakeAddress}
                        onChange={(e) => setLakeAddress(e.target.value)}
                        className="w-full h-10 bg-white/[0.04] border border-white/10 rounded-xl px-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-all text-xs font-medium"
                      />
                    </div>

                    {/* Checkbox Đồng ý điều khoản */}
                    <div className="flex items-start gap-2 pt-1">
                      <input
                        id="agreeTerms"
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded border-white/20 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                      />
                      <label htmlFor="agreeTerms" className="text-[11px] text-slate-300 leading-tight cursor-pointer">
                        Tôi đồng ý với <span className="text-emerald-400 font-bold">Quy định sử dụng & Chính sách</span> bảo vệ dữ liệu khách hàng.
                      </label>
                    </div>

                    {/* Buttons: Quay lại & Hoàn tất */}
                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setRegStep(1)}
                        className="h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-slate-300 font-bold text-xs uppercase flex items-center gap-1.5 hover:bg-white/10 transition-all cursor-pointer"
                      >
                        <ArrowLeft size={14} />
                        <span>Sửa</span>
                      </button>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 h-12 bg-emerald-500 hover:bg-emerald-400 text-white font-black uppercase tracking-widest text-xs rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/25 active:scale-[0.98] cursor-pointer"
                      >
                        {isLoading ? (
                          <Loader2 className="animate-spin" size={18} />
                        ) : (
                          <>
                            <Check size={16} />
                            <span>HOÀN TẤT & VÀO HỆ THỐNG</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Footer info */}
        <div className="px-8 pb-5 text-center border-t border-white/5 pt-3">
          <p className="text-[10px] text-slate-500">
            Hỗ trợ kích hoạt hồ & CSKH 24/7 qua Hotline / Zalo:{" "}
            <a href="https://zalo.me/0855550813" target="_blank" rel="noopener noreferrer" className="text-emerald-400 font-bold hover:underline">
              0855550813
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
