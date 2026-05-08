"use client";

import React from "react";
import { WifiOff } from "lucide-react";

export function OfflinePlaceholder() {
  return (
    <div className="p-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center space-y-4 bg-muted/30">
      <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
        <WifiOff size={32} />
      </div>
      <div>
        <h3 className="text-lg font-semibold">Bạn đang ngoại tuyến</h3>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
          Một số tính năng có thể không hoạt động. Dữ liệu của bạn sẽ được đồng bộ hóa khi có kết nối trở lại.
        </p>
      </div>
    </div>
  );
}
