"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Fish, Loader2, User, Lock, Phone, KeyRound, Eye, EyeOff, Mail } from "lucide-react";
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
type LoginMethod = "phone" | "email";

export default function LoginPage() {
  const router = useRouter();
  const [mainTab, setMainTab] = useState<MainTab>("login");
  const [loginMethod, setLoginMethod] = useState<LoginMethod>("phone");

  // Login states
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

  // Initialize reCAPTCHA lazily on first OTP request, not on mount
  // (avoids Firebase prerender crash)

  // ── LOGIN: Email / SĐT + mật khẩu ──
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginId || !loginPassword) return;
    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        email: loginId,
        password: loginPassword,
        redirect: false,
      });
      if (result?.error) {
        toast.error("Sai số điện thoại / email hoặc mật khẩu");
      } else {
        toast.success("Đăng nhập thành công! 🎉");
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      toast.error("Đã có lỗi xảy ra, thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── LOGIN: Gửi OTP ──
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
      // Lazy-import Firebase only on client, only when needed
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
      let msg = "Lỗi gửi SMS. ";
      if (err?.code === "auth/unauthorized-domain") msg = "Domain chưa được phép trong Firebase. Thêm quanlihocau.com vào Authorized Domains.";
      else if (err?.code === "auth/invalid-phone-number") msg = "Số điện thoại không hợp lệ.";
      else if (err?.code === "auth/too-many-requests") msg = "Đã vượt giới hạn SMS. Thử lại sau.";
      else if (err?.message) msg += err.message;
      toast.error(msg, { duration: 6000 });
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

  // ── REGISTER ──
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName) {
      toast.error("Vui lòng nhập họ và tên hoặc tên hồ câu");
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

    if (regMethod === "email" && !regEmail) {
      toast.error("Vui lòng nhập địa chỉ email");
      return;
    }
    if (regMethod === "phone" && !regPhone) {
      toast.error("Vui lòng nhập số điện thoại");
      return;
    }

    setIsLoading(true);
    try {
      const payload: any = {
        name: regName,
        password: regPassword,
      };
      if (regMethod === "email") {
        payload.email = regEmail;
      } else {
        payload.phone = regPhone;
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
        toast.success("Đăng ký thành công! Đang tự động đăng nhập...");
        const loginIdentifier = regMethod === "email" ? regEmail : regPhone;
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
    setLoginId("");
    setLoginPassword("");
  };

  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center p-4 relative overflow-hidden">
      <div id="recaptcha-container" />

      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/15 blur-[130px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[130px] rounded-full animate-pulse" />
        <div className="absolute top-[30%] right-[20%] w-[300px] h-[300px] bg-indigo-500/5 blur-[100px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-[440px] bg-white/[0.02] backdrop-blur-2xl border border-white/8 rounded-[2.5rem] shadow-2xl shadow-emerald-900/10 relative z-10 overflow-hidden"
      >
        {/* Back link */}
        <div className="px-8 pt-7 pb-0">
          <Link href="/" className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-widest">
            ← Quay lại trang chủ
          </Link>
        </div>

        {/* Logo */}
        <div className="flex flex-col items-center pt-5 pb-6 px-8">
          <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white mb-3 shadow-xl shadow-emerald-500/25 hover:scale-105 transition-transform">
            <Fish size={28} />
          </div>
          <h1 className="text-xl font-black text-white tracking-wider uppercase">Quản lý Hồ câu</h1>
          <p className="text-[11px] text-slate-500 mt-1">Hệ thống quản lý tiêu chuẩn chuyên nghiệp</p>
        </div>

        {/* ── MAIN TABS: Đăng nhập | Đăng ký ── */}
        <div className="px-8">
          <div className="flex bg-white/[0.04] border border-white/8 p-1 rounded-2xl mb-6">
            {(["login", "register"] as MainTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => switchTab(tab)}
                className={`flex-1 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-200 ${
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
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.2 }}
              >
                {/* Login method sub-tabs */}
                <div className="flex gap-2 mb-5">
                  <button
                    onClick={() => { setLoginMethod("phone"); setOtpSent(false); setOtp(""); setPhone(""); }}
                    className={`flex-1 py-2 text-[11px] font-bold rounded-xl border transition-all ${
                      loginMethod === "phone"
                        ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                        : "border-white/8 text-slate-500 hover:text-slate-300 hover:border-white/20"
                    }`}
                  >
                    📱 Số điện thoại
                  </button>
                  <button
                    onClick={() => { setLoginMethod("email"); setOtpSent(false); }}
                    className={`flex-1 py-2 text-[11px] font-bold rounded-xl border transition-all ${
                      loginMethod === "email"
                        ? "bg-blue-500/15 border-blue-500/40 text-blue-400"
                        : "border-white/8 text-slate-500 hover:text-slate-300 hover:border-white/20"
                    }`}
                  >
                    ✉️ Email / Mật khẩu
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {/* ── Phone OTP ── */}
                  {loginMethod === "phone" && !otpSent && (
                    <motion.form
                      key="phone-input"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      onSubmit={handleSendOtp}
                      className="space-y-4"
                    >
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
                        <input
                          type="tel"
                          placeholder="Nhập SĐT (vd: 0912345678)"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full h-13 bg-white/[0.03] border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/15 transition-all text-sm font-medium"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 bg-emerald-500 hover:bg-emerald-400 text-white font-black uppercase tracking-widest text-xs rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
                      >
                        {isLoading ? <Loader2 className="animate-spin" size={18} /> : "Gửi mã OTP →"}
                      </button>
                      <p className="text-[10px] text-slate-500 text-center pt-1">
                        Chưa có tài khoản? Hệ thống sẽ{" "}
                        <span className="text-emerald-400 font-bold">tự động tạo + tặng 7 ngày dùng thử</span>
                      </p>
                    </motion.form>
                  )}

                  {/* ── OTP verify ── */}
                  {loginMethod === "phone" && otpSent && (
                    <motion.form
                      key="otp-verify"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      onSubmit={handleVerifyOtp}
                      className="space-y-4"
                    >
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
                          className="w-full h-13 bg-white/[0.03] border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-white text-center tracking-[0.5em] font-black text-lg placeholder:text-slate-600 placeholder:tracking-normal focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/15 transition-all"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isLoading || otp.length < 6}
                        className="w-full h-12 bg-emerald-500 hover:bg-emerald-400 text-white font-black uppercase tracking-widest text-xs rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
                      >
                        {isLoading ? <Loader2 className="animate-spin" size={18} /> : "Xác nhận & Đăng nhập ✓"}
                      </button>
                    </motion.form>
                  )}

                  {/* ── Email + Password ── */}
                  {loginMethod === "email" && (
                    <motion.form
                      key="email-login"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      onSubmit={handleEmailLogin}
                      className="space-y-4"
                    >
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
                        <input
                          type="text"
                          placeholder="Số điện thoại hoặc Email"
                          value={loginId}
                          onChange={(e) => setLoginId(e.target.value)}
                          className="w-full h-13 bg-white/[0.03] border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/15 transition-all text-sm font-medium"
                          required
                        />
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
                        <input
                          type={showLoginPassword ? "text" : "password"}
                          placeholder="Mật khẩu"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="w-full h-13 bg-white/[0.03] border border-white/10 rounded-xl pl-11 pr-11 py-3.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/15 transition-all text-sm font-medium"
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
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-xs rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20 active:scale-[0.98]"
                      >
                        {isLoading ? <Loader2 className="animate-spin" size={18} /> : "Đăng nhập ngay →"}
                      </button>
                      <p className="text-center text-[10px] text-slate-500 pt-1">
                        Chưa có tài khoản?{" "}
                        <button type="button" onClick={() => switchTab("register")} className="text-emerald-400 font-bold hover:underline">
                          Đăng ký miễn phí
                        </button>
                      </p>
                    </motion.form>
                  )}
                </AnimatePresence>

                {/* Divider + Google */}
                <div className="mt-5 flex items-center gap-3">
                  <div className="h-px flex-1 bg-white/5" />
                  <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">hoặc</span>
                  <div className="h-px flex-1 bg-white/5" />
                </div>
                <button
                  onClick={handleGoogleLogin}
                  type="button"
                  className="w-full h-12 bg-white/[0.03] border border-white/10 text-slate-300 font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-3 mt-3 hover:bg-white/8 transition-all active:scale-[0.98]"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Tiếp tục với Google
                </button>
              </motion.div>
            )}

            {/* ════════════════ REGISTER TAB ════════════════ */}
            {mainTab === "register" && (
              <motion.div
                key="register-tab"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.2 }}
              >
                {/* Register method sub-tabs */}
                <div className="flex gap-2 mb-5">
                  <button
                    onClick={() => setRegMethod("phone")}
                    className={`flex-1 py-2 text-[11px] font-bold rounded-xl border transition-all ${
                      regMethod === "phone"
                        ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                        : "border-white/8 text-slate-500 hover:text-slate-300 hover:border-white/20"
                    }`}
                  >
                    📱 Bằng SĐT (OTP)
                  </button>
                  <button
                    onClick={() => setRegMethod("email")}
                    className={`flex-1 py-2 text-[11px] font-bold rounded-xl border transition-all ${
                      regMethod === "email"
                        ? "bg-blue-500/15 border-blue-500/40 text-blue-400"
                        : "border-white/8 text-slate-500 hover:text-slate-300 hover:border-white/20"
                    }`}
                  >
                    ✉️ Bằng Email
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {/* ── Register by Phone ── */}
                  {regMethod === "phone" && (
                    <motion.form
                      key="reg-phone"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      onSubmit={handleRegister}
                      className="space-y-3.5"
                    >
                      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
                        <p className="text-[10px] text-slate-400">
                          Đăng ký bằng SĐT = nhận ngay{" "}
                          <span className="text-emerald-400 font-bold">7 ngày dùng thử miễn phí</span> 🎁
                        </p>
                      </div>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
                        <input
                          type="text"
                          placeholder="Họ và tên hoặc Tên hồ câu"
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          className="w-full h-13 bg-white/[0.03] border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/15 transition-all text-sm font-medium"
                          required
                        />
                      </div>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
                        <input
                          type="tel"
                          placeholder="Số điện thoại (vd: 0912345678)"
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          className="w-full h-13 bg-white/[0.03] border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/15 transition-all text-sm font-medium"
                          required
                        />
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
                        <input
                          type={showRegPassword ? "text" : "password"}
                          placeholder="Mật khẩu (ít nhất 6 ký tự)"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          className="w-full h-13 bg-white/[0.03] border border-white/10 rounded-xl pl-11 pr-11 py-3.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/15 transition-all text-sm font-medium"
                          required
                        />
                        <button type="button" onClick={() => setShowRegPassword(!showRegPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                          {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
                        <input
                          type="password"
                          placeholder="Xác nhận mật khẩu"
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          className="w-full h-13 bg-white/[0.03] border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/15 transition-all text-sm font-medium"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 bg-emerald-500 hover:bg-emerald-400 text-white font-black uppercase tracking-widest text-xs rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
                      >
                        {isLoading ? <Loader2 className="animate-spin" size={18} /> : "Tạo tài khoản bằng SĐT →"}
                      </button>
                    </motion.form>
                  )}

                  {/* ── Register by Email ── */}
                  {regMethod === "email" && (
                    <motion.form
                      key="reg-email"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      onSubmit={handleRegister}
                      className="space-y-3.5"
                    >
                      <div className="bg-blue-500/8 border border-blue-500/15 rounded-xl p-3 text-center">
                        <p className="text-[10px] text-slate-400">
                          Đăng ký bằng Email = nhận ngay{" "}
                          <span className="text-emerald-400 font-bold">7 ngày dùng thử miễn phí</span> 🎁
                        </p>
                      </div>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
                        <input
                          type="text"
                          placeholder="Họ và tên hoặc Tên hồ câu"
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          className="w-full h-13 bg-white/[0.03] border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/15 transition-all text-sm font-medium"
                          required
                        />
                      </div>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
                        <input
                          type="email"
                          placeholder="Email"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          className="w-full h-13 bg-white/[0.03] border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/15 transition-all text-sm font-medium"
                          required
                        />
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
                        <input
                          type={showRegPassword ? "text" : "password"}
                          placeholder="Mật khẩu (ít nhất 6 ký tự)"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          className="w-full h-13 bg-white/[0.03] border border-white/10 rounded-xl pl-11 pr-11 py-3.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/15 transition-all text-sm font-medium"
                          required
                        />
                        <button type="button" onClick={() => setShowRegPassword(!showRegPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                          {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
                        <input
                          type="password"
                          placeholder="Xác nhận mật khẩu"
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          className="w-full h-13 bg-white/[0.03] border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/15 transition-all text-sm font-medium"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-xs rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20 active:scale-[0.98]"
                      >
                        {isLoading ? <Loader2 className="animate-spin" size={18} /> : "Tạo tài khoản bằng Email →"}
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>

                {/* Divider + Google */}
                <div className="mt-5 flex items-center gap-3">
                  <div className="h-px flex-1 bg-white/5" />
                  <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">hoặc</span>
                  <div className="h-px flex-1 bg-white/5" />
                </div>
                <button
                  onClick={handleGoogleLogin}
                  type="button"
                  className="w-full h-12 bg-white/[0.03] border border-white/10 text-slate-300 font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-3 mt-3 hover:bg-white/8 transition-all active:scale-[0.98]"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Tiếp tục với Google
                </button>

                <p className="text-center text-[10px] text-slate-500 mt-5">
                  Đã có tài khoản?{" "}
                  <button type="button" onClick={() => switchTab("login")} className="text-emerald-400 font-bold hover:underline">
                    Đăng nhập ngay
                  </button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          <p className="text-center text-[9px] text-slate-600 uppercase tracking-widest mt-6">
            Bằng cách tiếp tục, bạn đồng ý với{" "}
            <Link href="#" className="underline hover:text-slate-400 transition-colors">Điều khoản</Link>
            {" & "}
            <Link href="#" className="underline hover:text-slate-400 transition-colors">Chính sách</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
