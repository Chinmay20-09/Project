"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
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
  AlertTriangle, 
  Bell, 
  CheckCircle, 
  Clock, 
  Eye, 
  Filter, 
  Search,
  XCircle,
  User,
  DollarSign,
  MapPin,
  ArrowRight,
  MessageSquare
} from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { getAlerts, updateAlertStatus } from "@/lib/api"
import type { Alert } from "@/lib/api"

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "critical": return "bg-destructive text-destructive-foreground"
    case "high": return "bg-chart-4 text-foreground"
    case "medium": return "bg-warning text-warning-foreground"
    case "low": return "bg-info text-info-foreground"
    default: return ""
  }
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "open": return <Badge className="bg-destructive/20 text-destructive border-destructive/30">Open</Badge>
    case "investigating": return <Badge className="bg-warning/20 text-warning border-warning/30">Investigating</Badge>
    case "resolved": return <Badge className="bg-primary/20 text-primary border-primary/30">Resolved</Badge>
    case "dismissed": return <Badge className="bg-muted text-muted-foreground">Dismissed</Badge>
    default: return null
  }
}

export function AlertsTab() {
  const [allAlerts, setAllAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [severityFilter, setSeverityFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedAlerts, setSelectedAlerts] = useState<string[]>([])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const data = await getAlerts()
        setAllAlerts(data)
      } catch (error) {
        console.error("Failed to fetch alerts:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredAlerts = allAlerts.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         alert.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         alert.userId.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSeverity = severityFilter === "all" || alert.severity === severityFilter
    const matchesStatus = statusFilter === "all" || alert.status === statusFilter
    return matchesSearch && matchesSeverity && matchesStatus
  })

  const toggleAlert = (id: string) => {
    setSelectedAlerts(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    )
  }

  const alertCounts = {
    critical: allAlerts.filter(a => a.severity === "critical" && a.status !== "resolved").length,
    high: allAlerts.filter(a => a.severity === "high" && a.status !== "resolved").length,
    medium: allAlerts.filter(a => a.severity === "medium" && a.status !== "resolved").length,
    total: allAlerts.filter(a => a.status !== "resolved").length,
  }

  return (
    <div className="space-y-6">
      {/* Alert Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-card border-border border-l-4 border-l-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critical Alerts</p>
                {loading ? (
                  <Skeleton className="h-8 w-12 mt-2" />
                ) : (
                  <p className="text-3xl font-bold text-destructive">{alertCounts.critical}</p>
                )}
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border border-l-4 border-l-chart-4">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">High Priority</p>
                {loading ? (
                  <Skeleton className="h-8 w-12 mt-2" />
                ) : (
                  <p className="text-3xl font-bold text-chart-4">{alertCounts.high}</p>
                )}
              </div>
              <Bell className="h-8 w-8 text-chart-4/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border border-l-4 border-l-warning">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Medium Priority</p>
                <p className="text-3xl font-bold text-warning">{alertCounts.medium}</p>
              </div>
              <Clock className="h-8 w-8 text-warning/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border border-l-4 border-l-primary">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Open</p>
                <p className="text-3xl font-bold">{alertCounts.total}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-primary/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert List */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Alert Queue</CardTitle>
              <CardDescription>Manage and investigate fraud alerts</CardDescription>
            </div>
            {selectedAlerts.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {selectedAlerts.length} selected
                </span>
                <Button variant="outline" size="sm">
                  Assign
                </Button>
                <Button variant="outline" size="sm">
                  Resolve
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setSelectedAlerts([])}>
                  Clear
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search alerts..."
                className="pl-9 bg-secondary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-40 bg-secondary">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 bg-secondary">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="dismissed">Dismissed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Alert Items */}
          <div className="space-y-3">
            {filteredAlerts.map((alert) => (
              <div 
                key={alert.id}
                className={`rounded-lg border border-border p-4 transition-colors hover:bg-secondary/30 ${
                  selectedAlerts.includes(alert.id) ? "bg-secondary/50" : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  <Checkbox 
                    checked={selectedAlerts.includes(alert.id)}
                    onCheckedChange={() => toggleAlert(alert.id)}
                    className="mt-1"
                  />
                  
                  <div className={`mt-1 h-3 w-3 rounded-full shrink-0 ${getSeverityColor(alert.severity)}`} />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{alert.title}</h4>
                          {getStatusBadge(alert.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">{alert.description}</p>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <div className="flex items-center gap-2">
                              <span className={`h-3 w-3 rounded-full ${getSeverityColor(alert.severity)}`} />
                              <DialogTitle>{alert.title}</DialogTitle>
                            </div>
                            <DialogDescription>
                              {alert.id} - {alert.timestamp}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-6">
                            <p className="text-muted-foreground">{alert.description}</p>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <User className="h-3 w-3" /> User ID
                                </p>
                                <p className="font-mono">{alert.userId}</p>
                              </div>
                              {alert.transactionId && (
                                <div className="space-y-1">
                                  <p className="text-sm text-muted-foreground">Transaction ID</p>
                                  <p className="font-mono">{alert.transactionId}</p>
                                </div>
                              )}
                              {alert.amount && (
                                <div className="space-y-1">
                                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                                    <DollarSign className="h-3 w-3" /> Amount
                                  </p>
                                  <p className="font-bold">${alert.amount.toLocaleString()}</p>
                                </div>
                              )}
                              {alert.location && (
                                <div className="space-y-1">
                                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                                    <MapPin className="h-3 w-3" /> Location
                                  </p>
                                  <p>{alert.location}</p>
                                </div>
                              )}
                            </div>

                            {alert.notes && alert.notes.length > 0 && (
                              <div className="space-y-2">
                                <p className="text-sm font-medium flex items-center gap-1">
                                  <MessageSquare className="h-4 w-4" /> Investigation Notes
                                </p>
                                <div className="space-y-2">
                                  {alert.notes.map((note, i) => (
                                    <div key={i} className="rounded-lg bg-secondary/50 p-3 text-sm">
                                      {note}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="space-y-2">
                              <p className="text-sm font-medium">Add Note</p>
                              <Textarea 
                                placeholder="Add investigation notes..."
                                className="bg-secondary"
                              />
                            </div>

                            <div className="flex gap-2 pt-4 border-t border-border">
                              <Button variant="outline" className="flex-1">
                                <User className="mr-2 h-4 w-4" />
                                Assign to Me
                              </Button>
                              <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Mark Resolved
                              </Button>
                              <Button variant="ghost" className="flex-1">
                                <XCircle className="mr-2 h-4 w-4" />
                                Dismiss
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="font-mono">{alert.id}</span>
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {alert.userId}
                      </span>
                      {alert.amount && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          ${alert.amount.toLocaleString()}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {alert.timestamp.split(" ")[1]}
                      </span>
                      {alert.assignee && (
                        <span className="text-primary">
                          Assigned to: {alert.assignee}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
