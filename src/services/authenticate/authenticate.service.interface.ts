import type { Either } from '@/shared/types/either';
import type { Failure } from '@/shared/types/failure.type';

export interface AuthenticateServiceRequest {
  email: string;
  code: string;
}

export interface AuthenticateOutput {
  accessToken: string;
  refreshToken: string;
}

export type AuthenticateUseCaseResponse = Either<Failure, AuthenticateOutput>;
