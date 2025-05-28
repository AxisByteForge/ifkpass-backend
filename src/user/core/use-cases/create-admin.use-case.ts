import { UserAlreadyExistsException } from './errors/user-already-exists-exception';
import {
  CreateAdminUseCaseRequest,
  CreateAdminUseCaseResponse,
} from './interfaces/create-admin.use-case.interface';
import { CryptographyAdapter } from '../../adapters/cryptography/cryptography-adapter';
import { DynamoUserRepository } from '../../infra/persitence/dynamo-admin.repository';
import { User } from '../entity/User.entity';

export class CreateUserUseCase {
  constructor(
    private adminRepository: DynamoUserRepository,
    private cryptography: CryptographyAdapter,
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

    const admin = User.create({ ...props, password: hash });

    await this.adminRepository.create(admin);

    return {
      admin,
    };
  }
}
