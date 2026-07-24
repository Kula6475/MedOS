import * as React from "react"

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

type DataTableFrameProps = React.ComponentProps<typeof Card> & {
  title?: string
  description?: string
  action?: React.ReactNode
  contentClassName?: string
}

function DataTableFrame({
  title,
  description,
  action,
  children,
  className,
  contentClassName,
  ...props
}: DataTableFrameProps) {
  return (
    <Card className={cn("gap-0", className)} {...props}>
      {(title || description || action) && (
        <CardHeader className="border-b pb-4">
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
          {action && <CardAction>{action}</CardAction>}
        </CardHeader>
      )}
      <CardContent className={cn("px-0", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  )
}

export { DataTableFrame }
