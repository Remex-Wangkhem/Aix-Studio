import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function AuditLogs() {
  const logs = [
    { id: "1", user: "admin", action: "Created endpoint", resource: "/api/x/abx/doctor", timestamp: "2024-01-20 10:30:45", ip: "192.168.1.1" },
    { id: "2", user: "admin", action: "Updated model connector", resource: "Abx Model", timestamp: "2024-01-20 10:25:12", ip: "192.168.1.1" },
    { id: "3", user: "developer1", action: "Generated API key", resource: "Production Key", timestamp: "2024-01-20 09:15:33", ip: "192.168.1.5" },
    { id: "4", user: "admin", action: "Created user", resource: "developer1", timestamp: "2024-01-19 14:22:11", ip: "192.168.1.1" },
  ];

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6 md:p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Audit Logs</h1>
          <p className="text-muted-foreground mt-1">Track all admin actions and changes</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search logs..."
            className="pl-10"
            data-testid="input-search-logs"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-card-border text-left">
                    <th className="pb-3 text-sm font-medium text-muted-foreground">User</th>
                    <th className="pb-3 text-sm font-medium text-muted-foreground">Action</th>
                    <th className="pb-3 text-sm font-medium text-muted-foreground">Resource</th>
                    <th className="pb-3 text-sm font-medium text-muted-foreground">Timestamp</th>
                    <th className="pb-3 text-sm font-medium text-muted-foreground">IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b border-card-border last:border-0" data-testid={`log-${log.id}`}>
                      <td className="py-3 text-sm text-foreground">{log.user}</td>
                      <td className="py-3 text-sm">
                        <Badge variant="outline" className="text-xs">{log.action}</Badge>
                      </td>
                      <td className="py-3 text-sm font-mono text-foreground">{log.resource}</td>
                      <td className="py-3 text-sm text-muted-foreground">{log.timestamp}</td>
                      <td className="py-3 text-sm text-muted-foreground">{log.ip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
