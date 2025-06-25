import { CreateUserUseCase } from '../../../../../core/application/use-cases/create-user/create-user.use-case';
import { AwsCognitoService } from '../../../../aws/aws-cognito-client';
import { DynamoUserRepository } from '../../../../database/user-repository.dynamo';

export function makeRegisterUseCase() {
  const usersRepository = new DynamoUserRepository();
  const cognitoService = new AwsCognitoService();
  const createUserUseCase = new CreateUserUseCase(
    usersRepository,
    cognitoService,
  );
  return createUserUseCase;
}
