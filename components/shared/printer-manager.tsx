"use client";

import React, { useState, useEffect } from "react";
import { 
  Printer, 
  Bluetooth, 
  BluetoothOff, 
  X, 
  Smartphone, 
  Laptop, 
  Tablet, 
  HelpCircle,
  FileText,
  Wifi
} from "lucide-react";
import { printerService } from "@/services/printer/printer-service";
import { usePrinterStore } from "@/stores/printer-store";
import { cn } from "@/utils/utils";
import { motion, AnimatePresence } from "framer-motion";

export function PrinterManager() {
  const { 
    connectionType, 
    ipAddress, 
    port, 
    paperSize, 
    isConnected, 
    isConnecting, 
    setConnectionSettings, 
    setConnectionStatus,
    setIsConnecting
  } = usePrinterStore();

  const [isOpen, setIsOpen] = useState(false);
  const [showTestSuccess, setShowTestSuccess] = useState(false);

  // Kiểm tra trạng thái kết nối thực tế định kỳ và cập nhật store
  useEffect(() => {
    const interval = setInterval(() => {
      const actualConnected = printerService.isConnected();
      if (actualConnected !== isConnected) {
        setConnectionStatus(actualConnected);
      }
    }, 1500);
    return () => clearInterval(interval);
  }, [isConnected, setConnectionStatus]);

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
      sessionId: "TEST-0855",
      hutNumber: "Ô CÂU SỐ 08",
      customerName: "Cần Thủ In Thử",
      sessionFee: 200000,
      subtotal: 250000,
      prepaidAmount: 50000,
      buybackDeduction: 40000,
      totalAmount: 160000,
      products: [
        { name: "Nước tăng lực", quantity: 2, price: 15000 },
        { name: "Mồi chép đặc biệt", quantity: 1, price: 20000 }
      ]
    };

    const success = await printerService.printBill(testBill);
    if (success) {
      setShowTestSuccess(true);
      setTimeout(() => setShowTestSuccess(false), 3000);
    }
  };

  return (
    <>
      {/* 1. Thanh Floating Indicator hiển thị ở góc màn hình */}
      <div className="fixed bottom-24 right-6 sm:right-8 z-50">
        <AnimatePresence>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={() => setIsOpen(true)}
            className={cn(
              "flex items-center gap-3 p-3 pl-4 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all cursor-pointer hover:scale-105 active:scale-95 group",
              isConnected 
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400" 
                : "bg-white/95 dark:bg-zinc-950/95 border-slate-200 dark:border-slate-800 shadow-slate-900/5 text-slate-800 dark:text-slate-200"
            )}
          >
            <div className="flex flex-col text-left max-w-[200px]">
              <span className="text-[8px] font-black uppercase tracking-widest opacity-60">Máy in {paperSize}</span>
              <span className="text-[10px] font-bold tracking-tight mt-0.5 leading-tight flex items-center gap-1">
                {isConnected ? (
                  <span className="text-emerald-500 font-black flex items-center gap-1 uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block shrink-0" />
                    Sẵn sàng
                  </span>
                ) : (
                  <span className="text-amber-500 dark:text-amber-400 text-[9px] font-semibold">
                    Hãy kết nối máy in để dễ sử dụng tại đây
                  </span>
                )}
              </span>
            </div>

            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center transition-colors shadow-sm shrink-0",
              isConnected 
                ? "bg-emerald-500 text-white group-hover:bg-emerald-600" 
                : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-slate-200"
            )}>
              {isConnected ? (
                connectionType === "bluetooth" ? <Bluetooth size={18} className="animate-pulse" /> : <Wifi size={18} className="animate-pulse" />
              ) : (
                connectionType === "bluetooth" ? <BluetoothOff size={18} /> : <Wifi size={18} className="opacity-50" />
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 2. Modal Cài đặt & Hướng dẫn Kết nối Máy in */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            
            {/* Backdrop làm mờ mượt mà */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />

            {/* Container Modal */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-2xl w-full max-w-md relative overflow-hidden z-10 flex flex-col p-6 max-h-[85vh] font-sans"
            >
              {/* Header Modal */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center shadow-inner">
                    <Printer size={20} className="stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">Cài đặt Máy in Nhiệt</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hỗ trợ Bluetooth & Mạng LAN/Wi-Fi</p>
                  </div>
                </div>

                <button 
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-900 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center border border-slate-100 dark:border-slate-800 shadow-sm active:scale-90 transition-transform"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Nội dung cuộn được */}
              <div className="flex-1 overflow-y-auto space-y-6 pr-1 no-scrollbar">
                
                {/* Khối hiển thị trạng thái hiện tại */}
                <div className={cn(
                  "p-5 rounded-2xl border text-center flex flex-col items-center justify-center gap-2.5 relative overflow-hidden shadow-inner",
                  isConnected 
                    ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-700 dark:text-emerald-400" 
                    : "bg-slate-50 dark:bg-zinc-900/50 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400"
                )}>
                  {isConnected ? (
                    <>
                      <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-md animate-attention-pulse">
                        {connectionType === "bluetooth" ? <Bluetooth size={22} className="animate-pulse" /> : <Wifi size={22} className="animate-pulse" />}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Trạng thái máy in</p>
                        <h4 className="text-sm font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-tight mt-1.5">SẴN SÀNG IN HÓA ĐƠN ({connectionType === "bluetooth" ? "Bluetooth" : `LAN: ${ipAddress}`})</h4>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center shadow-inner">
                        <BluetoothOff size={22} />
                      </div>
                      <div className="px-4">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Trạng thái máy in</p>
                        <h4 className="text-[11px] sm:text-xs font-bold text-amber-500 dark:text-amber-400 uppercase tracking-wider mt-2">
                          Hãy kết nối máy in để dễ sử dụng tại đây
                        </h4>
                      </div>
                    </>
                  )}
                </div>

                {/* Phần cấu hình máy in - Giống KiotViet & Sổ Bán Hàng */}
                <div className="space-y-4 p-4 bg-slate-50 dark:bg-zinc-900/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                  
                  {/* Lựa chọn kiểu kết nối */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Kiểu kết nối</label>
                    <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-zinc-900 p-1 rounded-xl">
                      <button
                        onClick={() => {
                          handleDisconnect();
                          setConnectionSettings({ connectionType: "bluetooth" });
                        }}
                        className={cn(
                          "py-2 px-3 rounded-lg font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer",
                          connectionType === "bluetooth"
                            ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm"
                            : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        )}
                      >
                        <Bluetooth size={14} />
                        Bluetooth
                      </button>
                      <button
                        onClick={() => {
                          handleDisconnect();
                          setConnectionSettings({ connectionType: "lan" });
                        }}
                        className={cn(
                          "py-2 px-3 rounded-lg font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer",
                          connectionType === "lan"
                            ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm"
                            : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        )}
                      >
                        <Wifi size={14} />
                        Mạng LAN / Wi-Fi
                      </button>
                    </div>
                  </div>

                  {/* Lựa chọn khổ giấy */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Khổ giấy in</label>
                    <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-zinc-900 p-1 rounded-xl">
                      <button
                        onClick={() => setConnectionSettings({ paperSize: "58mm" })}
                        className={cn(
                          "py-2 px-3 rounded-lg font-black text-[10px] uppercase tracking-wider transition-all cursor-pointer",
                          paperSize === "58mm"
                            ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm"
                            : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        )}
                      >
                        Khổ 58mm (K57)
                      </button>
                      <button
                        onClick={() => setConnectionSettings({ paperSize: "80mm" })}
                        className={cn(
                          "py-2 px-3 rounded-lg font-black text-[10px] uppercase tracking-wider transition-all cursor-pointer",
                          paperSize === "80mm"
                            ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm"
                            : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        )}
                      >
                        Khổ 80mm (K80)
                      </button>
                    </div>
                  </div>

                  {/* Cấu hình LAN */}
                  {connectionType === "lan" && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80"
                    >
                      <div className="col-span-2 space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Địa chỉ IP máy in</label>
                        <input
                          type="text"
                          value={ipAddress}
                          onChange={(e) => setConnectionSettings({ ipAddress: e.target.value })}
                          placeholder="e.g. 192.168.1.100"
                          className="w-full h-11 px-3 bg-slate-100 dark:bg-zinc-900 border border-transparent focus:border-emerald-500 rounded-xl text-xs font-bold outline-none text-slate-800 dark:text-slate-200"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Cổng (Port)</label>
                        <input
                          type="number"
                          value={port}
                          onChange={(e) => setConnectionSettings({ port: Number(e.target.value) })}
                          placeholder="9100"
                          className="w-full h-11 px-3 bg-slate-100 dark:bg-zinc-900 border border-transparent focus:border-emerald-500 rounded-xl text-xs font-bold outline-none text-slate-800 dark:text-slate-200"
                        />
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Các nút hành động chính */}
                <div className="space-y-3">
                  {!isConnected ? (
                    <button
                      onClick={handleConnect}
                      disabled={isConnecting}
                      className="w-full h-14 bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 hover:from-emerald-450 hover:to-emerald-550 text-white rounded-2xl flex items-center justify-center gap-2.5 font-black uppercase text-xs tracking-wider transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-500/10 cursor-pointer disabled:opacity-50"
                    >
                      {isConnecting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          {connectionType === "bluetooth" ? "Đang tìm máy in Bluetooth..." : "Đang kiểm tra máy in LAN..."}
                        </>
                      ) : (
                        <>
                          {connectionType === "bluetooth" ? <Bluetooth size={16} className="fill-white" /> : <Wifi size={16} />}
                          Bắt đầu kết nối máy in
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        onClick={handleTestPrint}
                        className="h-12 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-sm"
                      >
                        <FileText size={15} />
                        {showTestSuccess ? "Đã gửi lệnh in!" : "In thử hóa đơn"}
                      </button>
                      
                      <button
                        onClick={handleDisconnect}
                        className="h-12 bg-slate-50 hover:bg-rose-500/10 hover:text-rose-500 text-slate-500 border border-slate-200 dark:border-slate-800 dark:bg-slate-900 rounded-xl flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-sm"
                      >
                        <BluetoothOff size={15} />
                        Ngắt kết nối
                      </button>
                    </div>
                  )}
                </div>

                {/* HƯỚNG DẪN KẾT NỐI NHANH CHO CÁC THIẾT BỊ */}
                <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-widest flex items-center gap-1.5">
                    <HelpCircle size={15} className="text-emerald-500" />
                    Hướng dẫn kết nối nhanh:
                  </h4>

                  <div className="space-y-3.5 text-slate-600 dark:text-slate-400" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    
                    {/* Hướng dẫn kết nối LAN */}
                    <div className="bg-slate-50/50 dark:bg-zinc-900/30 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl flex gap-3 text-left">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                        <Wifi size={16} />
                      </div>
                      <div className="space-y-1">
                        <h5 className="text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-wide">Kết nối máy in qua Mạng LAN / Wi-Fi:</h5>
                        <p className="text-[10px] sm:text-xs font-semibold leading-relaxed">
                          Áp dụng cho máy in hóa đơn có cổng LAN (cắm dây mạng vào modem) hoặc tích hợp Wi-Fi:
                        </p>
                        <ol className="list-decimal pl-4 text-[9px] sm:text-[10px] font-bold text-slate-500 dark:text-slate-400 space-y-0.5">
                          <li>Kết nối điện thoại/máy tính vào chung mạng Wi-Fi với máy in.</li>
                          <li>Nhập chính xác <strong>Địa chỉ IP</strong> của máy in (thường in ra từ nút FEED máy in).</li>
                          <li>Nhấn <strong>Bắt đầu kết nối máy in</strong> để hệ thống đồng bộ và sẵn sàng in hóa đơn.</li>
                        </ol>
                      </div>
                    </div>

                    {/* Hướng dẫn iPhone/iPad Bluetooth */}
                    <div className="bg-slate-50/50 dark:bg-zinc-900/30 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl flex gap-3 text-left">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-blue-500 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                        <Tablet size={16} />
                      </div>
                      <div className="space-y-1">
                        <h5 className="text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-wide">iPhone & iPad (Bluetooth):</h5>
                        <p className="text-[10px] sm:text-xs font-semibold leading-relaxed">
                          Do Apple khóa Web Bluetooth trên Safari mặc định:
                        </p>
                        <ol className="list-decimal pl-4 text-[9px] sm:text-[10px] font-bold text-slate-500 dark:text-slate-400 space-y-0.5">
                          <li>Tải app miễn phí <strong className="text-blue-500">Bluefy</strong> trên App Store.</li>
                          <li>Mở <strong>Bluefy</strong>, truy cập trang web quản lý chòi câu.</li>
                          <li>Bật Bluetooth của máy và kết nối in trực tiếp.</li>
                        </ol>
                      </div>
                    </div>

                    {/* Hướng dẫn Android Bluetooth */}
                    <div className="bg-slate-50/50 dark:bg-zinc-900/30 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl flex gap-3 text-left">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                        <Smartphone size={16} />
                      </div>
                      <div className="space-y-1">
                        <h5 className="text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-wide">Điện thoại Android (Bluetooth):</h5>
                        <ol className="list-decimal pl-4 text-[9px] sm:text-[10px] font-bold text-slate-500 dark:text-slate-400 space-y-0.5">
                          <li>Sử dụng trình duyệt <strong>Google Chrome</strong> hoặc <strong>Edge</strong>.</li>
                          <li>Bật Bluetooth và Vị trí (GPS) của điện thoại trước khi kết nối.</li>
                        </ol>
                      </div>
                    </div>

                  </div>
                </div>

              </div>

            </motion.div>

          </div>
        )}
      </AnimatePresence>
    </>
  );
}
