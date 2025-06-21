import { VerifyEmailUseCase } from '../../../../../core/application/use-cases/verify-email.use-case';
import { AwsCognitoService } from '../../../../aws/aws-cognito-client';
import { DynamoUserRepository } from '../../../../database/user-repository.dynamo';

export function factory() {
  const usersRepository = new DynamoUserRepository();
  const cognitoService = new AwsCognitoService();
  const createUserUseCase = new VerifyEmailUseCase(
    usersRepository,
    cognitoService,
  );
  return createUserUseCase;
}
