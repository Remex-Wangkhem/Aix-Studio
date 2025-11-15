import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Edit2, Trash2, UserPlus } from "lucide-react";

export default function Users() {
  const users = [
    { id: "1", username: "admin", email: "admin@eveda.ai", role: "admin", status: "active", createdAt: "2024-01-15" },
    { id: "2", username: "developer1", email: "dev1@example.com", role: "developer", status: "active", createdAt: "2024-01-16" },
    { id: "3", username: "user1", email: "user1@example.com", role: "user", status: "active", createdAt: "2024-01-20" },
  ];

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Users</h1>
            <p className="text-muted-foreground mt-1">Manage user accounts and roles</p>
          </div>
          <Button data-testid="button-add-user">
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 rounded-md border border-card-border hover-elevate"
                  data-testid={`user-${user.id}`}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <Avatar>
                      <AvatarFallback className="text-sm">
                        {user.username.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">{user.username}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <Badge variant={user.role === "admin" ? "default" : "outline"}>
                      {user.role}
                    </Badge>
                    <Badge variant="default" className="bg-accent text-accent-foreground">
                      {user.status}
                    </Badge>
                    <p className="text-sm text-muted-foreground">{user.createdAt}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" data-testid={`button-edit-user-${user.id}`}>
                      <Edit2 className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" data-testid={`button-delete-user-${user.id}`}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
