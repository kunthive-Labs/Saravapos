export type { CriterionScore, GoldenCase, JudgeResult, RubricCriterion } from './types.js';
export { goldenCaseSchema } from './schema.js';
export { CaseValidationError, JudgeParseError } from './errors.js';
export { loadCase, loadCaseFromString, loadAllCases } from './loadCase.js';
export {
  DEFAULT_JUDGE_MODEL,
  judge,
  parseJudgeResponse,
  weightedOverall,
  type JudgeOptions,
} from './judge.js';
export { runLexicalChecks, type LexicalResult } from './lexical.js';
export { buildJudgeSystemPrompt, buildJudgeUserPrompt } from './judgePrompts.js';
export {
  evaluateGate,
  compareToBaseline,
  buildBaseline,
  BASELINE_VERSION,
  DEFAULT_REGRESSION_DELTA,
  type GateThresholds,
  type GateViolation,
  type GateReport,
  type Baseline,
  type Regression,
  type RegressionReport,
} from './gate.js';
