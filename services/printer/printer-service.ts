"use client";

/**
 * Printer Service
 * Manages connection to both Bluetooth and LAN thermal printers.
 * Supports Web Bluetooth (Android/Chrome) & System Web Print (iOS/AirPrint fallback).
 */
import { EscPosBuilder } from "./esc-pos-builder";
import { usePrinterStore } from "@/stores/printer-store";
import { toast } from "sonner";

/**
 * Helper loại bỏ dấu tiếng Việt để in nhiệt không bị lỗi phông chữ trên máy in ESC/POS
 */
export function removeVietnameseTones(str: string): string {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

// Các UUID phổ biến của máy in nhiệt Bluetooth (PT-210, MPT-II, Xprinter, Cashino, Goojprt...)
const PRINTER_UUIDS = [
  "000018f0-0000-1000-8000-00805f9b34fb",
  "0000ffe0-0000-1000-8000-00805f9b34fb",
  "0000ffe1-0000-1000-8000-00805f9b34fb",
  "0000ff00-0000-1000-8000-00805f9b34fb",
  "00001101-0000-1000-8000-00805f9b34fb",
  "49535343-fe7d-41aa-8d19-37050e15a4e7",
  "e7810a71-73ae-499d-8c15-faa9aef0c3f2"
];

export class PrinterService {
  private device: BluetoothDevice | null = null;
  private characteristic: BluetoothRemoteGATTCharacteristic | null = null;

  /**
   * Tạo lệnh in ESC/POS cho hóa đơn
   */
  buildEscPosData(bill: any): Uint8Array {
    const { paperSize } = usePrinterStore.getState();
    const is80mm = paperSize === "80mm";
    const lineChars = is80mm ? 48 : 32;

    const builder = new EscPosBuilder(lineChars);

    const now = new Date();
    const formattedDateTime = `${now.getDate().toString().padStart(2, "0")}/${(now.getMonth() + 1).toString().padStart(2, "0")}/${now.getFullYear()} ${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

    const formatItemRow = (name: string, qty: string, priceStr: string): string => {
      const cleanNameStr = removeVietnameseTones(name);
      if (is80mm) {
        let cleanName = cleanNameStr;
        if (cleanName.length > 24) {
          cleanName = cleanName.substring(0, 22) + "..";
        }
        const colName = cleanName.padEnd(25, " ");
        const colQty = qty.padStart(5, " ");
        const colPrice = priceStr.padStart(18, " ");
        return `${colName}${colQty}${colPrice}`;
      } else {
        let cleanName = cleanNameStr;
        if (cleanName.length > 13) {
          cleanName = cleanName.substring(0, 11) + "..";
        }
        const colName = cleanName.padEnd(14, " ");
        const colQty = qty.padStart(3, " ");
        const colPrice = priceStr.padStart(15, " ");
        return `${colName}${colQty}${colPrice}`;
      }
    };

    builder
      .align("center")
      .bold()
      .size("double")
      .line(removeVietnameseTones(bill.lakeName || "QUAN LY HO CAU"))
      .size("normal")
      .bold(false)
      .line("Dich vu Giai tri & Thu gian")
      .line("Ket noi nhanh - In nhanh")
      .separator()
      .align("left")
      .line(`Hoa don:  ${bill.sessionId ? bill.sessionId.substring(0, 8).toUpperCase() : "12345"}`)
      .line(`O/Choi:   ${removeVietnameseTones(bill.hutNumber || "Chua chon")}`)
      .line(`Khach:    ${removeVietnameseTones(bill.customerName || "Khach le")}`)
      .line(`Ngay in:  ${formattedDateTime}`)
      .separator()
      .bold();

    if (is80mm) {
      builder.line("Ten san pham             SL         Thanh tien");
    } else {
      builder.line("Ten san pham   SL    Thanh tien");
    }

    builder.bold(false).separator();

    // Tiền ca câu
    const sessionFee = bill.sessionFee || 0;
    if (sessionFee > 0 || bill.packageTitle) {
      const pkgTitle = bill.packageTitle ? `Goi: ${bill.packageTitle}` : "Goi gio cau";
      builder.line(formatItemRow(pkgTitle, "1", sessionFee.toLocaleString() + "d"));
    }

    // Danh sách sản phẩm dịch vụ
    if (bill.products && bill.products.length > 0) {
      bill.products.forEach((p: any) => {
        const pName = p.name || "San pham";
        const pQty = String(p.quantity || 1);
        const pTotal = ((p.price || 0) * (p.quantity || 1)).toLocaleString() + "d";
        builder.line(formatItemRow(pName, pQty, pTotal));
      });
    }

    builder.separator();

    // Khấu trừ / Tạm tính
    const subtotal = bill.subtotal || sessionFee + (bill.products?.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0) || 0);
    builder.align("right").line(`Tam tinh: ${subtotal.toLocaleString()}d`);

    if (bill.prepaidAmount && bill.prepaidAmount > 0) {
      builder.line(`Da tra truoc: -${bill.prepaidAmount.toLocaleString()}d`);
    }

    if (bill.buybackDeduction && bill.buybackDeduction > 0) {
      builder.line(`Khau tru ca:  -${bill.buybackDeduction.toLocaleString()}d`);
    }

    builder.separator();

    const totalAmount = bill.totalAmount !== undefined ? bill.totalAmount : Math.max(0, subtotal - (bill.prepaidAmount || 0) - (bill.buybackDeduction || 0));
    builder
      .bold()
      .size("double")
      .align("right")
      .line(`TONG CONG:`)
      .line(`${totalAmount.toLocaleString()}d`)
      .size("normal")
      .bold(false)
      .separator()
      .feed(1)
      .align("center")
      .line("Cam on Quy khach!")
      .line("Hen gap lai cac Can thu!")
      .feed(4)
      .cut();

    return builder.build();
  }

  /**
   * Thao tác in hóa đơn chính
   */
  async printBill(bill: any): Promise<boolean> {
    const { connectionType } = usePrinterStore.getState();

    // Nếu chưa kết nối Bluetooth hoặc dùng iOS, hỗ trợ in Web Print tự động nếu Bluetooth lỗi
    const data = this.buildEscPosData(bill);
    return this.print(data, bill);
  }

  /**
   * Kết nối máy in nhiệt Bluetooth hoặc LAN
   */
  async connect(): Promise<boolean> {
    const { connectionType, ipAddress, port, setConnectionStatus, setIsConnecting } = usePrinterStore.getState();

    if (connectionType === "bluetooth") {
      setIsConnecting(true);
      try {
        if (typeof window === "undefined" || !navigator.bluetooth) {
          throw new Error("Trình duyệt không hỗ trợ Web Bluetooth API (Ví dụ iOS Safari). Bạn có thể dùng chế độ In Web/AirPrint!");
        }

        // Quét tất cả thiết bị và truyền optionalServices mở rộng
        this.device = await navigator.bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: PRINTER_UUIDS
        });

        if (!this.device || !this.device.gatt) {
          throw new Error("Không thể khởi tạo GATT trên thiết bị Bluetooth.");
        }

        const server = await this.device.gatt.connect();

        // Tìm đặc tính Write Characteristic tự động qua tất cả các dịch vụ có sẵn
        let targetCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;

        const services = await server.getPrimaryServices().catch(() => []);
        for (const service of services) {
          try {
            const characteristics = await service.getCharacteristics();
            const writeChar = characteristics.find(
              c => c.properties.write || c.properties.writeWithoutResponse
            );
            if (writeChar) {
              targetCharacteristic = writeChar;
              break;
            }
          } catch {
            continue;
          }
        }

        this.characteristic = targetCharacteristic;
        const success = !!this.characteristic;

        setConnectionStatus(success);
        setIsConnecting(false);

        if (success) {
          toast.success(`Đã kết nối thành công máy in "${this.device.name || "Bluetooth Thermal"}"!`);
        } else {
          toast.error("Đã kết nối thiết bị nhưng không tìm thấy cổng ghi dữ liệu in.");
        }

        return success;
      } catch (error: any) {
        console.error("Bluetooth Connection Error:", error);
        setConnectionStatus(false);
        setIsConnecting(false);
        if (error.name !== "NotFoundError") {
          toast.error(`Lỗi kết nối Bluetooth: ${error.message || "Huỷ hoặc thiết bị không phản hồi"}`);
        }
        return false;
      }
    } else {
      // LAN Connection
      setIsConnecting(true);
      await new Promise(resolve => setTimeout(resolve, 500));

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1200);

        await fetch(`http://${ipAddress}:${port}`, {
          method: "HEAD",
          mode: "no-cors",
          signal: controller.signal
        }).catch(() => {});

        clearTimeout(timeoutId);
        setConnectionStatus(true);
        setIsConnecting(false);
        toast.success(`Đã kết nối máy in mạng LAN/Wi-Fi tại ${ipAddress}:${port}!`);
        return true;
      } catch (error: any) {
        console.error("LAN Connection error:", error);
        setConnectionStatus(true);
        setIsConnecting(false);
        toast.success(`Đã lưu cấu hình máy in LAN (${ipAddress}:${port})`);
        return true;
      }
    }
  }

  /**
   * Gửi dữ liệu in thô ESC/POS tới máy in
   */
  async print(data: Uint8Array, rawBill?: any): Promise<boolean> {
    const { connectionType, ipAddress, port } = usePrinterStore.getState();

    if (connectionType === "bluetooth") {
      if (!this.characteristic || !this.device?.gatt?.connected) {
        toast.info("Đang tự động kết nối máy in Bluetooth...");
        const reconnected = await this.connect();
        if (!reconnected) {
          // Nếu không có Web Bluetooth (như trên iPhone), gợi ý in Web System Print
          if (rawBill && typeof window !== "undefined") {
            toast.info("Đang chuyển sang giao diện in chuẩn Web/AirPrint...");
            this.printBrowser(rawBill);
            return true;
          }
          return false;
        }
      }

      try {
        const chunkSize = 20;
        for (let i = 0; i < data.length; i += chunkSize) {
          const chunk = data.slice(i, i + chunkSize);

          if (typeof (this.characteristic as any).writeValueWithoutResponse === "function") {
            await (this.characteristic as any).writeValueWithoutResponse(chunk);
          } else if (this.characteristic) {
            await this.characteristic.writeValue(chunk);
          }
        }
        toast.success("Đã in hóa đơn Bluetooth thành công!");
        return true;
      } catch (error: any) {
        console.error("Print Error:", error);
        toast.error(`Lỗi khi truyền dữ liệu Bluetooth: ${error.message || error}`);
        if (rawBill) {
          this.printBrowser(rawBill);
        }
        return false;
      }
    } else {
      // LAN Connection
      try {
        await fetch(`http://${ipAddress}:${port}/print`, {
          method: "POST",
          headers: { "Content-Type": "application/octet-stream" },
          body: data as any,
          mode: "no-cors",
        }).catch(() => null);

        toast.success(`Đã gửi lệnh in tới máy in LAN ${ipAddress}:${port}!`);
        return true;
      } catch (error) {
        console.error("LAN Print error:", error);
        toast.error("Không thể gửi lệnh in LAN.");
        return false;
      }
    }
  }

  /**
   * In giao diện Web Print / AirPrint (hỗ trợ iPhone/iOS & mọi trình duyệt di động)
   */
  printBrowser(bill: any) {
    if (typeof window === "undefined") return;

    const { paperSize } = usePrinterStore.getState();
    const is80mm = paperSize === "80mm";

    const printWindow = window.open("", "_blank", "width=400,height=600");
    if (!printWindow) {
      toast.error("Trình duyệt đã chặn cửa sổ bật lên (popup). Vui lòng cho phép popup để in.");
      return;
    }

    const now = new Date();
    const formattedDateTime = `${now.getDate().toString().padStart(2, "0")}/${(now.getMonth() + 1).toString().padStart(2, "0")}/${now.getFullYear()} ${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

    const subtotal = bill.subtotal || bill.sessionFee + (bill.products?.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0) || 0);
    const totalAmount = bill.totalAmount !== undefined ? bill.totalAmount : Math.max(0, subtotal - (bill.prepaidAmount || 0) - (bill.buybackDeduction || 0));

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Hóa Đơn ${bill.sessionId ? bill.sessionId.substring(0, 8).toUpperCase() : ""}</title>
        <style>
          @page {
            size: ${is80mm ? "80mm" : "58mm"} auto;
            margin: 0;
          }
          body {
            font-family: 'Courier New', Courier, monospace;
            width: ${is80mm ? "72mm" : "48mm"};
            margin: 0 auto;
            padding: 8px 4px;
            font-size: ${is80mm ? "13px" : "11px"};
            line-height: 1.3;
            color: #000;
          }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .bold { font-weight: bold; }
          .title { font-size: ${is80mm ? "16px" : "14px"}; font-weight: bold; text-transform: uppercase; margin-bottom: 2px; }
          .divider { border-top: 1px dashed #000; margin: 6px 0; }
          .row { display: flex; justify-content: space-between; margin-bottom: 3px; }
          .item-table { width: 100%; border-collapse: collapse; margin: 4px 0; }
          .item-table th, .item-table td { text-align: left; padding: 2px 0; }
          .total-box { font-size: ${is80mm ? "16px" : "14px"}; font-weight: bold; text-align: right; margin-top: 6px; }
        </style>
      </head>
      <body>
        <div class="text-center title">${bill.lakeName || "QUẢN LÝ HỒ CÂU"}</div>
        <div class="text-center">Dịch vụ Giải trí & Thư giãn</div>
        <div class="divider"></div>
        <div>Hóa đơn: <b>${bill.sessionId ? bill.sessionId.substring(0, 8).toUpperCase() : "12345"}</b></div>
        <div>Ổ/Chòi: <b>${bill.hutNumber || "Chưa chọn"}</b></div>
        <div>Khách: <b>${bill.customerName || "Khách lẻ"}</b></div>
        <div>Ngày in: <b>${formattedDateTime}</b></div>
        <div class="divider"></div>
        <table class="item-table">
          <thead>
            <tr>
              <th>Tên SP</th>
              <th style="text-align: center;">SL</th>
              <th style="text-align: right;">Tiền</th>
            </tr>
          </thead>
          <tbody>
            ${(bill.sessionFee || bill.packageTitle) ? `
              <tr>
                <td>${bill.packageTitle || "Gói giờ câu"}</td>
                <td style="text-align: center;">1</td>
                <td style="text-align: right;">${(bill.sessionFee || 0).toLocaleString()}đ</td>
              </tr>
            ` : ""}
            ${(bill.products || []).map((p: any) => `
              <tr>
                <td>${p.name}</td>
                <td style="text-align: center;">${p.quantity}</td>
                <td style="text-align: right;">${((p.price || 0) * (p.quantity || 1)).toLocaleString()}đ</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
        <div class="divider"></div>
        <div class="row"><span>Tạm tính:</span><span>${subtotal.toLocaleString()}đ</span></div>
        ${(bill.prepaidAmount && bill.prepaidAmount > 0) ? `<div class="row"><span>Đã trả trước:</span><span>-${bill.prepaidAmount.toLocaleString()}đ</span></div>` : ""}
        ${(bill.buybackDeduction && bill.buybackDeduction > 0) ? `<div class="row"><span>Khấu trừ cá:</span><span>-${bill.buybackDeduction.toLocaleString()}đ</span></div>` : ""}
        <div class="divider"></div>
        <div class="total-box">TỔNG CỘNG: ${totalAmount.toLocaleString()}đ</div>
        <div class="divider"></div>
        <div class="text-center" style="margin-top: 8px;">Cảm ơn Qúy khách & Hẹn gặp lại!</div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  }

  async disconnect() {
    const { connectionType, setConnectionStatus } = usePrinterStore.getState();

    if (connectionType === "bluetooth") {
      if (this.device?.gatt?.connected) {
        this.device.gatt.disconnect();
      }
      this.characteristic = null;
      this.device = null;
    }

    setConnectionStatus(false);
    toast.success("Đã ngắt kết nối máy in!");
  }

  isConnected(): boolean {
    const { connectionType, isConnected } = usePrinterStore.getState();
    if (connectionType === "bluetooth") {
      return !!this.characteristic && (this.device?.gatt?.connected || false);
    }
    return isConnected;
  }
}

export const printerService = new PrinterService();
