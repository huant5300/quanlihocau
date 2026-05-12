import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { 
  DollarSign, 
  Users, 
  Fish, 
  TrendingUp,
  Activity,
  Calendar
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

export default async function DashboardPage() {
  const session = await auth();
  
  // Real stats from DB
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    activeSessions,
    todayRevenue,
    totalCustomers,
    todayCatches
  ] = await Promise.all([
    prisma.fishingSession.count({ where: { status: "ACTIVE" } }),
    prisma.fishingSession.aggregate({
      _sum: { sessionAmount: true },
      where: { status: "COMPLETED", updatedAt: { gte: today } }
    }),
    prisma.customer.count(),
    prisma.fishCatch.aggregate({
      _sum: { weight: true },
      where: { createdAt: { gte: today } }
    })
  ]);

  const stats = [
    { label: "Doanh thu hôm nay", value: `${Number(todayRevenue._sum.sessionAmount || 0).toLocaleString()}đ`, icon: DollarSign, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "Lượt câu đang hoạt động", value: activeSessions.toString(), icon: Activity, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Tổng hội viên", value: totalCustomers.toString(), icon: Users, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "Cá đã thu hôm nay", value: `${Number(todayCatches._sum.weight || 0).toFixed(1)}kg`, icon: Fish, color: "text-orange-500", bg: "bg-orange-500/10" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight uppercase">Tổng quan hệ thống</h1>
          <p className="text-muted-foreground flex items-center gap-2 mt-1">
            <Calendar size={14} />
            Hôm nay, {format(new Date(), "eeee, dd MMMM yyyy", { locale: vi })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Hệ thống Live</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="glass-card p-6 rounded-[2.5rem] relative overflow-hidden group">
            <div className={stat.bg + " absolute top-0 right-0 w-32 h-32 rounded-bl-full -mr-8 -mt-8 opacity-50 group-hover:scale-110 transition-transform duration-500"} />
            <div className="relative z-10">
              <div className={stat.color + " mb-4"}>
                <stat.icon size={28} />
              </div>
              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">{stat.label}</p>
              <h3 className="text-2xl font-black">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Charts & Activity */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-card p-8 rounded-[3rem]">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black uppercase tracking-tight">Biểu đồ doanh thu</h2>
              <select className="bg-white/5 border-none text-xs font-bold rounded-xl px-3 py-2 outline-none">
                <option>7 ngày qua</option>
                <option>30 ngày qua</option>
              </select>
            </div>
            <div className="h-[300px] flex items-center justify-center text-muted-foreground italic text-sm">
              [Recharts Revenue Chart]
            </div>
          </div>

          <div className="glass-card p-8 rounded-[3rem]">
            <h2 className="text-xl font-black uppercase tracking-tight mb-8">Hoạt động gần đây</h2>
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-3xl hover:bg-white/5 transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <TrendingUp size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold">Khách hàng A đã thanh toán hóa đơn #INV-001</p>
                    <p className="text-xs text-muted-foreground">10 phút trước</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-green-500">+150.000đ</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-8">
          <div className="glass-card p-8 rounded-[3rem] bg-primary/5 border-primary/10">
            <h2 className="text-xl font-black uppercase tracking-tight mb-6">Trạng thái hồ câu</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold">Chòi đang câu</span>
                <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-[10px] font-black">{activeSessions}</span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: '40%' }} />
              </div>
              <p className="text-[10px] text-muted-foreground font-medium italic">
                * Tỷ lệ lấp đầy: 40% (4/10 chòi)
              </p>
            </div>
          </div>

          <div className="glass-card p-8 rounded-[3rem]">
            <h2 className="text-xl font-black uppercase tracking-tight mb-6">Top cá thu hôm nay</h2>
            <div className="space-y-4">
              {['Cá Tra', 'Cá Chép', 'Cá Chim'].map((fish, i) => (
                <div key={fish} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-muted-foreground">0{i+1}</span>
                    <span className="text-sm font-bold">{fish}</span>
                  </div>
                  <span className="text-sm font-black">{12 - i*3}kg</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
