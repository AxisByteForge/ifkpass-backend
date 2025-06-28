import { CreateProfileUseCase } from '../../../../../core/application/use-cases/create-profile/create-profile.use-case';
import { DynamoUserRepository } from '../../../../database/user-repository.dynamo';

export function makeCreateProfileUseCase() {
  const usersRepository = new DynamoUserRepository();
  const createProfileUseCase = new CreateProfileUseCase(usersRepository);
  return createProfileUseCase;
}
