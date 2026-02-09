/**
 * @deprecated Use Either<Failure, R> pattern instead of throwing exceptions.
 * Return left({ reason: 'Too many login attempts...', statusCode: 429 }) instead.
 */
export class TooManyTokensError extends Error {
  public readonly lastTokenTime: Date;
  public readonly retryAfter: Date;

  constructor(lastTokenTime: Date, retryAfter: Date) {
    super('Too many login tokens requested. Please try again later.');
    this.name = 'TooManyTokensError';
    this.lastTokenTime = lastTokenTime;
    this.retryAfter = retryAfter;
  }

  toJSON() {
    return {
      message: this.message,
      lastTokenTime: this.lastTokenTime,
      retryAfter: this.retryAfter
    };
  }
}
