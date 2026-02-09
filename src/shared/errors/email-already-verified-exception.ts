/**
 * @deprecated Use Either<Failure, R> pattern instead of throwing exceptions.
 */
export class EmailAlreadyVerifiedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EmailAlreadyVerifiedError';
  }
}
