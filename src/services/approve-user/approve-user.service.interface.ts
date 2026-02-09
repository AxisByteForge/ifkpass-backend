import type { Either } from '@/shared/types/either';
import type { Failure } from '@/shared/types/failure.type';

export interface ApproveUserServiceRequest {
  userId: string;
  status: 'approved' | 'rejected';
}

export interface ApproveUserOutput {
  message: string;
}

export type ApproveUserUseCaseResponse = Either<Failure, ApproveUserOutput>;
