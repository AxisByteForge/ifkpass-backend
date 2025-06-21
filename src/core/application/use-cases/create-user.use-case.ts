import { IdentityProviderServiceAdapter } from '../../domain/adapters/aws/aws-cognito-adapter';
import { User } from '../../domain/entities/User.entity';
import { UserAlreadyExistsException } from '../../domain/errors/user-already-exists-exception';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { left, right } from '../../either';
import {
  CreateUserUseCaseRequest,
  CreateUserUseCaseResponse,
} from './interfaces/create-user.use-case.interface';

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

    return right({});
  }
}
