import { CreateProfileUseCase } from '../../../../../core/application/use-cases/create-profile.use-case';
import { AwsCognitoService } from '../../../../aws/aws-cognito-client';
import { DynamoUserRepository } from '../../../../database/user-repository.dynamo';

export function makeProfileUseCase() {
  const usersRepository = new DynamoUserRepository();
  const cognitoService = new AwsCognitoService();
  const createProfileUseCase = new CreateProfileUseCase(
    usersRepository,
    cognitoService,
  );
  return createProfileUseCase;
}
