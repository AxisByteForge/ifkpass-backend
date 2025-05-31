import { Argon2Hasher } from '../../../../shared/lib/cryptography/argon2/argon2-crypto';
import { DynamoClient } from '../../../../shared/modules/database/dynamo-db';
import { MailService } from '../../../../shared/modules/mail/ses-client';
import { CreateUserUseCase } from '../../../core/use-cases/create-admin.use-case';
import { DynamoUserRepository } from '../../../persitence/dynamo-user.repository';

export function makeRegisterUseCase() {
  const usersRepository = new DynamoUserRepository(new DynamoClient());
  const cryptography = new Argon2Hasher();
  const mailService = new MailService();
  const createUserUseCase = new CreateUserUseCase(
    usersRepository,
    cryptography,
    mailService,
  );
  return createUserUseCase;
}
