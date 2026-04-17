"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle, 
  ShieldQuestion,
  ArrowUpDown,
  ExternalLink,
  MapPin,
  Smartphone,
  Clock,
  Download
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { getTransactions } from "@/lib/api"
import { useComingSoonFeatures } from "@/hooks/use-coming-soon"
import { ComingSoonDialog } from "@/components/ui/coming-soon-dialog"
import type { Transaction } from "@/lib/api"

const getRiskColor = (level: string) => {
  switch (level) {
    case "low": return "bg-primary text-primary-foreground"
    case "medium": return "bg-warning text-warning-foreground"
    case "high": return "bg-chart-4 text-foreground"
    case "critical": return "bg-destructive text-destructive-foreground"
    default: return ""
  }
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "approved": return <Badge className="bg-primary/20 text-primary border-primary/30">Approved</Badge>
    case "blocked": return <Badge className="bg-destructive/20 text-destructive border-destructive/30">Blocked</Badge>
    case "pending": return <Badge className="bg-warning/20 text-warning border-warning/30">Pending</Badge>
    case "flagged": return <Badge className="bg-chart-4/20 text-chart-4 border-chart-4/30">Flagged</Badge>
    default: return null
  }
}

export function TransactionsTab() {
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [riskFilter, setRiskFilter] = useState<string>("all")

  const { showComingSoon, getComingSoonProps } = useComingSoonFeatures()

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const data = await getTransactions()
        setAllTransactions(data)
      } catch (error) {
        console.error("Failed to fetch transactions:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredTransactions = allTransactions.filter(txn => {
    const matchesSearch = txn.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         txn.userId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         txn.merchant.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || txn.status === statusFilter
    const matchesRisk = riskFilter === "all" || txn.riskLevel === riskFilter
    return matchesSearch && matchesStatus && matchesRisk
  })

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold text-warning">12</p>
              </div>
              <ShieldQuestion className="h-8 w-8 text-warning/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approved Today</p>
                <p className="text-2xl font-bold text-primary">1,847</p>
              </div>
              <CheckCircle className="h-8 w-8 text-primary/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Blocked Today</p>
                <p className="text-2xl font-bold text-destructive">23</p>
              </div>
              <XCircle className="h-8 w-8 text-destructive/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Risk Score</p>
                <p className="text-2xl font-bold">34.2</p>
              </div>
              <ArrowUpDown className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Transaction Monitor</CardTitle>
          <CardDescription>Real-time transaction analysis and decision management</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by ID, user, or merchant..."
                className="pl-9 bg-secondary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 bg-secondary">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="flagged">Flagged</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger className="w-40 bg-secondary">
                <SelectValue placeholder="Risk Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risks</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline"
              onClick={() => showComingSoon('export')}
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>

          {/* Transaction Table */}
          <div className="rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Transaction ID</TableHead>
                  <TableHead className="text-muted-foreground">User</TableHead>
                  <TableHead className="text-muted-foreground">Amount</TableHead>
                  <TableHead className="text-muted-foreground">Merchant</TableHead>
                  <TableHead className="text-muted-foreground">Risk Score</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground">Time</TableHead>
                  <TableHead className="text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((txn) => (
                  <TableRow key={txn.id} className="hover:bg-secondary/50">
                    <TableCell className="font-mono text-sm">{txn.id}</TableCell>
                    <TableCell className="font-mono text-sm">{txn.userId}</TableCell>
                    <TableCell className="font-medium">${txn.amount.toLocaleString()}</TableCell>
                    <TableCell className="max-w-[150px] truncate">{txn.merchant}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={txn.riskScore} 
                          className="h-2 w-16 bg-secondary"
                        />
                        <Badge className={`text-xs ${getRiskColor(txn.riskLevel)}`}>
                          {txn.riskScore}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(txn.status)}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {txn.timestamp.split(" ")[1]}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              Transaction Details
                              <Badge className={getRiskColor(txn.riskLevel)}>
                                Risk: {txn.riskScore}
                              </Badge>
                            </DialogTitle>
                            <DialogDescription>
                              {txn.id} - {txn.timestamp}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">User ID</p>
                                <p className="font-mono">{txn.userId}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Amount</p>
                                <p className="font-bold text-lg">${txn.amount.toLocaleString()}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <MapPin className="h-3 w-3" /> Location
                                </p>
                                <p>{txn.location}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Smartphone className="h-3 w-3" /> Device
                                </p>
                                <p>{txn.device}</p>
                              </div>
                            </div>
                            
                            {txn.factors.length > 0 && (
                              <div className="space-y-2">
                                <p className="text-sm font-medium">Risk Factors</p>
                                <div className="flex flex-wrap gap-2">
                                  {txn.factors.map((factor, i) => (
                                    <Badge key={i} variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
                                      {factor}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="flex gap-2 pt-4 border-t border-border">
                              <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Approve
                              </Button>
                              <Button variant="outline" className="flex-1">
                                <ShieldQuestion className="mr-2 h-4 w-4" />
                                Request MFA
                              </Button>
                              <Button variant="destructive" className="flex-1">
                                <XCircle className="mr-2 h-4 w-4" />
                                Block
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Coming Soon Dialogs */}
      <ComingSoonDialog
        {...getComingSoonProps('export')}
        feature="Export Transactions"
        description="Download transaction data in multiple formats (CSV, Excel, PDF) with advanced filtering options."
        estimatedDate="Q1 2024"
      />
    </div>
  )
}
