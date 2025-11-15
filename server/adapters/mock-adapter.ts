import { ModelAdapter, type ModelRequest, type ModelResponse, type StreamChunk } from './model-adapter';

export class MockAdapter extends ModelAdapter {
  async sendRequest(request: ModelRequest): Promise<ModelResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const systemPrompt = request.messages.find(m => m.role === 'system')?.content || 'No system prompt';
    const userMessage = request.messages.find(m => m.role === 'user')?.content || '';

    const mockResponse = `[Mock Response]
System Prompt: "${systemPrompt}"
Temperature: ${request.temperature || 0.7}
Max Tokens: ${request.max_tokens || 2048}

Response to: "${userMessage}"

This is a simulated response from the mock adapter. The settings above demonstrate that system prompt and temperature overrides are working correctly.`;

    return {
      content: mockResponse,
      tokens: Math.floor(mockResponse.length / 4),
      finish_reason: 'stop',
    };
  }

  async *sendStreamRequest(request: ModelRequest): AsyncGenerator<StreamChunk> {
    const systemPrompt = request.messages.find(m => m.role === 'system')?.content || 'No system prompt';
    const userMessage = request.messages.find(m => m.role === 'user')?.content || '';

    const mockResponse = `[Mock Streaming Response]
System Prompt: "${systemPrompt}"
Temperature: ${request.temperature || 0.7}

This is a simulated streaming response. `;

    const words = mockResponse.split(' ');
    
    for (const word of words) {
      await new Promise(resolve => setTimeout(resolve, 50));
      yield { content: word + ' ', done: false };
    }

    yield { content: '', done: true };
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }
}
