"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Search, 
  User, 
  MapPin, 
  Smartphone, 
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Shield,
  Activity,
  Clock,
  DollarSign,
  CreditCard
} from "lucide-react"
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { getUserProfiles } from "@/lib/api"
import type { UserProfile } from "@/lib/api"

const users: UserProfile[] = [
  {
    id: "USR-4521",
    name: "James Wilson",
    email: "j.wilson@email.com",
    riskScore: 87,
    accountAge: "3 months",
    lastLogin: "2 min ago",
    location: "Lagos, Nigeria",
    devices: ["Unknown Device", "Chrome - Windows"],
    transactionCount: 45,
    avgTransaction: 2500,
    totalSpend: 112500,
    anomalyCount: 8,
    status: "flagged"
  },
  {
    id: "USR-8832",
    name: "Sarah Chen",
    email: "s.chen@email.com",
    riskScore: 42,
    accountAge: "2 years",
    lastLogin: "5 min ago",
    location: "Miami, FL",
    devices: ["iPhone 14 Pro", "Safari - MacOS"],
    transactionCount: 234,
    avgTransaction: 450,
    totalSpend: 105300,
    anomalyCount: 2,
    status: "watchlist"
  },
  {
    id: "USR-2291",
    name: "Michael Brown",
    email: "m.brown@email.com",
    riskScore: 15,
    accountAge: "5 years",
    lastLogin: "1 hour ago",
    location: "New York, NY",
    devices: ["Chrome - Windows", "Android Phone"],
    transactionCount: 892,
    avgTransaction: 125,
    totalSpend: 111500,
    anomalyCount: 0,
    status: "normal"
  },
  {
    id: "USR-1105",
    name: "Emily Davis",
    email: "e.davis@email.com",
    riskScore: 8,
    accountAge: "4 years",
    lastLogin: "30 min ago",
    location: "Austin, TX",
    devices: ["Roku TV", "iPhone 13"],
    transactionCount: 567,
    avgTransaction: 89,
    totalSpend: 50463,
    anomalyCount: 0,
    status: "normal"
  },
]

const behaviorData = [
  { time: "Week 1", spending: 2400, baseline: 2000 },
  { time: "Week 2", spending: 2100, baseline: 2000 },
  { time: "Week 3", spending: 3200, baseline: 2000 },
  { time: "Week 4", spending: 5800, baseline: 2000 },
  { time: "Week 5", spending: 8400, baseline: 2000 },
  { time: "Week 6", spending: 12500, baseline: 2000 },
]

const activityData = [
  { hour: "00", transactions: 2 },
  { hour: "04", transactions: 0 },
  { hour: "08", transactions: 5 },
  { hour: "12", transactions: 12 },
  { hour: "16", transactions: 8 },
  { hour: "20", transactions: 15 },
]

const chartConfig = {
  spending: { label: "Actual Spending", color: "var(--color-chart-4)" },
  baseline: { label: "Baseline", color: "var(--color-chart-1)" },
  transactions: { label: "Transactions", color: "var(--color-chart-2)" },
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "normal": return <Badge className="bg-primary/20 text-primary border-primary/30">Normal</Badge>
    case "watchlist": return <Badge className="bg-warning/20 text-warning border-warning/30">Watchlist</Badge>
    case "flagged": return <Badge className="bg-destructive/20 text-destructive border-destructive/30">Flagged</Badge>
    case "blocked": return <Badge className="bg-muted text-muted-foreground">Blocked</Badge>
    default: return null
  }
}

export function UserProfilesTab() {
  const [allUsers, setAllUsers] = useState<UserProfile[]>([])
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const data = await getUserProfiles()
        setAllUsers(data)
        if (data.length > 0) {
          setSelectedUser(data[0])
        }
      } catch (error) {
        console.error("Failed to fetch user profiles:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredUsers = allUsers.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* User List */}
      <Card className="bg-card border-border lg:col-span-1">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">User Profiles</CardTitle>
          <CardDescription>Behavioral analysis and anomaly detection</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-9 bg-secondary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            {loading ? (
              <>
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`w-full flex items-center gap-3 rounded-lg p-3 text-left transition-colors ${
                    selectedUser?.id === user.id 
                      ? "bg-sidebar-accent" 
                      : "hover:bg-secondary/50"
                  }`}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/20 text-primary text-sm">
                      {user.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium truncate">{user.name}</p>
                      {getStatusBadge(user.status)}
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">{user.id}</p>
                  </div>
                </button>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No users found</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* User Details */}
      {selectedUser && (
        <Card className="bg-card border-border lg:col-span-2">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-primary/20 text-primary text-xl">
                    {selectedUser.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-xl">{selectedUser.name}</CardTitle>
                  <CardDescription>{selectedUser.email}</CardDescription>
                  <p className="text-xs text-muted-foreground font-mono mt-1">{selectedUser.id}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-muted-foreground">Risk Score</span>
                  {getStatusBadge(selectedUser.status)}
                </div>
                <div className="flex items-center gap-3">
                  <Progress 
                    value={selectedUser.riskScore} 
                    className="h-3 w-32 bg-secondary"
                  />
                  <span className={`text-2xl font-bold ${
                    selectedUser.riskScore > 70 ? "text-destructive" :
                    selectedUser.riskScore > 40 ? "text-warning" : "text-primary"
                  }`}>
                    {selectedUser.riskScore}
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="w-full justify-start bg-secondary/50 mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="behavior">Behavior</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="devices">Devices</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="rounded-lg bg-secondary/50 p-4">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                      <Calendar className="h-4 w-4" />
                      Account Age
                    </div>
                    <p className="text-lg font-semibold">{selectedUser.accountAge}</p>
                  </div>
                  <div className="rounded-lg bg-secondary/50 p-4">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                      <Activity className="h-4 w-4" />
                      Transactions
                    </div>
                    <p className="text-lg font-semibold">{selectedUser.transactionCount}</p>
                  </div>
                  <div className="rounded-lg bg-secondary/50 p-4">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                      <DollarSign className="h-4 w-4" />
                      Total Spend
                    </div>
                    <p className="text-lg font-semibold">${selectedUser.totalSpend.toLocaleString()}</p>
                  </div>
                  <div className="rounded-lg bg-secondary/50 p-4">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                      <AlertTriangle className="h-4 w-4" />
                      Anomalies
                    </div>
                    <p className={`text-lg font-semibold ${selectedUser.anomalyCount > 0 ? "text-destructive" : "text-primary"}`}>
                      {selectedUser.anomalyCount}
                    </p>
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-medium">Account Details</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Location:</span>
                        <span>{selectedUser.location}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Last Login:</span>
                        <span>{selectedUser.lastLogin}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Avg Transaction:</span>
                        <span>${selectedUser.avgTransaction.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium">Quick Actions</h3>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm">
                        <Shield className="mr-2 h-4 w-4" />
                        Add to Watchlist
                      </Button>
                      <Button variant="outline" size="sm">
                        <User className="mr-2 h-4 w-4" />
                        View Full Profile
                      </Button>
                      <Button variant="destructive" size="sm">
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        Flag Account
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="behavior">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Spending Pattern Analysis</h3>
                      <p className="text-sm text-muted-foreground">Comparison against established baseline</p>
                    </div>
                    <Badge variant="outline" className="border-destructive/50 text-destructive">
                      <TrendingUp className="mr-1 h-3 w-3" />
                      +425% deviation
                    </Badge>
                  </div>
                  <ChartContainer config={chartConfig} className="h-[250px] w-full">
                    <LineChart data={behaviorData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                      <XAxis dataKey="time" stroke="var(--color-muted-foreground)" fontSize={12} />
                      <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Line 
                        type="monotone" 
                        dataKey="baseline" 
                        stroke="var(--color-chart-1)" 
                        strokeWidth={2}
                        strokeDasharray="5 5"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="spending" 
                        stroke="var(--color-chart-4)" 
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ChartContainer>
                </div>
              </TabsContent>

              <TabsContent value="activity">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">Transaction Activity</h3>
                    <p className="text-sm text-muted-foreground">Hourly transaction distribution</p>
                  </div>
                  <ChartContainer config={chartConfig} className="h-[250px] w-full">
                    <BarChart data={activityData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                      <XAxis dataKey="hour" stroke="var(--color-muted-foreground)" fontSize={12} />
                      <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="transactions" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ChartContainer>
                </div>
              </TabsContent>

              <TabsContent value="devices">
                <div className="space-y-4">
                  <h3 className="font-medium">Registered Devices</h3>
                  <div className="space-y-3">
                    {selectedUser.devices.map((device, i) => (
                      <div key={i} className="flex items-center justify-between rounded-lg bg-secondary/50 p-4">
                        <div className="flex items-center gap-3">
                          <Smartphone className="h-5 w-5 text-muted-foreground" />
                          <span>{device}</span>
                        </div>
                        <Badge variant="outline">
                          {device.includes("Unknown") ? "Unverified" : "Verified"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
