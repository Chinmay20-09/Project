"use client"

import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  Users, 
  Bell, 
  Network, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { TabType } from "@/app/page"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface DashboardSidebarProps {
  activeTab: TabType
  setActiveTab: (tab: TabType) => void
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
}

const navItems = [
  { id: "overview" as const, label: "Overview", icon: LayoutDashboard },
  { id: "transactions" as const, label: "Transactions", icon: ArrowLeftRight },
  { id: "profiles" as const, label: "User Profiles", icon: Users },
  { id: "alerts" as const, label: "Alerts", icon: Bell },
  { id: "chains" as const, label: "Fraud Chains", icon: Network },
  { id: "settings" as const, label: "Settings", icon: Settings },
]

export function DashboardSidebar({ activeTab, setActiveTab, collapsed, setCollapsed }: DashboardSidebarProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <aside className={cn(
        "flex flex-col border-r border-border bg-sidebar transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}>
        <div className={cn(
          "flex h-16 items-center border-b border-sidebar-border px-4",
          collapsed ? "justify-center" : "gap-3"
        )}>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-sidebar-foreground">FraudShield</span>
              <span className="text-xs text-muted-foreground">Detection System</span>
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-1 p-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id

            if (collapsed) {
              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setActiveTab(item.id)}
                      className={cn(
                        "flex w-full items-center justify-center rounded-md p-3 transition-colors",
                        isActive 
                          ? "bg-sidebar-accent text-sidebar-primary" 
                          : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              )
            }

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
                  isActive 
                    ? "bg-sidebar-accent text-sidebar-primary font-medium" 
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="border-t border-sidebar-border p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "w-full text-muted-foreground hover:text-sidebar-foreground",
              collapsed ? "justify-center" : "justify-start"
            )}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 mr-2" />
                <span>Collapse</span>
              </>
            )}
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  )
}
