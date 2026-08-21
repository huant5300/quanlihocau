"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Fish, Loader2, User, Lock, Phone, KeyRound, Eye, EyeOff, Mail, Sparkles, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { signIn } from "next-auth/react";
import Link from "next/link";
import type { ConfirmationResult } from "firebase/auth";

declare global {
  interface Window {
    recaptchaVerifier: any;
    grecaptcha: any;
  }
}

type MainTab = "login" | "register";
type LoginMethod = "password" | "otp";

export default function LoginPage() {
  const router = useRouter();
  const [mainTab, setMainTab] = useState<MainTab>("login");
  const [loginMethod, setLoginMethod] = useState<LoginMethod>("password");

  // Login states (Password)
  const [loginId, setLoginId] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Phone OTP states
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  // Register states
  const [regPhone, setRegPhone] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regName, setRegName] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regMethod, setRegMethod] = useState<"phone" | "email">("phone");

  const [isLoading, setIsLoading] = useState(false);

  // ── LOGIN: Số điện thoại / Email + Mật khẩu ──
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginId || !loginPassword) {
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
        toast.error("Sai số điện thoại / email hoặc mật khẩu. Vui lòng kiểm tra lại!");
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

  // ── LOGIN: Gửi SMS OTP ──
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      toast.error("Vui lòng nhập số điện thoại");
      return;
    }
    let formatted = phone.trim();
    if (formatted.startsWith("0")) formatted = "+84" + formatted.slice(1);
    else if (!formatted.startsWith("+")) formatted = "+" + formatted;

    setIsLoading(true);
    try {
      const { auth } = await import("@/lib/firebase");
      const { RecaptchaVerifier, signInWithPhoneNumber } = await import("firebase/auth");

      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", { size: "invisible" });
      }
      const confirmation = await signInWithPhoneNumber(auth, formatted, window.recaptchaVerifier);
      setConfirmationResult(confirmation);
      setOtpSent(true);
      toast.success("Mã OTP đã được gửi về điện thoại!");
    } catch (err: any) {
      console.warn("Firebase Phone Auth error:", err);
      // Fallback thân thiện chuyển sang đăng nhập bằng mật khẩu
      setLoginId(phone);
      setLoginMethod("password");
      toast.info("Dịch vụ SMS OTP quốc tế đang bảo trì. Vui lòng nhập mật khẩu tài khoản để đăng nhập trực tiếp!", { duration: 5000 });
      try { window.recaptchaVerifier?.clear(); window.recaptchaVerifier = null; } catch {}
    } finally {
      setIsLoading(false);
    }
  };

  // ── LOGIN: Xác thực OTP ──
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult) return;
    setIsLoading(true);
    try {
      const result = await confirmationResult.confirm(otp);
      const idToken = await result.user.getIdToken();
      const signInResult = await signIn("firebase-phone", { idToken, redirect: false });
      if (signInResult?.error) {
        toast.error("Xác thực thất bại: " + signInResult.error);
      } else {
        toast.success("Đăng nhập thành công! 🎉");
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      toast.error("Mã OTP không hợp lệ hoặc đã hết hạn.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── REGISTER: Tạo tài khoản mới ──
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim()) {
      toast.error("Vui lòng nhập họ tên hoặc tên hồ câu của bạn");
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

    if (regMethod === "email" && !regEmail.trim()) {
      toast.error("Vui lòng nhập địa chỉ email");
      return;
    }
    if (regMethod === "phone" && !regPhone.trim()) {
      toast.error("Vui lòng nhập số điện thoại liên hệ");
      return;
    }

    setIsLoading(true);
    try {
      const payload: any = {
        name: regName.trim(),
        password: regPassword,
      };
      if (regMethod === "email") {
        payload.email = regEmail.trim();
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
        toast.success("Đăng ký thành công! Đang kích hoạt 5 ngày dùng thử...");
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
          switchTab("login");
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

  const switchTab = (tab: MainTab) => {
    setMainTab(tab);
    setOtpSent(false);
    setOtp("");
    setPhone("");
    setShowLoginPassword(false);
  };

  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center p-4 relative overflow-hidden">
      <div id="recaptcha-container" />

      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/15 blur-[130px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[130px] rounded-full animate-pulse" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-[440px] bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-2xl shadow-emerald-950/20 relative z-10 overflow-hidden"
      >
        {/* Back link */}
        <div className="px-8 pt-7 pb-0">
          <Link href="/" className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-widest">
            ← Quay lại trang chủ
          </Link>
        </div>

        {/* Logo Brand */}
        <div className="flex flex-col items-center pt-4 pb-6 px-8">
          <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white mb-3 shadow-xl shadow-emerald-500/25 hover:scale-105 transition-transform">
            <Fish size={28} />
          </div>
          <h1 className="text-xl font-black text-white tracking-wider uppercase">Quản lý Hồ câu</h1>
          <p className="text-[11px] text-slate-400 mt-1">Phần mềm quản lý hồ câu chuyên nghiệp</p>
        </div>

        {/* ── MAIN TABS: Đăng nhập | Đăng ký ── */}
        <div className="px-8">
          <div className="flex bg-white/[0.05] border border-white/10 p-1 rounded-2xl mb-6">
            {(["login", "register"] as MainTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => switchTab(tab)}
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

            {/* ════════════════ LOGIN TAB ════════════════ */}
            {mainTab === "login" && (
              <motion.div
                key="login-tab"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {loginMethod === "password" ? (
                  /* ── Form Đăng nhập chính bằng SĐT/Email + Mật khẩu ── */
                  <form onSubmit={handlePasswordLogin} className="space-y-3.5">
                    {/* Identifier Input */}
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
                      <input
                        type="text"
                        placeholder="Số điện thoại (0855550813) hoặc Email"
                        value={loginId}
                        onChange={(e) => setLoginId(e.target.value)}
                        className="w-full h-12 bg-white/[0.04] border border-white/10 rounded-xl pl-11 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm font-medium"
                        required
                      />
                    </div>

                    {/* Password Input */}
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
                      <input
                        type={showLoginPassword ? "text" : "password"}
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

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-12 bg-emerald-500 hover:bg-emerald-400 text-white font-black uppercase tracking-widest text-xs rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/25 active:scale-[0.98] cursor-pointer"
                    >
                      {isLoading ? <Loader2 className="animate-spin" size={18} /> : "ĐĂNG NHẬP HỆ THỐNG →"}
                    </button>

                    {/* OTP Option Switch */}
                    <div className="text-center pt-1">
                      <button
                        type="button"
                        onClick={() => { setLoginMethod("otp"); setPhone(loginId); }}
                        className="text-[11px] text-slate-400 hover:text-emerald-400 transition-colors font-semibold"
                      >
                        📱 Hoặc đăng nhập bằng mã SMS OTP
                      </button>
                    </div>
                  </form>
                ) : (
                  /* ── Form Đăng nhập phụ bằng SMS OTP ── */
                  <div className="space-y-3.5">
                    {!otpSent ? (
                      <form onSubmit={handleSendOtp} className="space-y-3.5">
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
                          <input
                            type="tel"
                            placeholder="Nhập SĐT nhận mã OTP (vd: 0855550813)"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full h-12 bg-white/[0.04] border border-white/10 rounded-xl pl-11 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm font-medium"
                            required
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="w-full h-12 bg-emerald-500 hover:bg-emerald-400 text-white font-black uppercase tracking-widest text-xs rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/20 active:scale-[0.98] cursor-pointer"
                        >
                          {isLoading ? <Loader2 className="animate-spin" size={18} /> : "GỬI MÃ OTP →"}
                        </button>
                        <div className="text-center">
                          <button
                            type="button"
                            onClick={() => setLoginMethod("password")}
                            className="text-[11px] text-slate-400 hover:text-white transition-colors font-semibold"
                          >
                            ← Quay lại đăng nhập bằng Mật khẩu
                          </button>
                        </div>
                      </form>
                    ) : (
                      <form onSubmit={handleVerifyOtp} className="space-y-3.5">
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
                          <p className="text-xs text-slate-400">Mã OTP đã gửi tới</p>
                          <p className="text-white font-bold tracking-widest text-sm mt-0.5">{phone}</p>
                          <button type="button" onClick={() => { setOtpSent(false); setOtp(""); }} className="text-[10px] text-emerald-400 hover:underline mt-1">
                            Đổi số điện thoại
                          </button>
                        </div>
                        <div className="relative">
                          <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
                          <input
                            type="text"
                            placeholder="Nhập mã OTP 6 số"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                            maxLength={6}
                            className="w-full h-12 bg-white/[0.04] border border-white/10 rounded-xl pl-11 pr-4 text-white text-center tracking-[0.5em] font-black text-lg placeholder:text-slate-500 placeholder:tracking-normal focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                            required
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={isLoading || otp.length < 6}
                          className="w-full h-12 bg-emerald-500 hover:bg-emerald-400 text-white font-black uppercase tracking-widest text-xs rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/20 active:scale-[0.98] cursor-pointer"
                        >
                          {isLoading ? <Loader2 className="animate-spin" size={18} /> : "XÁC NHẬN & ĐĂNG NHẬP ✓"}
                        </button>
                      </form>
                    )}
                  </div>
                )}

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

                <p className="text-center text-[10px] text-slate-500 pt-1">
                  Chưa có tài khoản?{" "}
                  <button type="button" onClick={() => switchTab("register")} className="text-emerald-400 font-bold hover:underline">
                    Đăng ký dùng thử 5 ngày miễn phí
                  </button>
                </p>
              </motion.div>
            )}

            {/* ════════════════ REGISTER TAB ════════════════ */}
            {mainTab === "register" && (
              <motion.div
                key="register-tab"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* Switch sub-type */}
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

                <form onSubmit={handleRegister} className="space-y-3">
                  {/* Name Input */}
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
                    <input
                      type="text"
                      placeholder="Họ tên hoặc Tên hồ câu"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full h-11 bg-white/[0.04] border border-white/10 rounded-xl pl-11 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-xs font-medium"
                      required
                    />
                  </div>

                  {/* Phone or Email */}
                  {regMethod === "phone" ? (
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
                      <input
                        type="tel"
                        placeholder="Số điện thoại của bạn (vd: 0855550813)"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        className="w-full h-11 bg-white/[0.04] border border-white/10 rounded-xl pl-11 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-xs font-medium"
                        required
                      />
                    </div>
                  ) : (
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
                  )}

                  {/* Password */}
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
                    <input
                      type={showRegPassword ? "text" : "password"}
                      placeholder="Mật khẩu (tối thiểu 6 ký tự)"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full h-11 bg-white/[0.04] border border-white/10 rounded-xl pl-11 pr-11 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-xs font-medium"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {/* Confirm Password */}
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
                    <input
                      type="password"
                      placeholder="Nhập lại mật khẩu"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      className="w-full h-11 bg-white/[0.04] border border-white/10 rounded-xl pl-11 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-xs font-medium"
                      required
                    />
                  </div>

                  {/* Free Trial Banner */}
                  <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center flex items-center justify-center gap-1.5">
                    <Sparkles size={13} className="text-emerald-400" />
                    <span className="text-[11px] font-bold text-emerald-300">Tặng ngay 5 ngày dùng thử trọn gói Full tính năng</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-emerald-500 hover:bg-emerald-400 text-white font-black uppercase tracking-widest text-xs rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/25 active:scale-[0.98] cursor-pointer"
                  >
                    {isLoading ? <Loader2 className="animate-spin" size={18} /> : "TẠO TÀI KHOẢN & DÙNG THỬ →"}
                  </button>
                </form>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Footer info */}
        <div className="px-8 pb-6 text-center border-t border-white/5 pt-4">
          <p className="text-[10px] text-slate-500">
            Hỗ trợ kỹ thuật 24/7 qua Hotline / Zalo:{" "}
            <a href="https://zalo.me/0855550813" target="_blank" rel="noopener noreferrer" className="text-emerald-400 font-bold hover:underline">
              0855550813
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
