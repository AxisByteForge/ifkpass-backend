import type { Either } from '@/shared/types/either';
import type { Failure } from '@/shared/types/failure.type';

export interface SendPhotoServiceRequest {
  Id: string;
}

export interface SendPhotoOutput {
  photoUrl: string;
  uploadUrl: string;
}

export type SendPhotoUseCaseResponse = Either<Failure, SendPhotoOutput>;
