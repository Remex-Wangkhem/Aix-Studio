import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import ChatPlayground from "@/pages/chat-playground";
import Dashboard from "@/pages/dashboard";
import ModelConnectors from "@/pages/model-connectors";
import Endpoints from "@/pages/endpoints";
import ApiKeys from "@/pages/api-keys";
import Billing from "@/pages/billing";
import Users from "@/pages/users";
import AuditLogs from "@/pages/audit-logs";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={ChatPlayground} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/connectors" component={ModelConnectors} />
      <Route path="/endpoints" component={Endpoints} />
      <Route path="/api-keys" component={ApiKeys} />
      <Route path="/billing" component={Billing} />
      <Route path="/users" component={Users} />
      <Route path="/audit-logs" component={AuditLogs} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SidebarProvider style={style as React.CSSProperties}>
          <div className="flex h-screen w-full overflow-hidden">
            <AppSidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
              <header className="flex items-center justify-between p-4 border-b border-border bg-card flex-shrink-0">
                <div className="flex items-center gap-3">
                  <SidebarTrigger data-testid="button-sidebar-toggle" />
                  <h1 className="text-lg font-bold text-foreground">EVEDA AIX STUDIO</h1>
                </div>
                <ThemeToggle />
              </header>
              <main className="flex-1 overflow-hidden">
                <Router />
              </main>
            </div>
          </div>
        </SidebarProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
