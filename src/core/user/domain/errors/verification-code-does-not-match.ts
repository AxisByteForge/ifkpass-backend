export class VerificationCodeDoesNotMatchException extends Error {
  constructor() {
    super('Code does not match');
  }
}
