"use client"

import { useState } from "react"

export interface ComingSoonFeature {
  name: string
  description?: string
  estimatedDate?: string
}

export function useComingSoon(feature: ComingSoonFeature) {
  const [open, setOpen] = useState(false)

  const showDialog = () => setOpen(true)
  const hideDialog = () => setOpen(false)

  return {
    open,
    setOpen,
    showDialog,
    hideDialog,
    featureName: feature.name,
    featureDescription: feature.description,
    estimatedDate: feature.estimatedDate,
  }
}

/**
 * Hook for managing multiple coming soon features
 * Usage:
 * const { openDialogs, showComingSoon, getComingSoonProps } = useComingSoonFeatures()
 * then for a button: onClick={() => showComingSoon('feature-id')}
 */
export function useComingSoonFeatures() {
  const [openDialogs, setOpenDialogs] = useState<Record<string, boolean>>({})

  const showComingSoon = (featureId: string) => {
    setOpenDialogs(prev => ({ ...prev, [featureId]: true }))
  }

  const hideComingSoon = (featureId: string) => {
    setOpenDialogs(prev => ({ ...prev, [featureId]: false }))
  }

  const getComingSoonProps = (featureId: string) => ({
    open: openDialogs[featureId] ?? false,
    onOpenChange: (open: boolean) => {
      setOpenDialogs(prev => ({ ...prev, [featureId]: open }))
    },
  })

  return {
    openDialogs,
    showComingSoon,
    hideComingSoon,
    getComingSoonProps,
  }
}
