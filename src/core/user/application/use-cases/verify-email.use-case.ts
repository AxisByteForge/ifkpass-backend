import { CryptographyAdapter } from '../../../../adapters/cryptography/cryptography-adapter';
import { left, right } from '../../../either';
import { UserAlreadyExistsException } from '../../domain/errors/user-already-exists-exception';
import { VerificationCodeDoesNotMatchException } from '../../domain/errors/verification-code-does-not-match';
import { UserRepository } from '../../domain/repositories/UserRepository';
import {
  VerifyEmailUseCaseRequest,
  VerifyEmailUseCaseResponse,
} from '../interfaces/verify-email.use-case.interface';

export class VerifyEmailUseCase {
  constructor(
    private userRepository: UserRepository,
    private cryptography: CryptographyAdapter,
  ) {}

  async execute({
    props,
  }: VerifyEmailUseCaseRequest): Promise<VerifyEmailUseCaseResponse> {
    const user = await this.userRepository.findByEmail(props.email);

    if (!user) {
      throw new UserAlreadyExistsException(props.email);
    }

    const code = user?.emailVerificationCode || '';

    const isVerifedCode = await this.cryptography.compare(
      code,
      props.emailVerificationCode,
    );

    if (!isVerifedCode) {
      return left(new VerificationCodeDoesNotMatchException());
    }

    await this.userRepository.updateEmailVerificationStatus(
      user?.userId,
      isVerifedCode,
    );

    return right({
      ok: true,
      message: 'Email verification sent',
    });
  }
}
