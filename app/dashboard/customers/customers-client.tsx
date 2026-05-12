"use client";

import React, { useState } from "react";
import { Plus, Search, UserPlus, Phone, MapPin, MoreHorizontal, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { createCustomerAction } from "@/actions/customer-actions";
import { toast } from "sonner";

export function CustomersClient({ initialCustomers }: any) {
  const [customers, setCustomers] = useState(initialCustomers);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredCustomers = customers.filter((c: any) => 
    c.fullName.toLowerCase().includes(search.toLowerCase()) || 
    c.phone.includes(search)
  );

  const handleAddCustomer = async (formData: FormData) => {
    const fullName = formData.get("fullName") as string;
    const phone = formData.get("phone") as string;
    
    const result = await createCustomerAction({ fullName, phone });
    if (result.success) {
      toast.success("Đã thêm hội viên mới");
      setCustomers([result.data, ...customers]);
      setIsModalOpen(false);
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input 
            placeholder="Tìm theo tên hoặc số điện thoại..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 h-12 rounded-2xl bg-white/5 border-white/10"
          />
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="h-12 px-6 rounded-2xl bg-primary text-white font-bold flex items-center gap-2"
        >
          <UserPlus size={18} />
          Thêm hội viên
        </Button>
      </div>

      <div className="glass-card rounded-[2.5rem] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-white/5">
              <TableHead className="pl-8 h-16 text-[10px] font-black uppercase tracking-widest">Hội viên</TableHead>
              <TableHead className="h-16 text-[10px] font-black uppercase tracking-widest">Số điện thoại</TableHead>
              <TableHead className="h-16 text-[10px] font-black uppercase tracking-widest">Số lần câu</TableHead>
              <TableHead className="h-16 text-[10px] font-black uppercase tracking-widest">Tổng chi</TableHead>
              <TableHead className="h-16 text-[10px] font-black uppercase tracking-widest">Công nợ</TableHead>
              <TableHead className="h-16 pr-8 text-right text-[10px] font-black uppercase tracking-widest">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.map((customer: any) => (
              <TableRow key={customer.id} className="hover:bg-white/5 border-white/5 transition-all group">
                <TableCell className="pl-8 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-xs group-hover:bg-primary group-hover:text-white transition-all">
                      {customer.fullName[0]}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{customer.fullName}</p>
                      {customer.isVip && <Badge className="bg-yellow-500/10 text-yellow-500 border-none text-[8px] h-4">VIP</Badge>}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm font-medium">{customer.phone}</TableCell>
                <TableCell className="text-sm font-medium">{customer.visitCount}</TableCell>
                <TableCell className="text-sm font-black">{Number(customer.totalSpent).toLocaleString()}đ</TableCell>
                <TableCell>
                  <span className={Number(customer.debtBalance) > 0 ? "text-red-500 font-black text-sm" : "text-muted-foreground text-sm"}>
                    {Number(customer.debtBalance).toLocaleString()}đ
                  </span>
                </TableCell>
                <TableCell className="pr-8 text-right">
                  <Button variant="ghost" size="icon" className="rounded-xl">
                    <MoreHorizontal size={18} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0f0f0f] border border-white/10 rounded-[3rem] p-10 shadow-2xl relative">
            <h2 className="text-2xl font-black uppercase tracking-tight mb-8">Thêm hội viên mới</h2>
            <form action={handleAddCustomer} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground ml-2">Họ và tên</label>
                <Input name="fullName" placeholder="Nhập tên hội viên" className="h-14 bg-white/5 border-white/10 rounded-2xl px-4" required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground ml-2">Số điện thoại</label>
                <Input name="phone" placeholder="Nhập số điện thoại" className="h-14 bg-white/5 border-white/10 rounded-2xl px-4" required />
              </div>
              <div className="flex gap-4 mt-8">
                <Button type="button" onClick={() => setIsModalOpen(false)} variant="ghost" className="flex-1 h-14 rounded-2xl font-bold">Hủy</Button>
                <Button type="submit" className="flex-1 h-14 bg-primary text-white rounded-2xl font-black uppercase tracking-widest">Lưu lại</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
