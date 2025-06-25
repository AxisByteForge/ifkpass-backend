import {
  CreateUserUseCaseRequest,
  CreateUserUseCaseResponse,
} from './create-user.use-case.interface';
import { IdentityProviderServiceAdapter } from '../../../domain/adapters/aws/aws-cognito-adapter';
import { left, right } from '../../../domain/either';
import { User } from '../../../domain/entities/User.entity';
import { UserAlreadyExistsException } from '../../../domain/errors/user-already-exists-exception';
import { UserRepository } from '../../../domain/repositories/UserRepository';

export class CreateUserUseCase {
  constructor(
    private userRepository: UserRepository,
    private identityProvider: IdentityProviderServiceAdapter,
  ) {}

  async execute({
    props,
  }: CreateUserUseCaseRequest): Promise<CreateUserUseCaseResponse> {
    const userAlreadyExists = await this.userRepository.findByEmail(
      props.email,
    );

    if (userAlreadyExists) {
      return left(new UserAlreadyExistsException(props.email));
    }

    await this.identityProvider.signUp(props.email, props.password);

    const userId = await this.identityProvider.getUserId(props.email);

    const user = User.create({
      userId: userId ?? '',
      name: props.name,
      lastName: props.lastName,
      email: props.email,
    });

    await this.userRepository.create(user);

    return right({
      message: 'Created',
    });
  }
}
