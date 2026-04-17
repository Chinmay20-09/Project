"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard/header"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { OverviewTab } from "@/components/dashboard/tabs/overview-tab"
import { TransactionsTab } from "@/components/dashboard/tabs/transactions-tab"
import { UserProfilesTab } from "@/components/dashboard/tabs/user-profiles-tab"
import { AlertsTab } from "@/components/dashboard/tabs/alerts-tab"
import { FraudChainsTab } from "@/components/dashboard/tabs/fraud-chains-tab"
import { SettingsTab } from "@/components/dashboard/tabs/settings-tab"

export type TabType = "overview" | "transactions" | "profiles" | "alerts" | "chains" | "settings"

export default function FraudDetectionDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("overview")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const renderTab = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab />
      case "transactions":
        return <TransactionsTab />
      case "profiles":
        return <UserProfilesTab />
      case "alerts":
        return <AlertsTab />
      case "chains":
        return <FraudChainsTab />
      case "settings":
        return <SettingsTab />
      default:
        return <OverviewTab />
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader activeTab={activeTab} />
        <main className="flex-1 overflow-auto p-6">
          {renderTab()}
        </main>
      </div>
    </div>
  )
}
