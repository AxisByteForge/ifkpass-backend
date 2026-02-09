import type { Either } from '@/shared/types/either';
import type { Failure } from '@/shared/types/failure.type';

export interface SigninServiceRequest {
  email: string;
}

export interface SigninOutput {
  message: string;
}

export type SigninUseCaseResponse = Either<Failure, SigninOutput>;
