import { ModelAdapter, type ModelRequest, type ModelResponse, type StreamChunk } from './model-adapter';

export class RestAdapter extends ModelAdapter {
  async sendRequest(request: ModelRequest): Promise<ModelResponse> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (this.authToken) {
        headers['Authorization'] = `Bearer ${this.authToken}`;
      }

      const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          messages: request.messages,
          temperature: request.temperature,
          max_tokens: request.max_tokens,
          top_p: request.top_p,
          stop: request.stop,
        }),
      });

      if (!response.ok) {
        throw new Error(`Model API returned ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();
      
      return {
        content: data.choices?.[0]?.message?.content || '',
        tokens: data.usage?.total_tokens,
        finish_reason: data.choices?.[0]?.finish_reason,
      };
    } catch (error) {
      console.error('RestAdapter error:', error);
      throw new Error(`Failed to call model: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async *sendStreamRequest(request: ModelRequest): AsyncGenerator<StreamChunk> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (this.authToken) {
        headers['Authorization'] = `Bearer ${this.authToken}`;
      }

      const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ...request,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Model API returned ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          yield { content: '', done: true };
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              yield { content: '', done: true };
              return;
            }

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content || '';
              if (content) {
                yield { content, done: false };
              }
            } catch (e) {
              // Ignore parse errors for incomplete chunks
            }
          }
        }
      }
    } catch (error) {
      console.error('RestAdapter streaming error:', error);
      throw error;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: this.authToken ? { 'Authorization': `Bearer ${this.authToken}` } : {},
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}
