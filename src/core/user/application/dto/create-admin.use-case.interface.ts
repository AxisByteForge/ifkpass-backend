import { User } from '../../domain/entities/User.entity';
import { UserAlreadyExistsException } from '../../domain/errors/user-already-exists-exception';

interface CreateAdminUseCaseRequest {
  props: Pick<User, 'name' | 'lastName' | 'email' | 'password'>;
}

type CreateAdminUseCaseResponse = { user: User } | UserAlreadyExistsException;

export { CreateAdminUseCaseRequest, CreateAdminUseCaseResponse };
