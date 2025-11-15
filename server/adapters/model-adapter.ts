export interface ModelRequest {
  messages: Array<{ role: string; content: string }>;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  stop?: string[];
  stream?: boolean;
}

export interface ModelResponse {
  content: string;
  tokens?: number;
  finish_reason?: string;
}

export interface StreamChunk {
  content: string;
  done: boolean;
}

export abstract class ModelAdapter {
  protected baseUrl: string;
  protected authToken?: string;

  constructor(baseUrl: string, authToken?: string) {
    this.baseUrl = baseUrl;
    this.authToken = authToken;
  }

  abstract sendRequest(request: ModelRequest): Promise<ModelResponse>;
  abstract sendStreamRequest(request: ModelRequest): AsyncGenerator<StreamChunk>;
  abstract healthCheck(): Promise<boolean>;
}
