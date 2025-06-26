import type React from "react"
import { cn } from "@/lib/utils"

interface PageContainerProps {
  children: React.ReactNode
  className?: string
}

export default function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div className={cn("h-full overflow-auto", className)}>
      <div className="container mx-auto py-6 px-4 space-y-6">{children}</div>
    </div>
  )
}
