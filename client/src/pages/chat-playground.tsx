import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Send, 
  Paperclip, 
  RotateCcw, 
  Copy, 
  Trash2,
  Plus,
  Settings2,
  MessageSquare
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useModelConnectors, useConversations, useMessages, useCreateConversation, useCreateMessage } from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";
import { getCurrentUser } from "@/lib/auth";

export default function ChatPlayground() {
  const [message, setMessage] = useState("");
  const [selectedConnectorId, setSelectedConnectorId] = useState<string>("");
  const [selectedConversationId, setSelectedConversationId] = useState<string>("");
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [topP, setTopP] = useState(1.0);
  const [systemPrompt, setSystemPrompt] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const currentUser = getCurrentUser();

  const { data: connectors } = useModelConnectors();
  const { data: conversations } = useConversations(currentUser.id);
  const { data: messages, refetch: refetchMessages } = useMessages(selectedConversationId);
  const createConversationMutation = useCreateConversation();
  const createMessageMutation = useCreateMessage();

  // Select first connector and conversation by default
  useEffect(() => {
    if (connectors?.length && !selectedConnectorId) {
      setSelectedConnectorId(connectors[0].id);
    }
  }, [connectors, selectedConnectorId]);

  useEffect(() => {
    if (conversations?.length && !selectedConversationId) {
      setSelectedConversationId(conversations[0].id);
    }
  }, [conversations, selectedConversationId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleNewConversation = async () => {
    try {
      const newConv = await createConversationMutation.mutateAsync({
        title: "New Conversation",
        userId: currentUser.id,
        modelConnectorId: selectedConnectorId,
        favorite: false,
      });
      setSelectedConversationId(newConv.id);
      toast({
        title: "Success",
        description: "New conversation created",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create conversation",
        variant: "destructive",
      });
    }
  };

  const handleClearChat = async () => {
    if (!selectedConversationId) return;
    try {
      await handleNewConversation();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear chat",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedConversationId || !selectedConnectorId) {
      toast({
        title: "Error",
        description: "Please enter a message and select a model",
        variant: "destructive",
      });
      return;
    }

    const userMessage = message.trim();
    setMessage("");
    setIsStreaming(true);

    try {
      // Save user message
      await createMessageMutation.mutateAsync({
        conversationId: selectedConversationId,
        role: "user",
        content: userMessage,
      });

      // Build messages array for API
      const messageHistory = messages?.map((m: any) => ({
        role: m.role,
        content: m.content,
      })) || [];

      if (systemPrompt) {
        messageHistory.unshift({ role: "system", content: systemPrompt });
      }
      messageHistory.push({ role: "user", content: userMessage });

      // Stream response
      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          connectorId: selectedConnectorId,
          messages: messageHistory,
          temperature,
          max_tokens: maxTokens,
          top_p: topP,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.content) {
                  assistantMessage += data.content;
                }
                if (data.done) {
                  // Save assistant message
                  await createMessageMutation.mutateAsync({
                    conversationId: selectedConversationId,
                    role: "assistant",
                    content: assistantMessage,
                  });
                  await refetchMessages();
                }
              } catch (e) {
                // Ignore parse errors
              }
            }
          }
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsStreaming(false);
    }
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied",
      description: "Message copied to clipboard",
    });
  };

  const handleFileUpload = () => {
    toast({
      title: "Feature Coming Soon",
      description: "File upload will be available in the next update",
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="w-64 border-r border-border flex flex-col bg-card">
        <div className="p-4 border-b border-card-border">
          <Button className="w-full" onClick={handleNewConversation} disabled={createConversationMutation.isPending} data-testid="button-new-conversation">
            <Plus className="h-4 w-4 mr-2" />
            New Conversation
          </Button>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {conversations?.map((conv: any) => (
              <button
                key={conv.id}
                className={`w-full text-left p-3 rounded-md hover-elevate active-elevate-2 group ${selectedConversationId === conv.id ? 'bg-sidebar-accent' : ''}`}
                onClick={() => setSelectedConversationId(conv.id)}
                data-testid={`conversation-${conv.id}`}
              >
                <div className="flex items-start gap-2">
                  <MessageSquare className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{conv.title}</p>
                    <p className="text-xs text-muted-foreground">{new Date(conv.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="border-b border-border p-4 flex items-center justify-between bg-card">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-foreground">
              {conversations?.find((c: any) => c.id === selectedConversationId)?.title || "Chat Playground"}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleClearChat} data-testid="button-clear-chat">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages?.map((msg: any) => (
              <div
                key={msg.id}
                className={`flex gap-4 group ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">AI</AvatarFallback>
                  </Avatar>
                )}
                <div className={`flex flex-col gap-2 max-w-[80%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                  <Card className={`p-4 ${msg.role === "user" ? "bg-primary text-primary-foreground" : ""}`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </Card>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleCopyMessage(msg.content)}
                      data-testid={`button-copy-${msg.id}`}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                {msg.role === "user" && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="text-xs">U</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isStreaming && (
              <div className="flex gap-4 justify-start">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">AI</AvatarFallback>
                </Avatar>
                <Card className="p-4">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-foreground rounded-full animate-pulse" />
                    <div className="w-2 h-2 bg-foreground rounded-full animate-pulse delay-75" />
                    <div className="w-2 h-2 bg-foreground rounded-full animate-pulse delay-150" />
                  </div>
                </Card>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="border-t border-border p-4 bg-card">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={handleFileUpload} data-testid="button-attach-file">
                <Paperclip className="h-4 w-4" />
              </Button>
              <div className="flex-1 relative">
                <Textarea
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="min-h-[60px] max-h-[200px] resize-none pr-12"
                  disabled={isStreaming}
                  data-testid="input-message"
                />
                <Button
                  size="icon"
                  className="absolute bottom-2 right-2 h-8 w-8"
                  onClick={handleSendMessage}
                  disabled={isStreaming || !message.trim()}
                  data-testid="button-send"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-80 border-l border-border bg-card p-6 overflow-y-auto">
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Settings2 className="h-5 w-5 text-foreground" />
              <h3 className="font-semibold text-foreground">Model Settings</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="model-select" className="text-sm font-medium">Model</Label>
                <Select value={selectedConnectorId} onValueChange={setSelectedConnectorId}>
                  <SelectTrigger id="model-select" className="mt-1.5" data-testid="select-model">
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    {connectors?.map((connector: any) => (
                      <SelectItem key={connector.id} value={connector.id}>
                        {connector.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div>
                <Label htmlFor="temperature" className="text-sm font-medium">
                  Temperature: <span className="text-muted-foreground">{temperature.toFixed(1)}</span>
                </Label>
                <Slider
                  id="temperature"
                  value={[temperature]}
                  onValueChange={([value]) => setTemperature(value)}
                  max={2}
                  step={0.1}
                  className="mt-2"
                  data-testid="slider-temperature"
                />
                <p className="text-xs text-muted-foreground mt-1.5">Higher values make output more random</p>
              </div>

              <div>
                <Label htmlFor="max-tokens" className="text-sm font-medium">Max Tokens</Label>
                <Input
                  id="max-tokens"
                  type="number"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                  className="mt-1.5"
                  data-testid="input-max-tokens"
                />
              </div>

              <div>
                <Label htmlFor="top-p" className="text-sm font-medium">
                  Top P: <span className="text-muted-foreground">{topP.toFixed(2)}</span>
                </Label>
                <Slider
                  id="top-p"
                  value={[topP]}
                  onValueChange={([value]) => setTopP(value)}
                  max={1}
                  step={0.05}
                  className="mt-2"
                  data-testid="slider-top-p"
                />
              </div>

              <div>
                <Label htmlFor="system-prompt" className="text-sm font-medium">System Prompt</Label>
                <Textarea
                  id="system-prompt"
                  placeholder="You are a helpful assistant..."
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  className="mt-1.5 min-h-[100px]"
                  data-testid="input-system-prompt"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
