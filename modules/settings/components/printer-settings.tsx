"use client";

import React, { useState } from "react";
import { SettingsCard } from "./settings-card";
import { Printer, Bluetooth, Wifi, FileText, BluetoothOff } from "lucide-react";
import { usePrinterStore } from "@/stores/printer-store";
import { printerService } from "@/services/printer/printer-service";
import { cn } from "@/utils/utils";

export function PrinterSettings() {
  const { 
    connectionType, 
    ipAddress, 
    port, 
    paperSize, 
    isConnected, 
    isConnecting, 
    setConnectionSettings, 
    setConnectionStatus
  } = usePrinterStore();

  const [showTestSuccess, setShowTestSuccess] = useState(false);

  const handleConnect = async () => {
    const success = await printerService.connect();
    setConnectionStatus(success);
  };

  const handleDisconnect = async () => {
    await printerService.disconnect();
    setConnectionStatus(false);
  };

  const handleTestPrint = async () => {
    if (!isConnected) return;
    
    const testBill = {
      sessionId: "TEST-SETTINGS",
      hutNumber: "CHÒI CẤU MẪU",
      customerName: "Khách Hàng Thử Nghiệm",
      sessionFee: 150000,
      subtotal: 195000,
      prepaidAmount: 0,
      buybackDeduction: 20000,
      totalAmount: 175000,
      products: [
        { name: "Cà phê sữa đá", quantity: 2, price: 20000 },
        { name: "Mồi cám tổng hợp", quantity: 1, price: 50000 }
      ]
    };

    const success = await printerService.printBill(testBill);
    if (success) {
      setShowTestSuccess(true);
      setTimeout(() => setShowTestSuccess(false), 3000);
    }
  };

  return (
    <SettingsCard 
      title="Cấu hình Máy in" 
      description="Quản lý kết nối máy in hóa đơn nhiệt cầm tay hoặc máy in mạng LAN."
      icon={Printer}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Cột trái: Form thiết lập */}
        <div className="space-y-6">
          {/* Lựa chọn kiểu kết nối */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
              Kiểu kết nối máy in
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => {
                  handleDisconnect();
                  setConnectionSettings({ connectionType: "bluetooth" });
                }}
                className={cn(
                  "p-5 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all cursor-pointer outline-none",
                  connectionType === "bluetooth"
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border/50 bg-accent/30 text-muted-foreground hover:bg-accent/50"
                )}
              >
                <Bluetooth size={24} />
                <span className="font-black text-[10px] uppercase tracking-widest text-center">Bluetooth</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  handleDisconnect();
                  setConnectionSettings({ connectionType: "lan" });
                }}
                className={cn(
                  "p-5 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all cursor-pointer outline-none",
                  connectionType === "lan"
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border/50 bg-accent/30 text-muted-foreground hover:bg-accent/50"
                )}
              >
                <Wifi size={24} />
                <span className="font-black text-[10px] uppercase tracking-widest text-center">LAN / Wi-Fi</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  handleDisconnect();
                  setConnectionSettings({ connectionType: "browser" });
                }}
                className={cn(
                  "p-5 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all cursor-pointer outline-none",
                  connectionType === "browser"
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border/50 bg-accent/30 text-muted-foreground hover:bg-accent/50"
                )}
              >
                <FileText size={24} />
                <span className="font-black text-[10px] uppercase tracking-widest text-center">In Trình Duyệt</span>
              </button>
            </div>
          </div>

          {/* Lựa chọn khổ giấy */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
              Khổ giấy in hóa đơn
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setConnectionSettings({ paperSize: "58mm" })}
                className={cn(
                  "py-3.5 px-4 rounded-xl border-2 font-black text-[10px] uppercase tracking-widest transition-all cursor-pointer outline-none",
                  paperSize === "58mm"
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border/50 bg-accent/30 text-muted-foreground hover:bg-accent/50"
                )}
              >
                Khổ 58mm (K57)
              </button>
              <button
                type="button"
                onClick={() => setConnectionSettings({ paperSize: "80mm" })}
                className={cn(
                  "py-3.5 px-4 rounded-xl border-2 font-black text-[10px] uppercase tracking-widest transition-all cursor-pointer outline-none",
                  paperSize === "80mm"
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border/50 bg-accent/30 text-muted-foreground hover:bg-accent/50"
                )}
              >
                Khổ 80mm (K80)
              </button>
            </div>
          </div>

          {/* Cấu hình LAN */}
          {connectionType === "lan" && (
            <div className="grid grid-cols-3 gap-4 p-5 rounded-2xl bg-accent/30 border border-border/50 animate-in fade-in duration-300">
              <div className="col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                  Địa chỉ IP máy in
                </label>
                <input
                  type="text"
                  value={ipAddress}
                  onChange={(e) => setConnectionSettings({ ipAddress: e.target.value })}
                  placeholder="e.g. 192.168.1.100"
                  className="w-full h-14 px-4 bg-accent/50 rounded-2xl border border-transparent focus:border-primary/20 outline-none font-bold text-foreground"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                  Cổng (Port)
                </label>
                <input
                  type="number"
                  value={port}
                  onChange={(e) => setConnectionSettings({ port: Number(e.target.value) })}
                  placeholder="9100"
                  className="w-full h-14 px-4 bg-accent/50 rounded-2xl border border-transparent focus:border-primary/20 outline-none font-bold text-foreground"
                />
              </div>
            </div>
          )}
        </div>

        {/* Cột phải: Trạng thái & Action Buttons */}
        <div className="flex flex-col justify-between border-t md:border-t-0 md:border-l border-border/40 pt-6 md:pt-0 md:pl-8 space-y-6">
          {/* Hộp Trạng Thái */}
          <div className={cn(
            "p-6 rounded-[2rem] border text-center flex flex-col items-center justify-center gap-4 relative overflow-hidden shadow-inner flex-1 min-h-[160px]",
            isConnected 
              ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-700 dark:text-emerald-400" 
              : "bg-slate-50 dark:bg-zinc-900/50 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400"
          )}>
            {isConnected ? (
              <>
                <div className="w-14 h-14 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20 animate-pulse">
                  {connectionType === "bluetooth" ? <Bluetooth size={24} /> : <Wifi size={24} />}
                </div>
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">
                    Trạng thái kết nối
                  </p>
                  <h4 className="text-base font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-tight mt-2 flex items-center gap-1.5 justify-center">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
                    Sẵn sàng hoạt động
                  </h4>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-2 uppercase tracking-wide">
                    {connectionType === "bluetooth" ? "Thiết bị Bluetooth" : `Máy in mạng LAN: ${ipAddress}:${port}`}
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="w-14 h-14 bg-slate-200 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center shadow-inner">
                  <BluetoothOff size={24} />
                </div>
                <div className="px-4">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">
                    Trạng thái kết nối
                  </p>
                  <h4 className="text-xs font-bold text-amber-500 dark:text-amber-400 uppercase tracking-wide mt-3 leading-relaxed">
                    Hãy kết nối máy in để dễ sử dụng tại đây
                  </h4>
                </div>
              </>
            )}
          </div>

          {/* Các nút hành động */}
          <div className="space-y-3">
            {!isConnected ? (
              <button
                type="button"
                onClick={handleConnect}
                disabled={isConnecting}
                className="w-full h-14 bg-primary hover:bg-primary/95 text-white rounded-2xl flex items-center justify-center gap-2.5 font-black uppercase text-xs tracking-wider transition-all hover:scale-[1.01] active:scale-95 shadow-xl shadow-primary/20 cursor-pointer disabled:opacity-50"
              >
                {isConnecting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Đang kết nối...
                  </>
                ) : (
                  <>
                    {connectionType === "bluetooth" ? <Bluetooth size={16} /> : <Wifi size={16} />}
                    Bắt đầu kết nối máy in
                  </>
                )}
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleTestPrint}
                  className="h-14 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-sm animate-in zoom-in-95 duration-200"
                >
                  <FileText size={16} />
                  {showTestSuccess ? "Đã gửi lệnh!" : "In thử hóa đơn"}
                </button>
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="h-14 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-rose-500/10 hover:text-rose-500 text-slate-500 rounded-2xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-sm animate-in zoom-in-95 duration-200"
                >
                  <BluetoothOff size={16} />
                  Ngắt kết nối
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </SettingsCard>
  );
}
