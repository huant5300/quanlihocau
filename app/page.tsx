export const dynamic = "force-dynamic";

import { MainLayout } from "@/components/layouts/main-layout";
import { 
  Waves, 
  Users, 
  CalendarCheck, 
  TrendingUp,
  ArrowUpRight,
  Fish
} from "lucide-react";

export default function DashboardPage() {
  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Chào mừng trở lại, Admin! 👋</h1>
          <p className="text-muted-foreground mt-2">
            Hôm nay có 5 lượt đặt chỗ mới và 2 hồ cần kiểm tra định kỳ.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            title="Tổng doanh thu" 
            value="45.200.000đ" 
            change="+12.5%" 
            icon={<TrendingUp size={20} />} 
          />
          <StatCard 
            title="Khách hàng" 
            value="1,284" 
            change="+3.2%" 
            icon={<Users size={20} />} 
          />
          <StatCard 
            title="Lượt đặt chỗ" 
            value="42" 
            change="+18%" 
            icon={<CalendarCheck size={20} />} 
          />
          <StatCard 
            title="Cá đã câu" 
            value="156 kg" 
            change="+5.4%" 
            icon={<Fish size={20} />} 
          />
        </div>

        {/* Placeholder for Modules */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="p-6 rounded-xl border bg-card/50 min-h-[300px] flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Waves size={24} />
            </div>
            <h3 className="font-semibold text-lg">Quản lý Hồ câu</h3>
            <p className="text-sm text-muted-foreground max-w-[250px]">
              Module quản lý danh sách hồ, mực nước và trạng thái cá trong hồ.
            </p>
            <button className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1">
              Đi đến module <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="p-6 rounded-xl border bg-card/50 min-h-[300px] flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <CalendarCheck size={24} />
            </div>
            <h3 className="font-semibold text-lg">Lịch đặt chỗ</h3>
            <p className="text-sm text-muted-foreground max-w-[250px]">
              Theo dõi và phê duyệt các yêu cầu đặt chỗ từ ngư dân.
            </p>
            <button className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1">
              Xem lịch <ArrowUpRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

function StatCard({ title, value, change, icon }: { 
  title: string; 
  value: string; 
  change: string; 
  icon: React.ReactNode 
}) {
  return (
    <div className="p-6 rounded-xl border bg-card hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        <span className="text-xs font-medium text-green-500 bg-green-500/10 px-2 py-1 rounded-full">
          {change}
        </span>
      </div>
      <div className="mt-4">
        <p className="text-sm text-muted-foreground">{title}</p>
        <h4 className="text-2xl font-bold mt-1">{value}</h4>
      </div>
    </div>
  );
}
