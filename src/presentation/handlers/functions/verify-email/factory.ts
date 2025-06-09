import { VerifyEmailUseCase } from '../../../../core/user/application/use-cases/verify-email.use-case';
import { Argon2Hasher } from '../../../../infra/cryptography/argon2/argon2-crypto';
import { DynamoUserRepository } from '../../../../infra/persitence/user-repository.dynamo';

export function factory() {
  const usersRepository = new DynamoUserRepository();
  const cryptography = new Argon2Hasher();
  const createUserUseCase = new VerifyEmailUseCase(
    usersRepository,
    cryptography,
  );
  return createUserUseCase;
}
