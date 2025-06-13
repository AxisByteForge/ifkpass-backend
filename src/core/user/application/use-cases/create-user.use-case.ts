import { IdentityProviderServiceAdapter } from '../../../../adapters/aws/aws-cognito-adapter';
import { left, right } from '../../../either';
import { User } from '../../domain/entities/User.entity';
import { UserAlreadyExistsException } from '../../domain/errors/user-already-exists-exception';
import { UserRepository } from '../../domain/repositories/UserRepository';
import {
  CreateUserUseCaseRequest,
  CreateUserUseCaseResponse,
} from '../interfaces/create-user.use-case.interface';

export class CreateUserUseCase {
  constructor(
    private adminRepository: UserRepository,
    private identityProvider: IdentityProviderServiceAdapter,
  ) {}

  async execute({
    props,
  }: CreateUserUseCaseRequest): Promise<CreateUserUseCaseResponse> {
    const userAlreadyExists = await this.adminRepository.findByEmail(
      props.email,
    );

    if (userAlreadyExists) {
      return left(new UserAlreadyExistsException(props.email));
    }

    const user = User.create({
      ...props,
    });

    await this.identityProvider.signUp(user.userId, props.password);

    await this.adminRepository.create(user);

    return right({});
  }
}
