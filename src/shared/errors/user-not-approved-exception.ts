/**
 * @deprecated Use Either<Failure, R> pattern instead of throwing exceptions.
 * Return left({ reason: 'User not approved', statusCode: 403 }) instead.
 */
export class UserNotApprovedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UserNotApprovedError';
  }
}
