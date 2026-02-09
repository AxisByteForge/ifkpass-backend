import { describe, it, expect, vi, beforeEach } from 'vitest';
import { signinUserService } from './signin-service';
import {
  countRecentTokens,
  createAuthToken,
  getLastLoginTokenCreatedAt,
  invalidateLoginCodes
} from '@/infra/database/repository/authTokens/auth-tokens-db.service';
import { findUserByEmail } from '@/infra/database/repository/user/user-db.service';
import { findAdminByEmail } from '@/infra/database/repository/admins/admins-db.service';
import { sendVerificationCode } from '@/infra/mail/resend.service';
import { generateCode } from '@/shared/utils/generateCode';
import { getTokenExpiresAt } from '@/shared/utils/getTokenExpiresAt';

vi.mock('@/shared/lib/db', () => ({
  db: {}
}));
vi.mock('@/infra/database/repository/authTokens/auth-tokens-db.service');
vi.mock('@/infra/database/repository/user/user-db.service');
vi.mock('@/infra/database/repository/admins/admins-db.service');
vi.mock('@/infra/mail/resend.service');
vi.mock('@/shared/utils/generateCode');
vi.mock('@/shared/utils/getTokenExpiresAt');

const mockUser = {
  id: 'user-123',
  email: 'user@example.com',
  name: 'John',
  lastName: 'Doe',
  cpf: '12345678900',
  phone: '11999999999',
  status: 'pending',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

describe('Signin Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(generateCode).mockReturnValue('123456');
    vi.mocked(getTokenExpiresAt).mockReturnValue(new Date(Date.now() + 600000));
  });

  describe('User Not Found', () => {
    it('should return error when user does not exist', async () => {
      vi.mocked(findAdminByEmail).mockResolvedValue(null);
      vi.mocked(findUserByEmail).mockResolvedValue(null);

      const result = await signinUserService({ email: 'notfound@example.com' });

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value.reason).toBe('User not found');
        expect(result.value.statusCode).toBe(404);
      }
    });
  });

  describe('Rate Limiting', () => {
    it('should return error when too many login attempts', async () => {
      const lastTokenDate = new Date(Date.now() - 30000); // 30 seconds ago

      vi.mocked(findAdminByEmail).mockResolvedValue(null);
      vi.mocked(findUserByEmail).mockResolvedValue(mockUser);
      vi.mocked(countRecentTokens).mockResolvedValue(2);
      vi.mocked(getLastLoginTokenCreatedAt).mockResolvedValue(lastTokenDate);

      const result = await signinUserService({ email: 'user@example.com' });

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value.reason).toContain('Too many login attempts');
        expect(result.value.statusCode).toBe(429);
      }

      expect(invalidateLoginCodes).not.toHaveBeenCalled();
      expect(sendVerificationCode).not.toHaveBeenCalled();
    });
  });

  describe('Successful Signin', () => {
    it('should successfully send signin code for regular user', async () => {
      vi.mocked(findAdminByEmail).mockResolvedValue(null);
      vi.mocked(findUserByEmail).mockResolvedValue(mockUser);
      vi.mocked(countRecentTokens).mockResolvedValue(0);
      vi.mocked(invalidateLoginCodes).mockResolvedValue();
      vi.mocked(createAuthToken).mockResolvedValue({} as any);
      vi.mocked(sendVerificationCode).mockResolvedValue({} as any);

      const result = await signinUserService({ email: 'user@example.com' });

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.message).toBe('Email verified successfully');
      }

      expect(invalidateLoginCodes).toHaveBeenCalledWith('user-123', false);
      expect(createAuthToken).toHaveBeenCalledWith({
        userId: 'user-123',
        adminId: null,
        token: '123456',
        type: 'login_code',
        expiresAt: expect.any(Date)
      });
      expect(sendVerificationCode).toHaveBeenCalledWith(
        'user@example.com',
        '123456'
      );
    });

    it('should successfully send signin code for admin', async () => {
      const mockAdmin = {
        id: 'admin-123',
        email: 'admin@example.com',
        name: 'Admin',
        lastName: 'User',
        cpf: '12345678900',
        phone: '11999999999',
        createdAt: new Date().toISOString()
      };

      vi.mocked(findAdminByEmail).mockResolvedValue(mockAdmin);
      vi.mocked(countRecentTokens).mockResolvedValue(0);
      vi.mocked(invalidateLoginCodes).mockResolvedValue();
      vi.mocked(createAuthToken).mockResolvedValue({} as any);
      vi.mocked(sendVerificationCode).mockResolvedValue({} as any);

      const result = await signinUserService({ email: 'admin@example.com' });

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.message).toBe('Email verified successfully');
      }

      expect(invalidateLoginCodes).toHaveBeenCalledWith('admin-123', true);
      expect(createAuthToken).toHaveBeenCalledWith({
        userId: null,
        adminId: 'admin-123',
        token: '123456',
        type: 'login_code',
        expiresAt: expect.any(Date)
      });
      expect(sendVerificationCode).toHaveBeenCalledWith(
        'admin@example.com',
        '123456'
      );
    });
  });

  describe('Token Generation', () => {
    it('should generate and send unique verification code', async () => {
      vi.mocked(findAdminByEmail).mockResolvedValue(null);
      vi.mocked(findUserByEmail).mockResolvedValue(mockUser);
      vi.mocked(countRecentTokens).mockResolvedValue(0);
      vi.mocked(invalidateLoginCodes).mockResolvedValue();
      vi.mocked(createAuthToken).mockResolvedValue({} as any);
      vi.mocked(sendVerificationCode).mockResolvedValue({} as any);

      await signinUserService({ email: 'user@example.com' });

      expect(generateCode).toHaveBeenCalled();
      expect(createAuthToken).toHaveBeenCalledWith(
        expect.objectContaining({
          token: '123456'
        })
      );
    });
  });
});
