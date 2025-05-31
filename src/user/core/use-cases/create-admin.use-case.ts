import { UserAlreadyExistsException } from './errors/user-already-exists-exception';
import {
  CreateAdminUseCaseRequest,
  CreateAdminUseCaseResponse,
} from './interfaces/create-admin.use-case.interface';
import { CryptographyAdapter } from '../../adapters/cryptography/cryptography-adapter';
import { MailServiceAdapter } from '../../adapters/mail/mail-adapter';
import { UserRepository } from '../entity/repositories/UserRepository';
import { User } from '../entity/User.entity';

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

    const hash = await this.cryptography.hash(props.password);

    const user = User.create({ ...props, password: hash });

    await this.adminRepository.create(user);

    const isVerify = await this.mailService.send({
      email: user.email,
      verifyCode: user.emailVerificationCode,
    });

    console.log(isVerify);

    return {
      user,
    };
  }
}
