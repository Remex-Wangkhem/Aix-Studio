import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Copy, Trash2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEndpoints, useCreateEndpoint, useDeleteEndpoint, useModelConnectors } from "@/hooks/use-api";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { getCurrentUser } from "@/lib/auth";

export default function Endpoints() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    route: "",
    modelConnectorId: "",
    systemPrompt: "",
    temperature: "0.7",
    maxTokens: 2048,
    topP: "1.0",
    rateLimitPerMinute: 60,
    accessType: "public",
  });

  const { data: endpoints, isLoading } = useEndpoints();
  const { data: connectors } = useModelConnectors();
  const createMutation = useCreateEndpoint();
  const deleteMutation = useDeleteEndpoint();
  const { toast } = useToast();
  const currentUser = getCurrentUser();

  const handleCreate = async () => {
    try {
      await createMutation.mutateAsync({
        ...formData,
        createdBy: currentUser.id,
        frozen: false,
        inheritDefaults: false,
        tokenLimitPerRequest: 4096,
      });
      setOpen(false);
      setFormData({
        name: "",
        route: "",
        modelConnectorId: "",
        systemPrompt: "",
        temperature: "0.7",
        maxTokens: 2048,
        topP: "1.0",
        rateLimitPerMinute: 60,
        accessType: "public",
      });
      toast({
        title: "Success",
        description: "Endpoint created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create endpoint",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast({
        title: "Success",
        description: "Endpoint deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete endpoint",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Route copied to clipboard",
    });
  };

  if (isLoading) {
    return (
      <div className="flex-1 overflow-auto">
        <div className="p-6 md:p-8 space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Endpoints</h1>
            <p className="text-muted-foreground mt-1">Create and manage API endpoints</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-endpoint">
                <Plus className="h-4 w-4 mr-2" />
                Create Endpoint
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Endpoint</DialogTitle>
                <DialogDescription>
                  Configure a new API endpoint with custom settings
                </DialogDescription>
              </DialogHeader>
              <Tabs defaultValue="basic" className="mt-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Basic</TabsTrigger>
                  <TabsTrigger value="prompt">Prompt</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
                <TabsContent value="basic" className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="endpoint-name">Endpoint Name</Label>
                    <Input
                      id="endpoint-name"
                      placeholder="MyEndpoint"
                      className="mt-1.5"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      data-testid="input-endpoint-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="route">Route</Label>
                    <Input
                      id="route"
                      placeholder="/api/x/my-endpoint"
                      className="mt-1.5"
                      value={formData.route}
                      onChange={(e) => setFormData({ ...formData, route: e.target.value })}
                      data-testid="input-route"
                    />
                  </div>
                  <div>
                    <Label htmlFor="model-connector">Model Connector</Label>
                    <Select value={formData.modelConnectorId} onValueChange={(value) => setFormData({ ...formData, modelConnectorId: value })}>
                      <SelectTrigger id="model-connector" className="mt-1.5" data-testid="select-model-connector">
                        <SelectValue placeholder="Select a model connector" />
                      </SelectTrigger>
                      <SelectContent>
                        {connectors?.map((conn: any) => (
                          <SelectItem key={conn.id} value={conn.id}>{conn.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>
                <TabsContent value="prompt" className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="system-prompt">System Prompt</Label>
                    <Textarea
                      id="system-prompt"
                      placeholder="You are a helpful assistant..."
                      className="mt-1.5 min-h-[200px]"
                      value={formData.systemPrompt}
                      onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                      data-testid="input-endpoint-system-prompt"
                    />
                    <p className="text-xs text-muted-foreground mt-1.5">
                      This prompt will be injected into all requests to this endpoint
                    </p>
                  </div>
                </TabsContent>
                <TabsContent value="settings" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="temperature">Temperature</Label>
                      <Input
                        id="temperature"
                        type="number"
                        step="0.1"
                        min="0"
                        max="2"
                        value={formData.temperature}
                        onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                        className="mt-1.5"
                        data-testid="input-endpoint-temperature"
                      />
                    </div>
                    <div>
                      <Label htmlFor="max-tokens">Max Tokens</Label>
                      <Input
                        id="max-tokens"
                        type="number"
                        value={formData.maxTokens}
                        onChange={(e) => setFormData({ ...formData, maxTokens: parseInt(e.target.value) })}
                        className="mt-1.5"
                        data-testid="input-endpoint-max-tokens"
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              <DialogFooter className="mt-6">
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={handleCreate} disabled={createMutation.isPending} data-testid="button-save-endpoint">
                  {createMutation.isPending ? "Creating..." : "Create Endpoint"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          {endpoints?.map((endpoint: any) => (
            <Card key={endpoint.id} data-testid={`endpoint-${endpoint.id}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-foreground text-lg">{endpoint.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {endpoint.accessType}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground font-mono mt-1 flex items-center gap-2">
                      {endpoint.route}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => copyToClipboard(endpoint.route)}
                        data-testid={`button-copy-route-${endpoint.id}`}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDelete(endpoint.id)}
                    disabled={deleteMutation.isPending}
                    data-testid={`button-delete-endpoint-${endpoint.id}`}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {endpoint.systemPrompt && (
                  <div className="text-sm">
                    <p className="text-muted-foreground mb-1">System Prompt:</p>
                    <p className="text-foreground line-clamp-2">{endpoint.systemPrompt}</p>
                  </div>
                )}
                <div className="grid grid-cols-3 gap-4 text-sm pt-2 border-t border-card-border">
                  <div>
                    <p className="text-muted-foreground">Temperature</p>
                    <p className="font-medium text-foreground mt-1">{endpoint.temperature}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Max Tokens</p>
                    <p className="font-medium text-foreground mt-1">{endpoint.maxTokens}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <Badge variant="default" className="mt-1">Active</Badge>
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
