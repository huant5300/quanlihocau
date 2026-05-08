"use client";

import React from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { ErrorBoundary } from "@/components/error-boundaries/root-error-boundary";
import { useUIStore } from "@/stores/ui-store";
import { cn } from "@/utils/utils";
import { Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MainLayoutProps {
  children: React.ReactNode;
}

import { OpenSessionModal } from "@/modules/sessions/components/open-session-modal";
import { PaymentModal } from "@/modules/payments/components/payment-modal";
import { PrinterManager } from "@/components/shared/printer-manager";

export function MainLayout({ children }: MainLayoutProps) {
  const { 
    sidebarCollapsed, 
    openSessionModalOpen, 
    setOpenSessionModalOpen,
    paymentModalOpen,
    setPaymentModalOpen,
    activeSessionForPayment
  } = useUIStore();

  return (
    <ErrorBoundary>
      <div className="flex min-h-screen bg-background selection:bg-primary/20 selection:text-primary overflow-x-hidden">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Wrapper */}
        <div 
          className={cn(
            "flex-1 flex flex-col min-w-0 transition-all duration-500 ease-in-out",
            sidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
          )}
        >
          {/* Topbar */}
          <Topbar />
          
          {/* Content Area */}
          <main className="flex-1 p-4 md:p-8 lg:p-10 w-full max-w-[1600px] mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key="content"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
          
          {/* Footer */}
          <footer className="px-10 py-6 text-center text-xs text-muted-foreground border-t bg-card/30 lg:hidden">
            &copy; 2026 Fishing Lake SaaS POS. All rights reserved.
          </footer>
        </div>

        {/* Floating Action Button (FAB) */}
        <div className="fixed bottom-8 right-8 z-40 hidden lg:block">
          <button 
            onClick={() => setOpenSessionModalOpen(true)}
            className="group w-16 h-16 bg-primary text-white rounded-2xl shadow-2xl shadow-primary/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300"
          >
            <Plus size={32} className="group-hover:rotate-90 transition-transform duration-500" />
            
            {/* FAB Tooltip */}
            <div className="absolute bottom-full mb-4 right-0 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
               <span className="bg-popover border px-4 py-2 rounded-xl text-sm font-bold shadow-xl whitespace-nowrap">Mở lượt câu mới (F2)</span>
            </div>
          </button>
        </div>

        {/* Modals */}
        <OpenSessionModal 
          isOpen={openSessionModalOpen} 
          onClose={() => setOpenSessionModalOpen(false)} 
        />

        {activeSessionForPayment && (
          <PaymentModal
            isOpen={paymentModalOpen}
            onClose={() => {
              setPaymentModalOpen(false);
            }}
            session={{
              id: activeSessionForPayment.id,
              hut_number: activeSessionForPayment.hut_number,
              customer_name: activeSessionForPayment.customer_name,
              package_total: 200000,
              product_total: activeSessionForPayment.total_amount - 200000,
              fish_buyback: 50000,
            }}
          />
        )}

        {/* Printer Manager */}
        <PrinterManager />
      </div>
    </ErrorBoundary>
  );
}
