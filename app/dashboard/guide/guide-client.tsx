"use client";

import React, { useState } from "react";
import { 
  Play, 
  Fish, 
  ShoppingBag, 
  Scale, 
  CreditCard, 
  Printer, 
  QrCode, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight,
  BookOpen,
  Users,
  Settings,
  HelpCircle,
  ShieldCheck,
  ChevronRight,
  Plus
} from "lucide-react";
import { useUIStore } from "@/stores/ui-store";
import { cn } from "@/utils/utils";
import Link from "next/link";

interface StepGuide {
  step: number;
  title: string;
  subtitle: string;
  icon: any;
  color: string;
  badge: string;
  details: string[];
  tips: string;
  actionText?: string;
  actionHref?: string;
  onActionClick?: () => void;
}

export function GuideClient() {
  const { setOpenSessionModalOpen } = useUIStore();
  const [activeTab, setActiveTab] = useState<"flow" | "features" | "faq">("flow");

  const operatingSteps: StepGuide[] = [
    {
      step: 1,
      title: "Vào ca câu & Giao chòi cho cần thủ",
      subtitle: "Mở chòi câu, chọn gói giờ / ca câu và gán tên khách hàng",
      icon: Play,
      color: "from-emerald-500 to-teal-600",
      badge: "Bước khởi đầu",
      details: [
        "Nhấn nút xanh '⚡ Vào ca / Bán vé' trên thanh Menu hoặc góc màn hình.",
        "Chọn Chòi câu còn trống (VD: Chòi 1, Chòi VIP, Ô số 5...).",
        "Chọn Gói câu phù hợp: Theo giờ (VD: 40k/giờ) hoặc Theo ca (VD: 5 tiếng / 10 tiếng).",
        "Nhập Tên / Số điện thoại của cần thủ (hoặc chọn Khách lẻ nếu khách không lưu thông tin).",
        "Bấm 'Bắt đầu ca câu' -> Đồng hồ đếm giờ sẽ tự động kích hoạt tính tiền thời gian thực."
      ],
      tips: "💡 Mẹo: Bạn có thể vào ca trước, khi khách muốn chuyển sang chòi khác chỉ cần bấm vào chòi đó để điều chỉnh.",
      actionText: "Thử mở ca câu ngay",
      onActionClick: () => setOpenSessionModalOpen(true),
    },
    {
      step: 2,
      title: "Bán đồ uống, thức ăn & mồi câu",
      subtitle: "Gọi thêm nước suối, bò húc, cám câu, ốc câu ghi nợ trực tiếp vào ca",
      icon: ShoppingBag,
      color: "from-blue-500 to-indigo-600",
      badge: "Gia tăng doanh thu",
      details: [
        "Trên màn hình 'Quản lý ca câu', tìm đến Chòi của khách đang câu.",
        "Nhấn vào nút '+ Thêm món / Dịch vụ'.",
        "Chọn các món khách gọi: Nước suối, Bò húc, Mồi câu, Thuốc lá, Cơm trưa...",
        "Tùy chỉnh số lượng (+/-) -> Bấm 'Xác nhận thêm'.",
        "Hệ thống sẽ tự động cộng dồn tiền món vào tổng bill của ca câu."
      ],
      tips: "💡 Mẹo: Nếu khách vãng lai chỉ mua nước không câu cá, hãy dùng mục 'Bán hàng POS' trên Menu để in bill lẻ.",
      actionText: "Đến trang Ca câu",
      actionHref: "/dashboard/sessions",
    },
    {
      step: 3,
      title: "Thu mua cá câu được (Cân ký)",
      subtitle: "Ghi nhận cá cần thủ câu được và tự động trừ tiền vào hóa đơn",
      icon: Scale,
      color: "from-amber-500 to-orange-600",
      badge: "Đặc quyền Hồ câu",
      details: [
        "Khi cần thủ câu được cá và muốn bán lại cho hồ (hoặc mang về theo quy định).",
        "Nhấn vào Chòi của cần thủ -> Chọn nút '⚖️ Cân cá / Thu mua'.",
        "Chọn Loại cá: Cá Trắm đen, Cá Chép, Cá Trôi, Cá Rô phi...",
        "Nhập số Cân nặng (kg) -> Hệ thống tự động nhân với Đơn giá thu mua (VD: 60.000đ/kg).",
        "Số tiền này sẽ được tự động TRỪ TRỰC TIẾP vào tổng tiền khách phải thanh toán."
      ],
      tips: "💡 Mẹo: Hồ câu cũng tự động lưu lại 'Kỷ lục cá khủng nhất' để vinh danh cần thủ trên bảng xếp hạng Báo cáo!",
      actionText: "Xem bảng báo cáo kỷ lục",
      actionHref: "/dashboard/reports",
    },
    {
      step: 4,
      title: "Kết thúc ca & Thanh toán VietQR tự động",
      subtitle: "Tự động tính phụ trội quá giờ, hiển thị QR ngân hàng và in hóa đơn",
      icon: QrCode,
      color: "from-emerald-600 to-green-700",
      badge: "Hoàn tất & Chống thất thoát",
      details: [
        "Khi cần thủ về, nhấn 'Kết thúc & Thanh toán'.",
        "Hệ thống tự động tính: Tiền giờ câu + Tiền đồ uống mồi câu - Tiền thu mua cá = Tổng tiền cuối.",
        "Nếu khách quét mã: Mã QR VietQR sẽ tự động hiện lên với ĐÚNG SỐ TIỀN và NỘI DUNG chuyển khoản.",
        "Khách chuyển tiền -> Nhân viên xác nhận -> Bấm 'In hóa đơn' (hỗ trợ máy in Bluetooth cầm tay 58mm/80mm).",
        "Chòi câu sẽ tự động chuyển sang trạng thái Sẵn sàng đón lượt khách tiếp theo."
      ],
      tips: "💡 Mẹo: Đừng quên cài đặt Số tài khoản ngân hàng của bạn trong mục 'Cài đặt -> Cấu hình Hồ' để mã QR hoạt động chuẩn xác.",
      actionText: "Cài đặt tài khoản nhận tiền",
      actionHref: "/dashboard/settings",
    },
  ];

  const quickFeatures = [
    {
      title: "Quản lý Chòi câu & Live Timer",
      desc: "Đồng hồ bấm giờ chính xác từng giây, đổi màu cảnh báo khi khách sắp hết giờ hoặc quá giờ câu.",
      icon: Clock,
      href: "/dashboard/sessions",
    },
    {
      title: "Cổng thanh toán VietQR Napas",
      desc: "Tự động sinh mã QR ngân hàng động chuẩn VietQR, khách quét là đúng số tiền không lo nhập sai số.",
      icon: CreditCard,
      href: "/dashboard/settings",
    },
    {
      title: "Quản lý Khách hàng & Cần thủ thân thiết",
      desc: "Lưu lịch sử câu, tích điểm hội viên, theo dõi công nợ và gắn thẻ VIP cho cần thủ quen thuộc.",
      icon: Users,
      href: "/dashboard/customers",
    },
    {
      title: "Báo cáo Doanh thu & Kỷ lục câu cá",
      desc: "Biểu đồ trực quan doanh thu theo ngày, tỷ lệ tiền mặt/chuyển khoản và top sản phẩm bán chạy nhất.",
      icon: Sparkles,
      href: "/dashboard/reports",
    },
    {
      title: "In Hóa Đơn Máy In Nhiệt Cầm Tay",
      desc: "Kết nối trực tiếp máy in Bluetooth 58mm hoặc 80mm, in hóa đơn sắc nét có logo và lời chào của hồ.",
      icon: Printer,
      href: "/dashboard/invoices",
    },
    {
      title: "Chế độ Ngoại tuyến (Offline-First)",
      desc: "Mất mạng Internet vẫn bán vé và tính giờ bình thường, tự động đồng bộ khi có kết nối lại.",
      icon: ShieldCheck,
      href: "/dashboard",
    },
  ];

  const faqs = [
    {
      q: "Làm sao để tiền chuyển khoản về thẳng tài khoản của chủ hồ?",
      a: "Bạn chỉ cần vào menu 'Cấu hình' (hoặc Cài đặt) -> Mục 'Cấu hình Hồ' -> Chọn Tên Ngân hàng của bạn (MBBank, Vietcombank, Techcombank...) -> Nhập Số tài khoản & Tên chủ tài khoản -> Bấm Lưu lại. Từ đó, mọi mã QR thanh toán trên app sẽ tự động chuyển thẳng về tài khoản đó."
    },
    {
      q: "Khách câu quá giờ thì phần mềm tính tiền như thế nào?",
      a: "Hệ thống tự động theo dõi thời gian. Khi hết giờ, chòi sẽ đổi sang màu vàng cảnh báo. Nếu quá giờ câu, hệ thống sẽ tự động tính thêm phụ trội theo đơn giá giờ bạn đã thiết lập trong 'Gói ca câu'."
    },
    {
      q: "Có thể sử dụng phần mềm trên điện thoại di động không?",
      a: "Có! Giao diện được tối ưu 100% responsive cho cả điện thoại di động, máy tính bảng iPad và máy vi tính để bàn tại quầy thu ngân. Nhân viên có thể cầm điện thoại đi quanh hồ để mở ca hoặc cân cá."
    },
    {
      q: "Có in được hóa đơn cho khách không?",
      a: "Có! Hệ thống hỗ trợ in hóa đơn nhiệt qua máy in Bluetooth cầm tay (khổ 58mm) hoặc máy in hóa đơn quầy thu ngân (khổ 80mm). Hóa đơn có đầy đủ giờ vào, giờ ra, tiền dịch vụ, tiền trừ cá và mã QR thanh toán."
    }
  ];

  return (
    <div className="space-y-6 select-none max-w-6xl mx-auto pb-10">
      
      {/* ── BANNER HEADER ── */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white p-6 sm:p-8 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider">
            <BookOpen size={14} />
            <span>Cẩm Nang Vận Hành Chuẩn</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Hướng dẫn sử dụng Hệ thống Quản lý Hồ câu
          </h1>

          <p className="text-xs sm:text-sm text-emerald-50 leading-relaxed font-medium">
            Tài liệu hướng dẫn trực quan từng bước giúp chủ hồ và nhân viên làm chủ toàn bộ quy trình: Từ mở chòi câu, bán mồi, cân cá đến xuất hóa đơn VietQR tự động.
          </p>

          <div className="pt-2 flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setOpenSessionModalOpen(true)}
              className="h-10 px-5 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl font-extrabold text-xs flex items-center gap-2 shadow-md shadow-black/10 transition-all hover:scale-105 active:scale-95"
            >
              <Plus size={16} className="stroke-[2.5]" />
              <span>Vào ca câu mới thử ngay</span>
            </button>
            <Link href="/dashboard/settings">
              <button className="h-10 px-4 bg-emerald-700/80 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 transition-colors">
                <Settings size={15} />
                <span>Cài đặt thông tin hồ</span>
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* ── NAVIGATION TABS ── */}
      <div className="flex bg-white dark:bg-zinc-900 p-1.5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-2xs">
        <button
          onClick={() => setActiveTab("flow")}
          className={cn(
            "flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2",
            activeTab === "flow"
              ? "bg-emerald-600 text-white shadow-2xs"
              : "text-slate-600 dark:text-zinc-400 hover:text-slate-900"
          )}
        >
          <Play size={14} />
          <span>Quy trình 4 Bước chuẩn (Từ vào ca đến thu tiền)</span>
        </button>

        <button
          onClick={() => setActiveTab("features")}
          className={cn(
            "flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2",
            activeTab === "features"
              ? "bg-emerald-600 text-white shadow-2xs"
              : "text-slate-600 dark:text-zinc-400 hover:text-slate-900"
          )}
        >
          <Sparkles size={14} />
          <span>Các tính năng nổi bật</span>
        </button>

        <button
          onClick={() => setActiveTab("faq")}
          className={cn(
            "flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2",
            activeTab === "faq"
              ? "bg-emerald-600 text-white shadow-2xs"
              : "text-slate-600 dark:text-zinc-400 hover:text-slate-900"
          )}
        >
          <HelpCircle size={14} />
          <span>Câu hỏi thường gặp</span>
        </button>
      </div>

      {/* ── TAB 1: 4-STEP OPERATING FLOW ── */}
      {activeTab === "flow" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {operatingSteps.map((item) => (
              <div 
                key={item.step}
                className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-2xs p-6 flex flex-col justify-between space-y-4 hover:border-emerald-500/50 transition-all group"
              >
                <div className="space-y-3">
                  
                  {/* Step Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-xl bg-gradient-to-br text-white flex items-center justify-center font-black text-sm shadow-md shrink-0",
                        item.color
                      )}>
                        {item.step}
                      </div>
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                          {item.badge}
                        </span>
                        <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white mt-1">
                          {item.title}
                        </h3>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                    {item.subtitle}
                  </p>

                  {/* Bullet points */}
                  <ul className="space-y-2 pt-2 border-t border-slate-100 dark:border-zinc-800/80 text-xs">
                    {item.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-700 dark:text-zinc-300">
                        <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>

                </div>

                {/* Tips & Quick Action */}
                <div className="pt-3 border-t border-slate-100 dark:border-zinc-800/80 space-y-3">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 text-[11px] text-slate-600 dark:text-zinc-300 font-medium">
                    {item.tips}
                  </div>

                  {item.onActionClick ? (
                    <button
                      onClick={item.onActionClick}
                      className="w-full h-9 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-600/20 transition-all"
                    >
                      <span>{item.actionText}</span>
                      <ArrowRight size={13} />
                    </button>
                  ) : item.actionHref ? (
                    <Link href={item.actionHref} className="block w-full">
                      <button className="w-full h-9 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors">
                        <span>{item.actionText}</span>
                        <ChevronRight size={13} />
                      </button>
                    </Link>
                  ) : null}
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 2: FEATURES GRID ── */}
      {activeTab === "features" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {quickFeatures.map((f, i) => (
            <Link key={i} href={f.href} className="group">
              <div className="h-full bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-2xs hover:border-emerald-500/50 hover:shadow-md transition-all flex flex-col justify-between space-y-3">
                <div className="space-y-2.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                    <f.icon size={20} className="stroke-[2.2]" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                    {f.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium leading-relaxed">
                    {f.desc}
                  </p>
                </div>

                <div className="pt-2 flex items-center text-[11px] font-bold text-emerald-600 gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Truy cập chức năng</span>
                  <ChevronRight size={13} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* ── TAB 3: FAQ ── */}
      {activeTab === "faq" && (
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div 
              key={idx}
              className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-2xs space-y-2"
            >
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                  ?
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {faq.q}
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-zinc-300 pl-9 font-medium leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ── FOOTER CSKH HOTLINE ── */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-500/20">
            <HelpCircle size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Cần hỗ trợ hướng dẫn vận hành hoặc tư vấn sử dụng?
            </h4>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Tổng đài Chăm sóc khách hàng & Kỹ thuật hỗ trợ 24/7 qua Hotline / Zalo:{" "}
              <a href="https://zalo.me/0855550813" target="_blank" rel="noopener noreferrer" className="font-extrabold text-emerald-600 underline">
                0855550813
              </a>
            </p>
          </div>
        </div>

        <a
          href="https://zalo.me/0855550813"
          target="_blank"
          rel="noopener noreferrer"
          className="h-9 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shrink-0 flex items-center gap-2 transition-all shadow-sm shadow-emerald-600/25"
        >
          <span>Chat Zalo CSKH: 0855550813</span>
        </a>
      </div>

    </div>
  );
}
