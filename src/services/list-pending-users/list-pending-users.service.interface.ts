import type { Either } from '@/shared/types/either';
import type { Failure } from '@/shared/types/failure.type';
import type { UserDbData } from '@/infra/database/repository/user/user-db.interface';

export interface ListPendingUsersRequest {
  limit: number;
  offset: number;
}

export interface ListPendingUsersOutput {
  users: UserDbData[];
  total: number;
  limit: number;
  offset: number;
}

export type ListPendingUsersResponse = Either<Failure, ListPendingUsersOutput>;
