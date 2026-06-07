import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  Fish, 
  Clock, 
  Printer, 
  Coins, 
  TrendingUp, 
  Users, 
  Package, 
  Zap, 
  ArrowRight,
  Monitor,
  Phone,
  Sparkles,
  Layers,
  WifiOff,
  Camera,
  Calendar,
  Lock,
  Activity,
  CreditCard,
  ChevronRight,
  Check,
  Award,
  Bell,
  ShieldCheck,
  Volume2,
  FileText,
  Star,
  Users2,
  CheckCircle,
  HelpCircle,
  Crown,
  PhoneCall,
  MessageSquare,
  Gift,
  Building,
  ChevronDown,
  Target,
  Handshake
} from "lucide-react";

export const metadata = {
  title: "Phần Mềm Quản Lý Hồ Câu Cá Chuyên Nghiệp | Tối Ưu Doanh Thu & Vận Hành SaaS",
  description: "Giải pháp số hóa hồ câu cá hàng đầu Việt Nam. Tự động đếm ngược realtime, tự động thanh toán hết giờ, chuông SOS nhấp nháy đỏ, nhạc chuông Web Audio API offline và in hóa đơn nhiệt Bluetooth 58mm chuyên nghiệp.",
  keywords: [
    "quản lý hồ câu cá",
    "phần mềm quản lý hồ câu",
    "phần mềm hồ câu giải trí",
    "quản lý ca câu realtime",
    "in hóa đơn bluetooth di động",
    "phần mềm saas hồ câu",
    "thiết bị in hóa đơn pt-210",
    "tự động hóa hồ câu",
    "chuyển đổi số hồ câu"
  ],
  authors: [{ name: "Quản Lý Hồ Câu Team" }],
  openGraph: {
    title: "Phần Mềm Quản Lý Hồ Câu Cá Chuyên Nghiệp | Số Hóa Toàn Diện",
    description: "Tăng 25% hiệu suất hồ câu, loại bỏ 100% thất thoát tài chính. Trải nghiệm hệ thống đếm ngược realtime, báo động SOS và in hóa đơn nhiệt Bluetooth thông minh.",
    url: "https://quanlihocau.com",
    siteName: "Quản Lý Hồ Câu",
    images: [
      {
        url: "https://quanlihocau.com/fishing_bg.png",
        width: 1200,
        height: 630,
        alt: "Giao diện Quản Lý Hồ Câu Thông Minh",
      },
    ],
    locale: "vi_VN",
    type: "website",
  },
  alternates: {
    canonical: "https://quanlihocau.com",
  },
  verification: {
    google: "google50db3f22f66b9054",
  },
};

export default async function RootPage() {
  const session = await auth();

  // Redirect to dashboard if already logged in
  if (session) {
    redirect("/dashboard");
  }

  // Schema.org Structured Data
  const jsonLdSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Phần mềm Quản lý Hồ câu Cá Chuyên nghiệp",
    "alternateName": "quanlihocau.com",
    "url": "https://quanlihocau.com",
    "logo": "https://quanlihocau.com/fishing_bg.png",
    "operatingSystem": "Windows, macOS, iOS, Android",
    "applicationCategory": "BusinessApplication",
    "description": "Giải pháp số hóa quản lý hồ câu cá giải trí toàn diện tại Việt Nam. Hỗ trợ đếm ngược realtime, báo động SOS, in bill nhiệt cầm tay Bluetooth ESC/POS.",
    "author": {
      "@type": "Organization",
      "name": "Đội ngũ QuanLiHoCau",
      "url": "https://quanlihocau.com"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "139",
      "bestRating": "5",
      "worstRating": "1"
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "VND",
      "priceSpecification": {
        "@type": "PriceSpecification",
        "price": "0",
        "priceCurrency": "VND",
        "valueAddedTaxIncluded": true
      }
    },
    "featureList": [
      "Quản lý ca câu đếm ngược thời gian thực",
      "Tự động khóa ca và thanh toán khi hết giờ",
      "Cảnh báo SOS nhấp nháy đỏ hào quang dưới 15 phút",
      "Nhạc chuông Web Audio API tự tổng hợp offline",
      "Tích hợp máy in hóa đơn nhiệt Bluetooth 58mm PT-210",
      "Thêm sản phẩm nhanh ngay ở bước Check-in"
    ]
  };

  const faqJsonLdSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Phần mềm quản lý hồ câu cá QuanLiHoCau™ là gì?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "QuanLiHoCau™ là giải pháp phần mềm quản lý hồ câu cá giải trí dịch vụ chuyên nghiệp hàng đầu tại Việt Nam. Phần mềm giúp các chủ hồ câu cá số hóa toàn diện quy trình vận hành: quản lý ca câu thời gian thực (realtime), tự động chốt tiền giờ, quản lý bán hàng (đồ ăn, nước uống, mồi câu), thu mua cá trực tiếp, in bill nhiệt Bluetooth không dây cầm tay và kiểm soát doanh thu chi tiết từ xa qua điện thoại di động."
        }
      },
      {
        "@type": "Question",
        "name": "Phần mềm hỗ trợ quản lý ca câu đếm ngược và cảnh báo bằng cách nào?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Hệ thống tích hợp tính năng đếm ngược thời gian thực (realtime countdown) cực kỳ trực quan cho từng ô câu/chòi câu. Khi ca câu sắp hết giờ (dưới 15 phút), hệ thống sẽ tự động nhấp nháy đỏ báo động SOS và phát âm thanh cảnh báo thông minh thông qua Web Audio API tổng hợp nhạc chuông trực tiếp offline. Tính năng này giúp nhân viên kịp thời báo giỏ, gia hạn giờ hoặc chốt thu mua cá của cần thủ mà không sợ quên hay nhầm lẫn."
        }
      },
      {
        "@type": "Question",
        "name": "Tôi có cần mua thêm thiết bị đắt tiền để sử dụng máy in hóa đơn không?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Hoàn toàn không. QuanLiHoCau™ hỗ trợ kết nối trực tiếp với các dòng máy in bill nhiệt cầm tay Bluetooth 58mm giá rẻ (như PT-210) ngay trên trình duyệt điện thoại hoặc máy tính. Bạn có thể in hóa đơn nhiệt cho khách chỉ trong 3 giây thông qua kết nối Bluetooth không dây siêu mượt mà không cần dây cáp rườm rà hay máy vi tính cồng kềnh."
        }
      },
      {
        "@type": "Question",
        "name": "Làm thế nào để phần mềm chống thất thoát doanh số dịch vụ và nhân viên?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Phần mềm cung cấp tính năng phân quyền chặt chẽ giữa Chủ hồ (Admin), Thu ngân và Nhân viên trực chòi. Mọi hành động như mở ca câu, gia hạn giờ, hủy vé hay bán đồ ăn thức uống đều được lưu lại vết chi tiết (Activity Log). Nhân viên có thể thêm nhanh các sản phẩm nước ngọt, mồi câu ngay khi mở ca check-in, đối soát tồn kho tự động, triệt tiêu 100% việc nhân viên tự ý thu tiền riêng của khách hàng."
        }
      },
      {
        "@type": "Question",
        "name": "Chủ hồ câu có thể theo dõi hoạt động và báo cáo doanh thu từ xa không?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Có, QuanLiHoCau™ được xây dựng trên nền tảng Web App (SaaS) hiện đại, hoạt động mượt mà trên mọi thiết bị di động (iPhone, Android, máy tính bảng) và PC. Bạn có thể tự do rời hồ câu để đi du lịch hoặc làm công việc khác mà vẫn nắm rõ chính xác số lượng cần thủ đang câu, biểu đồ doanh thu realtime, nhật ký thả cá và lượng cá thu mua lại mọi lúc mọi nơi."
        }
      },
      {
        "@type": "Question",
        "name": "Hồ câu dịch vụ của tôi có được hỗ trợ cài đặt và setup ban đầu không?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Chúng tôi cam kết đồng hành và hỗ trợ setup trọn gói ban đầu hoàn toàn miễn phí. Đội ngũ kỹ thuật QuanLiHoCau sẽ trực tiếp tư vấn cấu hình ô câu, chòi câu, biểu giá dịch vụ câu cá (ca 5h, 10h, giờ lẻ), danh mục mồi câu, nước uống và hướng dẫn nhân viên vận hành chi tiết tận nơi hoặc qua video gọi trực tiếp."
        }
      }
    ]
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans overflow-x-hidden selection:bg-emerald-500/30 selection:text-emerald-950 relative smooth-scroll">
      
      {/* Dynamic Google Fonts Stylesheet Injection */}
      <link 
        href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Be+Vietnam+Pro:wght@400;500;600;700;800;900&family=Caveat:wght@400;700&display=swap" 
        rel="stylesheet" 
      />

      {/* Inject Structured Data for Google SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
      />

      {/* Inject FAQ Structured Data for GEO & LLMO Optimization */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLdSchema) }}
      />

      {/* ================= HEADER / NAVIGATION ================= */}
      <header className="z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md text-slate-900 sticky top-0 transition-all shadow-sm overflow-visible">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-20 relative">
          
          {/* Logo Brand */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0 select-none">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-emerald-600 flex items-center justify-center shadow-md shadow-emerald-500/10 group-hover:scale-105 transition-transform border border-emerald-400/20">
              <Fish className="w-5.5 h-5.5 text-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="text-base font-extrabold tracking-tight text-slate-900 font-display">
                  QuanLiHoCau
                </span>
                <span className="text-[10px] font-black text-emerald-600">™</span>
              </div>
              <span className="text-[9px] font-medium text-slate-400 tracking-wider -mt-0.5">
                Phát triển bởi Đội ngũ QuanLiHoCau
              </span>
            </div>
          </Link>

          {/* Navigation Links in Center */}
          <nav className="hidden lg:flex items-center gap-8">
            <a href="#tinh-nang" className="text-sm font-semibold text-slate-655 hover:text-emerald-600 transition-colors">
              Tính năng
            </a>
            <a href="#giai-phap" className="text-sm font-semibold text-slate-655 hover:text-emerald-600 transition-colors">
              Giải pháp
            </a>
            <a href="#doi-ngu" className="text-sm font-semibold text-slate-655 hover:text-emerald-600 transition-colors">
              Đội ngũ hỗ trợ
            </a>
            <a href="#lien-he" className="text-sm font-semibold text-slate-655 hover:text-emerald-600 transition-colors">
              Liên hệ
            </a>
          </nav>

          {/* Actions on Right */}
          <div className="flex items-center gap-4">
            <a 
              href="tel:0855550813" 
              className="hidden xl:flex h-10 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-full px-4 items-center justify-center gap-2 transition-all"
            >
              <PhoneCall size={13} className="text-emerald-600 animate-pulse" />
              <span>Hỗ trợ: 0855 550 813</span>
            </a>
            
            <Link 
              href="/login" 
              className="h-11 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold uppercase tracking-wide rounded-xl px-5 flex items-center justify-center transition-all shadow-md shadow-emerald-600/10 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
              id="register_nav_btn"
            >
              TRẢI NGHIỆM MIỄN PHÍ NGAY
            </Link>

            {/* Mobile menu checkbox hack */}
            <input type="checkbox" id="mobile-menu-toggle" className="hidden peer" />
            <label htmlFor="mobile-menu-toggle" className="lg:hidden flex flex-col justify-between w-6 h-4 cursor-pointer z-50 shrink-0">
              <span className="w-full h-[2px] bg-slate-800 rounded transition-all duration-300 origin-left peer-checked:rotate-45" />
              <span className="w-full h-[2px] bg-slate-800 rounded transition-all duration-300 peer-checked:opacity-0" />
              <span className="w-full h-[2px] bg-slate-800 rounded transition-all duration-300 origin-left peer-checked:-rotate-45" />
            </label>

            {/* Mobile menu panel */}
            <div className="fixed inset-0 bg-white z-40 translate-x-full peer-checked:translate-x-0 transition-transform duration-300 lg:hidden flex flex-col justify-center items-center gap-8 text-lg font-bold text-center">
              <a href="#tinh-nang" className="text-slate-800 hover:text-emerald-600 transition-colors">Tính năng</a>
              <a href="#giai-phap" className="text-slate-800 hover:text-emerald-600 transition-colors">Giải pháp</a>
              <a href="#doi-ngu" className="text-slate-800 hover:text-emerald-600 transition-colors">Đội ngũ hỗ trợ</a>
              <a href="#lien-he" className="text-slate-800 hover:text-emerald-600 transition-colors">Liên hệ</a>
              <Link href="/login" className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-extrabold shadow-md">ĐĂNG NHẬP HỆ THỐNG</Link>
            </div>
          </div>

        </div>
      </header>

      {/* ================= HERO SECTION ================= */}
      <section className="relative z-10 overflow-hidden bg-gradient-to-b from-white via-slate-50 to-white pt-12 pb-20 sm:pb-24 border-b border-slate-100">
        
        {/* Soft mint/light-blue background glow orbs */}
        <div className="absolute top-1/4 left-0 w-[400px] h-[400px] rounded-full bg-emerald-500/5 blur-[100px] pointer-events-none -z-10" />
        <div className="absolute top-1/3 right-0 w-[500px] h-[500px] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Hero Content Left */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-8 text-left">
            
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-extrabold tracking-wide uppercase">
                <Sparkles size={12} />
                PHẦN MỀM SAAS CHUYÊN NGHIỆP
              </div>
              
              <h1 className="text-3xl sm:text-[40px] md:text-[46px] lg:text-[48px] xl:text-[50px] font-black tracking-tight leading-[1.15] text-slate-900" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>
                Quản lý hồ câu dễ hơn — <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 drop-shadow-sm">
                  Theo dõi doanh thu mọi lúc mọi nơi.
                </span>
              </h1>
            </div>

            <p className="text-slate-500 text-sm sm:text-base md:text-lg leading-relaxed max-w-xl font-medium" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Giải pháp quản lý hồ câu toàn diện giúp chủ hồ loại bỏ hoàn toàn sổ sách thủ công, triệt tiêu 100% thất thoát thời gian và nâng tầm dịch vụ chuyên nghiệp hàng đầu.
            </p>

            {/* Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {[
                "Quản lý vé câu thông minh",
                "Doanh thu báo cáo realtime",
                "Hồ sơ khách hàng VIP",
                "Quản lý nhân viên trực chòi",
                "Kho hàng & sản phẩm dịch vụ",
                "Nhật ký thả cá và thu mua",
                "Dữ liệu vận hành tự động",
                "Hoạt động mượt trên mọi thiết bị"
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
                    <Check size={11} className="stroke-[3]" />
                  </div>
                  <span className="text-slate-700 text-xs sm:text-sm font-semibold tracking-wide">{item}</span>
                </div>
              ))}
            </div>

            {/* CTA and Pointer */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4 relative">
              <Link 
                href="/login" 
                className="h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold uppercase tracking-wider text-sm rounded-xl px-8 flex items-center justify-center gap-2.5 transition-all hover:scale-[1.01] active:scale-[0.98] hover:shadow-lg hover:shadow-emerald-600/10 duration-300 border border-emerald-600/20"
                style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
              >
                BẮT ĐẦU MIỄN PHÍ NGAY
                <Zap size={14} className="fill-white animate-pulse" />
              </Link>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Đăng nhập siêu tốc bằng Google / Zalo
              </div>
            </div>

            {/* Trust lines */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest pt-2">
              <span className="flex items-center gap-1.5"><Check size={12} className="text-emerald-500" /> Miễn phí cài đặt</span>
              <span className="flex items-center gap-1.5"><Check size={12} className="text-emerald-500" /> Không cần thẻ tín dụng</span>
              <span className="flex items-center gap-1.5"><Check size={12} className="text-emerald-500" /> Hỗ trợ tận nơi</span>
              <span className="flex items-center gap-1.5"><Check size={12} className="text-emerald-500" /> Đồng hành setup ban đầu</span>
            </div>

          </div>

          {/* Hero Visual Mockup Right - REAL HIGH-FIDELITY DASHBOARD MOCKUP */}
          <div className="lg:col-span-6 relative mt-6 lg:mt-0 flex justify-center items-center">
            
            {/* Soft decorative background glow */}
            <div className="absolute inset-0 w-full h-full bg-slate-200/50 rounded-[2.5rem] overflow-hidden -z-10 shadow-inner border border-slate-100 flex items-center justify-center" />

            {/* Premium Simulated SaaS Dashboard Setup */}
            <div className="w-full max-w-[520px] relative px-2 py-4 flex flex-col items-center">
              
              {/* Floating Award Seal Badge */}
              <div className="absolute -top-6 -left-3 z-30 bg-gradient-to-br from-amber-400 to-yellow-600 border-2 border-white rounded-full w-24 h-24 shadow-lg flex flex-col items-center justify-center text-center p-2 transform -rotate-12 animate-attention-pulse hover:scale-105 transition-transform select-none">
                <Crown className="w-5 h-5 text-white" />
                <span className="text-[8px] font-black text-amber-950 uppercase tracking-tighter mt-0.5 leading-none">
                  GIẢI PHÁP SỐ 1
                </span>
                <span className="text-[7px] font-bold text-white uppercase tracking-widest leading-none mt-0.5">
                  CHO HỒ CÂU
                </span>
                <div className="flex gap-0.5 mt-1">
                  {[...Array(5)].map((_, i) => <Star key={i} size={7} className="fill-white text-transparent" />)}
                </div>
              </div>

              {/* 1. SaaS Main Web Application Interface Simulator */}
              <div className="w-full bg-slate-900 rounded-2xl p-2.5 shadow-2xl border border-slate-800 relative">
                
                {/* Simulated Screen Body */}
                <div className="bg-[#0b1329] rounded-xl overflow-hidden border border-slate-800 shadow-inner aspect-[16/10.5] relative flex flex-col">
                  
                  {/* Dashboard Header Bar */}
                  <div className="flex items-center justify-between border-b border-white/5 px-3 py-2 text-[9px]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="font-extrabold text-slate-300 tracking-wider ml-1 uppercase">HỒ CÂU ĐẠI AN</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded text-[8px] text-emerald-400 font-extrabold animate-pulse">
                        LIVE
                      </span>
                    </div>
                  </div>

                  {/* Core Statistics Cards */}
                  <div className="grid grid-cols-3 gap-2 px-3 py-2 text-[9px]">
                    <div className="bg-white/[0.03] border border-white/5 rounded-lg p-2 text-center">
                      <p className="text-[7px] text-slate-400 font-extrabold uppercase">Vé đang câu</p>
                      <p className="font-black text-white mt-0.5">12 Ô Hoạt Động</p>
                    </div>
                    <div className="bg-white/[0.03] border border-white/5 rounded-lg p-2 text-center">
                      <p className="text-[7px] text-slate-400 font-extrabold uppercase">Doanh thu ngày</p>
                      <p className="font-black text-emerald-400 mt-0.5">4,250,000 đ</p>
                    </div>
                    <div className="bg-white/[0.03] border border-white/5 rounded-lg p-2 text-center">
                      <p className="text-[7px] text-slate-400 font-extrabold uppercase">Cá thu mua</p>
                      <p className="font-black text-amber-400 mt-0.5">32.8 Kg</p>
                    </div>
                  </div>

                  {/* Active Slots Time Real-time Grid View */}
                  <div className="flex-1 px-3 pb-3 space-y-1.5 text-[8px] overflow-hidden">
                    <p className="text-[7px] font-bold text-slate-500 uppercase tracking-widest mb-1">Phiên câu đang hoạt động</p>
                    
                    {/* Slot 1 - Active */}
                    <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 p-2 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="font-bold text-slate-200">Ô SỐ 08 - ANH HOÀNG (VIP)</span>
                      </div>
                      <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-black">Còn: 03:14:22</span>
                    </div>

                    {/* Slot 2 - SOS Alert (Core business feature) */}
                    <div className="flex items-center justify-between bg-rose-500/10 border border-rose-500/20 p-2 rounded-lg animate-sos">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                        <span className="font-bold text-white uppercase tracking-wide">Ô SỐ 12 - ANH KHÁNH (SOS)</span>
                      </div>
                      <span className="bg-rose-600 text-white px-2 py-0.5 rounded font-black text-[9px]">SẮP HẾT GIỜ: 00:08:45</span>
                    </div>

                    {/* Slot 3 - Active */}
                    <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 p-2 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="font-bold text-slate-200">Ô SỐ 03 - ANH PHÚC</span>
                      </div>
                      <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-black">Còn: 01:45:10</span>
                    </div>
                  </div>

                  {/* Top Bar of the Mockup displaying Stocked Fish stats */}
                  <div className="bg-slate-950 px-3 py-1.5 text-[7px] text-slate-400 flex items-center justify-between border-t border-white/5 font-mono">
                    <span>Nhật ký thả cá gần nhất: Trắm Đen (150kg) • Chép Giòn (80kg)</span>
                    <span className="text-emerald-400 font-bold">Cập nhật: 2 giờ trước</span>
                  </div>

                </div>

              </div>

              {/* 2. Bluetooth Portable Thermal Receipt Printer Simulator (Overlaid left-front) */}
              <div className="absolute -bottom-10 -left-6 w-44 sm:w-48 bg-[#1f1f23] rounded-xl p-3 shadow-2xl border border-zinc-700 flex flex-col justify-between hover:scale-105 transition-transform duration-300 z-20">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5 text-[8px] font-bold text-zinc-400">
                  <span className="flex items-center gap-1">
                    <Printer size={10} className="text-emerald-400" />
                    IN NHIỆT PT-210
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>

                {/* Simulated thermal printed bill paper */}
                <div className="bg-slate-50 text-slate-900 rounded p-2.5 mt-2 font-mono text-[7px] leading-normal uppercase shadow-lg border-t-4 border-emerald-500 transform -rotate-1 select-none">
                  <div className="text-center font-black text-[9px] leading-tight tracking-tight">HỒ CÂU ĐẠI AN</div>
                  <div className="h-[1px] bg-slate-300 my-1 border-dashed" />
                  <p className="font-bold">VỊ TRÍ: Ô SỐ 12</p>
                  <p>KHÁCH: ANH KHÁNH</p>
                  <div className="h-[1px] bg-slate-200 my-0.5" />
                  <div className="flex justify-between">
                    <span>Ca 4 giờ</span>
                    <span>240,000đ</span>
                  </div>
                  <div className="flex justify-between">
                    <span>2 Nước ngọt</span>
                    <span>24,000đ</span>
                  </div>
                  <div className="flex justify-between">
                    <span>1 Mồi cá chép</span>
                    <span>25,000đ</span>
                  </div>
                  <div className="flex justify-between text-rose-600 font-bold">
                    <span>Thu cá trắm 5.2kg</span>
                    <span>-104,000đ</span>
                  </div>
                  <div className="h-[1px] bg-slate-300 my-1 border-dashed" />
                  <div className="text-right font-black text-[8px] text-slate-950">THỰC THU: 185,000đ</div>
                </div>
              </div>

              {/* 3. Smartphone App view Simulator (Overlaid right-front) */}
              <div className="absolute -bottom-12 -right-4 w-32 sm:w-36 bg-[#0a0f1d] rounded-[2rem] p-2.5 shadow-2xl border-[3px] border-slate-700 flex flex-col justify-between hover:scale-105 transition-transform duration-300 z-20 aspect-[9/18.5]">
                
                {/* Simulated mobile screen view */}
                <div className="bg-slate-950 rounded-[1.6rem] overflow-hidden flex-1 flex flex-col p-2 text-white text-[7.5px] font-sans justify-between relative">
                  
                  {/* Smartphone camera notch */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-slate-800 rounded-b-xl w-12 h-3.5 z-10" />
                  <div className="h-2" />

                  {/* Active Countdown block */}
                  <div className="bg-rose-500/10 border border-rose-500/20 p-2 rounded-xl flex flex-col items-center justify-center text-center mt-1">
                    <span className="text-[5px] text-rose-400 font-extrabold uppercase tracking-widest">Ô 12 SẮP HẾT GIỜ</span>
                    <span className="text-base font-black text-rose-500 tracking-tight my-0.5 leading-none">00:08:45</span>
                    <span className="text-[5.5px] text-slate-400 font-bold bg-white/5 px-1.5 py-0.5 rounded mt-0.5">BẤM GIA HẠN NHANH</span>
                  </div>

                  {/* Small customer list in mobile view */}
                  <div className="flex-1 my-2.5 space-y-1.5 overflow-hidden leading-tight font-bold text-[6.5px]">
                    <div className="bg-white/[0.03] p-1.5 rounded flex justify-between items-center">
                      <span>Anh Hoàng Đại An</span>
                      <span className="text-emerald-400">Đang câu</span>
                    </div>
                    <div className="bg-white/[0.03] p-1.5 rounded flex justify-between items-center">
                      <span>Anh Phúc Hà Nội</span>
                      <span className="text-emerald-400">Đang câu</span>
                    </div>
                    <div className="bg-white/[0.03] p-1.5 rounded flex justify-between items-center">
                      <span>Anh Tiến Dũng</span>
                      <span className="text-slate-500">Đã thanh toán</span>
                    </div>
                  </div>

                  {/* Mobile navigation bottom tab bar */}
                  <div className="border-t border-white/5 pt-1.5 flex justify-around text-[5px] text-slate-500 font-bold uppercase tracking-wider">
                    <span className="text-emerald-400">Trang chủ</span>
                    <span>Tạo Vé</span>
                    <span>Báo cáo</span>
                  </div>

                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ================= SECTION — PAIN POINTS ================= */}
      <section className="py-20 sm:py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-2xl sm:text-3.5xl font-black text-slate-900 uppercase tracking-tight" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>
              Bạn đang gặp những vấn đề này trong vận hành hồ câu?
            </h2>
            <div className="w-12 h-1 bg-emerald-500 mx-auto rounded-full mt-2" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Thất thoát doanh thu dịch vụ",
                desc: "Không kiểm soát được nước uống, đồ ăn, mồi câu nhân viên bán ra. Thiếu sự đối soát giữa số tiền thu về và tồn kho sản phẩm thực tế.",
                icon: Coins,
                color: "bg-rose-50 border-rose-100 text-rose-600"
              },
              {
                title: "Nhân viên thao tác thiếu minh bạch",
                desc: "Không quản lý được nhân viên trực chòi có tự ý tạo ca câu, thu tiền khách lẻ rồi bỏ túi riêng hay không. Khó truy vết lịch sử tạo vé.",
                icon: Users,
                color: "bg-amber-50 border-amber-100 text-amber-600"
              },
              {
                title: "Quản lý thủ công bằng sổ sách rườm rà",
                desc: "Ghi chép tay mệt mỏi, dễ nhầm lẫn giờ ra vào của cần thủ, tính toán hóa đơn sai sót dẫn đến tranh cãi không đáng có với khách hàng.",
                icon: FileText,
                color: "bg-blue-50 border-blue-100 text-blue-600"
              },
              {
                title: "Không theo dõi dữ liệu từ xa",
                desc: "Chủ hồ không thể rời hồ câu lấy 1 ngày vì không biết doanh số thực tế, số lượng khách đang câu, tình hình hồ ra sao khi vắng mặt.",
                icon: WifiOff,
                color: "bg-purple-50 border-purple-100 text-purple-600"
              },
              {
                title: "Khó khăn khi kiểm soát giờ câu",
                desc: "Hàng chục cần thủ câu các ca 5 giờ, 10 giờ hay giờ lẻ khác nhau. Nhân viên không nhớ nổi ai sắp hết giờ để đi báo giỏ hoặc thu cá.",
                icon: Clock,
                color: "bg-red-50 border-red-100 text-red-600"
              },
              {
                title: "Khó theo dõi lịch sử và biểu giá cá",
                desc: "Thất thoát tiền do cân cá thu mua của khách sai biểu giá, nhập cá thả xuống hồ ghi chép thủ công dễ nhầm lẫn số lượng và chi phí.",
                icon: Fish,
                color: "bg-teal-50 border-teal-100 text-teal-600"
              }
            ].map((card, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-100 rounded-2xl p-6 sm:p-8 hover:shadow-md transition-all duration-200">
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center font-bold text-sm mb-4 ${card.color}`}>
                  <card.icon size={18} className="stroke-[2.5]" />
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 mb-2 uppercase tracking-tight" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>
                  {card.title}
                </h3>
                <p className="text-slate-500 text-xs sm:text-sm font-semibold leading-relaxed" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {card.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-slate-800 font-extrabold text-sm sm:text-base uppercase tracking-wider mb-2">
              Chúng tôi thấu hiểu những đau đầu đó và mang lại giải pháp số hóa toàn diện
            </p>
            <a href="#tinh-nang" className="inline-flex items-center gap-1 text-xs font-black text-emerald-600 uppercase tracking-widest hover:text-emerald-700 transition-colors">
              Xem giải pháp của QuanLiHoCau <ArrowRight size={14} />
            </a>
          </div>

        </div>
      </section>

      {/* ================= SECTION — WHY CHOOSE US ================= */}
      <section className="py-20 sm:py-24 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-2xl sm:text-3.5xl font-black text-slate-900 uppercase tracking-tight" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>
              Tại sao nhiều chủ hồ chuyển sang số hóa?
            </h2>
            <div className="w-12 h-1 bg-emerald-500 mx-auto rounded-full mt-2" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Triệt tiêu 100% thất thoát doanh thu",
                desc: "Hệ thống tự động hóa hoàn toàn việc cộng dồn tiền giờ câu, tiền sản phẩm và trừ tiền thu mua cá trực tiếp trên bill in nhiệt Bluetooth."
              },
              {
                title: "Kiểm soát nhân viên dễ dàng hơn",
                desc: "Mọi thao tác tạo vé, gia hạn giờ, hủy vé đều được lưu vết chi tiết. Phân quyền chặt chẽ giữa Admin chủ hồ, thu ngân và nhân viên trực chòi."
              },
              {
                title: "Tạo và kiểm tra vé câu nhanh gấp 5 lần",
                desc: "Nhập thông tin, tích chọn ca câu mẫu (5h/10h) hoặc nhập giờ lẻ và in bill chỉ trong 3 giây. Trực quan hóa toàn bộ ô câu trên một màn hình."
              },
              {
                title: "Theo dõi tình hình hồ câu từ xa",
                desc: "Chủ hồ tự do đi du lịch hay làm việc khác mà vẫn kiểm soát được chính xác doanh số phát sinh, số lượng khách đang câu realtime qua điện thoại."
              },
              {
                title: "Báo cáo doanh thu & cá thả realtime",
                desc: "Tự động thống kê doanh số bán sản phẩm, tiền giờ câu, tổng trọng lượng cá thu mua lại và số lượng cá đã thả xuống hồ trong ngày."
              },
              {
                title: "Loại bỏ hoàn toàn các sai sót thủ công",
                desc: "Hệ thống tự động phát âm thanh cảnh báo SOS nhấp nháy đỏ trên màn hình khi cần thủ sắp hết giờ câu, tự động chốt hóa đơn chính xác."
              }
            ].map((benefit, idx) => (
              <div key={idx} className="bg-white border border-slate-200/60 rounded-2xl p-6 sm:p-8 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mb-6">
                  <CheckCircle size={20} className="stroke-[2.5]" />
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-800 mb-2 uppercase tracking-tight" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>
                  {benefit.title}
                </h3>
                <p className="text-slate-500 text-xs sm:text-sm font-semibold leading-relaxed" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {benefit.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ================= SECTION — FEATURES ================= */}
      <section id="tinh-nang" className="py-20 sm:py-24 bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <p className="text-emerald-600 font-extrabold uppercase tracking-widest text-xs sm:text-sm">
              PHÁT TRIỂN CHUYÊN BIỆT CHO NGÀNH HỒ CÂU VIỆT NAM
            </p>
            <h2 className="text-2xl sm:text-3.5xl font-black text-slate-900 uppercase tracking-tight animate-fade-in" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>
              Hệ tính năng chuyên sâu — May đo cho hồ câu
            </h2>
            <div className="w-12 h-1 bg-emerald-500 mx-auto rounded-full mt-2" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              {
                title: "Quản lý vé câu tiện lợi",
                desc: "Tạo nhanh vé mới, tự động đếm ngược giờ câu realtime. Hỗ trợ tạo ca câu 5h, 10h hoặc nhập giờ lẻ tùy chỉnh linh hoạt.",
                icon: Layers,
                color: "bg-emerald-50 text-emerald-600 border-emerald-100"
              },
              {
                title: "Báo cáo doanh thu realtime",
                desc: "Cập nhật tức thì doanh số, tiền thực thu, sản phẩm bán chạy, sản lượng cá thu hồi theo ngày, tuần, tháng rõ ràng.",
                icon: TrendingUp,
                color: "bg-blue-50 text-blue-600 border-blue-100"
              },
              {
                title: "Lưu lịch sử khách hàng",
                desc: "Quản lý dữ liệu cần thủ: số điện thoại, lịch sử ca câu, tổng số tiền đã chi tiêu để phục vụ chăm sóc và tạo thẻ VIP.",
                icon: Users,
                color: "bg-purple-50 text-purple-600 border-purple-100"
              },
              {
                title: "Phân quyền nhân viên chặt chẽ",
                desc: "Tạo tài khoản và phân quyền độc lập cho Admin (chủ hồ), Nhân viên trực chòi và Thu ngân nhằm bảo mật dữ liệu tuyệt đối.",
                icon: ShieldCheck,
                color: "bg-amber-50 text-amber-600 border-amber-100"
              },
              {
                title: "Kho sản phẩm & dịch vụ",
                desc: "Thêm nhanh các mặt hàng nước uống, mồi câu đặc chủng, đồ ăn... trực tiếp ngay từ bước Check-in mở ca câu ban đầu.",
                icon: Package,
                color: "bg-rose-50 text-rose-600 border-rose-100"
              },
              {
                title: "Quản lý cá thả xuống hồ",
                desc: "Ghi nhật ký chi tiết các đợt thả cá mới xuống hồ, biểu giá thu mua lại cá câu được từ cần thủ cực kỳ trực quan.",
                icon: Fish,
                color: "bg-teal-50 text-teal-600 border-teal-100"
              },
              {
                title: "Cảnh báo SOS thông minh",
                desc: "Tự động kích hoạt thông báo chuông nhấp nháy đỏ trên màn hình khi ca câu còn dưới 15 phút, nhắc nhở thu chòi câu kịp thời.",
                icon: Bell,
                color: "bg-red-50 text-red-600 border-red-100"
              },
              {
                title: "Truy cập trên đa thiết bị",
                desc: "Hệ thống thiết kế theo chuẩn Web App mượt mà, sử dụng trơn tru trên cả điện thoại di động và máy tính không cần cài đặt.",
                icon: Monitor,
                color: "bg-cyan-50 text-cyan-600 border-cyan-100"
              }
            ].map((feat, idx) => (
              <div key={idx} className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-7 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between h-full">
                <div className="space-y-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-sm ${feat.color} group-hover:scale-105 transition-transform`}>
                    <feat.icon size={22} className="stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-800 mb-1.5 uppercase tracking-tight" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>
                      {feat.title}
                    </h3>
                    <p className="text-slate-500 text-xs sm:text-sm font-semibold leading-relaxed" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      {feat.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ================= SECTION — TRUST / SOCIAL PROOF ================= */}
      <section id="giai-phap" className="py-20 sm:py-24 bg-slate-900 text-white relative overflow-hidden">
        
        {/* Decorative elements */}
        <div className="absolute top-1/4 left-0 w-[300px] h-[300px] rounded-full bg-emerald-500/5 blur-[100px] pointer-events-none -z-10" />
        <div className="absolute bottom-1/4 right-0 w-[300px] h-[300px] rounded-full bg-blue-500/5 blur-[100px] pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <p className="text-emerald-400 font-extrabold uppercase tracking-widest text-xs sm:text-sm">
              XÂY DỰNG DÀNH RIÊNG CHO NGÀNH HỒ CÂU
            </p>
            <h2 className="text-2xl sm:text-3.5xl font-black uppercase tracking-tight" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>
              Đồng hành cùng sự phát triển của các chủ hồ
            </h2>
            <div className="w-12 h-1 bg-emerald-500 mx-auto rounded-full mt-2" />
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center mb-20" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>
            <div className="space-y-2">
              <h3 className="text-3xl sm:text-5xl font-black text-emerald-400">139+</h3>
              <p className="text-[10px] sm:text-xs font-bold text-slate-450 uppercase tracking-widest">Tài khoản chủ hồ câu & nhân viên</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl sm:text-5xl font-black text-emerald-400">24/7</h3>
              <p className="text-[10px] sm:text-xs font-bold text-slate-450 uppercase tracking-widest">Giám sát hoạt động Realtime</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl sm:text-5xl font-black text-emerald-400">100%</h3>
              <p className="text-[10px] sm:text-xs font-bold text-slate-450 uppercase tracking-widest">Bảo mật dữ liệu tuyệt đối</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl sm:text-5xl font-black text-emerald-400">2 Giây</h3>
              <p className="text-[10px] sm:text-xs font-bold text-slate-450 uppercase tracking-widest">In bill nhiệt Bluetooth mượt mà</p>
            </div>
          </div>

          <div className="w-full h-[1px] bg-slate-800 mb-16" />

          {/* Testimonial cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Anh Hoàng",
                role: "Chủ Hồ Câu Đại Nga (HCM)",
                content: "Từ khi dùng phần mềm, tôi không còn phải lo nhân viên gian lận hay nhầm lẫn giờ của khách nữa. Khách cần thủ câu ca 5h hay 10h hết giờ là hệ thống nhấp nháy chuông đỏ SOS báo ngay. In bill nhiệt Bluetooth PT-210 qua điện thoại cực nhanh, rất chuyên nghiệp!"
              },
              {
                name: "Chị Thanh Tâm",
                role: "Chủ Hồ Câu Giải Trí Thanh Tâm (Đồng Nai)",
                content: "Tôi thích nhất tính năng theo dõi doanh thu từ xa qua điện thoại. Đi chợ hay đi công việc vẫn nắm rõ hồ đang có bao nhiêu khách câu, doanh thu sản phẩm dịch vụ thực tế thế nào. Phần mềm cực dễ dùng, nhân viên chòi lớn tuổi vẫn thao tác mượt mà."
              },
              {
                name: "Anh Bình An",
                role: "Chủ Hồ Câu Bình An (Bình Dương)",
                content: "Quy trình thêm sản phẩm nhanh ở bước Check-in cực hay. Cần thủ vào gọi nước, gọi mồi câu chép là lên đơn in bill luôn. Phần mềm tính tiền chuẩn xác, trừ tiền cá cần thủ câu được tự động theo biểu giá nên khách rất tin tưởng."
              }
            ].map((test, idx) => (
              <div key={idx} className="bg-slate-950/40 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4">
                <div className="flex gap-0.5 text-amber-400">
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} className="fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed italic">
                  "{test.content}"
                </p>
                <div>
                  <h4 className="text-sm font-extrabold text-white" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>
                    {test.name}
                  </h4>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    {test.role}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ================= SECTION — SUPPORT TEAM ================= */}
      <section id="doi-ngu" className="py-20 sm:py-24 bg-[#0c111e] relative overflow-hidden border-b border-slate-950 scroll-mt-20">
        {/* Glowing background decorations */}
        <div className="absolute top-1/4 left-0 w-[400px] h-[400px] rounded-full bg-emerald-500/[0.03] blur-[120px] pointer-events-none -z-10" />
        <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] rounded-full bg-blue-500/[0.03] blur-[120px] pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Team Block (Left Column) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-3">
                <span className="text-emerald-500 font-extrabold uppercase tracking-widest text-xs sm:text-sm block" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>
                  Đội ngũ đồng hành
                </span>
                <h2 className="text-3xl sm:text-[40px] font-black text-white uppercase tracking-tight leading-none" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>
                  QuanLiHoCau<span className="text-emerald-500">™</span>
                </h2>
              </div>

              {/* Core Statement Quote */}
              <div className="relative pl-6 sm:pl-8 py-2">
                <span className="absolute left-0 top-0 text-emerald-500/30 text-6xl font-serif leading-none select-none">“</span>
                <p className="text-lg sm:text-xl font-bold text-slate-100 leading-relaxed italic" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>
                  Chúng tôi xây dựng giải pháp công nghệ xuất phát từ sự thấu hiểu sâu sắc <span className="text-emerald-400 font-extrabold">vấn đề thực tế</span> của chủ hồ.
                </p>
              </div>

              <div className="w-full h-[1px] bg-emerald-500/20" />

              {/* Team Meta Details */}
              <div className="space-y-2">
                <h4 className="text-2xl font-black text-white tracking-wide uppercase font-display" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>
                  Đội ngũ Quản Lý Hồ Câu
                </h4>
                <span className="inline-block bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-md border border-emerald-500/30">
                  Hệ sinh thái quản lý hồ câu chuyên nghiệp
                </span>
              </div>

              {/* Team Body Paragraphs */}
              <div className="space-y-4 text-slate-300 text-xs sm:text-sm leading-relaxed font-semibold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <p>
                  QuanLiHoCau được phát triển và vận hành bởi tập thể các kỹ sư phần mềm tâm huyết cùng các chuyên gia có kinh nghiệm trực tiếp quản lý các tổ hợp câu cá giải trí, hồ câu dịch vụ lớn tại Việt Nam.
                </p>
                <p>
                  Với mục tiêu tối ưu hóa vận hành và triệt tiêu hoàn toàn thất thoát doanh thu, chúng tôi liên tục cải tiến hệ thống để mang lại trải nghiệm mượt mà nhất cho cả chủ hồ, nhân viên và cần thủ.
                </p>
              </div>

              {/* 4 Core Value Pillars Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
                {[
                  { icon: Target, label: "Hiểu rõ ngành hồ câu" },
                  { icon: Monitor, label: "Giải pháp thực tế" },
                  { icon: Lock, label: "Uy tín bảo mật" },
                  { icon: Handshake, label: "Đồng hành lâu dài" }
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center text-center space-y-2 p-2 bg-slate-900/30 border border-slate-800/40 rounded-xl backdrop-blur-sm">
                    <div className="w-10 h-10 rounded-full border border-emerald-500/20 flex items-center justify-center text-emerald-400 bg-emerald-950/20">
                      <item.icon size={18} className="stroke-[2.5]" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider leading-snug">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Elegant Signature */}
              <div className="pt-4 flex flex-col items-start select-none">
                <span className="text-emerald-400 text-3xl font-signature leading-none" style={{ fontFamily: "'Caveat', cursive" }}>
                  Đội ngũ QuanLiHoCau.com
                </span>
                <span className="text-slate-500 text-[9px] font-extrabold uppercase tracking-widest mt-1">
                  ĐỒNG HÀNH CÙNG SỰ PHÁT TRIỂN BỀN VỮNG
                </span>
              </div>
            </div>

            {/* Team Image Block (Right Column) */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
              <div className="relative group w-full max-w-[380px]">
                
                {/* Decorative border frame */}
                <div className="absolute -inset-4 bg-emerald-500/5 rounded-3xl blur-2xl group-hover:opacity-100 opacity-70 transition duration-500" />
                
                {/* The main picture container */}
                <div className="relative bg-slate-900 border border-slate-800 rounded-3xl p-3 shadow-2xl overflow-hidden">
                  <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden relative bg-slate-950">
                    <img 
                      src="/fishing_bg.png" 
                      alt="Hệ thống Quản lý Hồ câu Cá Chuyên nghiệp" 
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                </div>

                {/* Overlapping Premium Quote Box */}
                <div className="mt-6 w-full bg-emerald-950/50 border border-emerald-500/20 rounded-2xl p-5 backdrop-blur-md relative overflow-hidden shadow-xl">
                  {/* Subtle design ornament inside quote box */}
                  <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/[0.02] rounded-bl-full pointer-events-none" />
                  
                  <span className="text-emerald-400 text-4xl font-serif leading-none block mb-0.5">“</span>
                  <p className="text-xs sm:text-sm font-semibold leading-relaxed text-slate-100 italic" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Cam kết đồng hành cùng các chủ hồ câu trên cả nước, cung cấp giải pháp vận hành tối ưu và hỗ trợ kỹ thuật chuyên nghiệp 24/7.
                  </p>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ================= SECTION — FAQ (GEO & LLMO OPTIMIZATION) ================= */}
      <section id="faq" className="py-20 sm:py-24 bg-white relative overflow-hidden scroll-mt-20 border-b border-slate-100">
        <div className="absolute top-1/4 left-0 w-[300px] h-[300px] rounded-full bg-emerald-500/5 blur-[80px] pointer-events-none -z-10" />
        <div className="absolute bottom-1/4 right-0 w-[300px] h-[300px] rounded-full bg-blue-500/5 blur-[80px] pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <p className="text-emerald-600 font-extrabold uppercase tracking-widest text-xs sm:text-sm">
              GIẢI ĐÁP THẮC MẮC • TỐI ƯU HÓA HOẠT ĐỘNG
            </p>
            <h2 className="text-2xl sm:text-3.5xl font-black text-slate-900 uppercase tracking-tight font-display" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>
              Câu hỏi thường gặp về phần mềm hồ câu
            </h2>
            <div className="w-12 h-1 bg-emerald-500 mx-auto rounded-full mt-2" />
          </div>

          <div className="space-y-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {[
              {
                q: "Phần mềm quản lý hồ câu cá QuanLiHoCau™ là gì?",
                a: "QuanLiHoCau™ là giải pháp phần mềm quản lý hồ câu cá giải trí dịch vụ chuyên nghiệp hàng đầu tại Việt Nam. Phần mềm giúp các chủ hồ câu cá số hóa toàn diện quy trình vận hành: quản lý ca câu thời gian thực (realtime), tự động chốt tiền giờ, quản lý bán hàng (đồ ăn, nước uống, mồi câu), thu mua cá trực tiếp, in bill nhiệt Bluetooth không dây cầm tay và kiểm soát doanh thu chi tiết từ xa qua điện thoại di động."
              },
              {
                q: "Phần mềm hỗ trợ quản lý ca câu đếm ngược và cảnh báo bằng cách nào?",
                a: "Hệ thống tích hợp tính năng đếm ngược thời gian thực (realtime countdown) cực kỳ trực quan cho từng ô câu/chòi câu. Khi ca câu sắp hết giờ (dưới 15 phút), hệ thống sẽ tự động nhấp nháy đỏ báo động SOS và phát âm thanh cảnh báo thông minh thông qua Web Audio API tổng hợp nhạc chuông trực tiếp offline. Tính năng này giúp nhân viên kịp thời báo giỏ, gia hạn giờ hoặc chốt thu mua cá của cần thủ mà không sợ quên hay nhầm lẫn."
              },
              {
                q: "Tôi có cần mua thêm thiết bị đắt tiền để sử dụng máy in hóa đơn không?",
                a: "Hoàn toàn không. QuanLiHoCau™ hỗ trợ kết nối trực tiếp với các dòng máy in bill nhiệt cầm tay Bluetooth 58mm giá rẻ (như PT-210) ngay trên trình duyệt điện thoại hoặc máy tính. Bạn có thể in hóa đơn nhiệt cho khách chỉ trong 3 giây thông qua kết nối Bluetooth không dây siêu mượt mà không cần dây cáp rườm rà hay máy vi tính cồng kềnh."
              },
              {
                q: "Làm thế nào để phần mềm chống thất thoát doanh số dịch vụ và nhân viên?",
                a: "Phần mềm cung cấp tính năng phân quyền chặt chẽ giữa Chủ hồ (Admin), Thu ngân và Nhân viên trực chòi. Mọi hành động như mở ca câu, gia hạn giờ, hủy vé hay bán đồ ăn thức uống đều được lưu lại vết chi tiết (Activity Log). Nhân viên có thể thêm nhanh các sản phẩm nước ngọt, mồi câu ngay khi mở ca check-in, đối soát tồn kho tự động, triệt tiêu 100% việc nhân viên tự ý thu tiền riêng của khách hàng."
              },
              {
                q: "Chủ hồ câu có thể theo dõi hoạt động và báo cáo doanh thu từ xa không?",
                a: "Có, QuanLiHoCau™ được xây dựng trên nền tảng Web App (SaaS) hiện đại, hoạt động mượt mà trên mọi thiết bị di động (iPhone, Android, máy tính bảng) và PC. Bạn có thể tự do rời hồ câu để đi du lịch hoặc làm công việc khác mà vẫn nắm rõ chính xác số lượng cần thủ đang câu, biểu đồ doanh thu realtime, nhật ký thả cá và lượng cá thu mua lại mọi lúc mọi nơi."
              },
              {
                q: "Hồ câu dịch vụ của tôi có được hỗ trợ cài đặt và setup ban đầu không?",
                a: "Chúng tôi cam kết đồng hành và hỗ trợ setup trọn gói ban đầu hoàn toàn miễn phí. Đội ngũ kỹ thuật QuanLiHoCau sẽ trực tiếp tư vấn cấu hình ô câu, chòi câu, biểu giá dịch vụ câu cá (ca 5h, 10h, giờ lẻ), danh mục mồi câu, nước uống và hướng dẫn nhân viên vận hành chi tiết tận nơi hoặc qua video gọi trực tiếp."
              }
            ].map((item, idx) => (
              <div key={idx} className="border border-slate-200/80 rounded-2xl p-5 hover:border-emerald-500/30 transition-all duration-300 bg-slate-50/50 hover:bg-white hover:shadow-md group">
                <details className="group [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex items-center justify-between cursor-pointer focus:outline-none select-none">
                    <h3 className="text-sm sm:text-base font-black text-slate-800 tracking-tight pr-4 uppercase leading-snug group-hover:text-emerald-700 transition-colors" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>
                      {item.q}
                    </h3>
                    <span className="shrink-0 ml-1.5 p-1.5 bg-slate-100 group-hover:bg-emerald-50 text-slate-500 group-hover:text-emerald-600 rounded-full transition-colors">
                      <svg
                        className="w-4 h-4 transition duration-300 group-open:-rotate-180"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </summary>
                  <p className="mt-4 text-slate-500 text-xs sm:text-sm font-semibold leading-relaxed border-t border-slate-100 pt-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {item.a}
                  </p>
                </details>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ================= SECTION — FINAL CTA ================= */}
      <section className="py-20 sm:py-24 bg-gradient-to-br from-slate-900 to-[#020a17] text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 rounded-bl-full bg-emerald-500/5 pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-8 relative z-10">
          
          <div className="space-y-4">
            <span className="text-emerald-400 font-extrabold uppercase tracking-widest text-xs sm:text-sm block">
              BẮT ĐẦU CHUYỂN ĐỔI SỐ HỒ CÂU CỦA BẠN NGAY HÔM NAY
            </span>
            <h2 className="text-3xl sm:text-4.5xl font-black uppercase tracking-tight leading-none" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>
              Sẵn sàng quản lý hồ câu chuyên nghiệp hơn?
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm font-semibold max-w-xl mx-auto leading-relaxed" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Bắt đầu trải nghiệm hệ thống giúp bạn kiểm soát doanh thu chặt chẽ, chấm dứt thất thoát nước/mồi câu và tự động hóa vận hành dễ dàng hơn bao giờ hết.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link 
              href="/login" 
              className="inline-flex h-14 w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold uppercase tracking-wider text-xs sm:text-sm rounded-xl px-8 items-center justify-center gap-2.5 transition-all hover:scale-[1.01] active:scale-[0.98] shadow-lg shadow-emerald-600/10 cursor-pointer"
              style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
            >
              BẮT ĐẦU MIỄN PHÍ NGAY
              <Zap size={14} className="fill-white" />
            </Link>
            
            <a 
              href="https://zalo.me/0855550813"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-14 w-full sm:w-auto border border-slate-800 hover:border-slate-700 bg-white/5 hover:bg-white/10 text-white font-bold uppercase tracking-wider text-xs sm:text-sm rounded-xl px-8 items-center justify-center gap-2 transition-all cursor-pointer"
              style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
            >
              <MessageSquare size={13} /> LIÊN HỆ TRỰC TIẾP QUA ZALO
            </a>
          </div>

          {/* Trust lines */}
          <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            <span>✓ HỖ TRỢ SETUP TRỌN GÓI</span>
            <span>✓ KHÔNG RỦI RO</span>
            <span>✓ ĐỒNG HÀNH TRỌN ĐỜI</span>
          </div>

        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-slate-200 bg-white py-12 text-slate-800" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <div className="flex items-center gap-2 text-slate-800 select-none">
              <div className="w-6 h-6 rounded-lg bg-emerald-500 flex items-center justify-center text-white">
                <Fish size={14} />
              </div>
              <span className="text-sm font-extrabold tracking-tight">QuanLiHoCau™</span>
            </div>
            <span className="hidden sm:inline text-slate-300">|</span>
            <span className="text-slate-600 font-extrabold">Đội ngũ kỹ thuật QuanLiHoCau™</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <a href="#" className="hover:text-slate-900 transition-colors">Điều khoản</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Bảo mật</a>
            <a 
              href="https://zalo.me/0855550813" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-emerald-700 text-emerald-600 flex items-center gap-2 normal-case font-extrabold border border-emerald-100 bg-emerald-50 rounded-xl px-4 py-1.5 transition-all shadow-sm"
              id="footer_zalo_btn"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span>Zalo hỗ trợ: 0855550813</span>
            </a>
          </div>

        </div>
        
        <div suppressHydrationWarning className="max-w-7xl mx-auto px-6 text-center text-[10px] text-slate-400 mt-8 font-semibold uppercase tracking-widest">
          © {new Date().getFullYear()} QuanLiHoCau. Phát triển bởi Đội ngũ QuanLiHoCau với tất cả tâm huyết.
        </div>
      </footer>

      {/* ================= FLOATING CONTACT WIDGETS ================= */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        
        {/* Hotline Quick Call Bubble */}
        <a 
          href="tel:0855550813"
          className="w-12 h-12 bg-gradient-to-tr from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-all group relative cursor-pointer"
          title="Gọi Hotline Tư Vấn"
        >
          <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-20 pointer-events-none" />
          <PhoneCall size={18} className="animate-pulse" />
          
          <span className="absolute right-14 top-1/2 -translate-y-1/2 bg-slate-950 text-white font-extrabold text-[9px] tracking-wider uppercase px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            Hotline: 0855 550 813
          </span>
        </a>

        {/* Zalo Direct Chat Bubble */}
        <a 
          href="https://zalo.me/0855550813"
          target="_blank"
          rel="noopener noreferrer"
          className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-all group relative cursor-pointer"
          title="Chat Zalo Hỗ Trợ"
        >
          <div className="absolute inset-0 rounded-full bg-blue-600 animate-ping opacity-20 pointer-events-none" />
          <MessageSquare size={18} />
          
          <span className="absolute right-14 top-1/2 -translate-y-1/2 bg-slate-950 text-white font-extrabold text-[9px] tracking-wider uppercase px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            Zalo Đăng Ký
          </span>
        </a>

      </div>

    </div>
  );
}
