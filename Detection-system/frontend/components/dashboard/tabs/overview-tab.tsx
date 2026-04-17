"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Shield, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Activity,
  DollarSign,
  Users,
  Clock
} from "lucide-react"
import { 
  Area, 
  AreaChart, 
  Bar, 
  BarChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip,
  CartesianGrid,
  Line,
  LineChart,
  PieChart,
  Pie,
  Cell
} from "recharts"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { getDashboardMetrics, getAlerts } from "@/lib/api"
import type { Alert, DashboardMetrics } from "@/lib/api"

const transactionData = [
  { time: "00:00", legitimate: 2400, flagged: 24, blocked: 8 },
  { time: "04:00", legitimate: 1398, flagged: 45, blocked: 12 },
  { time: "08:00", legitimate: 9800, flagged: 132, blocked: 34 },
  { time: "12:00", legitimate: 12908, flagged: 178, blocked: 45 },
  { time: "16:00", legitimate: 15800, flagged: 210, blocked: 52 },
  { time: "20:00", legitimate: 8300, flagged: 95, blocked: 28 },
]

const riskDistribution = [
  { name: "Low Risk", value: 72, color: "var(--color-chart-1)" },
  { name: "Medium Risk", value: 18, color: "var(--color-chart-3)" },
  { name: "High Risk", value: 8, color: "var(--color-chart-4)" },
  { name: "Critical", value: 2, color: "var(--color-destructive)" },
]

const fraudTypesData = [
  { type: "Account Takeover", count: 45, change: +12 },
  { type: "Card Fraud", count: 32, change: -8 },
  { type: "Identity Theft", count: 28, change: +5 },
  { type: "Money Laundering", count: 15, change: +2 },
  { type: "Phishing", count: 12, change: -3 },
]
const modelPerformance = [
  { date: "Mon", accuracy: 94.2, precision: 92.1, recall: 89.5 },
  { date: "Tue", accuracy: 94.8, precision: 93.2, recall: 90.1 },
  { date: "Wed", accuracy: 95.1, precision: 93.8, recall: 91.2 },
  { date: "Thu", accuracy: 94.9, precision: 93.5, recall: 90.8 },
  { date: "Fri", accuracy: 95.4, precision: 94.1, recall: 91.5 },
  { date: "Sat", accuracy: 95.2, precision: 93.9, recall: 91.3 },
  { date: "Sun", accuracy: 95.6, precision: 94.3, recall: 91.8 },
]

const chartConfig = {
  legitimate: { label: "Legitimate", color: "var(--color-chart-1)" },
  flagged: { label: "Flagged", color: "var(--color-chart-3)" },
  blocked: { label: "Blocked", color: "var(--color-chart-4)" },
  accuracy: { label: "Accuracy", color: "var(--color-chart-1)" },
  precision: { label: "Precision", color: "var(--color-chart-2)" },
  recall: { label: "Recall", color: "var(--color-chart-3)" },
}

export function OverviewTab() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [metricsData, alertsData] = await Promise.all([
          getDashboardMetrics(),
          getAlerts(),
        ])
        setMetrics(metricsData)
        setAlerts(alertsData.slice(0, 4))
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Transactions Analyzed
            </CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {metrics?.totalTransactions.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-primary" />
                  <span className="text-primary">+{metrics?.transactionGrowth}%</span> from last hour
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Fraud Blocked
            </CardTitle>
            <Shield className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {(metrics?.blockedTransactions ?? 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <TrendingDown className="h-3 w-3 text-primary" />
                  <span className="text-primary">-8.2%</span> attempted fraud
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Alerts
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{metrics?.openAlerts}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-destructive">
                    {alerts.filter(a => a.severity === "critical").length} critical
                  </span>
                  , {alerts.filter(a => a.severity === "high").length} high,{" "}
                  {alerts.filter(a => a.severity === "medium").length} medium
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Detection Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{metrics?.systemHealth}%</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <span className="text-primary">+{metrics?.healthTrend}%</span> improvement this week
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Transaction Volume Chart */}
        <Card className="col-span-2 bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base">Transaction Flow</CardTitle>
            <CardDescription>Real-time transaction analysis over 24 hours</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <AreaChart data={transactionData}>
                <defs>
                  <linearGradient id="legitGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-chart-1)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="time" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                <Tooltip content={<ChartTooltipContent />} />
                <Area 
                  type="monotone" 
                  dataKey="legitimate" 
                  stroke="var(--color-chart-1)" 
                  fill="url(#legitGradient)"
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey="flagged" 
                  stroke="var(--color-chart-3)" 
                  fill="var(--color-chart-3)"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey="blocked" 
                  stroke="var(--color-chart-4)" 
                  fill="var(--color-chart-4)"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Risk Distribution */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base">Risk Distribution</CardTitle>
            <CardDescription>Current transaction risk levels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {riskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {riskDistribution.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span 
                      className="h-3 w-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Alerts */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base">Recent Alerts</CardTitle>
            <CardDescription>Latest fraud detection alerts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <>
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </>
            ) : alerts.length > 0 ? (
              alerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className="flex items-start gap-3 rounded-lg bg-secondary/50 p-3"
                >
                  <span className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${
                    alert.severity === "critical" ? "bg-destructive" :
                    alert.severity === "high" ? "bg-warning" : "bg-info"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{alert.title}</p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      <span>{alert.userId}</span>
                      {alert.amount && (
                        <>
                          <DollarSign className="h-3 w-3 ml-2" />
                          <span>${alert.amount.toLocaleString()}</span>
                        </>
                      )}
                      <Clock className="h-3 w-3 ml-2" />
                      <span>{alert.timestamp}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No alerts found</p>
            )}
          </CardContent>
        </Card>

        {/* Fraud Types */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base">Fraud Types Detected</CardTitle>
            <CardDescription>Distribution by fraud category</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
              <BarChart data={fraudTypesData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                <XAxis type="number" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis 
                  dataKey="type" 
                  type="category" 
                  stroke="var(--color-muted-foreground)" 
                  fontSize={11}
                  width={100}
                  tickLine={false}
                />
                <Tooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="var(--color-chart-2)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ChartContainer>
            <div className="mt-4 space-y-2">
              {fraudTypesData.slice(0, 3).map((item) => (
                <div key={item.type} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{item.type}</span>
                  <Badge variant={item.change > 0 ? "destructive" : "secondary"} className="text-xs">
                    {item.change > 0 ? "+" : ""}{item.change}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Model Performance */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base">Model Performance</CardTitle>
            <CardDescription>Weekly detection metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
              <LineChart data={modelPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis domain={[85, 100]} stroke="var(--color-muted-foreground)" fontSize={12} />
                <Tooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="accuracy" 
                  stroke="var(--color-chart-1)" 
                  strokeWidth={2}
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="precision" 
                  stroke="var(--color-chart-2)" 
                  strokeWidth={2}
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="recall" 
                  stroke="var(--color-chart-3)" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
            <div className="mt-4 flex justify-center gap-4">
              <div className="flex items-center gap-2 text-xs">
                <span className="h-2 w-2 rounded-full bg-chart-1" />
                <span className="text-muted-foreground">Accuracy</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="h-2 w-2 rounded-full bg-chart-2" />
                <span className="text-muted-foreground">Precision</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="h-2 w-2 rounded-full bg-chart-3" />
                <span className="text-muted-foreground">Recall</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
