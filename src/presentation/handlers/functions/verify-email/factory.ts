import { VerifyEmailUseCase } from '../../../../core/user/application/use-cases/verify-email.use-case';
import { AwsCognitoService } from '../../../../infra/aws/aws-cognito-client';
import { DynamoUserRepository } from '../../../../infra/persitence/user-repository.dynamo';

export function factory() {
  const usersRepository = new DynamoUserRepository();
  const cognitoService = new AwsCognitoService();
  const createUserUseCase = new VerifyEmailUseCase(
    usersRepository,
    cognitoService,
  );
  return createUserUseCase;
}
