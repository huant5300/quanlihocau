"use client";

import React, { useState } from "react";
import { CustomerCard } from "@/modules/crm/components/customer-card";
import { CustomerDetailDrawer } from "@/modules/crm/components/customer-detail-drawer";
import { Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Customer } from "@/types";

interface CRMClientProps {
  customers: Customer[];
  search: string;
  onSearchChange: (value: string) => void;
}

export function CRMClient({ customers, search, onSearchChange }: CRMClientProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  return (
    <div className="space-y-10">
      {/* Search Bar */}
      <div className="relative group max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
        <input 
          type="text"
          placeholder="Tìm kiếm theo tên hoặc số điện thoại..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full h-16 pl-12 pr-4 bg-accent/50 rounded-2xl border-2 border-transparent focus:border-primary/20 focus:bg-background outline-none transition-all font-bold"
        />
      </div>

      {/* Customer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
        <AnimatePresence mode="popLayout">
          {customers.map((customer) => (
            <CustomerCard 
              key={customer.id} 
              customer={customer as any} 
              onClick={() => setSelectedCustomer(customer)}
            />
          ))}
        </AnimatePresence>
        {customers.length === 0 && (
          <div className="col-span-full py-20 text-center glass-card rounded-[2rem]">
            <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">Không tìm thấy khách hàng nào</p>
          </div>
        )}
      </div>

      {/* Customer Detail Drawer */}
      <CustomerDetailDrawer 
        customer={selectedCustomer as any}
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
      />
    </div>
  );
}
