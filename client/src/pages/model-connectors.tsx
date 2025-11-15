import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, Activity } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useModelConnectors, useCreateModelConnector, useDeleteModelConnector } from "@/hooks/use-api";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { getCurrentUser } from "@/lib/auth";

export default function ModelConnectors() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    protocol: "REST",
    baseUrl: "",
    authType: "none",
    authToken: "",
  });

  const { data: connectors, isLoading } = useModelConnectors();
  const createMutation = useCreateModelConnector();
  const deleteMutation = useDeleteModelConnector();
  const { toast } = useToast();
  const currentUser = getCurrentUser();

  const handleCreate = async () => {
    try {
      await createMutation.mutateAsync({
        ...formData,
        createdBy: currentUser.id,
        defaultSettings: {
          temperature: 0.7,
          maxTokens: 2048,
          topP: 1.0,
        },
      });
      setOpen(false);
      setFormData({ name: "", protocol: "REST", baseUrl: "", authType: "none", authToken: "" });
      toast({
        title: "Success",
        description: "Model connector created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create connector",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast({
        title: "Success",
        description: "Connector deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete connector",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 overflow-auto">
        <div className="p-6 md:p-8 space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-6 md:grid-cols-2">
            {[...Array(2)].map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Model Connectors</h1>
            <p className="text-muted-foreground mt-1">Manage external LLM service connections</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-connector">
                <Plus className="h-4 w-4 mr-2" />
                Add Connector
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Model Connector</DialogTitle>
                <DialogDescription>
                  Configure a new connection to an external LLM service
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="connector-name">Name</Label>
                    <Input
                      id="connector-name"
                      placeholder="My Custom Model"
                      className="mt-1.5"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      data-testid="input-connector-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="protocol">Protocol</Label>
                    <Select value={formData.protocol} onValueChange={(value) => setFormData({ ...formData, protocol: value })}>
                      <SelectTrigger id="protocol" className="mt-1.5" data-testid="select-protocol">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="REST">REST</SelectItem>
                        <SelectItem value="WebSocket">WebSocket</SelectItem>
                        <SelectItem value="gRPC">gRPC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="base-url">Base URL</Label>
                  <Input
                    id="base-url"
                    placeholder="https://api.example.com"
                    className="mt-1.5"
                    value={formData.baseUrl}
                    onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
                    data-testid="input-base-url"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="auth-type">Authentication</Label>
                    <Select value={formData.authType} onValueChange={(value) => setFormData({ ...formData, authType: value })}>
                      <SelectTrigger id="auth-type" className="mt-1.5" data-testid="select-auth-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="api_key">API Key</SelectItem>
                        <SelectItem value="bearer">Bearer Token</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="auth-token">Auth Token (optional)</Label>
                    <Input
                      id="auth-token"
                      type="password"
                      placeholder="sk-..."
                      className="mt-1.5"
                      value={formData.authToken}
                      onChange={(e) => setFormData({ ...formData, authToken: e.target.value })}
                      data-testid="input-auth-token"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={handleCreate} disabled={createMutation.isPending} data-testid="button-save-connector">
                  {createMutation.isPending ? "Creating..." : "Save Connector"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {connectors?.map((connector: any) => (
            <Card key={connector.id} data-testid={`connector-${connector.id}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground text-lg">{connector.name}</h3>
                    <p className="text-sm text-muted-foreground font-mono mt-1 truncate">
                      {connector.baseUrl}
                    </p>
                  </div>
                  <Badge
                    variant={connector.healthStatus === "healthy" ? "default" : "destructive"}
                    className="flex-shrink-0"
                  >
                    <Activity className="h-3 w-3 mr-1" />
                    {connector.healthStatus || "unknown"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Protocol</p>
                    <p className="font-medium text-foreground mt-1">{connector.protocol}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Auth</p>
                    <p className="font-medium text-foreground mt-1">{connector.authType}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-card-border">
                  <span className="text-xs text-muted-foreground">
                    Created {new Date(connector.createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDelete(connector.id)}
                      disabled={deleteMutation.isPending}
                      data-testid={`button-delete-${connector.id}`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
