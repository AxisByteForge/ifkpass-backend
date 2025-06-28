import { AuthenticateUseCase } from '../../../../../core/application/use-cases/authenticate/authenticate.use-case';
import { AwsCognitoService } from '../../../../aws/aws-cognito-client';
import { DynamoUserRepository } from '../../../../database/user-repository.dynamo';

export function factory() {
  const usersRepository = new DynamoUserRepository();
  const cognitoService = new AwsCognitoService();
  const authenticateUseCase = new AuthenticateUseCase(
    usersRepository,
    cognitoService,
  );
  return authenticateUseCase;
}
