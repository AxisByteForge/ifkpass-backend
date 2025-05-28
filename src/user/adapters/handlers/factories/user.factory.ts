import { Argon2Hasher } from '../../../../shared/lib/cryptography/argon2/argon2-crypto';
import { DynamoClient } from '../../../../shared/modules/database/dynamo-db';
import { CreateUserUseCase } from '../../../core/use-cases/create-admin.use-case';
import { DynamoUserRepository } from '../../../infra/persitence/dynamo-admin.repository';

export function makeRegisterUseCase() {
  const usersRepository = new DynamoUserRepository(new DynamoClient());
  const cryptography = new Argon2Hasher();
  const createUserUseCase = new CreateUserUseCase(
    usersRepository,
    cryptography,
  );
  return createUserUseCase;
}
