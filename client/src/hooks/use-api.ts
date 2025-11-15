import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";

// Model Connectors
export function useModelConnectors() {
  return useQuery({
    queryKey: ["/api/model-connectors"],
  });
}

export function useCreateModelConnector() {
  return useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/model-connectors", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/model-connectors"] });
    },
  });
}

export function useDeleteModelConnector() {
  return useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/model-connectors/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/model-connectors"] });
    },
  });
}

// Endpoints
export function useEndpoints() {
  return useQuery({
    queryKey: ["/api/endpoints"],
  });
}

export function useCreateEndpoint() {
  return useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/endpoints", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/endpoints"] });
    },
  });
}

export function useDeleteEndpoint() {
  return useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/endpoints/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/endpoints"] });
    },
  });
}

// API Keys
export function useApiKeys(userId?: string) {
  return useQuery({
    queryKey: ["/api/api-keys", userId],
    queryFn: async () => {
      const url = userId ? `/api/api-keys?userId=${userId}` : "/api/api-keys";
      const res = await fetch(url);
      return res.json();
    },
  });
}

export function useCreateApiKey() {
  return useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/api-keys", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/api-keys"] });
    },
  });
}

export function useDeleteApiKey() {
  return useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/api-keys/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/api-keys"] });
    },
  });
}

// Users
export function useUsers() {
  return useQuery({
    queryKey: ["/api/users"],
  });
}

export function useDeleteUser() {
  return useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
  });
}

// Audit Logs
export function useAuditLogs() {
  return useQuery({
    queryKey: ["/api/audit-logs"],
  });
}

// Dashboard Stats
export function useDashboardStats() {
  return useQuery({
    queryKey: ["/api/dashboard/stats"],
  });
}

// Conversations
export function useConversations(userId: string) {
  return useQuery({
    queryKey: ["/api/conversations", userId],
    queryFn: async () => {
      const res = await fetch(`/api/conversations?userId=${userId}`);
      return res.json();
    },
  });
}

export function useCreateConversation() {
  return useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/conversations", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    },
  });
}

// Messages
export function useMessages(conversationId: string) {
  return useQuery({
    queryKey: ["/api/conversations", conversationId, "messages"],
    queryFn: async () => {
      const res = await fetch(`/api/conversations/${conversationId}/messages`);
      return res.json();
    },
    enabled: !!conversationId,
  });
}

export function useCreateMessage() {
  return useMutation({
    mutationFn: ({ conversationId, ...data }: any) => 
      apiRequest("POST", `/api/conversations/${conversationId}/messages`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/conversations", variables.conversationId, "messages"] 
      });
    },
  });
}
