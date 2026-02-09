/**
 * @deprecated Use Either<Failure, R> pattern instead of throwing exceptions.
 * Return left({ reason: 'Token was not valid', statusCode: 401 }) instead.
 */
export class TokenWasNotValidError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TokenWasNotValidError';
  }
}
