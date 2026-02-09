import { findUserByEmail } from '@/infra/database/repository/user/user-db.service';
import {
  AuthenticateServiceRequest,
  AuthenticateUseCaseResponse
} from './authenticate.service.interface';
import {
  findValidToken,
  markTokenAsUsed
} from '@/infra/database/repository/authTokens/auth-tokens-db.service';
import { generateTokenPair } from '@/infra/jwt/jwt.service';
import { findAdminByEmail } from '@/infra/database/repository/admins/admins-db.service';
import { left, right } from '@/shared/types/either';
import type { Either } from '@/shared/types/either';
import type { Failure } from '@/shared/types/failure.type';

const isAdmin = async (email: string): Promise<Either<Failure, any>> => {
  const admin = await findAdminByEmail(email);

  if (!admin) {
    const user = await findUserByEmail(email);

    if (!user) {
      return left({
        reason: 'User not found',
        statusCode: 404
      });
    }

    return right({
      id: user.id,
      email: user.email,
      isAdmin: false,
      status: user.status
    });
  }

  return right({
    id: admin.id,
    email: admin.email,
    isAdmin: true
  });
};

export const authenticate = async (
  input: AuthenticateServiceRequest
): Promise<AuthenticateUseCaseResponse> => {
  const userResult = await isAdmin(input.email);

  if (userResult.isLeft()) {
    return left(userResult.value);
  }

  const user = userResult.value;
  const code = input.code;

  const authToken = await findValidToken(code);

  if (!authToken) {
    return left({
      reason: 'Token was not valid',
      statusCode: 401
    });
  }

  if (user.isAdmin) {
    await markTokenAsUsed(code);

    const tokens = generateTokenPair({
      id: user.id,
      email: user.email,
      isAdmin: true
    });

    return right(tokens);
  }

  await markTokenAsUsed(code);

  const tokens = generateTokenPair({ id: user.id, email: user.email });

  return right(tokens);
};
