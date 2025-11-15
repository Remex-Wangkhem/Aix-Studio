import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Copy, Trash2, Eye, EyeOff } from "lucide-react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ApiKeys() {
  const [showNewKey, setShowNewKey] = useState(false);
  const [apiKeys] = useState([
    {
      id: "1",
      name: "Production Key",
      key: "sk_prod_abc...xyz",
      scopes: ["read", "write"],
      quotaTokens: 1000000,
      usedTokens: 450000,
      createdAt: "2024-01-15",
      lastUsed: "2 hours ago",
    },
    {
      id: "2",
      name: "Development Key",
      key: "sk_dev_def...uvw",
      scopes: ["read"],
      quotaTokens: 100000,
      usedTokens: 12000,
      createdAt: "2024-01-20",
      lastUsed: "1 day ago",
    },
  ]);

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">API Keys</h1>
            <p className="text-muted-foreground mt-1">Manage API access credentials</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button data-testid="button-create-api-key">
                <Plus className="h-4 w-4 mr-2" />
                Create API Key
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New API Key</DialogTitle>
                <DialogDescription>
                  Generate a new API key for external access
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="key-name">Key Name</Label>
                  <Input
                    id="key-name"
                    placeholder="Production Key"
                    className="mt-1.5"
                    data-testid="input-key-name"
                  />
                </div>
                <div>
                  <Label htmlFor="scopes">Scopes</Label>
                  <Select defaultValue="read">
                    <SelectTrigger id="scopes" className="mt-1.5" data-testid="select-scopes">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="read">Read Only</SelectItem>
                      <SelectItem value="read,write">Read & Write</SelectItem>
                      <SelectItem value="admin">Admin (All)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="quota">Token Quota (optional)</Label>
                  <Input
                    id="quota"
                    type="number"
                    placeholder="1000000"
                    className="mt-1.5"
                    data-testid="input-quota"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button data-testid="button-generate-key">Generate Key</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {showNewKey && (
          <Alert className="border-primary bg-primary/5">
            <AlertDescription className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="font-medium text-foreground mb-2">Your new API key</p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Make sure to copy this key now. You won't be able to see it again!
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-3 rounded-md bg-card border border-card-border font-mono text-sm text-foreground">
                      sk_prod_1234567890abcdefghijklmnopqrstuvwxyz
                    </code>
                    <Button size="icon" variant="outline" data-testid="button-copy-new-key">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowNewKey(false)}
                  data-testid="button-dismiss-key-alert"
                >
                  ×
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          {apiKeys.map((apiKey) => (
            <Card key={apiKey.id} data-testid={`api-key-${apiKey.id}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-foreground text-lg">{apiKey.name}</h3>
                      {apiKey.scopes.map((scope) => (
                        <Badge key={scope} variant="outline" className="text-xs">
                          {scope}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-sm text-muted-foreground font-mono">{apiKey.key}</code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        data-testid={`button-copy-key-${apiKey.id}`}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" data-testid={`button-delete-key-${apiKey.id}`}>
                    <Trash2 className="h-3 w-3 mr-1" />
                    Revoke
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Token Usage</span>
                    <span className="font-medium text-foreground">
                      {apiKey.usedTokens.toLocaleString()} / {apiKey.quotaTokens.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${(apiKey.usedTokens / apiKey.quotaTokens) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm pt-2 border-t border-card-border">
                  <div>
                    <p className="text-muted-foreground">Created</p>
                    <p className="font-medium text-foreground mt-1">{apiKey.createdAt}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Last Used</p>
                    <p className="font-medium text-foreground mt-1">{apiKey.lastUsed}</p>
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
