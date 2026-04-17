"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Clock, Sparkles } from "lucide-react"

export interface ComingSoonDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  feature?: string
  description?: string
  estimatedDate?: string
}

export function ComingSoonDialog({
  open,
  onOpenChange,
  feature = "This Feature",
  description = "We're working hard to bring this feature to you soon.",
  estimatedDate,
}: ComingSoonDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle>Coming Soon</DialogTitle>
          </div>
          <DialogDescription className="mt-3">
            <span className="font-semibold text-foreground">{feature}</span> is not yet available, but we&apos;re excited to bring it to you soon!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {description}
          </p>

          {estimatedDate && (
            <div className="flex items-center gap-2 rounded-lg bg-muted p-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm">
                <p className="font-medium text-foreground">Estimated availability</p>
                <p className="text-muted-foreground">{estimatedDate}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Got it
          </Button>
          <Button 
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Notify me
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
