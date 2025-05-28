import argon2 from 'argon2';

export class Argon2Hasher {
  constructor() {}

  async hash(password: string): Promise<string> {
    return argon2.hash(password, {
      type: argon2.argon2id,
    });
  }

  async compare(dbPassword: string, loginPassword: string): Promise<boolean> {
    return argon2.verify(dbPassword, loginPassword);
  }
}
