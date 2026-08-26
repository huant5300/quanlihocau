"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Phone, Waves, ArrowRight, X, Play, Info, Sparkles, Building2, Check } from "lucide-react";
import { getMyLakes, updateLakeDetails } from "@/actions/lake-actions";
import { toast } from "sonner";
import { useUIStore } from "@/stores/ui-store";
import { useAuthSession } from "@/hooks/auth/use-auth-session";
import { VIETNAM_PROVINCES } from "@/utils/vietnam-provinces";

export function OnboardingWizard() {
  const { currentLakeId, setCurrentLake } = useUIStore();
  const { user } = useAuthSession();
  const [showSetup, setShowSetup] = useState(false);
  const [lakeData, setLakeData] = useState<any>(null);
  
  // Setup form states
  const [lakeName, setLakeName] = useState("");
  const [lakeProvince, setLakeProvince] = useState("TP. Hồ Chí Minh");
  const [addressDetail, setAddressDetail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Tour states
  const [tourStep, setTourStep] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const [highlightPos, setHighlightPos] = useState({ top: 0, left: 0, width: 0, height: 0 });

  useEffect(() => {
    async function checkSetup() {
      try {
        const result = await getMyLakes();
        if (result.success && result.data && result.data.length > 0) {
          const activeLake = result.data.find((l: any) => l.id === currentLakeId) || result.data[0];
          setLakeData(activeLake);
          
          const isDefaultNameVal = !activeLake.name || activeLake.name.startsWith("Hồ Câu Chủ Hồ") || activeLake.name === "Hồ câu giải trí" || activeLake.name === "Hồ câu dịch vụ";
          const isDefaultAddressVal = !activeLake.address || activeLake.address === "Chưa cập nhật" || activeLake.address === "Bình Dương, Việt Nam";
          const isDefaultPhoneVal = !activeLake.phone || activeLake.phone === "Chưa cập nhật" || activeLake.phone === "0912345678";

          setLakeName(isDefaultNameVal ? `Hồ câu ${user?.name || ""}`.trim() : (activeLake.name || ""));
          
          // Phân tách tỉnh thành & địa chỉ chi tiết
          const existingAddr = isDefaultAddressVal ? "" : (activeLake.address || "");
          const matchedProvince = VIETNAM_PROVINCES.find(p => existingAddr.includes(p));
          if (matchedProvince) {
            setLakeProvince(matchedProvince);
            setAddressDetail(existingAddr.replace(matchedProvince, "").replace(/,\s*$/, "").trim());
          } else {
            setAddressDetail(existingAddr);
          }

          const existingPhone = isDefaultPhoneVal ? ((user as any)?.phone || "") : (activeLake.phone || "");
          setPhoneNumber(existingPhone);

          // If it's first login and lake is using defaults, enforce onboarding setup popup
          if (isDefaultNameVal || isDefaultAddressVal || isDefaultPhoneVal) {
            setShowSetup(true);
          } else {
            // Check if user has completed tour guide
            const tourCompleted = localStorage.getItem(`fishing_lake_tour_completed_${activeLake.id}`);
            if (!tourCompleted) {
              setTourStep(1);
            }
          }
        }
      } catch (error) {
        console.error("Failed to verify onboarding status:", error);
      }
    }
    checkSetup();
  }, [currentLakeId, user]);

  // Handle Setup Form Submission
  const handleSaveSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lakeName.trim()) {
      toast.error("Vui lòng nhập tên hồ câu của bạn!");
      return;
    }
    if (!phoneNumber.trim()) {
      toast.error("Vui lòng nhập số điện thoại liên hệ!");
      return;
    }
    if (!agreeTerms) {
      toast.error("Vui lòng xác nhận đồng ý với điều khoản sử dụng!");
      return;
    }

    const phoneTrimmed = phoneNumber.trim();
    const vnPhoneRegex = /^(0[35789])[0-9]{8}$/;
    if (!vnPhoneRegex.test(phoneTrimmed)) {
      toast.error("Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại Việt Nam gồm 10 chữ số (ví dụ: 0912345678)!");
      return;
    }

    let fullAddress = addressDetail.trim();
    if (lakeProvince && !fullAddress.includes(lakeProvince)) {
      fullAddress = fullAddress ? `${fullAddress}, ${lakeProvince}` : lakeProvince;
    }

    setIsSaving(true);
    try {
      const res = await updateLakeDetails({
        name: lakeName.trim(),
        address: fullAddress,
        phone: phoneTrimmed
      });

      if (res.success && res.data) {
        toast.success("Thiết lập thông tin hồ câu thành công! 🎉");
        setCurrentLake(res.data.id, res.data.name);
        setLakeData(res.data);
        setShowSetup(false);
        
        // Auto trigger tour guide
        setTourStep(1);
      } else {
        toast.error(res.error || "Không thể lưu thông tin hồ câu.");
      }
    } catch (error) {
      toast.error("Đã xảy ra lỗi khi lưu thông tin.");
    } finally {
      setIsSaving(false);
    }
  };

  // Track position of highlighted elements during the tour
  useEffect(() => {
    if (tourStep === null || showSetup) return;

    let targetId = "";
    if (tourStep === 1) targetId = "tour-sidebar-create-ticket";
    else if (tourStep === 2) targetId = "tour-sidebar-dashboard";
    else if (tourStep === 3) targetId = "tour-sidebar-sessions";
    else if (tourStep === 4) targetId = "tour-sidebar-settings";

    const element = document.getElementById(targetId);
    if (element) {
      const rect = element.getBoundingClientRect();
      setHighlightPos({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height
      });
      setTooltipPos({
        top: rect.top + window.scrollY + rect.height / 2,
        left: rect.right + window.scrollX + 16
      });
    } else {
      handleNextTourStep();
    }

    const handleResize = () => {
      const el = document.getElementById(targetId);
      if (el) {
        const r = el.getBoundingClientRect();
        setHighlightPos({
          top: r.top + window.scrollY,
          left: r.left + window.scrollX,
          width: r.width,
          height: r.height
        });
        setTooltipPos({
          top: r.top + window.scrollY + r.height / 2,
          left: r.right + window.scrollX + 16
        });
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [tourStep, showSetup]);

  const handleNextTourStep = () => {
    if (tourStep === null) return;
    if (tourStep < 4) {
      setTourStep(tourStep + 1);
    } else {
      completeTour();
    }
  };

  const skipTour = () => {
    completeTour();
    toast.info("Đã bỏ qua hướng dẫn nhanh.");
  };

  const completeTour = () => {
    setTourStep(null);
    if (lakeData?.id) {
      localStorage.setItem(`fishing_lake_tour_completed_${lakeData.id}`, "true");
    }
    toast.success("🎉 Bạn đã sẵn sàng vận hành hồ câu!");
  };

  const getTourContent = (step: number) => {
    switch (step) {
      case 1:
        return {
          title: "🎫 Tạo Vé Câu (Mở Lượt Mới)",
          text: "Nhấn vào đây bất cứ lúc nào để tạo vé câu mới cho khách. Quy trình phân bước wizard siêu tốc của chúng tôi giúp bạn chọn chòi, gói câu và nước uống trong nháy mắt."
        };
      case 2:
        return {
          title: "📊 Tổng Quan Doanh Thu Live",
          text: "Trang chủ hiển thị các biểu đồ doanh thu tuần, số lượng cá đã câu hôm nay và danh sách các lượt thanh toán thực tế theo thời gian thực."
        };
      case 3:
        return {
          title: "🎣 Quản Lý Lượt Câu Đang Hoạt Động",
          text: "Theo dõi các ô câu đang hoạt động với đồng hồ đếm ngược. Bạn có thể bấm để xem trực tiếp chi tiết bill, thêm món, thêm giờ hoặc thu cá ngay tại đây."
        };
      case 4:
      default:
        return {
          title: "⚙️ Cấu Hình Hồ Câu",
          text: "Trang cài đặt giúp bạn cấu hình máy in hóa đơn (in bill tự động), thêm bớt số lượng chòi, tạo các gói câu cố định hoặc điều chỉnh giá cả dịch vụ."
        };
    }
  };

  const displayName = user?.name || "Bạn";

  return (
    <>
      {/* Mandatory setup modal - Form Sapo Style */}
      <AnimatePresence>
        {showSetup && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              className="relative w-full max-w-lg bg-card border border-border rounded-[2.5rem] p-8 shadow-2xl overflow-hidden flex flex-col gap-6 z-10"
            >
              <div className="absolute top-0 right-0 w-32 h-32 rounded-bl-full bg-primary/10 -mr-8 -mt-8 opacity-60" />
              
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-600/20 shrink-0">
                  <Building2 size={28} />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight text-white/95">
                    {displayName.toUpperCase()} ƠI, HÃY CẬP NHẬT THÔNG TIN HỒ CÂU
                  </h2>
                  <p className="text-xs text-emerald-400 font-black uppercase tracking-widest mt-0.5">
                    Bước bắt buộc để Super Admin kích hoạt gói dùng thử
                  </p>
                </div>
              </div>

              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex gap-3 text-emerald-400">
                <Sparkles size={20} className="shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed font-bold uppercase tracking-wider text-emerald-300">
                  Vui lòng cung cấp số điện thoại và tên hồ câu chính xác để hệ thống đồng bộ hóa đơn in nhiệt và hỗ trợ vận hành.
                </p>
              </div>

              <form onSubmit={handleSaveSetup} className="space-y-4">
                {/* Số điện thoại */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1">
                    Số điện thoại liên hệ của bạn <span className="text-rose-500 font-black text-xs">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                    <input
                      type="tel"
                      required
                      placeholder="Ví dụ: 0817991579"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full h-13 pl-11 pr-4 bg-slate-50 focus:bg-white text-slate-900 border-2 border-slate-300 focus:border-emerald-500 dark:bg-zinc-800 dark:focus:bg-zinc-900 dark:text-slate-100 dark:border-zinc-700 rounded-2xl outline-none font-bold text-sm transition-all"
                    />
                  </div>
                </div>

                {/* Tên hồ câu */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1">
                    Tên hồ câu của bạn <span className="text-rose-500 font-black text-xs">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Hồ câu KIM THÔNG, Hồ câu Đại Nam..."
                      value={lakeName}
                      onChange={(e) => setLakeName(e.target.value)}
                      className="w-full h-13 pl-11 pr-4 bg-slate-50 focus:bg-white text-slate-900 border-2 border-slate-300 focus:border-emerald-500 dark:bg-zinc-800 dark:focus:bg-zinc-900 dark:text-slate-100 dark:border-zinc-700 rounded-2xl outline-none font-bold text-sm transition-all"
                    />
                  </div>
                </div>

                {/* Tỉnh / Thành phố */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1">
                    Bạn ở tỉnh / thành phố nào? <span className="text-rose-500 font-black text-xs">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                    <select
                      value={lakeProvince}
                      onChange={(e) => setLakeProvince(e.target.value)}
                      className="w-full h-13 pl-11 pr-4 bg-[#0c1222] border-2 border-slate-300 dark:border-zinc-700 text-white rounded-2xl outline-none font-bold text-xs appearance-none cursor-pointer focus:border-emerald-500"
                    >
                      {VIETNAM_PROVINCES.map((p) => (
                        <option key={p} value={p} className="bg-slate-900 text-white">
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Địa chỉ chi tiết */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                    Địa chỉ chi tiết nơi đặt hồ (Đường, Xã, Huyện)
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Thôn 2, Xã Lộc Tân, Huyện Bảo Lâm"
                    value={addressDetail}
                    onChange={(e) => setAddressDetail(e.target.value)}
                    className="w-full h-12 px-4 bg-slate-50 focus:bg-white text-slate-900 border-2 border-slate-300 focus:border-emerald-500 dark:bg-zinc-800 dark:focus:bg-zinc-900 dark:text-slate-100 dark:border-zinc-700 rounded-2xl outline-none font-bold text-xs transition-all"
                  />
                </div>

                {/* Checkbox Điều khoản */}
                <div className="flex items-start gap-2 pt-1">
                  <input
                    id="onboardingTerms"
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <label htmlFor="onboardingTerms" className="text-[11px] text-slate-300 leading-tight cursor-pointer">
                    Tôi đồng ý với <span className="text-emerald-400 font-bold">Quy định sử dụng & Chính sách bảo mật dữ liệu</span> của phần mềm Quản Lý Hồ Câu.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="h-14 w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-600/25 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 mt-4 cursor-pointer"
                >
                  {isSaving ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check size={18} />
                      <span>XÁC NHẬN & BẮT ĐẦU SỬ DỤNG</span>
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Onboarding Tour Guide */}
      <AnimatePresence>
        {tourStep !== null && !showSetup && (
          <div className="fixed inset-0 z-[900] pointer-events-none">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto" />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                top: highlightPos.top - 4,
                left: highlightPos.left - 4,
                width: highlightPos.width + 8,
                height: highlightPos.height + 8
              }}
              transition={{ type: "spring", damping: 20, stiffness: 150 }}
              className="absolute z-[910] border-2 border-primary bg-primary/15 rounded-xl shadow-[0_0_20px_rgba(244,114,182,0.4)] pointer-events-none"
            />

            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ 
                opacity: 1, 
                y: -highlightPos.height / 2, 
                scale: 1,
                top: tooltipPos.top,
                left: tooltipPos.left
              }}
              transition={{ type: "spring", damping: 20, stiffness: 150 }}
              className="absolute z-[920] w-80 bg-zinc-950 text-white border border-white/10 p-6 rounded-3xl shadow-2xl flex flex-col gap-4 pointer-events-auto origin-left"
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-widest bg-primary/20 text-primary px-2 py-1 rounded">
                  Bước {tourStep}/4
                </span>
                <button 
                  onClick={skipTour}
                  className="p-1 text-zinc-500 hover:text-white transition-colors"
                  title="Bỏ qua hướng dẫn"
                >
                  <X size={16} />
                </button>
              </div>

              {(() => {
                const content = getTourContent(tourStep);
                return (
                  <div className="space-y-2">
                    <h3 className="font-black text-sm uppercase tracking-tight text-white">{content.title}</h3>
                    <p className="text-[11px] leading-relaxed text-zinc-300 font-medium">{content.text}</p>
                  </div>
                );
              })()}

              <div className="flex items-center justify-between mt-2 pt-3 border-t border-white/5">
                <button
                  onClick={skipTour}
                  className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 hover:text-white transition-colors"
                >
                  Bỏ qua
                </button>
                <button
                  onClick={handleNextTourStep}
                  className="h-10 px-4 bg-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-1.5 shadow-lg shadow-primary/20 hover:scale-[1.03] active:scale-95 transition-all"
                >
                  {tourStep < 4 ? "Tiếp tục" : "Hoàn tất"}
                  <ArrowRight size={12} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
