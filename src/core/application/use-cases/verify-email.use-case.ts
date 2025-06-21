import { IdentityProviderServiceAdapter } from '../../domain/adapters/aws/aws-cognito-adapter';
import { EmailAlreadyVerifiedException } from '../../domain/errors/email-already-verified-exception';
import { UserNotFoundException } from '../../domain/errors/user-not-found-exception';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { left, right } from '../../either';
import {
  VerifyEmailUseCaseRequest,
  VerifyEmailUseCaseResponse,
} from './interfaces/verify-email.use-case.interface';

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
      throw new UserNotFoundException(email);
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
