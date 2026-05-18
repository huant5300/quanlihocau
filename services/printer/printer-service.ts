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
    
    builder
      .align("center")
      .size("double")
      .line("HO CAU SAAS")
      .size("normal")
      .line("Dich vu giai tri & Thu gian")
      .separator()
      .align("left")
      .line(`Hoa don: ${bill.sessionId}`)
      .line(`Choi: ${bill.hutNumber}`)
      .line(`Khach: ${bill.customerName}`)
      .separator()
      .line("Noi dung          SL   Thanh tien")
      .line(`Goi cau           1    ${bill.sessionFee.toLocaleString()}`)
      
    bill.products.forEach((p: any) => {
      const pName = p.name || "Sản phẩm";
      builder.line(`${pName.padEnd(16)} ${p.quantity}    ${(p.price * p.quantity).toLocaleString()}`);
    });

    if (bill.buybackDeduction > 0) {
      builder
        .separator()
        .line(`Khau tru ca:      -${bill.buybackDeduction.toLocaleString()}`);
    }

    builder
      .separator()
      .bold()
      .size("double")
      .align("right")
      .line(`TONG: ${bill.totalAmount.toLocaleString()}d`)
      .size("normal")
      .bold(false)
      .feed(2)
      .align("center")
      .line("Cam on Quy khach!")
      .line("Hen gap lai!")
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
      // Send data in chunks of 20 bytes (BLE limit for some devices)
      const chunkSize = 20;
      for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);
        await this.characteristic.writeValue(chunk);
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
