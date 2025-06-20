import { User } from '../../domain/entities/User.entity';
import { UserAlreadyExistsException } from '../../domain/errors/user-already-exists-exception';

interface CreateUserUseCaseRequest {
  props: Pick<User, 'name' | 'lastName' | 'email' | 'password'>;
}

type CreateUserUseCaseResponse = { user: User } | UserAlreadyExistsException;

export { CreateUserUseCaseRequest, CreateUserUseCaseResponse };
