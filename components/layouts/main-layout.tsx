"use client";

import React from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { MobileNav } from "./mobile-nav";
import { useUIStore } from "@/stores/ui-store";
import { cn } from "@/utils/utils";
import { motion, AnimatePresence } from "framer-motion";
import { OpenSessionModal } from "@/modules/sessions/components/open-session";
import { PaymentModal } from "@/modules/payment/components/payment-modal";
import { PrinterManager } from "@/components/shared/printer-manager";
import { OfflineBanner } from "@/modules/offline/components/offline-banner";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { OfflineQueueManager } from "@/modules/offline/components/offline-queue-manager";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { 
    sidebarCollapsed, 
    isMobileNavOpen,
    isOpenSessionModalOpen,
    setOpenSessionModalOpen,
    isPaymentModalOpen,
    setPaymentModalOpen
  } = useUIStore();

  const [isQueueOpen, setIsQueueOpen] = React.useState(false);
  useNetworkStatus();

  return (
    <div className="min-h-screen bg-background text-foreground flex overflow-hidden">
      <OfflineBanner />
      <OfflineQueueManager isOpen={isQueueOpen} onClose={() => setIsQueueOpen(false)} />
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0 relative h-screen overflow-hidden">
        <Topbar />
        
        <main className="flex-1 overflow-y-auto no-scrollbar pb-24 lg:pb-8">
          <div className="p-4 sm:p-6 lg:p-10 max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>

        {/* Mobile Navigation */}
        <div className="lg:hidden">
          <MobileNav />
        </div>

        {/* Global Floating Components */}
        <PrinterManager />

        {/* Modals */}
        <OpenSessionModal 
          isOpen={isOpenSessionModalOpen} 
          onClose={() => setOpenSessionModalOpen(false)} 
        />

        <PaymentModal 
          isOpen={isPaymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          billData={{
            sessionId: "123",
            hutNumber: "08",
            customerName: "Nguyễn Văn A",
            sessionFee: 250000,
            products: [
              { id: "1", name: "Mồi Cám Xanh", quantity: 2, price: 25000 },
              { id: "2", name: "Nước Suối", quantity: 1, price: 10000 }
            ],
            buybackDeduction: 45000,
            subtotal: 310000,
            totalAmount: 265000
          }}
        />
      </div>
    </div>
  );
}
