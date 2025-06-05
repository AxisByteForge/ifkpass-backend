import { CryptographyAdapter } from '../../../../adapters/cryptography/cryptography-adapter';
import { MailServiceAdapter } from '../../../../adapters/mail/mail-adapter';
import { User } from '../../domain/entities/User.entity';
import { UserAlreadyExistsException } from '../../domain/errors/user-already-exists-exception';
import { UserRepository } from '../../domain/repositories/UserRepository';
import {
  CreateAdminUseCaseRequest,
  CreateAdminUseCaseResponse,
} from '../dto/create-admin.use-case.interface';

export class CreateUserUseCase {
  constructor(
    private adminRepository: UserRepository,
    private cryptography: CryptographyAdapter,
    private mailService: MailServiceAdapter,
  ) {}

  async execute({
    props,
  }: CreateAdminUseCaseRequest): Promise<CreateAdminUseCaseResponse> {
    const userAlreadyExists = await this.adminRepository.findByEmail(
      props.email,
    );

    if (userAlreadyExists) {
      return new UserAlreadyExistsException(props.email);
    }

    const hashedPassword = await this.cryptography.hash(props.password);
    const verificationCode = User.generateVerificationCode();
    const hashedVerificationCode =
      await this.cryptography.hash(verificationCode);

    const user = User.create({
      ...props,
      password: hashedPassword,
      emailVerificationCode: hashedVerificationCode,
    });

    await this.adminRepository.create(user);

    await this.mailService.send({
      email: user.email,
      verifyCode: verificationCode,
    });

    return {
      user,
    };
  }
}
