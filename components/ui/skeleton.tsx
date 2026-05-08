import { cn } from "@/utils/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-2xl bg-muted/50 shadow-inner", className)}
      {...props}
    />
  )
}

export { Skeleton }
