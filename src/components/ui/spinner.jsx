import { cn } from "@/lib/utils"
import { Loader2Icon } from "lucide-react"

const sizeMap = {
  sm: "size-3",
  md: "size-4",
  lg: "size-8",
}

function Spinner({ className, size = "md", ...props }) {
  const sizeClass = sizeMap[size] || sizeMap.md
  return (
    <Loader2Icon
      role="status"
      aria-label="Loading"
      className={cn(sizeClass, "animate-spin", className)}
      {...props}
    />
  )
}

export { Spinner }
