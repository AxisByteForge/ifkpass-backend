import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authenticate } from './authenticate.service';
import { findUserByEmail } from '@/infra/database/repository/user/user-db.service';
import {
  findValidToken,
  markTokenAsUsed
} from '@/infra/database/repository/authTokens/auth-tokens-db.service';
import { generateTokenPair } from '@/infra/jwt/jwt.service';
import { findAdminByEmail } from '@/infra/database/repository/admins/admins-db.service';

vi.mock('@/shared/lib/db', () => ({
  db: {}
}));
vi.mock('@/infra/database/repository/user/user-db.service');
vi.mock('@/infra/database/repository/authTokens/auth-tokens-db.service');
vi.mock('@/infra/jwt/jwt.service');
vi.mock('@/infra/database/repository/admins/admins-db.service');

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

describe('Authenticate Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('User Not Found', () => {
    it('should return error when email does not exist', async () => {
      vi.mocked(findAdminByEmail).mockResolvedValue(null);
      vi.mocked(findUserByEmail).mockResolvedValue(null);

      const result = await authenticate({
        email: 'notfound@example.com',
        code: '123456'
      });

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value.reason).toBe('User not found');
        expect(result.value.statusCode).toBe(404);
      }
    });
  });

  describe('Invalid Token', () => {
    it('should return error when token is invalid', async () => {
      vi.mocked(findAdminByEmail).mockResolvedValue(null);
      vi.mocked(findUserByEmail).mockResolvedValue(mockUser);
      vi.mocked(findValidToken).mockResolvedValue(null);

      const result = await authenticate({
        email: 'user@example.com',
        code: 'invalid'
      });

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value.reason).toBe('Token was not valid');
        expect(result.value.statusCode).toBe(401);
      }

      expect(findValidToken).toHaveBeenCalledWith('invalid');
    });
  });

  describe('Admin Authentication', () => {
    it('should successfully authenticate admin', async () => {
      const mockAdmin = {
        id: 'admin-123',
        email: 'admin@example.com',
        name: 'Admin',
        lastName: 'User',
        cpf: '12345678900',
        phone: '11999999999',
        createdAt: new Date().toISOString()
      };

      const mockAuthToken = {
        id: 'token-123',
        userId: null,
        adminId: 'admin-123',
        token: '123456',
        type: 'login_code',
        expiresAt: new Date(Date.now() + 600000),
        used: false,
        createdAt: new Date()
      };

      const mockTokens = {
        accessToken: 'admin-access-token',
        refreshToken: 'admin-refresh-token'
      };

      vi.mocked(findAdminByEmail).mockResolvedValue(mockAdmin);
      vi.mocked(findValidToken).mockResolvedValue(mockAuthToken);
      vi.mocked(generateTokenPair).mockReturnValue(mockTokens);
      vi.mocked(markTokenAsUsed).mockResolvedValue();

      const result = await authenticate({
        email: 'admin@example.com',
        code: '123456'
      });

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value).toEqual(mockTokens);
      }

      expect(markTokenAsUsed).toHaveBeenCalledWith('123456');
      expect(generateTokenPair).toHaveBeenCalledWith({
        id: 'admin-123',
        email: 'admin@example.com',
        isAdmin: true
      });
    });
  });

  describe('User Authentication', () => {
    it('should successfully authenticate approved user', async () => {
      const mockApprovedUser = {
        ...mockUser,
        status: 'approved'
      };

      const mockAuthToken = {
        id: 'token-123',
        userId: 'user-123',
        adminId: null,
        token: '123456',
        type: 'login_code',
        expiresAt: new Date(Date.now() + 600000),
        used: false,
        createdAt: new Date()
      };

      const mockTokens = {
        accessToken: 'user-access-token',
        refreshToken: 'user-refresh-token'
      };

      vi.mocked(findAdminByEmail).mockResolvedValue(null);
      vi.mocked(findUserByEmail).mockResolvedValue(mockApprovedUser);
      vi.mocked(findValidToken).mockResolvedValue(mockAuthToken);
      vi.mocked(generateTokenPair).mockReturnValue(mockTokens);
      vi.mocked(markTokenAsUsed).mockResolvedValue();

      const result = await authenticate({
        email: 'user@example.com',
        code: '123456'
      });

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value).toEqual(mockTokens);
      }

      expect(markTokenAsUsed).toHaveBeenCalledWith('123456');
      expect(generateTokenPair).toHaveBeenCalledWith({
        id: 'user-123',
        email: 'user@example.com'
      });
    });
  });

  describe('Token Marking', () => {
    it('should mark token as used after successful authentication', async () => {
      const mockApprovedUser = {
        ...mockUser,
        status: 'approved'
      };

      const mockAuthToken = {
        id: 'token-123',
        userId: 'user-123',
        adminId: null,
        token: '123456',
        type: 'login_code',
        expiresAt: new Date(Date.now() + 600000),
        used: false,
        createdAt: new Date()
      };

      vi.mocked(findAdminByEmail).mockResolvedValue(null);
      vi.mocked(findUserByEmail).mockResolvedValue(mockApprovedUser);
      vi.mocked(findValidToken).mockResolvedValue(mockAuthToken);
      vi.mocked(generateTokenPair).mockReturnValue({
        accessToken: 'token',
        refreshToken: 'refresh'
      });
      vi.mocked(markTokenAsUsed).mockResolvedValue();

      await authenticate({
        email: 'user@example.com',
        code: '123456'
      });

      expect(markTokenAsUsed).toHaveBeenCalledTimes(1);
      expect(markTokenAsUsed).toHaveBeenCalledWith('123456');
    });
  });
});
