import type { ErrorObject } from 'ajv';

export class JudgeParseError extends Error {
  /** The raw judge response we failed to parse, preserved for debugging. */
  readonly raw: string;

  constructor(message: string, raw: string) {
    super(message);
    this.name = 'JudgeParseError';
    this.raw = raw;
  }
}

export class CaseValidationError extends Error {
  readonly fieldPath: string;
  readonly validationErrors: ErrorObject[];

  constructor(message: string, fieldPath: string, errors: ErrorObject[]) {
    super(message);
    this.name = 'CaseValidationError';
    this.fieldPath = fieldPath;
    this.validationErrors = errors;
  }
}
