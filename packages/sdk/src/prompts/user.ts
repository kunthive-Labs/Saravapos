export function buildUserPrompt(text: string): string {
  return ['<source_text>', text, '</source_text>'].join('\n');
}
