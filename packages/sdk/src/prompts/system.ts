import type { Profile } from '@saravapos/spec';

function describeProfile(profile: Profile, role: 'source' | 'target'): string {
  const lines: string[] = [];
  lines.push(`# ${role === 'source' ? 'SOURCE' : 'TARGET'} WORLDVIEW`);
  lines.push(`Display name: ${profile.identity.display_name}`);
  lines.push(`Languages: ${profile.identity.languages.join(', ')}`);
  if (profile.identity.region) {
    lines.push(`Region: ${profile.identity.region}`);
  }
  if (profile.expertise?.length) {
    const expertise = profile.expertise
      .map((e) => `${e.domain} (${e.level}${e.years ? `, ${e.years}y` : ''})`)
      .join('; ');
    lines.push(`Expertise: ${expertise}`);
  }
  if (profile.cognitive_style) {
    const cs = profile.cognitive_style;
    const prefers = cs.prefers?.length ? ` prefers ${cs.prefers.join(', ')};` : '';
    lines.push(
      `Cognitive style: mode=${cs.mode};${prefers} abstraction_tolerance=${cs.abstraction_tolerance}`,
    );
  }
  if (profile.cultural_context) {
    const cc = profile.cultural_context;
    if (cc.references_that_land?.length) {
      lines.push(`References that land: ${cc.references_that_land.join(', ')}`);
    }
    if (cc.references_to_avoid?.length) {
      lines.push(`References to avoid: ${cc.references_to_avoid.join(', ')}`);
    }
  }
  if (profile.analogy_bank?.length) {
    const sample = profile.analogy_bank
      .slice(0, 8)
      .map((a) => `- ${a.concept} -> ${a.metaphor}${a.domain ? ` [${a.domain}]` : ''}`)
      .join('\n');
    lines.push(`Analogy bank:\n${sample}`);
  }
  return lines.join('\n');
}

const INSTRUCTIONS = [
  '# TASK',
  'You are a worldview translator. Given a text expressed in the SOURCE worldview,',
  'rewrite it so that it lands faithfully for someone with the TARGET worldview.',
  '',
  'Rules:',
  '- Preserve the semantic content: claims, structure, and intent must not change.',
  '- Replace jargon, references, and analogies the target would not recognize with',
  '  equivalents drawn from the target worldview (use the analogy bank when relevant).',
  '- Match the target cognitive style (mode, abstraction tolerance, preferred framings).',
  '- Do not invent facts. If a concept has no faithful target-side analogue, keep it',
  '  and briefly explain it in target-native terms.',
  '- Avoid references the target is marked to avoid.',
  '- Output only the translated text. No preamble, no meta-commentary.',
].join('\n');

export function buildSystemPrompt(from: Profile, to: Profile): string {
  return [describeProfile(from, 'source'), describeProfile(to, 'target'), INSTRUCTIONS].join(
    '\n\n',
  );
}
