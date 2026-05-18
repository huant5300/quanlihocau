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
    setIsMobileNavOpen,
    isOpenSessionModalOpen,
    setOpenSessionModalOpen,
    isPaymentModalOpen,
    setPaymentModalOpen,
    activeSessionForPayment
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

      {/* Mobile Drawer Sidebar */}
      <AnimatePresence>
        {isMobileNavOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileNavOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            {/* Sidebar Container */}
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-80 h-full bg-background z-10 flex flex-col shadow-2xl"
            >
              {/* Close Button or click inside menu closes drawer */}
              <div 
                onClick={() => setIsMobileNavOpen(false)}
                className="h-full"
              >
                <Sidebar />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
          billData={activeSessionForPayment ? {
            sessionId: activeSessionForPayment.id,
            hutNumber: activeSessionForPayment.hut_number,
            customerName: activeSessionForPayment.customer_name || "Khách lẻ",
            sessionFee: activeSessionForPayment.total_amount,
            products: activeSessionForPayment.session_products?.map(p => ({
              id: p.id,
              name: p.name,
              quantity: p.quantity,
              price: p.price
            })) || [],
            buybackDeduction: activeSessionForPayment.fish_buybacks?.reduce((sum, b) => sum + b.total_price, 0) || 0,
            prepaidAmount: activeSessionForPayment.prepaidAmount || 0,
            subtotal: activeSessionForPayment.total_amount,
            totalAmount: activeSessionForPayment.total_amount
          } : {
            sessionId: "",
            hutNumber: "",
            customerName: "",
            sessionFee: 0,
            products: [],
            buybackDeduction: 0,
            prepaidAmount: 0,
            subtotal: 0,
            totalAmount: 0
          }}
        />
      </div>
    </div>
  );
}
