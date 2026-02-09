import { verifyToken, generateTokenPair } from '@/infra/jwt/jwt.service';
import { findUserById } from '@/infra/database/repository/user/user-db.service';
import { findAdminById } from '@/infra/database/repository/admins/admins-db.service';
import { left, right } from '@/shared/types/either';
import type {
  RefreshTokenServiceRequest,
  RefreshTokenUseCaseResponse
} from './refresh-token.service.interface';

export const refreshToken = async (
  input: RefreshTokenServiceRequest
): Promise<RefreshTokenUseCaseResponse> => {
  const tokenVerification = verifyToken(input.refreshToken);

  if (tokenVerification.isLeft()) {
    return left(tokenVerification.value);
  }

  const payload = tokenVerification.value;

  if (payload.isAdmin) {
    const admin = await findAdminById(payload.id);
    if (!admin) {
      return left({
        reason: 'Admin not found',
        statusCode: 404
      });
    }

    const tokens = generateTokenPair({
      id: admin.id,
      email: admin.email,
      isAdmin: true
    });

    return right(tokens);
  }

  const user = await findUserById(payload.id);
  if (!user) {
    return left({
      reason: 'User not found',
      statusCode: 404
    });
  }

  if (user.status === 'pending') {
    return left({
      reason: 'User not approved yet',
      statusCode: 403
    });
  }

  if (user.status === 'rejected') {
    return left({
      reason: 'User application was rejected',
      statusCode: 403
    });
  }

  const tokens = generateTokenPair({
    id: user.id,
    email: user.email
  });

  return right(tokens);
};
