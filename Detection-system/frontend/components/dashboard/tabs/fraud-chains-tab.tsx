"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Network, 
  Search, 
  Users, 
  AlertTriangle, 
  Link2, 
  ArrowRight,
  MapPin,
  Smartphone,
  DollarSign,
  Eye,
  ZoomIn,
  ZoomOut,
  Maximize2
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface FraudChain {
  id: string
  name: string
  type: "account_takeover" | "money_laundering" | "synthetic_identity" | "card_fraud"
  nodesCount: number
  connectionCount: number
  totalAmount: number
  riskLevel: "critical" | "high" | "medium"
  detectedAt: string
  status: "active" | "investigating" | "contained"
  accounts: {
    id: string
    name: string
    role: "source" | "intermediate" | "destination"
    riskScore: number
  }[]
  connections: {
    from: string
    to: string
    type: string
    amount?: number
  }[]
}

const fraudChains: FraudChain[] = [
  {
    id: "FC-001",
    name: "International Wire Ring",
    type: "money_laundering",
    nodesCount: 8,
    connectionCount: 12,
    totalAmount: 245000,
    riskLevel: "critical",
    detectedAt: "2024-01-15 10:32:00",
    status: "active",
    accounts: [
      { id: "USR-4521", name: "James Wilson", role: "source", riskScore: 92 },
      { id: "USR-8832", name: "Sarah Chen", role: "intermediate", riskScore: 78 },
      { id: "USR-2291", name: "Michael Brown", role: "intermediate", riskScore: 65 },
      { id: "USR-EXT1", name: "External Account", role: "destination", riskScore: 95 },
    ],
    connections: [
      { from: "USR-4521", to: "USR-8832", type: "wire_transfer", amount: 12500 },
      { from: "USR-8832", to: "USR-2291", type: "wire_transfer", amount: 11000 },
      { from: "USR-2291", to: "USR-EXT1", type: "wire_transfer", amount: 10500 },
    ]
  },
  {
    id: "FC-002",
    name: "Account Takeover Cluster",
    type: "account_takeover",
    nodesCount: 5,
    connectionCount: 8,
    totalAmount: 67500,
    riskLevel: "high",
    detectedAt: "2024-01-15 08:15:00",
    status: "investigating",
    accounts: [
      { id: "USR-7724", name: "David Lee", role: "source", riskScore: 88 },
      { id: "USR-3356", name: "Lisa Wang", role: "intermediate", riskScore: 72 },
      { id: "USR-9912", name: "Tom Harris", role: "destination", riskScore: 85 },
    ],
    connections: [
      { from: "USR-7724", to: "USR-3356", type: "shared_device" },
      { from: "USR-3356", to: "USR-9912", type: "same_ip", amount: 5200 },
    ]
  },
  {
    id: "FC-003",
    name: "Synthetic Identity Network",
    type: "synthetic_identity",
    nodesCount: 12,
    connectionCount: 18,
    totalAmount: 156000,
    riskLevel: "critical",
    detectedAt: "2024-01-14 22:45:00",
    status: "contained",
    accounts: [
      { id: "USR-SYN1", name: "Synthetic Account 1", role: "source", riskScore: 98 },
      { id: "USR-SYN2", name: "Synthetic Account 2", role: "intermediate", riskScore: 96 },
      { id: "USR-SYN3", name: "Synthetic Account 3", role: "destination", riskScore: 94 },
    ],
    connections: [
      { from: "USR-SYN1", to: "USR-SYN2", type: "shared_ssn" },
      { from: "USR-SYN2", to: "USR-SYN3", type: "linked_address" },
    ]
  },
]

const getTypeLabel = (type: FraudChain["type"]) => {
  switch (type) {
    case "account_takeover": return "Account Takeover"
    case "money_laundering": return "Money Laundering"
    case "synthetic_identity": return "Synthetic Identity"
    case "card_fraud": return "Card Fraud"
  }
}

const getRiskColor = (level: FraudChain["riskLevel"]) => {
  switch (level) {
    case "critical": return "bg-destructive text-destructive-foreground"
    case "high": return "bg-chart-4 text-foreground"
    case "medium": return "bg-warning text-warning-foreground"
  }
}

const getStatusBadge = (status: FraudChain["status"]) => {
  switch (status) {
    case "active": return <Badge className="bg-destructive/20 text-destructive border-destructive/30">Active</Badge>
    case "investigating": return <Badge className="bg-warning/20 text-warning border-warning/30">Investigating</Badge>
    case "contained": return <Badge className="bg-primary/20 text-primary border-primary/30">Contained</Badge>
  }
}

export function FraudChainsTab() {
  const [selectedChain, setSelectedChain] = useState<FraudChain | null>(fraudChains[0])
  const [searchQuery, setSearchQuery] = useState("")

  const chainStats = {
    total: fraudChains.length,
    active: fraudChains.filter(c => c.status === "active").length,
    totalAmount: fraudChains.reduce((sum, c) => sum + c.totalAmount, 0),
    totalNodes: fraudChains.reduce((sum, c) => sum + c.nodesCount, 0),
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Detected Chains</p>
                <p className="text-2xl font-bold">{chainStats.total}</p>
              </div>
              <Network className="h-8 w-8 text-primary/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Threats</p>
                <p className="text-2xl font-bold text-destructive">{chainStats.active}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Exposure</p>
                <p className="text-2xl font-bold">${chainStats.totalAmount.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-warning/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Linked Accounts</p>
                <p className="text-2xl font-bold">{chainStats.totalNodes}</p>
              </div>
              <Users className="h-8 w-8 text-info/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Chain List */}
        <Card className="bg-card border-border lg:col-span-1">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Fraud Chains</CardTitle>
            <CardDescription>Detected fraud networks and rings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search chains..."
                className="pl-9 bg-secondary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              {fraudChains.map((chain) => (
                <button
                  key={chain.id}
                  onClick={() => setSelectedChain(chain)}
                  className={`w-full rounded-lg border p-4 text-left transition-colors ${
                    selectedChain?.id === chain.id 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:bg-secondary/50"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${getRiskColor(chain.riskLevel)}`} />
                      <span className="font-medium text-sm">{chain.name}</span>
                    </div>
                    {getStatusBadge(chain.status)}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {chain.nodesCount} nodes
                    </span>
                    <span className="flex items-center gap-1">
                      <Link2 className="h-3 w-3" />
                      {chain.connectionCount} links
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <Badge variant="outline" className="text-xs">
                      {getTypeLabel(chain.type)}
                    </Badge>
                    <span className="font-medium">${chain.totalAmount.toLocaleString()}</span>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chain Visualization */}
        <Card className="bg-card border-border lg:col-span-2">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Network Visualization</CardTitle>
                <CardDescription>
                  {selectedChain ? selectedChain.name : "Select a chain to view"}
                </CardDescription>
              </div>
              {selectedChain && (
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon">
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {selectedChain ? (
              <div className="space-y-6">
                {/* Simple Network Diagram */}
                <div className="relative rounded-lg bg-secondary/30 p-8 min-h-[300px]">
                  <div className="flex items-center justify-center gap-8">
                    {selectedChain.accounts.map((account, index) => (
                      <div key={account.id} className="flex items-center gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`h-16 w-16 rounded-full flex items-center justify-center border-2 ${
                            account.role === "source" 
                              ? "border-destructive bg-destructive/20" 
                              : account.role === "destination"
                              ? "border-warning bg-warning/20"
                              : "border-info bg-info/20"
                          }`}>
                            <Users className="h-6 w-6" />
                          </div>
                          <div className="mt-2 text-center">
                            <p className="text-xs font-mono">{account.id}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[80px]">
                              {account.name}
                            </p>
                            <Badge variant="outline" className="mt-1 text-xs">
                              Risk: {account.riskScore}
                            </Badge>
                          </div>
                        </div>
                        {index < selectedChain.accounts.length - 1 && (
                          <div className="flex flex-col items-center">
                            <ArrowRight className="h-6 w-6 text-muted-foreground" />
                            {selectedChain.connections[index] && (
                              <span className="text-xs text-muted-foreground mt-1">
                                {selectedChain.connections[index].amount 
                                  ? `$${selectedChain.connections[index].amount?.toLocaleString()}`
                                  : selectedChain.connections[index].type.replace("_", " ")
                                }
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* Legend */}
                  <div className="absolute bottom-4 left-4 flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <span className="h-3 w-3 rounded-full border-2 border-destructive bg-destructive/20" />
                      <span className="text-muted-foreground">Source</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="h-3 w-3 rounded-full border-2 border-info bg-info/20" />
                      <span className="text-muted-foreground">Intermediate</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="h-3 w-3 rounded-full border-2 border-warning bg-warning/20" />
                      <span className="text-muted-foreground">Destination</span>
                    </div>
                  </div>
                </div>

                {/* Chain Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-secondary/50 p-4">
                    <h4 className="text-sm font-medium mb-3">Chain Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Chain ID</span>
                        <span className="font-mono">{selectedChain.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type</span>
                        <span>{getTypeLabel(selectedChain.type)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Detected</span>
                        <span>{selectedChain.detectedAt}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Exposure</span>
                        <span className="font-bold">${selectedChain.totalAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg bg-secondary/50 p-4">
                    <h4 className="text-sm font-medium mb-3">Actions</h4>
                    <div className="space-y-2">
                      <Button className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90" size="sm">
                        Block All Accounts
                      </Button>
                      <Button variant="outline" className="w-full" size="sm">
                        Export Report
                      </Button>
                      <Button variant="outline" className="w-full" size="sm">
                        Assign Investigator
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Connection Details */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Connection Details</h4>
                  {selectedChain.connections.map((conn, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border border-border p-3">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm">{conn.from}</span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <span className="font-mono text-sm">{conn.to}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{conn.type.replace("_", " ")}</Badge>
                        {conn.amount && (
                          <span className="font-medium">${conn.amount.toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex h-[400px] items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Network className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a fraud chain to view the network visualization</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
