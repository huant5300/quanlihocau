"use client";

import React from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { MobileNav } from "./mobile-nav";
import { ErrorBoundary } from "@/components/error-boundaries/root-error-boundary";
import { useUIStore } from "@/stores/ui-store";
import { cn } from "@/utils/utils";
import { motion, AnimatePresence } from "framer-motion";
import { OpenSessionModal } from "@/modules/sessions/components/open-session-modal";
import { PaymentModal } from "@/modules/payments/components/payment-modal";
import { PrinterManager } from "@/components/shared/printer-manager";

interface MainLayoutProps {
  children: React.ReactNode;
}

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
        {/* Desktop Sidebar */}
        <Sidebar />
        
        {/* Main Wrapper */}
        <div 
          className={cn(
            "flex-1 flex flex-col min-w-0 transition-all duration-500 ease-in-out",
            sidebarCollapsed ? "lg:ml-24" : "lg:ml-72"
          )}
        >
          {/* Topbar */}
          <Topbar />
          
          {/* Content Area */}
          <main className="flex-1 p-4 md:p-8 lg:p-10 w-full max-w-[1800px] mx-auto pb-32 lg:pb-10">
            <AnimatePresence mode="wait">
              <motion.div
                key="content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>

        {/* Mobile Navigation */}
        <MobileNav />

        {/* Desktop Floating Action Button */}
        <div className="fixed bottom-10 right-10 z-40 hidden lg:block">
          <motion.button 
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setOpenSessionModalOpen(true)}
            className="w-16 h-16 bg-primary text-white rounded-[1.5rem] shadow-2xl shadow-primary/40 flex items-center justify-center group relative overflow-hidden"
          >
            <motion.div
              initial={false}
              animate={{ rotate: 0 }}
              className="z-10"
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </motion.div>
            
            {/* Pulsing effect */}
            <div className="absolute inset-0 bg-white/20 scale-0 group-hover:scale-150 transition-transform duration-700 rounded-full" />
            
            {/* Tooltip */}
            <div className="absolute right-full mr-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 pointer-events-none">
               <div className="glass px-4 py-2 rounded-xl shadow-2xl border border-white/20">
                  <span className="text-xs font-black uppercase tracking-widest whitespace-nowrap">Mở lượt câu mới (F2)</span>
               </div>
            </div>
          </motion.button>
        </div>

        {/* Modals & Overlays */}
        <OpenSessionModal 
          isOpen={openSessionModalOpen} 
          onClose={() => setOpenSessionModalOpen(false)} 
        />

        {activeSessionForPayment && (
          <PaymentModal
            isOpen={paymentModalOpen}
            onClose={() => setPaymentModalOpen(false)}
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

        {/* Floating Printer Manager / Sync Status */}
        <PrinterManager />
      </div>
    </ErrorBoundary>
  );
}
