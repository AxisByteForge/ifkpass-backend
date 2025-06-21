import { Either } from '../../../domain/either';
import { UserAlreadyExistsException } from '../../../domain/errors/user-already-exists-exception';

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
