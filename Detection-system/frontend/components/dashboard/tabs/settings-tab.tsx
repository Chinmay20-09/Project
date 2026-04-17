"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Settings, 
  Bell, 
  Shield, 
  Database, 
  Zap, 
  Users,
  Mail,
  Smartphone,
  Key,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Server
} from "lucide-react"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { useComingSoonFeatures } from "@/hooks/use-coming-soon"
import { ComingSoonDialog } from "@/components/ui/coming-soon-dialog"

interface NotificationSetting {
  id: string
  name: string
  description: string
  email: boolean
  sms: boolean
  push: boolean
}

const notificationSettings: NotificationSetting[] = [
  {
    id: "critical_alerts",
    name: "Critical Alerts",
    description: "Immediate notification for critical fraud detections",
    email: true,
    sms: true,
    push: true,
  },
  {
    id: "high_risk",
    name: "High Risk Transactions",
    description: "Alerts for transactions with risk score above threshold",
    email: true,
    sms: false,
    push: true,
  },
  {
    id: "model_updates",
    name: "Model Updates",
    description: "Notifications when ML models are updated",
    email: true,
    sms: false,
    push: false,
  },
  {
    id: "daily_summary",
    name: "Daily Summary",
    description: "Daily digest of fraud detection metrics",
    email: true,
    sms: false,
    push: false,
  },
]

export function SettingsTab() {
  const [notifications, setNotifications] = useState(notificationSettings)
  const [riskThreshold, setRiskThreshold] = useState([70])
  const [autoBlock, setAutoBlock] = useState(true)
  const [mfaRequired, setMfaRequired] = useState(true)
  const [adaptiveLearning, setAdaptiveLearning] = useState(true)

  const { showComingSoon, getComingSoonProps } = useComingSoonFeatures()

  const updateNotification = (id: string, channel: "email" | "sms" | "push", value: boolean) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, [channel]: value } : n
    ))
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="w-full justify-start bg-secondary/50 mb-6">
          <TabsTrigger value="general" className="gap-2">
            <Settings className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="integrations" className="gap-2">
            <Database className="h-4 w-4" />
            Integrations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          {/* Risk Thresholds */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base">Risk Thresholds</CardTitle>
              <CardDescription>Configure automatic actions based on risk scores</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Auto-Block Threshold</p>
                    <p className="text-xs text-muted-foreground">
                      Automatically block transactions above this risk score
                    </p>
                  </div>
                  <Badge variant="outline" className="text-lg px-4">
                    {riskThreshold[0]}
                  </Badge>
                </div>
                <Slider
                  value={riskThreshold}
                  onValueChange={setRiskThreshold}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0 (Allow All)</span>
                  <span>50 (Balanced)</span>
                  <span>100 (Block All)</span>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Automatic Blocking</p>
                    <p className="text-xs text-muted-foreground">
                      Enable automatic blocking for high-risk transactions
                    </p>
                  </div>
                  <Switch checked={autoBlock} onCheckedChange={setAutoBlock} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">MFA for High Risk</p>
                    <p className="text-xs text-muted-foreground">
                      Require MFA verification for medium-risk transactions
                    </p>
                  </div>
                  <Switch checked={mfaRequired} onCheckedChange={setMfaRequired} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Adaptive Learning</p>
                    <p className="text-xs text-muted-foreground">
                      Allow the model to learn from new fraud patterns
                    </p>
                  </div>
                  <Switch checked={adaptiveLearning} onCheckedChange={setAdaptiveLearning} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Decision Timing */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base">Decision Timing</CardTitle>
              <CardDescription>Configure response times and processing windows</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup className="space-y-4">
                <Field>
                  <FieldLabel>Maximum Decision Latency</FieldLabel>
                  <Select defaultValue="100">
                    <SelectTrigger className="bg-secondary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="50">50ms (Ultra-fast)</SelectItem>
                      <SelectItem value="100">100ms (Recommended)</SelectItem>
                      <SelectItem value="200">200ms (Standard)</SelectItem>
                      <SelectItem value="500">500ms (Relaxed)</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>

                <Field>
                  <FieldLabel>Review Queue Timeout</FieldLabel>
                  <Select defaultValue="30">
                    <SelectTrigger className="bg-secondary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base">Notification Preferences</CardTitle>
              <CardDescription>Configure how you receive fraud alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Header */}
                <div className="grid grid-cols-4 gap-4 text-sm text-muted-foreground pb-2 border-b border-border">
                  <span>Alert Type</span>
                  <span className="text-center">
                    <Mail className="h-4 w-4 mx-auto" />
                  </span>
                  <span className="text-center">
                    <Smartphone className="h-4 w-4 mx-auto" />
                  </span>
                  <span className="text-center">
                    <Bell className="h-4 w-4 mx-auto" />
                  </span>
                </div>

                {/* Rows */}
                {notifications.map((setting) => (
                  <div key={setting.id} className="grid grid-cols-4 gap-4 items-center py-2">
                    <div>
                      <p className="font-medium text-sm">{setting.name}</p>
                      <p className="text-xs text-muted-foreground">{setting.description}</p>
                    </div>
                    <div className="flex justify-center">
                      <Switch 
                        checked={setting.email} 
                        onCheckedChange={(v) => updateNotification(setting.id, "email", v)} 
                      />
                    </div>
                    <div className="flex justify-center">
                      <Switch 
                        checked={setting.sms} 
                        onCheckedChange={(v) => updateNotification(setting.id, "sms", v)} 
                      />
                    </div>
                    <div className="flex justify-center">
                      <Switch 
                        checked={setting.push} 
                        onCheckedChange={(v) => updateNotification(setting.id, "push", v)} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base">Contact Information</CardTitle>
              <CardDescription>Where to send notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup className="space-y-4">
                <Field>
                  <FieldLabel>Email Address</FieldLabel>
                  <Input 
                    type="email" 
                    defaultValue="security@company.com" 
                    className="bg-secondary"
                  />
                </Field>
                <Field>
                  <FieldLabel>Phone Number</FieldLabel>
                  <Input 
                    type="tel" 
                    defaultValue="+1 (555) 123-4567" 
                    className="bg-secondary"
                  />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base">API Security</CardTitle>
              <CardDescription>Manage API keys and authentication</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-3">
                  <Key className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-sm">Production API Key</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      sk-prod-••••••••••••••••
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-primary/20 text-primary border-primary/30">Active</Badge>
                  <Button variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Rotate
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-3">
                  <Key className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">Test API Key</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      sk-test-••••••••••••••••
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Test Mode</Badge>
                  <Button variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Rotate
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base">Access Control</CardTitle>
              <CardDescription>Manage team permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { role: "Admin", users: 2, permissions: "Full access" },
                  { role: "Analyst", users: 5, permissions: "View + Investigate" },
                  { role: "Viewer", users: 12, permissions: "View only" },
                ].map((role) => (
                  <div key={role.role} className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{role.role}</p>
                        <p className="text-xs text-muted-foreground">{role.permissions}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{role.users} users</Badge>
                      <Button variant="ghost" size="sm">Manage</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base">Connected Services</CardTitle>
              <CardDescription>External integrations and data sources</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: "Transaction Database", status: "connected", type: "PostgreSQL", icon: Database },
                  { name: "ML Model Server", status: "connected", type: "TensorFlow Serving", icon: Server },
                  { name: "Identity Verification", status: "connected", type: "Jumio", icon: Shield },
                  { name: "Device Fingerprinting", status: "warning", type: "FingerprintJS", icon: Smartphone },
                ].map((integration) => (
                  <div key={integration.name} className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-3">
                      <integration.icon className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{integration.name}</p>
                        <p className="text-xs text-muted-foreground">{integration.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {integration.status === "connected" ? (
                        <Badge className="bg-primary/20 text-primary border-primary/30">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Connected
                        </Badge>
                      ) : (
                        <Badge className="bg-warning/20 text-warning border-warning/30">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Check Config
                        </Badge>
                      )}
                      <Button variant="ghost" size="sm">Configure</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base">Webhooks</CardTitle>
              <CardDescription>Configure event notifications to external systems</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup className="space-y-4">
                <Field>
                  <FieldLabel>Alert Webhook URL</FieldLabel>
                  <Input 
                    placeholder="https://your-system.com/webhooks/alerts" 
                    className="bg-secondary"
                    disabled
                  />
                </Field>
                <Field>
                  <FieldLabel>Decision Webhook URL</FieldLabel>
                  <Input 
                    placeholder="https://your-system.com/webhooks/decisions" 
                    className="bg-secondary"
                    disabled
                  />
                </Field>
              </FieldGroup>
              <Button 
                className="mt-4"
                onClick={() => showComingSoon('webhooks')}
              >
                Save Webhook Configuration
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Coming Soon Dialogs */}
      <ComingSoonDialog
        {...getComingSoonProps('webhooks')}
        feature="Webhook Configuration"
        description="Configure real-time event notifications to your external systems for alerts and decisions."
        estimatedDate="Q1 2024"
      />
    </div>
  )
}
