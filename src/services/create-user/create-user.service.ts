import {
  findUserByEmail,
  createUserInDb
} from '@/infra/database/repository/user/user-db.service';
import { randomUUID } from 'node:crypto';
import {
  CreateUserServiceRequest,
  CreateUserUseCaseResponse
} from './create-user.service.interface';
import { left, right } from '@/shared/types/either';

const createUser = async (
  input: CreateUserServiceRequest
): Promise<CreateUserUseCaseResponse> => {
  const userExists = await findUserByEmail(input.email);

  if (userExists) {
    return left({
      reason: 'User already exists',
      statusCode: 409
    });
  }

  const userId = randomUUID();

  await createUserInDb({
    id: userId,
    name: input.name,
    lastName: input.lastName,
    email: input.email,
    status: 'pending'
  });

  return right(userId);
};

export { createUser };
