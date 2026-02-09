import type { Either } from '@/shared/types/either';
import type { Failure } from '@/shared/types/failure.type';

export interface CreateUserServiceRequest {
  name: string;
  lastName: string;
  email: string;
  password: string;
  isAdmin?: boolean;
}

export type CreateUserUseCaseResponse = Either<Failure, string>;
