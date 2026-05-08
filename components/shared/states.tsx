"use client";

import React from "react";
import { FolderOpen, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  title = "Không có dữ liệu",
  description = "Hiện tại chưa có thông tin nào để hiển thị.",
  icon = <FolderOpen size={48} />,
  actionLabel,
  onAction
}: EmptyStateProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center p-12 text-center bg-muted/10 border-2 border-dashed rounded-[3rem] space-y-4"
    >
      <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center text-muted-foreground/50">
        {icon}
      </div>
      <div className="space-y-1">
        <h3 className="text-xl font-black">{title}</h3>
        <p className="text-sm text-muted-foreground font-medium max-w-[250px] mx-auto">{description}</p>
      </div>
      {actionLabel && onAction && (
        <Button variant="pos" onClick={onAction} className="mt-2">
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
}

export function ErrorState({
  title = "Đã có lỗi xảy ra",
  description = "Chúng tôi không thể tải dữ liệu lúc này. Vui lòng thử lại.",
  onRetry
}: { title?: string; description?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-destructive/5 border-2 border-destructive/20 rounded-[3rem] space-y-4">
      <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center">
        <RefreshCcw size={32} />
      </div>
      <div className="space-y-1">
        <h3 className="text-xl font-black text-destructive">{title}</h3>
        <p className="text-sm text-muted-foreground font-medium">{description}</p>
      </div>
      {onRetry && (
        <Button variant="destructive" onClick={onRetry} className="mt-2">
          Thử lại ngay
        </Button>
      )}
    </div>
  );
}
