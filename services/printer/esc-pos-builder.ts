/**
 * ESC/POS Command Builder for 58mm Thermal Printers
 * Supports basic text formatting, alignment, and paper cutting.
 */
export class EscPosBuilder {
  private encoder = new TextEncoder();
  private buffer: Uint8Array[] = [];

  private static readonly COMMANDS = {
    RESET: new Uint8Array([0x1B, 0x40]),
    ALIGN_LEFT: new Uint8Array([0x1B, 0x61, 0x00]),
    ALIGN_CENTER: new Uint8Array([0x1B, 0x61, 0x01]),
    ALIGN_RIGHT: new Uint8Array([0x1B, 0x61, 0x02]),
    BOLD_ON: new Uint8Array([0x1B, 0x45, 0x01]),
    BOLD_OFF: new Uint8Array([0x1B, 0x45, 0x00]),
    DOUBLE_HEIGHT_ON: new Uint8Array([0x1B, 0x21, 0x10]),
    DOUBLE_WIDTH_ON: new Uint8Array([0x1B, 0x21, 0x20]),
    DOUBLE_SIZE_ON: new Uint8Array([0x1B, 0x21, 0x30]),
    SIZE_NORMAL: new Uint8Array([0x1B, 0x21, 0x00]),
    CUT: new Uint8Array([0x1D, 0x56, 0x41, 0x03]),
    LINE_FEED: new Uint8Array([0x0A]),
  };

  constructor() {
    this.buffer.push(EscPosBuilder.COMMANDS.RESET);
  }

  text(content: string): this {
    // Basic Vietnamese accent removal for simple thermal printers if needed, 
    // but modern ones might support UTF-8/TCVN3. 
    // For now, we'll send UTF-8 and assume the printer handles it or the user will configure encoding.
    this.buffer.push(this.encoder.encode(content));
    return this;
  }

  line(content: string = ""): this {
    this.text(content + "\n");
    return this;
  }

  bold(on: boolean = true): this {
    this.buffer.push(on ? EscPosBuilder.COMMANDS.BOLD_ON : EscPosBuilder.COMMANDS.BOLD_OFF);
    return this;
  }

  align(type: "left" | "center" | "right"): this {
    const cmd = type === "center" ? EscPosBuilder.COMMANDS.ALIGN_CENTER : 
                type === "right" ? EscPosBuilder.COMMANDS.ALIGN_RIGHT : 
                EscPosBuilder.COMMANDS.ALIGN_LEFT;
    this.buffer.push(cmd);
    return this;
  }

  size(type: "normal" | "double"): this {
    this.buffer.push(type === "double" ? EscPosBuilder.COMMANDS.DOUBLE_SIZE_ON : EscPosBuilder.COMMANDS.SIZE_NORMAL);
    return this;
  }

  separator(): this {
    this.line("--------------------------------");
    return this;
  }

  feed(lines: number = 3): this {
    for (let i = 0; i < lines; i++) {
      this.buffer.push(EscPosBuilder.COMMANDS.LINE_FEED);
    }
    return this;
  }

  cut(): this {
    this.buffer.push(EscPosBuilder.COMMANDS.CUT);
    return this;
  }

  build(): Uint8Array {
    const totalLength = this.buffer.reduce((acc, curr) => acc + curr.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const arr of this.buffer) {
      result.set(arr, offset);
      offset += arr.length;
    }
    return result;
  }
}
