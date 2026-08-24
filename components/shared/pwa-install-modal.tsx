"use client";

import React, { useState, useEffect } from "react";
import { 
  Smartphone, 
  Share2, 
  PlusSquare, 
  MoreVertical, 
  Download, 
  CheckCircle2, 
  X, 
  Sparkles,
  ExternalLink,
  Apple,
  Chrome
} from "lucide-react";
import { cn } from "@/utils/utils";

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PWAInstallModal({ isOpen, onClose }: PWAInstallModalProps) {
  const [platform, setPlatform] = useState<"ios" | "android">("ios");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userAgent = window.navigator.userAgent.toLowerCase();
      if (/iphone|ipad|ipod/.test(userAgent)) {
        setPlatform("ios");
      } else if (/android/.test(userAgent)) {
        setPlatform("android");
      }
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-[2.5rem] p-6 sm:p-8 shadow-2xl overflow-hidden flex flex-col gap-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 shrink-0">
            <Smartphone size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                Không Cần Tải Từ App Store / CH Play
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1">
              Thêm Icon Vào Màn Hình Chính Điện Thoại
            </h3>
          </div>
        </div>

        {/* Platform Selector Tabs */}
        <div className="flex bg-slate-100 dark:bg-zinc-900 p-1.5 rounded-2xl border border-slate-200 dark:border-zinc-800">
          <button
            onClick={() => setPlatform("ios")}
            className={cn(
              "flex-1 py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all",
              platform === "ios"
                ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 dark:text-zinc-400 hover:text-slate-900"
            )}
          >
            <Apple size={16} />
            <span>iPhone / iPad (Safari)</span>
          </button>

          <button
            onClick={() => setPlatform("android")}
            className={cn(
              "flex-1 py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all",
              platform === "android"
                ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 dark:text-zinc-400 hover:text-slate-900"
            )}
          >
            <Chrome size={16} />
            <span>Android (Google Chrome)</span>
          </button>
        </div>

        {/* Content for iOS */}
        {platform === "ios" && (
          <div className="space-y-4">
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-[11px] font-bold text-amber-700 dark:text-amber-400 leading-relaxed">
              💡 <strong>Lưu ý:</strong> Trên iPhone/iPad, vui lòng mở trang web bằng trình duyệt <strong>Safari</strong> để có thể thêm icon ra màn hình chính.
            </div>

            <div className="space-y-3">
              {/* Step 1 */}
              <div className="flex items-start gap-3 p-3.5 bg-slate-50 dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800/80">
                <div className="w-7 h-7 rounded-xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center font-black text-xs shrink-0">
                  1
                </div>
                <div className="text-xs space-y-1">
                  <p className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                    Bấm nút Chia sẻ <Share2 size={14} className="text-blue-500 shrink-0" />
                  </p>
                  <p className="text-slate-500 dark:text-zinc-400 font-medium">
                    Nhấn vào biểu tượng <strong>Chia sẻ (Share)</strong> ở thanh công cụ dưới đáy màn hình Safari.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3 p-3.5 bg-slate-50 dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800/80">
                <div className="w-7 h-7 rounded-xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center font-black text-xs shrink-0">
                  2
                </div>
                <div className="text-xs space-y-1">
                  <p className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                    Chọn "Thêm vào MH chính" <PlusSquare size={14} className="text-emerald-500 shrink-0" />
                  </p>
                  <p className="text-slate-500 dark:text-zinc-400 font-medium">
                    Cuộn xuống danh sách tùy chọn và chọn dòng <strong>"Thêm vào MH chính" (Add to Home Screen)</strong>.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3 p-3.5 bg-slate-50 dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800/80">
                <div className="w-7 h-7 rounded-xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center font-black text-xs shrink-0">
                  3
                </div>
                <div className="text-xs space-y-1">
                  <p className="font-extrabold text-slate-900 dark:text-white">
                    Nhấn nút "Thêm" (Add) ở góc trên bên phải
                  </p>
                  <p className="text-slate-500 dark:text-zinc-400 font-medium">
                    Icon ứng dụng <strong>Quản lý Hồ câu</strong> sẽ xuất hiện ngay trên màn hình chính điện thoại, mở full màn hình cực kỳ mượt mà.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content for Android */}
        {platform === "android" && (
          <div className="space-y-4">
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-[11px] font-bold text-emerald-700 dark:text-emerald-400 leading-relaxed">
              💡 <strong>Lưu ý:</strong> Trên Android, hãy dùng trình duyệt <strong>Google Chrome</strong> hoặc <strong>Cốc Cốc</strong> để cài đặt icon.
            </div>

            <div className="space-y-3">
              {/* Step 1 */}
              <div className="flex items-start gap-3 p-3.5 bg-slate-50 dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800/80">
                <div className="w-7 h-7 rounded-xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center font-black text-xs shrink-0">
                  1
                </div>
                <div className="text-xs space-y-1">
                  <p className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                    Bấm biểu tượng Menu 3 chấm <MoreVertical size={14} className="text-slate-600 dark:text-zinc-400 shrink-0" />
                  </p>
                  <p className="text-slate-500 dark:text-zinc-400 font-medium">
                    Nhấn vào biểu tượng <strong>3 dấu chấm dọc</strong> ở góc trên bên phải trình duyệt Chrome.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3 p-3.5 bg-slate-50 dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800/80">
                <div className="w-7 h-7 rounded-xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center font-black text-xs shrink-0">
                  2
                </div>
                <div className="text-xs space-y-1">
                  <p className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                    Chọn "Cài đặt ứng dụng" <Download size={14} className="text-emerald-500 shrink-0" />
                  </p>
                  <p className="text-slate-500 dark:text-zinc-400 font-medium">
                    Tìm và chọn mục <strong>"Cài đặt ứng dụng"</strong> (hoặc <strong>"Thêm vào Màn hình chính"</strong>).
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3 p-3.5 bg-slate-50 dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800/80">
                <div className="w-7 h-7 rounded-xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center font-black text-xs shrink-0">
                  3
                </div>
                <div className="text-xs space-y-1">
                  <p className="font-extrabold text-slate-900 dark:text-white">
                    Nhấn "Cài đặt" (Install)
                  </p>
                  <p className="text-slate-500 dark:text-zinc-400 font-medium">
                    Hệ thống sẽ tự động ghim icon app vào màn hình chính. Bạn có thể mở trực tiếp như app thông thường.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Benefits Footer */}
        <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-zinc-400">
            <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
            <span>Mở toàn màn hình • Không tốn bộ nhớ • Tự cập nhật</span>
          </div>

          <button
            onClick={onClose}
            className="h-10 px-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-xs hover:opacity-90 transition-opacity"
          >
            Đã Hiểu
          </button>
        </div>

      </div>
    </div>
  );
}
