import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function PageHeader({ title, description, action, onAction, icon: Icon = Plus, extra }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      <div className="flex items-center gap-2">
        {extra}
        {action && (
          <Button onClick={onAction}>
            <Icon className="mr-2 h-4 w-4" />
            {action}
          </Button>
        )}
      </div>
    </div>
  )
}
