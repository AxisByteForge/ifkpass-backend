import { UserAlreadyExistsException } from '../../../domain/errors/user-already-exists-exception';
import { Either } from '../../../either';

export interface CreateUserUseCaseRequest {
  props: {
    name: string;
    lastName: string;
    email: string;
    password: string;
  };
}

export type CreateUserUseCaseResponse = Either<
  UserAlreadyExistsException,
  object
>;
