export interface LlmClient {
  generateText(prompt: string): Promise<string>;
}

export const llmClient: LlmClient = {
  async generateText(prompt: string): Promise<string> {
    // For now, return a deterministic placeholder using the prompt
    return `STUBBED: ${prompt.slice(0, 120)}`;
  }
};
