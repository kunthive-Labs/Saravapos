export class AdapterError extends Error {
  readonly provider: string;
  readonly status?: number | undefined;
  override readonly cause?: unknown;

  constructor(
    message: string,
    provider: string,
    options: { status?: number; cause?: unknown } = {},
  ) {
    super(message);
    this.name = 'AdapterError';
    this.provider = provider;
    this.status = options.status;
    this.cause = options.cause;
  }
}
