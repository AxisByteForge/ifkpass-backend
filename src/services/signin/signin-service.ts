import {
  countRecentTokens,
  createAuthToken,
  getLastLoginTokenCreatedAt,
  invalidateLoginCodes
} from '@/infra/database/repository/authTokens/auth-tokens-db.service';
import { findUserByEmail } from '@/infra/database/repository/user/user-db.service';
import { generateCode } from '@/shared/utils/generateCode';
import { getTokenExpiresAt } from '@/shared/utils/getTokenExpiresAt';
import {
  SigninServiceRequest,
  SigninUseCaseResponse
} from './signin.service.interface';
import { findAdminByEmail } from '@/infra/database/repository/admins/admins-db.service';
import { left, right } from '@/shared/types/either';
import type { Either } from '@/shared/types/either';
import type { Failure } from '@/shared/types/failure.type';
import { sendVerificationCode } from '@/infra/mail/resend.service';

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
      isAdmin: false
    });
  }

  return right({
    id: admin.id,
    email: admin.email,
    isAdmin: true
  });
};

export const signinUserService = async (
  input: SigninServiceRequest
): Promise<SigninUseCaseResponse> => {
  const userResult = await isAdmin(input.email);

  if (userResult.isLeft()) {
    return left(userResult.value);
  }

  const user = userResult.value;
  const recentTokenCount = await countRecentTokens(user.id);

  if (recentTokenCount >= 2) {
    const lastTokenDate = await getLastLoginTokenCreatedAt(user);

    if (lastTokenDate) {
      const retryAfter = new Date(lastTokenDate.getTime() + 60 * 1000); // +1 minute
      return left({
        reason: `Too many login attempts. Please try again after ${retryAfter.toISOString()}`,
        statusCode: 429
      });
    }
  }

  await invalidateLoginCodes(user.id, user.isAdmin);

  const code = generateCode();

  await createAuthToken({
    userId: user.isAdmin ? null : user.id,
    adminId: user.isAdmin ? user.id : null,
    token: code,
    type: 'login_code',
    expiresAt: getTokenExpiresAt()
  });

  await sendVerificationCode(user.email, code);

  return right({
    message: 'Email verified successfully'
  });
};
