import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Download, Check } from "lucide-react";

export default function Billing() {
  const plans = [
    {
      name: "Starter",
      price: "$29",
      period: "/month",
      features: ["100,000 tokens/month", "5 API keys", "Email support", "Basic analytics"],
      current: false,
    },
    {
      name: "Professional",
      price: "$99",
      period: "/month",
      features: ["1,000,000 tokens/month", "Unlimited API keys", "Priority support", "Advanced analytics", "Custom endpoints"],
      current: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      features: ["Unlimited tokens", "Dedicated support", "SLA guarantee", "On-premise deployment", "Custom integrations"],
      current: false,
    },
  ];

  const invoices = [
    { id: "INV-001", date: "2024-01-01", amount: "$99.00", status: "paid" },
    { id: "INV-002", date: "2023-12-01", amount: "$99.00", status: "paid" },
    { id: "INV-003", date: "2023-11-01", amount: "$99.00", status: "paid" },
  ];

  const usage = [
    { customer: "john@example.com", endpoint: "/api/x/abx/doctor", tokens: 45678, cost: "$12.34" },
    { customer: "jane@example.com", endpoint: "/api/x/abx/engineer", tokens: 34567, cost: "$9.87" },
    { customer: "bob@example.com", endpoint: "/api/v1/chat/gpt4", tokens: 23456, cost: "$6.54" },
  ];

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6 md:p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Billing</h1>
          <p className="text-muted-foreground mt-1">Manage subscriptions and invoices</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
            <TabsTrigger value="plans" data-testid="tab-plans">Plans</TabsTrigger>
            <TabsTrigger value="usage" data-testid="tab-usage">Usage</TabsTrigger>
            <TabsTrigger value="invoices" data-testid="tab-invoices">Invoices</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Current Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">Professional</div>
                  <p className="text-sm text-muted-foreground mt-1">$99/month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">This Month</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">456,789</div>
                  <p className="text-sm text-muted-foreground mt-1">tokens used</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Next Billing</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">Feb 1, 2024</div>
                  <p className="text-sm text-muted-foreground mt-1">$99.00 due</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="plans" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              {plans.map((plan) => (
                <Card key={plan.name} className={plan.current ? "border-primary" : ""} data-testid={`plan-${plan.name.toLowerCase()}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-foreground">{plan.name}</CardTitle>
                      {plan.current && <Badge>Current</Badge>}
                    </div>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                      <span className="text-muted-foreground">{plan.period}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full"
                      variant={plan.current ? "outline" : "default"}
                      disabled={plan.current}
                      data-testid={`button-${plan.current ? 'current' : 'upgrade'}-${plan.name.toLowerCase()}`}
                    >
                      {plan.current ? "Current Plan" : "Upgrade"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="usage" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Usage by Customer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-card-border text-left">
                        <th className="pb-3 text-sm font-medium text-muted-foreground">Customer</th>
                        <th className="pb-3 text-sm font-medium text-muted-foreground">Endpoint</th>
                        <th className="pb-3 text-sm font-medium text-muted-foreground">Tokens</th>
                        <th className="pb-3 text-sm font-medium text-muted-foreground">Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usage.map((record, index) => (
                        <tr key={index} className="border-b border-card-border last:border-0" data-testid={`usage-row-${index}`}>
                          <td className="py-3 text-sm text-foreground">{record.customer}</td>
                          <td className="py-3 text-sm font-mono text-foreground">{record.endpoint}</td>
                          <td className="py-3 text-sm text-foreground">{record.tokens.toLocaleString()}</td>
                          <td className="py-3 text-sm font-medium text-foreground">{record.cost}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invoices" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Invoice History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {invoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between p-4 rounded-md border border-card-border hover-elevate"
                      data-testid={`invoice-${invoice.id}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                          <CreditCard className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{invoice.id}</p>
                          <p className="text-sm text-muted-foreground">{invoice.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-medium text-foreground">{invoice.amount}</p>
                          <Badge variant="default" className="text-xs mt-1">
                            {invoice.status}
                          </Badge>
                        </div>
                        <Button variant="outline" size="sm" data-testid={`button-download-${invoice.id}`}>
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
