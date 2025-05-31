import { User } from '../../entity/User.entity';
import { UserAlreadyExistsException } from '../errors/user-already-exists-exception';

interface CreateAdminUseCaseRequest {
  props: Pick<User, 'name' | 'lastName' | 'email' | 'password'>;
}

type CreateAdminUseCaseResponse = { user: User } | UserAlreadyExistsException;

export { CreateAdminUseCaseRequest, CreateAdminUseCaseResponse };
