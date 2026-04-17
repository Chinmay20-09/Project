"use client"

import { ReactNode, useState } from "react"
import { ComingSoonDialog, ComingSoonDialogProps } from "@/components/ui/coming-soon-dialog"

export interface ComingSoonButtonProps {
  children: ReactNode
  feature: string
  description?: string
  estimatedDate?: string
  onClick?: (e: React.MouseEvent) => void
  disabled?: boolean
  className?: string
  asChild?: boolean
}

/**
 * Wrapper component that shows "Coming Soon" dialog when clicked
 * Replaces the normal onClick functionality
 * 
 * Usage:
 * <ComingSoonButton feature="Advanced Analytics" description="Track detailed metrics">
 *   <Button>Analytics</Button>
 * </ComingSoonButton>
 */
export function ComingSoonButton({
  children,
  feature,
  description,
  estimatedDate,
  onClick,
  disabled,
  className,
  asChild = false,
}: ComingSoonButtonProps) {
  const [open, setOpen] = useState(false)

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onClick?.(e)
    setOpen(true)
  }

  return (
    <>
      <div
        onClick={handleClick}
        className={disabled ? "opacity-50 cursor-not-allowed" : ""}
        role={asChild ? "presentation" : undefined}
      >
        {children}
      </div>
      <ComingSoonDialog
        open={open}
        onOpenChange={setOpen}
        feature={feature}
        description={description}
        estimatedDate={estimatedDate}
      />
    </>
  )
}

/**
 * Alternative: Higher-order hook for making any button a "Coming Soon" button
 * Usage:
 * const handleComingSoon = useComingSoonClickHandler(
 *   "Advanced Analytics",
 *   "Track detailed metrics",
 *   "Q3 2024"
 * )
 * <button onClick={handleComingSoon}>Analytics</button>
 */
export function useComingSoonClickHandler(
  feature: string,
  description?: string,
  estimatedDate?: string
) {
  const [open, setOpen] = useState(false)

  const handleClick = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    setOpen(true)
  }

  return {
    handleClick,
    DialogNode: (
      <ComingSoonDialog
        open={open}
        onOpenChange={setOpen}
        feature={feature}
        description={description}
        estimatedDate={estimatedDate}
      />
    ),
  }
}
