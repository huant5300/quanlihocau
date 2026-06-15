"use client";

import React, { useState } from "react";
import { Fish, Plus, Skull, PackagePlus, Scale, Hash, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { createFishStockAction, adjustFishStockAction } from "@/actions/fish-stock-actions";
import { useRouter } from "next/navigation";
import { cn } from "@/utils/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface FishStock {
  id: string;
  fishTypeId: string;
  fishTypeName: string;
  initialWeight: number;
  initialQuantity: number;
  currentWeight: number;
  currentQuantity: number;
  deadCount: number;
  addedCount: number;
  addedWeight: number;
  caughtWeight: number;
  caughtCount: number;
  notes: string | null;
  updatedAt: string;
}

interface FishType {
  id: string;
  name: string;
  buybackPrice: number;
}

interface FishStockClientProps {
  initialStocks: FishStock[];
  fishTypes: FishType[];
}

export function FishStockClient({ initialStocks, fishTypes }: FishStockClientProps) {
  const [stocks, setStocks] = useState(initialStocks);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [selectedFishType, setSelectedFishType] = useState("");
  const [adjustType, setAdjustType] = useState<"DEAD" | "ADD">("ADD");
  const [formData, setFormData] = useState({ weight: 0, quantity: 0, notes: "" });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleAddStock = async () => {
    if (!selectedFishType) {
      toast.error("Vui lòng chọn loại cá");
      return;
    }
    if (formData.weight <= 0 || formData.quantity <= 0) {
      toast.error("Vui lòng nhập trọng lượng và số lượng hợp lệ");
      return;
    }
    setIsLoading(true);
    try {
      const result = await createFishStockAction({
        fishTypeId: selectedFishType,
        initialWeight: formData.weight,
        initialQuantity: formData.quantity,
        notes: formData.notes,
      });
      if (result.success) {
        toast.success("Đã nhập cá thành công!");
        setIsAddOpen(false);
        setFormData({ weight: 0, quantity: 0, notes: "" });
        setSelectedFishType("");
        router.refresh();
      } else {
        toast.error(result.error || "Lỗi khi nhập cá");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdjust = async () => {
    if (!selectedFishType) {
      toast.error("Vui lòng chọn loại cá");
      return;
    }
    setIsLoading(true);
    try {
      const result = await adjustFishStockAction({
        fishTypeId: selectedFishType,
        adjustment: adjustType,
        weight: formData.weight,
        quantity: formData.quantity,
        notes: formData.notes,
      });
      if (result.success) {
        toast.success(adjustType === "DEAD" ? "Đã ghi nhận cá chết" : "Đã thả thêm cá");
        setIsAdjustOpen(false);
        setFormData({ weight: 0, quantity: 0, notes: "" });
        router.refresh();
      } else {
        toast.error(result.error || "Lỗi");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const totalWeight = stocks.reduce((sum, s) => sum + s.currentWeight, 0);
  const totalQuantity = stocks.reduce((sum, s) => sum + s.currentQuantity, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight uppercase flex items-center gap-3">
            <Fish size={28} className="text-primary" />
            Cá Tồn Hồ
          </h1>
          <p className="text-xs text-muted-foreground font-bold mt-1">Quản lý tồn kho cá theo loại</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setAdjustType("ADD"); setIsAdjustOpen(true); }}
            className="h-14 px-6 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-500/20 transition-all active:scale-95"
          >
            <PackagePlus size={16} /> Thả thêm
          </button>
          <button
            onClick={() => { setAdjustType("DEAD"); setIsAdjustOpen(true); }}
            className="h-14 px-6 bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-red-500/20 transition-all active:scale-95"
          >
            <Skull size={16} /> Cá chết
          </button>
          <button
            onClick={() => setIsAddOpen(true)}
            className="h-14 px-6 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Plus size={16} /> Nhập cá mới
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl">
          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Tổng kg còn</p>
          <p className="text-2xl font-black text-primary mt-1">{totalWeight.toFixed(1)} kg</p>
        </div>
        <div className="glass-card p-5 rounded-2xl">
          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Tổng số lượng còn</p>
          <p className="text-2xl font-black text-emerald-500 mt-1">{totalQuantity} con</p>
        </div>
        <div className="glass-card p-5 rounded-2xl">
          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Loại cá</p>
          <p className="text-2xl font-black mt-1">{stocks.length}</p>
        </div>
        <div className="glass-card p-5 rounded-2xl">
          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Tổng đã bắt</p>
          <p className="text-2xl font-black text-orange-500 mt-1">{stocks.reduce((s, st) => s + st.caughtCount, 0)} con</p>
        </div>
      </div>

      {/* Stock Table */}
      <div className="glass-card rounded-[2rem] overflow-hidden">
        <div className="p-6 border-b border-border/50">
          <h2 className="text-lg font-black uppercase tracking-tight">Chi tiết tồn kho cá</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50 bg-accent/30">
                <th className="text-left p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Loại cá</th>
                <th className="text-right p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Ban đầu</th>
                <th className="text-right p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Thả thêm</th>
                <th className="text-right p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Đã bắt</th>
                <th className="text-right p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Chết</th>
                <th className="text-right p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tồn hiện tại</th>
                <th className="text-right p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Kg còn</th>
              </tr>
            </thead>
            <tbody>
              {stocks.length > 0 ? stocks.map((stock, idx) => (
                <motion.tr
                  key={stock.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="border-b border-border/30 hover:bg-accent/20 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                        <Fish size={16} />
                      </div>
                      <span className="font-black text-sm uppercase tracking-tight">{stock.fishTypeName}</span>
                    </div>
                  </td>
                  <td className="p-4 text-right font-bold text-sm">{stock.initialQuantity} con <span className="text-muted-foreground text-xs">({stock.initialWeight}kg)</span></td>
                  <td className="p-4 text-right font-bold text-sm text-emerald-500">+{stock.addedCount} con <span className="text-xs">({stock.addedWeight}kg)</span></td>
                  <td className="p-4 text-right font-bold text-sm text-orange-500">-{stock.caughtCount} con <span className="text-xs">({stock.caughtWeight}kg)</span></td>
                  <td className="p-4 text-right font-bold text-sm text-red-500">-{stock.deadCount}</td>
                  <td className="p-4 text-right">
                    <span className="font-black text-lg">{stock.currentQuantity}</span>
                    <span className="text-muted-foreground text-xs ml-1">con</span>
                  </td>
                  <td className="p-4 text-right">
                    <span className="font-black text-lg text-primary">{stock.currentWeight.toFixed(1)}</span>
                    <span className="text-muted-foreground text-xs ml-1">kg</span>
                  </td>
                </motion.tr>
              )) : (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-muted-foreground italic">
                    Chưa có dữ liệu cá tồn. Bấm "Nhập cá mới" để bắt đầu.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Stock Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[480px] rounded-[2rem] p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-tight">Nhập cá mới</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <label htmlFor="add-fish-type-select" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Loại cá</label>
              <select
                id="add-fish-type-select"
                title="Chọn loại cá"
                value={selectedFishType}
                onChange={(e) => setSelectedFishType(e.target.value)}
                className="w-full h-14 px-4 bg-accent/50 rounded-xl border border-border outline-none font-bold focus:border-primary"
              >
                <option value="">Chọn loại cá...</option>
                {fishTypes.map((ft) => (
                  <option key={ft.id} value={ft.id}>{ft.name} ({ft.buybackPrice.toLocaleString()}đ/kg)</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="add-weight-input" className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1"><Scale size={12} /> Trọng lượng (kg)</label>
                <input id="add-weight-input" type="number" step="0.1" min="0" placeholder="0.0" title="Trọng lượng (kg)" value={formData.weight || ""} onChange={(e) => setFormData(d => ({ ...d, weight: Number(e.target.value) }))} className="w-full h-14 px-4 bg-accent/50 rounded-xl border border-border outline-none font-black text-lg focus:border-primary" />
              </div>
              <div className="space-y-2">
                <label htmlFor="add-quantity-input" className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1"><Hash size={12} /> Số lượng (con)</label>
                <input id="add-quantity-input" type="number" min="0" placeholder="0" title="Số lượng (con)" value={formData.quantity || ""} onChange={(e) => setFormData(d => ({ ...d, quantity: Number(e.target.value) }))} className="w-full h-14 px-4 bg-accent/50 rounded-xl border border-border outline-none font-black text-lg focus:border-primary" />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="add-notes-input" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Ghi chú</label>
              <input id="add-notes-input" type="text" title="Ghi chú" value={formData.notes} onChange={(e) => setFormData(d => ({ ...d, notes: e.target.value }))} placeholder="Ghi chú (tùy chọn)" className="w-full h-14 px-4 bg-accent/50 rounded-xl border border-border outline-none font-bold focus:border-primary" />
            </div>
            <button onClick={handleAddStock} disabled={isLoading} className="w-full h-14 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50 hover:scale-[1.02] active:scale-95 transition-all">
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Xác nhận nhập cá
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Adjust Stock Dialog */}
      <Dialog open={isAdjustOpen} onOpenChange={setIsAdjustOpen}>
        <DialogContent className="sm:max-w-[480px] rounded-[2rem] p-6">
          <DialogHeader>
            <DialogTitle className={cn("text-xl font-black uppercase tracking-tight", adjustType === "DEAD" ? "text-red-500" : "text-emerald-500")}>
              {adjustType === "DEAD" ? "Ghi nhận cá chết" : "Thả thêm cá"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <label htmlFor="adjust-fish-type-select" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Loại cá</label>
              <select id="adjust-fish-type-select" title="Chọn loại cá" value={selectedFishType} onChange={(e) => setSelectedFishType(e.target.value)} className="w-full h-14 px-4 bg-accent/50 rounded-xl border border-border outline-none font-bold focus:border-primary">
                <option value="">Chọn loại cá...</option>
                {stocks.map((s) => (
                  <option key={s.fishTypeId} value={s.fishTypeId}>{s.fishTypeName} (tồn: {s.currentQuantity} con)</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="adjust-weight-input" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Trọng lượng (kg)</label>
                <input id="adjust-weight-input" type="number" step="0.1" min="0" placeholder="0.0" title="Trọng lượng (kg)" value={formData.weight || ""} onChange={(e) => setFormData(d => ({ ...d, weight: Number(e.target.value) }))} className="w-full h-14 px-4 bg-accent/50 rounded-xl border border-border outline-none font-black text-lg focus:border-primary" />
              </div>
              <div className="space-y-2">
                <label htmlFor="adjust-quantity-input" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Số lượng (con)</label>
                <input id="adjust-quantity-input" type="number" min="0" placeholder="0" title="Số lượng (con)" value={formData.quantity || ""} onChange={(e) => setFormData(d => ({ ...d, quantity: Number(e.target.value) }))} className="w-full h-14 px-4 bg-accent/50 rounded-xl border border-border outline-none font-black text-lg focus:border-primary" />
              </div>
            </div>
            <button onClick={handleAdjust} disabled={isLoading} className={cn("w-full h-14 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 hover:scale-[1.02] active:scale-95 transition-all", adjustType === "DEAD" ? "bg-red-500 shadow-red-500/20" : "bg-emerald-500 shadow-emerald-500/20")}>
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : adjustType === "DEAD" ? <Skull size={16} /> : <PackagePlus size={16} />}
              {adjustType === "DEAD" ? "Ghi nhận cá chết" : "Xác nhận thả thêm"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
