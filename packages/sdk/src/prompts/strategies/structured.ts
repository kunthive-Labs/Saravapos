import type { Profile } from '@saravapos/spec';
import { describeProfile } from '../system.js';
import { buildUserPrompt } from '../user.js';
import type { PromptStrategy } from '../types.js';

const CONTRACT = [
  '# TRANSLATION CONTRACT',
  '1. Preserve the semantic content: every claim, the structure, and the intent.',
  '2. Replace jargon, references, and analogies the target would not recognize',
  '   with equivalents drawn from the target worldview.',
  '3. Match the target cognitive style: mode, abstraction tolerance, framings.',
  '4. Never invent facts. If a concept has no faithful target-side analogue,',
  '   keep it and explain it briefly in target-native terms.',
  '5. Avoid any references the target is marked to avoid.',
].join('\n');

const CHECKLIST = [
  '# FIDELITY CHECKLIST (verify silently before answering)',
  '- [ ] Every claim in the source is present in the output.',
  '- [ ] No source-only jargon survives untranslated.',
  '- [ ] Tone and abstraction match the target cognitive style.',
  '- [ ] The output is ONLY the translation — no preamble, no meta-commentary.',
].join('\n');

const OUTPUT = '# OUTPUT\nReturn only the translated text.';

/** Build a sectioned system prompt: role, profiles, contract, checklist, output. */
export function buildStructuredSystemPrompt(from: Profile, to: Profile): string {
  return [
    '# ROLE\nYou are a worldview translator. Rewrite text expressed in the SOURCE',
    'worldview so it lands faithfully for someone with the TARGET worldview.',
    describeProfile(from, 'source'),
    describeProfile(to, 'target'),
    CONTRACT,
    CHECKLIST,
    OUTPUT,
  ].join('\n\n');
}

/**
 * Same profile rendering as `baseline`, but the instructions are reorganised
 * into explicit sections plus a self-check list. Isolates "does structure help"
 * from any change in what the model knows about the profiles.
 */
export const structuredStrategy: PromptStrategy = {
  name: 'structured',
  description: 'Sectioned system prompt (role / profiles / contract / checklist / output).',
  buildSystemPrompt: buildStructuredSystemPrompt,
  buildUserPrompt,
};
