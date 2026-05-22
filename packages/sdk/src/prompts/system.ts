import type { Profile } from '@wv/spec';

function describeProfile(profile: Profile, role: 'source' | 'target'): string {
  const lines: string[] = [];
  lines.push(`# ${role === 'source' ? 'SOURCE' : 'TARGET'} WORLDVIEW`);
  lines.push(`Display name: ${profile.identity.display_name}`);
  lines.push(`Languages: ${profile.identity.languages.join(', ')}`);
  if (profile.identity.region) {
    lines.push(`Region: ${profile.identity.region}`);
  }
  const expertise = profile.expertise
    .map((e) => `${e.domain} (${e.level}${e.years ? `, ${e.years}y` : ''})`)
    .join('; ');
  lines.push(`Expertise: ${expertise}`);
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

export function buildSystemPrompt(from: Profile, to: Profile): string {
  return [describeProfile(from, 'source'), describeProfile(to, 'target')].join('\n\n');
}
