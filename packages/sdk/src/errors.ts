import type { ErrorObject } from 'ajv';

export class ProfileValidationError extends Error {
  readonly fieldPath: string;
  readonly validationErrors: ErrorObject[];

  constructor(message: string, fieldPath: string, errors: ErrorObject[]) {
    super(message);
    this.name = 'ProfileValidationError';
    this.fieldPath = fieldPath;
    this.validationErrors = errors;
  }
}
