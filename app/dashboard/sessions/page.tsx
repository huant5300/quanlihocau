"use client";

import React from "react";
import { SessionsClient } from "./sessions-client";
import { useQuery } from "@tanstack/react-query";
import { sessionService } from "@/services/api/session-service";
import { DashboardLayout, DashboardHeader } from "@/modules/dashboard/layout/dashboard-layout";
import { SessionCardSkeleton } from "@/modules/sessions/skeletons/session-skeleton";
import { DashboardHeaderActions } from "@/modules/dashboard/widgets/dashboard-header-actions";

export default function SessionsPage() {
  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["sessions"],
    queryFn: () => sessionService.getSessions(),
    refetchInterval: 5000,
  });

  return (
    <DashboardLayout
      header={
        <DashboardHeader 
          title="Quản lý Lượt câu" 
          subtitle="Theo dõi và quản lý các chòi đang hoạt động tại hồ."
          actions={<DashboardHeaderActions />}
        />
      }
    >
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <SessionCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <SessionsClient initialSessions={sessions} />
      )}
    </DashboardLayout>
  );
}