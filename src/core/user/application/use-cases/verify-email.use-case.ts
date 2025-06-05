import { CryptographyAdapter } from '../../../../adapters/cryptography/cryptography-adapter';
import { User } from '../../domain/entities/User.entity';
import { UserAlreadyExistsException } from '../../domain/errors/user-already-exists-exception';
import { UserRepository } from '../../domain/repositories/UserRepository';
import {
  VerifyEmailUseCaseRequest,
  VerifyEmailUseCaseResponse,
} from '../dto/verify-email.use-case.interface';

export class VerifyEmailUseCase {
  constructor(
    private adminRepository: UserRepository,
    private cryptography: CryptographyAdapter,
  ) {}

  async execute({
    props,
  }: VerifyEmailUseCaseRequest): Promise<VerifyEmailUseCaseResponse> {
    const userAlreadyExists = await this.adminRepository.findByEmail(
      props.email,
    );

    const code = userAlreadyExists?.emailVerificationCode || '';

    const hashedPassword = await this.cryptography.compare(
      code,
      props.emailVerificationCode,
    );

    console.log(hashedPassword);

    return {
      ok: true,
    };
  }
}
