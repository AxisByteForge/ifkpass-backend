import type { Either } from '@/shared/types/either';
import type { Failure } from '@/shared/types/failure.type';

export interface AuthenticateServiceRequest {
  email: string;
  code: string;
}

export interface AuthenticateOutput {
  token: string;
}

export type AuthenticateUseCaseResponse = Either<Failure, AuthenticateOutput>;
