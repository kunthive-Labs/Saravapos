export interface CompletionOptions {
  system: string;
  user: string;
  model?: string;
  temperature?: number;
}

export interface CompletionResult {
  text: string;
  model: string;
  provider: string;
}

export interface LLMAdapter {
  readonly name: string;
  readonly defaultModel: string;
  complete(options: CompletionOptions): Promise<CompletionResult>;
}
