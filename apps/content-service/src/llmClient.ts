export interface LlmClient {
  generateText(prompt: string, opts?: { model?: string }): Promise<{ text: string }>;
}

export class StubLlmClient implements LlmClient {
  async generateText(prompt: string): Promise<{ text: string }> {
    return { text: `STUB_RESPONSE: ${prompt.slice(0, 120)}` };
  }
}
