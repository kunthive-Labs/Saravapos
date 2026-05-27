import type { ErrorObject } from 'ajv';

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
