/**
 * @deprecated Use Either<Failure, R> pattern instead of throwing exceptions.
 * Return left({ reason: 'User already exists', statusCode: 409 }) instead.
 */
export class UserAlreadyExistsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UserAlreadyExistsError';
  }
}
