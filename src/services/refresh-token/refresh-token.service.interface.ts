import type { Either } from '@/shared/types/either';
import type { Failure } from '@/shared/types/failure.type';

export interface RefreshTokenServiceRequest {
  refreshToken: string;
}

export interface RefreshTokenServiceResponse {
  accessToken: string;
  refreshToken: string;
}

export type RefreshTokenUseCaseResponse = Either<
  Failure,
  RefreshTokenServiceResponse
>;
