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
  Check
} from "lucide-react";

export default async function RootPage() {
  const session = await auth();

  // Tự động chuyển hướng nếu người dùng đã đăng nhập
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans overflow-x-hidden selection:bg-primary/30 selection:text-white relative">
      
      {/* ================= BACKGROUND GLOWS (NEBULA AESTHETIC) ================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Soft cyan light top-left */}
        <div className="absolute top-[-10%] left-[-15%] w-[800px] h-[800px] rounded-full bg-cyan-500/10 blur-[160px] animate-pulse" />
        {/* Deep electric blue glow in the center */}
        <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-primary/10 blur-[140px]" />
        {/* Rich violet glow near the bottom */}
        <div className="absolute bottom-[10%] left-[-10%] w-[700px] h-[700px] rounded-full bg-violet-600/5 blur-[160px]" />
        {/* Tech grid layout background overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b08_1px,transparent_1px),linear-gradient(to_bottom,#1e293b08_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      {/* ================= HEADER / GLASSMARPHIC NAVIGATION ================= */}
      <header className="z-50 border-b border-white/5 bg-[#020617]/40 backdrop-blur-2xl sticky top-0 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-tr from-primary to-blue-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/25 hover:rotate-6 transition-all duration-300">
              <Fish size={24} className="drop-shadow-md" />
            </div>
            <div className="flex flex-col items-start leading-tight">
              <span className="font-extrabold text-xl tracking-tighter uppercase text-white bg-clip-text bg-gradient-to-r from-white via-white to-slate-400">
                QUẢN LÝ HỒ CÂU
              </span>
              <span className="text-[9px] font-black text-primary uppercase tracking-widest mt-0.5 bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                By Tech Founder HuanTran
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Zalo Premium Header pill */}
            <a 
              href="https://zalo.me/0855550813" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hidden md:flex h-11 border border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary text-xs font-black uppercase tracking-wider rounded-2xl px-5 items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-md shadow-primary/5 group"
            >
              <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
              <span>Zalo: 0855550813</span>
            </a>
            
            <Link 
              href="/login" 
              className="text-sm font-bold text-slate-300 hover:text-white transition-all px-4 py-2 hover:scale-105"
            >
              Đăng nhập
            </Link>
            <Link 
              href="/login" 
              className="h-11 bg-gradient-to-r from-primary to-blue-600 text-white text-xs font-black uppercase tracking-wider rounded-xl px-6 flex items-center justify-center hover:from-primary hover:to-blue-700 transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0"
            >
              Dùng thử miễn phí
            </Link>
          </div>
        </div>
      </header>

      {/* ================= HERO SECTION (FIRST FOLD) ================= */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-28 text-center">
        
        {/* Shimmering Tech Pill */}
        <div className="inline-flex items-center gap-2 bg-white/[0.02] border border-white/10 rounded-full px-5 py-2.5 mb-8 hover:bg-white/[0.04] hover:border-primary/35 transition-all shadow-lg shadow-primary/5 group">
          <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-cyan-400 to-primary animate-pulse" />
          <span className="text-xs font-black uppercase tracking-widest text-slate-300 group-hover:text-white transition-colors">
            TIÊN PHONG CÔNG NGHỆ – LẦN ĐẦU TIÊN XUẤT HIỆN
          </span>
        </div>

        {/* Cinematic Title */}
        <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter max-w-6xl mx-auto leading-[0.95] text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-slate-400 drop-shadow-sm">
          Mang công nghệ hiện đại nhất <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-primary to-indigo-500 drop-shadow-md">
            vào ngành Hồ câu Việt Nam
          </span>
        </h1>

        {/* Pitch Statement */}
        <p className="mt-10 text-lg sm:text-2xl text-slate-300 max-w-4xl mx-auto font-medium leading-relaxed">
          Chúng tôi tự hào là người đi đầu (tiên phong) số hóa hoạt động kinh doanh hồ câu. 
          Không còn cảnh ghi chép sổ sách thủ công dễ nhầm lẫn. Ứng dụng này giúp các chủ hồ và nhân viên quản lý mọi hoạt động cực kỳ dễ dàng, chính xác tuyệt đối, chuẩn theo quy trình từ hồ nhỏ lẻ cho đến chuỗi nhiều hồ câu (chuỗi hệ sinh thái).
        </p>

        {/* CTA Buttons */}
        <div className="mt-14 flex flex-col items-center justify-center gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
            <Link 
              href="/login" 
              className="w-full sm:w-auto h-16 bg-gradient-to-r from-primary via-blue-600 to-indigo-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl px-12 flex items-center justify-center gap-3 hover:opacity-95 transition-all shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1 active:translate-y-0"
            >
              Đăng ký dùng thử miễn phí ngay <ArrowRight size={18} />
            </Link>
            <a 
              href="#chuc-nang" 
              className="w-full sm:w-auto h-16 bg-white/[0.03] border border-white/10 hover:bg-white/10 text-slate-200 hover:text-white text-xs font-black uppercase tracking-widest rounded-2xl px-8 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              Xem các chức năng vượt trội
            </a>
          </div>

          {/* Zero Install Badge */}
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 text-slate-400 text-xs font-black bg-white/[0.02] border border-white/5 backdrop-blur-md rounded-[2rem] px-8 py-4 mt-4 shadow-xl shadow-black/10">
            <div className="flex items-center gap-2.5 text-primary">
              <Zap size={16} />
              <span>KHÔNG CẦN CÀI ĐẶT</span>
            </div>
            <div className="hidden md:block w-px h-5 bg-white/10" />
            <div className="flex items-center gap-3 text-cyan-400">
              <Monitor size={16} />
              <Phone size={16} />
              <span>SỬ DỤNG TRỰC TIẾP TRÊN TRÌNH DUYỆT (PC & ĐIỆN THOẠI)</span>
            </div>
          </div>
        </div>

        {/* ================= HIGH-FIDELITY APP INTERACTION PREVIEW ================= */}
        <div className="mt-24 relative max-w-5xl mx-auto rounded-[2.5rem] border border-white/10 bg-white/[0.01] p-3.5 shadow-[0_0_50px_rgba(59,130,246,0.1)] backdrop-blur-sm group">
          <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-tr from-primary/15 via-transparent to-cyan-500/10 pointer-events-none" />
          
          {/* Glowing tech lines */}
          <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80" />
          <div className="absolute bottom-0 left-1/3 right-1/3 h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-80" />

          <div className="rounded-[2rem] overflow-hidden border border-white/5 bg-[#050a17] shadow-inner p-6 sm:p-8 flex flex-col lg:flex-row gap-8 relative text-left">
            
            {/* Mockup Dashboard Pane */}
            <div className="flex-1 space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-red-500/60" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <span className="w-3 h-3 rounded-full bg-green-500/60" />
                  <span className="text-[10px] font-black text-slate-500 tracking-widest uppercase ml-3">App Preview Live</span>
                </div>
                <div className="text-[10px] font-black text-emerald-450 uppercase bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1.5 shadow-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Đang hoạt động
                </div>
              </div>

              {/* Fake dashboard cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/20 text-primary rounded-xl flex items-center justify-center shadow-md">
                    <Activity size={20} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Đang câu</p>
                    <p className="text-xl font-black text-white">12 Cần thủ</p>
                  </div>
                </div>
                
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex items-center gap-4">
                  <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center shadow-md">
                    <Coins size={20} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Doanh thu ngày</p>
                    <p className="text-xl font-black text-white">4,850,000d</p>
                  </div>
                </div>
              </div>

              {/* Fake Realtime Active slots */}
              <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-5 space-y-4">
                <p className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                  <Clock size={14} className="text-primary" /> Ca câu đang diễn ra (Realtime)
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 p-3 rounded-xl hover:border-primary/30 transition-all">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase">Choi so 3 - Anh Khanh</h4>
                      <p className="text-[9px] font-black text-slate-500 uppercase mt-0.5">Ca 5 gio • Đa bat dau: 07:30</p>
                    </div>
                    <span className="text-xs font-black bg-primary/20 text-primary px-3 py-1 rounded-lg">Ca con: 2h 15m</span>
                  </div>
                  <div className="flex items-center justify-between bg-red-500/5 border border-red-500/20 p-3 rounded-xl animate-pulse">
                    <div>
                      <h4 className="text-xs font-bold text-red-400 uppercase">Choi VIP 1 - Anh Minh</h4>
                      <p className="text-[9px] font-black text-red-500/70 uppercase mt-0.5">Ca 10 gio • Đa bat dau: 05:00</p>
                    </div>
                    <span className="text-xs font-black bg-red-500/20 text-red-400 px-3 py-1 rounded-lg">Sap het gio! (12m)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mockup PT-210 Thermal Print Preview Pane */}
            <div className="w-full lg:w-[320px] bg-slate-900/50 border border-white/10 rounded-2xl p-6 relative flex flex-col justify-between overflow-hidden shadow-2xl">
              <div className="absolute top-[-10%] right-[-10%] w-[150px] h-[150px] bg-emerald-500/10 blur-[40px] rounded-full pointer-events-none" />
              
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4 flex items-center gap-2 border-b border-white/5 pb-2">
                  <Printer size={15} className="text-emerald-400" /> Bảng hóa đơn PT-210
                </p>

                {/* Simulated thermal bill */}
                <div className="bg-white text-black p-4 rounded-xl font-mono text-[9px] shadow-lg leading-tight space-y-2 uppercase">
                  <div className="text-center space-y-1">
                    <h5 className="font-extrabold text-[11px] tracking-tighter">QUAN LY HO CAU</h5>
                    <p className="text-[7px]">Dich vu Giai tri & Thu gian</p>
                    <p className="text-[7px]">Hotline/Zalo: 0855550813</p>
                    <p className="text-[8px]">--------------------------------</p>
                  </div>
                  <div>
                    <p>Hoa don:  HC987AB</p>
                    <p>O/Choi:   Choi so 3</p>
                    <p>Khach:    Anh Khanh (VIP)</p>
                    <p>Ngay in:  24/05/2026 15:45</p>
                    <p>--------------------------------</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Goi gio cau (5h)</span>
                      <span>300,000d</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Nuoc ngot (x2)</span>
                      <span>30,000d</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Moi cau sieu cap</span>
                      <span>150,000d</span>
                    </div>
                    <div className="flex justify-between text-red-650 font-bold">
                      <span>Khau tru ca (4.5kg)</span>
                      <span>-90,000d</span>
                    </div>
                    <p>--------------------------------</p>
                  </div>
                  <div className="text-right space-y-0.5">
                    <p>Tam tinh:  480,000d</p>
                    <p className="font-bold text-[10px] text-right">TONG: 390,000d</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-white/5 pt-4 text-center">
                <span className="text-[9px] font-black text-slate-450 uppercase tracking-widest">
                  Chuẩn hóa 58mm di động 32 ký tự
                </span>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* ================= CORE FEATURES GRID ================= */}
      <section id="chuc-nang" className="relative z-10 max-w-7xl mx-auto px-6 py-28 border-t border-white/5">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-primary font-black uppercase tracking-widest text-[10px] bg-primary/10 rounded-full px-4 py-1.5 border border-primary/20">
            TÍNH NĂNG VƯỢT TRỘI KHÁC
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight mt-6 uppercase text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-slate-400">
            Vận hành hoàn hảo mọi quy trình
          </h2>
          <p className="text-slate-450 mt-4 text-sm sm:text-base leading-relaxed font-medium">
            Thiết kế bài bản, hiện đại, loại bỏ hoàn toàn mệt mỏi từ cách tính toán thủ công truyền thống.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card A-Z Process */}
          <div className="group bg-white/[0.01] border border-white/5 rounded-3xl p-8 hover:bg-white/[0.03] hover:border-primary/25 transition-all shadow-lg hover:shadow-primary/5 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="space-y-5">
              <div className="w-14 h-14 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white transition-all shadow-md">
                <Layers size={24} />
              </div>
              <h3 className="text-xl font-bold text-white uppercase tracking-tight">Quy trình từ A đến Z</h3>
              <p className="text-slate-350 text-sm leading-relaxed font-medium">
                Bám sát quy trình từ A đến Z: Từ lúc khách vào mua vé, thuê cần, mua mồi, gọi nước uống, cho đến lúc tính tiền bù giờ, cân cá thưởng – tất cả chỉ cần chạm nhẹ trên màn hình điện thoại.
              </p>
            </div>
            <div className="mt-8 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-blue-400 opacity-80 group-hover:opacity-100 group-hover:translate-x-1.5 transition-all">
              Bắt đầu ngay <ChevronRight size={14} />
            </div>
          </div>

          {/* Card Any Scale */}
          <div className="group bg-white/[0.01] border border-white/5 rounded-3xl p-8 hover:bg-white/[0.03] hover:border-primary/25 transition-all shadow-lg hover:shadow-primary/5 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="space-y-5">
              <div className="w-14 h-14 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center border border-indigo-500/20 group-hover:bg-primary group-hover:text-white transition-all shadow-md">
                <TrendingUp size={24} />
              </div>
              <h3 className="text-xl font-bold text-white uppercase tracking-tight">Cân mọi quy mô</h3>
              <p className="text-slate-350 text-sm leading-relaxed font-medium">
                Dù anh chỉ có 1 hồ câu gia đình nhỏ hay là ông chủ của một chuỗi hệ thống nhiều hồ câu ở các tỉnh khác nhau, phần mềm đều tự động tổng hợp báo cáo tài chính về điện thoại của anh theo từng phút (thời gian thực - real-time).
              </p>
            </div>
            <div className="mt-8 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary opacity-80 group-hover:opacity-100 group-hover:translate-x-1.5 transition-all">
              Báo cáo realtime <ChevronRight size={14} />
            </div>
          </div>

          {/* Card Offline Mode */}
          <div className="group bg-white/[0.01] border border-white/5 rounded-3xl p-8 hover:bg-white/[0.03] hover:border-primary/25 transition-all shadow-lg hover:shadow-primary/5 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="space-y-5">
              <div className="w-14 h-14 bg-emerald-500/10 text-emerald-450 rounded-2xl flex items-center justify-center border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-md">
                <WifiOff size={24} />
              </div>
              <h3 className="text-xl font-bold text-white uppercase tracking-tight">Chế độ ngoại tuyến (Offline)</h3>
              <p className="text-slate-350 text-sm leading-relaxed font-medium">
                Nếu hồ câu ở khu vực sóng yếu hoặc mất mạng Wi-Fi, app vẫn hoạt động bình thường, lưu lại mọi dữ liệu một cách an toàn và tự đồng bộ hóa (sync) lên mạng ngay khi có kết nối trở lại.
              </p>
            </div>
            <div className="mt-8 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-400 opacity-80 group-hover:opacity-100 group-hover:translate-x-1.5 transition-all">
              Tự động đồng bộ <ChevronRight size={14} />
            </div>
          </div>

        </div>
      </section>

      {/* ================= COMING SOON LAB (3 UNIQUE EXCLUSIVE FEATURES) ================= */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-28 border-t border-white/5 bg-gradient-to-b from-transparent to-[#040818]/45 overflow-hidden rounded-[3rem]">
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 blur-[120px] pointer-events-none rounded-full" />

        <div className="text-center max-w-3xl mx-auto mb-20 relative z-10">
          <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 font-black uppercase tracking-widest text-[9px] px-5 py-2 rounded-full shadow-md">
            COMING SOON – LẦN ĐẦU TIÊN CÓ TẠI VIỆT NAM
          </span>
          <h2 className="text-4xl sm:text-6xl font-black tracking-tighter mt-6 uppercase text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500">
            3 Tính năng độc quyền đột phá
          </h2>
          <p className="text-slate-450 mt-4 text-sm sm:text-base leading-relaxed font-medium">
            Chúng tôi luôn đổi mới không ngừng để dẫn đầu cuộc cách mạng công nghệ phục vụ ngành giải trí hồ câu cá.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          
          {/* Coming Card 1 - AI Camera */}
          <div className="group bg-white/[0.01] border border-white/5 rounded-3xl p-8 hover:bg-white/[0.03] transition-all shadow-md flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-amber-500/10 border border-amber-500/20 text-amber-400 font-extrabold uppercase tracking-widest text-[8px] px-2 py-0.5 rounded">
              AI Vision
            </div>
            <div className="space-y-5 pb-6">
              <div className="w-12 h-12 bg-amber-500/10 text-amber-400 rounded-2xl flex items-center justify-center border border-amber-500/20">
                <Camera size={22} />
              </div>
              <h3 className="text-lg font-bold text-white uppercase tracking-tight">AI Camera nhận diện cá khủng</h3>
              <p className="text-slate-400 text-xs leading-relaxed font-medium">
                Kết hợp camera thông minh tại hồ để nhận diện chính xác cân nặng, loại cá (ví dụ: Trắm Đen) khi khách lên cá. Tự động cộng điểm thưởng cho khách và cập nhật lượng cá còn lại dưới hồ (số lượng tồn kho sinh học) mà không cần chủ hồ có mặt.
              </p>
            </div>
            {/* Đóng dấu Sắp ra mắt nghệ thuật */}
            <div className="absolute bottom-6 right-6 border-2 border-dashed border-amber-500/30 text-amber-450 font-black uppercase text-[9px] tracking-widest px-3 py-1.5 rounded-lg -rotate-12 bg-amber-500/5 select-none animate-pulse">
              Sắp ra mắt
            </div>
          </div>

          {/* Coming Card 2 - Split Shift & Commission */}
          <div className="group bg-white/[0.01] border border-white/5 rounded-3xl p-8 hover:bg-white/[0.03] transition-all shadow-md flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-amber-500/10 border border-amber-500/20 text-amber-400 font-extrabold uppercase tracking-widest text-[8px] px-2 py-0.5 rounded">
              Anti-Fraud
            </div>
            <div className="space-y-5 pb-6">
              <div className="w-12 h-12 bg-amber-500/10 text-amber-400 rounded-2xl flex items-center justify-center border border-amber-500/20">
                <Lock size={22} />
              </div>
              <h3 className="text-lg font-bold text-white uppercase tracking-tight">Quản lý chia doanh thu ca trực</h3>
              <p className="text-slate-400 text-xs leading-relaxed font-medium">
                Hệ thống tự động theo dõi lịch trực của nhân viên, số tiền thu vào trong ca, tự tính tiền hoa hồng (tiền bồi dưỡng - commission) dựa trên số giờ làm hoặc lượng nước uống, mồi câu họ bán được. Nhân viên không thể gian lận (anti-fraud).
              </p>
            </div>
            {/* Đóng dấu Sắp ra mắt nghệ thuật */}
            <div className="absolute bottom-6 right-6 border-2 border-dashed border-amber-500/30 text-amber-450 font-black uppercase text-[9px] tracking-widest px-3 py-1.5 rounded-lg -rotate-12 bg-amber-500/5 select-none animate-pulse">
              Sắp ra mắt
            </div>
          </div>

          {/* Coming Card 3 - Online Booking Map */}
          <div className="group bg-white/[0.01] border border-white/5 rounded-3xl p-8 hover:bg-white/[0.03] transition-all shadow-md flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-amber-500/10 border border-amber-500/20 text-amber-400 font-extrabold uppercase tracking-widest text-[8px] px-2 py-0.5 rounded">
              Smart booking
            </div>
            <div className="space-y-5 pb-6">
              <div className="w-12 h-12 bg-amber-500/10 text-amber-400 rounded-2xl flex items-center justify-center border border-amber-500/20">
                <Calendar size={22} />
              </div>
              <h3 className="text-lg font-bold text-white uppercase tracking-tight">Đặt chòi & hố trước online</h3>
              <p className="text-slate-400 text-xs leading-relaxed font-medium">
                Khách câu có thể xem bản đồ hồ câu trực tuyến trên điện thoại để chọn trước chòi VIP, vị trí hố câu (điểm câu đẹp) và đặt cọc tiền trước. Hệ thống tự động khóa vị trí đó, tránh tình trạng tranh chấp chỗ ngồi giữa các cần thủ.
              </p>
            </div>
            {/* Đóng dấu Sắp ra mắt nghệ thuật */}
            <div className="absolute bottom-6 right-6 border-2 border-dashed border-amber-500/30 text-amber-450 font-black uppercase text-[9px] tracking-widest px-3 py-1.5 rounded-lg -rotate-12 bg-amber-500/5 select-none animate-pulse">
              Sắp ra mắt
            </div>
          </div>

        </div>
      </section>

      {/* ================= MARKETING CTA & VALUE OFFER SECTION ================= */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-28 text-center">
        <div className="bg-gradient-to-tr from-white/5 to-white/[0.01] border border-white/5 rounded-[3rem] p-12 sm:p-20 relative overflow-hidden shadow-2xl">
          
          {/* Internal blurred neon orbs */}
          <div className="absolute -top-[20%] -left-[20%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-[20%] -right-[20%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[100px] pointer-events-none" />
          
          <span className="text-emerald-400 font-black uppercase tracking-widest text-[10px] bg-emerald-500/10 rounded-full px-5 py-2.5 border border-emerald-500/20 shadow-md">
            DÙNG THỬ KHÔNG RỦI RO - FREE TRIAL
          </span>
          
          <h2 className="text-3xl sm:text-6xl font-black uppercase tracking-tighter mt-8 leading-none max-w-3xl mx-auto text-white">
            Bắt đầu đổi mới hồ câu <br />
            của bạn ngay hôm nay!
          </h2>
          
          <p className="text-slate-300 mt-6 text-sm sm:text-lg leading-relaxed max-w-2xl mx-auto font-medium">
            Đăng ký dùng thử miễn phí 1 tháng. <br />
            Đơn giản hóa việc quản lý – Nhân đôi doanh thu – Chăm sóc cần thủ chuyên nghiệp như Resort.
          </p>

          <div className="mt-12 relative z-20">
            <Link 
              href="/login" 
              className="inline-flex h-16 bg-primary hover:bg-primary/95 text-white font-black uppercase tracking-widest text-xs rounded-2xl px-14 items-center justify-center gap-3 transition-all hover:scale-[1.03] active:scale-[0.97] shadow-2xl shadow-primary/30 hover:shadow-primary/50"
            >
              Đăng ký ngay <ArrowRight size={18} />
            </Link>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-5">
              Miễn phí hoàn toàn kích hoạt trong 5 giây • Không cần thẻ thanh toán
            </p>
          </div>
        </div>
      </section>

      {/* ================= PREMIUM FOOTER ================= */}
      <footer className="relative z-10 border-t border-white/5 bg-[#01040a] py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center justify-between gap-6 text-slate-500 text-[10px] sm:text-xs font-bold uppercase tracking-widest">
          <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
            <div className="flex items-center gap-2">
              <Fish size={16} className="text-primary animate-pulse" />
              <span className="text-slate-350">QUẢN LÝ HỒ CÂU © {new Date().getFullYear()}</span>
            </div>
            <span className="hidden sm:inline text-slate-800">|</span>
            <span className="text-slate-450 font-black">ĐƯỢC TẠO BỞI TECH FOUNDER HUANTRAN</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <a href="#" className="hover:text-slate-300 transition-colors">Điều khoản</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Bảo mật</a>
            <a 
              href="https://zalo.me/0855550813" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-primary text-primary flex items-center gap-1.5 normal-case font-black border border-primary/20 bg-primary/5 rounded-full px-4 py-1.5 shadow-md shadow-primary/5 hover:scale-105 transition-all"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Liên hệ Zalo/SĐT: 0855550813
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
