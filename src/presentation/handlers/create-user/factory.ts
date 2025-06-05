import { CreateUserUseCase } from '../../../core/user/application/use-cases/create-user.use-case';
import { Argon2Hasher } from '../../../infra/cryptography/argon2/argon2-crypto';
import { ResendMailService } from '../../../infra/mail/resend-client';
import { DynamoUserRepository } from '../../../infra/persitence/user-repository.dynamo';

export function makeRegisterUseCase() {
  const usersRepository = new DynamoUserRepository();
  const cryptography = new Argon2Hasher();
  const mailService = new ResendMailService();
  const createUserUseCase = new CreateUserUseCase(
    usersRepository,
    cryptography,
    mailService,
  );
  return createUserUseCase;
}
