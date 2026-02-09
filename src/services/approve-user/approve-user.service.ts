import {
  findUserById,
  updateUserStatus
} from '@/infra/database/repository/user/user-db.service';
import type {
  ApproveUserServiceRequest,
  ApproveUserUseCaseResponse
} from './approve-user.service.interface';
import { left, right } from '@/shared/types/either';

export const approveUser = async (
  input: ApproveUserServiceRequest
): Promise<ApproveUserUseCaseResponse> => {
  const user = await findUserById(input.userId);

  if (!user) {
    return left({
      reason: `User with ID ${input.userId} not found`,
      statusCode: 404
    });
  }

  await updateUserStatus(input.userId, input.status);

  return right({
    message: `User ${input.status === 'approved' ? 'approved' : 'rejected'} successfully`
  });
};
