import {
  VerifyEmailUseCaseRequest,
  VerifyEmailUseCaseResponse,
} from './verify-email.use-case.interface';
import { IdentityProviderServiceAdapter } from '../../../domain/adapters/aws/aws-cognito-adapter';
import { left, right } from '../../../domain/either';
import { EmailAlreadyVerifiedException } from '../../../domain/errors/email-already-verified-exception';
import { UserNotFoundException } from '../../../domain/errors/user-not-found-exception';
import { UserRepository } from '../../../domain/repositories/UserRepository';

export class VerifyEmailUseCase {
  constructor(
    private userRepository: UserRepository,
    private identityProvider: IdentityProviderServiceAdapter,
  ) {}

  async execute({
    code,
    email,
    password,
  }: VerifyEmailUseCaseRequest): Promise<VerifyEmailUseCaseResponse> {
    const userAlreadyExists = await this.userRepository.findByEmail(email);

    if (!userAlreadyExists) {
      return left(new UserNotFoundException(email));
    }

    const isEmailVerified = await this.identityProvider.isEmailVerified(email);

    if (isEmailVerified) {
      return left(new EmailAlreadyVerifiedException(email));
    }

    await this.identityProvider.confirmEmail(email, code);

    const token = await this.identityProvider.signIn(email, password);

    return right({
      statusCode: 200,
      token,
    });
  }
}
