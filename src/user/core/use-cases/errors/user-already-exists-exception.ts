export class UserAlreadyExistsException extends Error {
  constructor(identifier: string) {
    super(`Admin "${identifier}" already exists.`);
  }
}
