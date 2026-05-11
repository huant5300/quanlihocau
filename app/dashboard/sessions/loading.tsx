import { DashboardHeader, DashboardLayout } from "@/modules/dashboard/layout/dashboard-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";

export default function SessionsLoading() {
  return (
    <DashboardLayout
      header={
        <DashboardHeader
          title="Quản lý lượt câu"
          subtitle="Đang tải dữ liệu vận hành..."
          actions={
            <div className="h-14 px-6 bg-muted animate-pulse rounded-2xl w-40" />
          }
        />
      }
    >
      <div className="space-y-6">
        <div className="h-10 bg-muted animate-pulse rounded-full w-full" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-muted animate-pulse rounded-[2rem]" />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
