import { findUsersByStatus } from '@/infra/database/repository/user/user-db.service';
import type {
  ListPendingUsersRequest,
  ListPendingUsersResponse
} from './list-pending-users.service.interface';
import { right } from '@/shared/types/either';

export const listPendingUsers = async (
  input: ListPendingUsersRequest
): Promise<ListPendingUsersResponse> => {
  const { data, total } = await findUsersByStatus(
    'pending',
    input.limit,
    input.offset
  );

  return right({
    users: data,
    total,
    limit: input.limit,
    offset: input.offset
  });
};
