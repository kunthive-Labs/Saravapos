import type { AnalogyBank } from './schemas/analogy_bank.js';
import type { CognitiveStyle } from './schemas/cognitive_style.js';
import type { CulturalContext } from './schemas/cultural_context.js';
import type { Expertise } from './schemas/expertise.js';
import type { Identity } from './schemas/identity.js';

export type { AnalogyBank, AnalogyEntry } from './schemas/analogy_bank.js';
export type {
  AbstractionTolerance,
  CognitiveMode,
  CognitiveStyle,
} from './schemas/cognitive_style.js';
export type { CulturalContext } from './schemas/cultural_context.js';
export type { Expertise, ExpertiseLevel } from './schemas/expertise.js';
export type { Identity } from './schemas/identity.js';

export interface Profile {
  schema_version: '0.1';
  identity: Identity;
  expertise?: Expertise[];
  analogy_bank?: AnalogyBank;
  cognitive_style?: CognitiveStyle;
  cultural_context?: CulturalContext;
}
