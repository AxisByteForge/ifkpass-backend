/**
 * @deprecated Use Either<Failure, R> pattern instead of throwing exceptions.
 * Return left({ reason: 'User not found', statusCode: 404 }) instead.
 */
export class UserNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UserNotFoundError';
  }
}
