import { CreateUserUseCase } from '../../../../core/user/application/use-cases/create-user.use-case';
import { AwsCognitoService } from '../../../../infra/aws/aws-cognito-client';
import { DynamoUserRepository } from '../../../../infra/persitence/user-repository.dynamo';

export function makeRegisterUseCase() {
  const usersRepository = new DynamoUserRepository();
  const cognitoService = new AwsCognitoService();
  const createUserUseCase = new CreateUserUseCase(
    usersRepository,
    cognitoService,
  );
  return createUserUseCase;
}
