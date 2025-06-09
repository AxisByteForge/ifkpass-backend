import { CryptographyAdapter } from '../../../../adapters/cryptography/cryptography-adapter';
import { UserAlreadyExistsException } from '../../domain/errors/user-already-exists-exception';
import { UserRepository } from '../../domain/repositories/UserRepository';
import {
  VerifyEmailUseCaseRequest,
  VerifyEmailUseCaseResponse,
} from '../dto/verify-email.use-case.interface';

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

    await this.userRepository.updateEmailVerificationStatus(
      user?.userId,
      isVerifedCode,
    );

    return {
      message: 'Email is verifed sucessfully',
      email: user.email,
      success: true,
    };
  }
}
