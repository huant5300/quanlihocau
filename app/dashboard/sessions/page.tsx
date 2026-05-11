"use client";

import React from "react";
import { SessionsClient } from "./sessions-client";
import { useQuery } from "@tanstack/react-query";
import { sessionService } from "@/services/api/session-service";
import { DashboardLayout, DashboardHeader } from "@/modules/dashboard/layout/dashboard-layout";
import { DashboardHeaderActions } from "@/modules/dashboard/widgets/dashboard-header-actions";

export default function SessionsPage() {
  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["sessions"],
    queryFn: () => sessionService.getSessions(),
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
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      ) : (
        <SessionsClient initialSessions={sessions} />
      )}
    </DashboardLayout>
  );
}