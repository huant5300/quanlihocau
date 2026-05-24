"use client";

/**
 * Bluetooth Printer Service
 * Manages connection to Bluetooth thermal printers via Web Bluetooth API.
 */
import { EscPosBuilder } from "./esc-pos-builder";

export class PrinterService {
  private device: BluetoothDevice | null = null;
  private characteristic: BluetoothRemoteGATTCharacteristic | null = null;

  async printBill(bill: any) {
    const builder = new EscPosBuilder();
    
    // Khởi tạo ngày giờ in hóa đơn thực tế
    const now = new Date();
    const formattedDateTime = `${now.getDate().toString().padStart(2, "0")}/${(now.getMonth() + 1).toString().padStart(2, "0")}/${now.getFullYear()} ${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

    // Helper rút gọn chuỗi có độ dài cố định để vừa khít khổ in 58mm (32 ký tự)
    const formatItemRow = (name: string, qty: string, priceStr: string): string => {
      // 32 ký tự: Tên sản phẩm (14 ký tự) + SL (3 ký tự) + Thành tiền (15 ký tự)
      let cleanName = name;
      if (cleanName.length > 13) {
        cleanName = cleanName.substring(0, 11) + "..";
      }
      const colName = cleanName.padEnd(14, " ");
      const colQty = qty.padStart(3, " ");
      const colPrice = priceStr.padStart(15, " ");
      return `${colName}${colQty}${colPrice}`;
    };

    builder
      .align("center")
      .bold()
      .size("double")
      .line("QUAN LY HO CAU")
      .size("normal")
      .bold(false)
      .line("Dich vu Giai tri & Thu gian")
      .line("Ket noi nhanh - In nhanh")
      .separator()
      .align("left")
      .line(`Hoa don:  ${bill.sessionId ? bill.sessionId.substring(0, 8).toUpperCase() : "12345"}`)
      .line(`O/Choi:   ${bill.hutNumber || "Chua chon"}`)
      .line(`Khach:    ${bill.customerName || "Khach le"}`)
      .line(`Ngay in:  ${formattedDateTime}`)
      .separator()
      .bold()
      .line("Ten san pham   SL    Thanh tien")
      .bold(false)
      .separator();

    // In tiền giờ câu đầu tiên
    const sessionFee = bill.sessionFee || 0;
    builder.line(formatItemRow("Goi gio cau", "1", sessionFee.toLocaleString() + "d"));

    // In danh sách sản phẩm dịch vụ đi kèm
    if (bill.products && bill.products.length > 0) {
      bill.products.forEach((p: any) => {
        const pName = p.name || "San pham";
        const pQty = String(p.quantity || 1);
        const pTotal = ((p.price || 0) * (p.quantity || 1)).toLocaleString() + "d";
        builder.line(formatItemRow(pName, pQty, pTotal));
      });
    }

    builder.separator();

    // Hiển thị các chi tiết khấu trừ/tạm tính
    const subtotal = bill.subtotal || 0;
    builder.align("right").line(`Tam tinh: ${subtotal.toLocaleString()}d`);

    if (bill.prepaidAmount && bill.prepaidAmount > 0) {
      builder.line(`Da tra truoc: -${bill.prepaidAmount.toLocaleString()}d`);
    }

    if (bill.buybackDeduction && bill.buybackDeduction > 0) {
      builder.line(`Khau tru ca:  -${bill.buybackDeduction.toLocaleString()}d`);
    }

    builder.separator();

    // Tổng tiền thanh toán cuối cùng
    const totalAmount = bill.totalAmount || 0;
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

    return this.print(builder.build());
  }

  async connect(): Promise<boolean> {
    try {
      this.device = await navigator.bluetooth.requestDevice({
        filters: [{ services: ["000018f0-0000-1000-8000-00805f9b34fb"] }], // Common thermal printer service
        optionalServices: ["000018f0-0000-1000-8000-00805f9b34fb"]
      });

      const server = await this.device.gatt?.connect();
      const service = await server?.getPrimaryService("000018f0-0000-1000-8000-00805f9b34fb");
      const characteristics = await service?.getCharacteristics();
      
      // Usually the first characteristic with 'write' property is the one
      this.characteristic = characteristics?.find(c => c.properties.write) || null;

      return !!this.characteristic;
    } catch (error) {
      console.error("Bluetooth Connection Error:", error);
      return false;
    }
  }

  async print(data: Uint8Array): Promise<boolean> {
    if (!this.characteristic) {
      console.warn("Printer not connected");
      return false;
    }

    try {
      // Chia nhỏ gói tin thành 20 bytes (BLE limit để tránh rụng kết nối)
      const chunkSize = 20;
      for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);
        
        // Tối ưu cực mạnh cho máy in PT-210: Gửi dữ liệu không chờ phản hồi giúp in nhanh gấp 5-10 lần
        if (typeof (this.characteristic as any).writeValueWithoutResponse === "function") {
          await (this.characteristic as any).writeValueWithoutResponse(chunk);
        } else {
          await this.characteristic.writeValue(chunk);
        }
      }
      return true;
    } catch (error) {
      console.error("Print Error:", error);
      return false;
    }
  }

  async disconnect() {
    if (this.device?.gatt?.connected) {
      this.device.gatt.disconnect();
    }
    this.characteristic = null;
    this.device = null;
  }

  isConnected(): boolean {
    return !!this.characteristic && (this.device?.gatt?.connected || false);
  }
}

export const printerService = new PrinterService();
