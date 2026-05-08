"use client";

import { toast } from "sonner";

export class PrinterService {
  private static device: BluetoothDevice | null = null;
  private static characteristic: BluetoothRemoteGATTCharacteristic | null = null;

  /**
   * Connect to a Bluetooth Thermal Printer
   */
  static async connect() {
    try {
      if (!navigator.bluetooth) {
        throw new Error("Trình duyệt không hỗ trợ Bluetooth.");
      }

      this.device = await navigator.bluetooth.requestDevice({
        filters: [{ services: ["000018f0-0000-1000-8000-00805f9b34fb"] }], // Standard SPP UUID
        optionalServices: ["000018f0-0000-1000-8000-00805f9b34fb"]
      });

      const server = await this.device.gatt?.connect();
      const service = await server?.getPrimaryService("000018f0-0000-1000-8000-00805f9b34fb");
      this.characteristic = (await service?.getCharacteristics())?.[0] || null;

      toast.success("Đã kết nối máy in Bluetooth!");
      return true;
    } catch (error: any) {
      console.error("Printer connection failed:", error);
      toast.error(`Không thể kết nối máy in: ${error.message}`);
      return false;
    }
  }

  /**
   * Print raw ESC/POS commands
   */
  static async printRaw(data: Uint8Array) {
    if (!this.characteristic) {
      const connected = await this.connect();
      if (!connected) return;
    }

    try {
      // Split data into chunks as Bluetooth has limit (usually 20-512 bytes)
      const chunkSize = 20;
      for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);
        await this.characteristic?.writeValue(chunk);
      }
    } catch (error: any) {
      toast.error("Lỗi khi in dữ liệu.");
      this.characteristic = null; // Reset for retry
    }
  }

  /**
   * ESC/POS Template Generators
   */
  static generateReceipt(data: any, type: "TICKET" | "INVOICE") {
    const encoder = new TextEncoder();
    const esc = {
      init: [0x1b, 0x40],
      center: [0x1b, 0x61, 0x01],
      left: [0x1b, 0x61, 0x00],
      boldOn: [0x1b, 0x45, 0x01],
      boldOff: [0x1b, 0x45, 0x00],
      feed: [0x0a, 0x0a, 0x0a],
      cut: [0x1d, 0x56, 0x41, 0x03],
    };

    let commands: number[] = [...esc.init, ...esc.center, ...esc.boldOn];
    
    // Header
    commands.push(...Array.from(encoder.encode("FISHING PARADISE\n")));
    commands.push(...esc.boldOff);
    commands.push(...Array.from(encoder.encode("123 Duong ven song, Q7\n")));
    commands.push(...Array.from(encoder.encode("--------------------------------\n")));

    // Content
    commands.push(...esc.left);
    if (type === "TICKET") {
      commands.push(...Array.from(encoder.encode(`CHOI: ${data.hut_number}\n`)));
      commands.push(...Array.from(encoder.encode(`KHACH: ${data.customer_name}\n`)));
      commands.push(...Array.from(encoder.encode(`BAT DAU: ${new Date().toLocaleTimeString()}\n`)));
    } else {
      commands.push(...Array.from(encoder.encode(`HOA DON: ${data.id}\n`)));
      commands.push(...Array.from(encoder.encode(`TONG TIEN: ${data.total.toLocaleString()}d\n`)));
    }

    commands.push(...Array.from(encoder.encode("--------------------------------\n")));
    commands.push(...esc.center);
    commands.push(...Array.from(encoder.encode("Cam on quy khach!\n")));
    
    commands.push(...esc.feed, ...esc.cut);

    return new Uint8Array(commands);
  }

  static async printTicket(data: any) {
    const commands = this.generateReceipt(data, "TICKET");
    await this.printRaw(commands);
  }

  static async printInvoice(data: any) {
    const commands = this.generateReceipt(data, "INVOICE");
    await this.printRaw(commands);
  }
}
