import { describe, it, expect, vi, beforeEach } from 'vitest';
import { refreshToken } from './refresh-token.service';
import { verifyToken, generateTokenPair } from '@/infra/jwt/jwt.service';
import { findUserById } from '@/infra/database/repository/user/user-db.service';
import { findAdminById } from '@/infra/database/repository/admins/admins-db.service';
import { left, right } from '@/shared/types/either';

vi.mock('@/shared/lib/db', () => ({
  db: {}
}));
vi.mock('@/infra/jwt/jwt.service');
vi.mock('@/infra/database/repository/user/user-db.service');
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

describe('RefreshToken Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Token Verification', () => {
    it('should return error when token verification fails', async () => {
      vi.mocked(verifyToken).mockReturnValue(
        left({ reason: 'Invalid token', statusCode: 401 })
      );

      const result = await refreshToken({ refreshToken: 'invalid-token' });

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value.reason).toBe('Invalid token');
        expect(result.value.statusCode).toBe(401);
      }
    });

    it('should return error when token is expired', async () => {
      vi.mocked(verifyToken).mockReturnValue(
        left({ reason: 'Token expired', statusCode: 401 })
      );

      const result = await refreshToken({ refreshToken: 'expired-token' });

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value.reason).toBe('Token expired');
        expect(result.value.statusCode).toBe(401);
      }
    });
  });

  describe('Admin Token Refresh', () => {
    it('should successfully refresh admin token', async () => {
      const mockAdmin = {
        id: 'admin-123',
        email: 'admin@example.com',
        name: 'Admin',
        lastName: 'User',
        cpf: '12345678900',
        phone: '11999999999',
        createdAt: new Date().toISOString()
      };

      const mockTokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token'
      };

      vi.mocked(verifyToken).mockReturnValue(
        right({
          id: 'admin-123',
          email: 'admin@example.com',
          isAdmin: true
        })
      );

      vi.mocked(findAdminById).mockResolvedValue(mockAdmin);
      vi.mocked(generateTokenPair).mockReturnValue(mockTokens);

      const result = await refreshToken({ refreshToken: 'valid-admin-token' });

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value).toEqual(mockTokens);
      }

      expect(findAdminById).toHaveBeenCalledWith('admin-123');
      expect(generateTokenPair).toHaveBeenCalledWith({
        id: 'admin-123',
        email: 'admin@example.com',
        isAdmin: true
      });
    });

    it('should return error when admin not found', async () => {
      vi.mocked(verifyToken).mockReturnValue(
        right({
          id: 'admin-999',
          email: 'admin@example.com',
          isAdmin: true
        })
      );

      vi.mocked(findAdminById).mockResolvedValue(null);

      const result = await refreshToken({ refreshToken: 'valid-token' });

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value.reason).toBe('Admin not found');
        expect(result.value.statusCode).toBe(404);
      }

      expect(findAdminById).toHaveBeenCalledWith('admin-999');
      expect(generateTokenPair).not.toHaveBeenCalled();
    });
  });

  describe('User Token Refresh', () => {
    it('should successfully refresh user token', async () => {
      const mockApprovedUser = {
        ...mockUser,
        status: 'approved'
      };

      const mockTokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token'
      };

      vi.mocked(verifyToken).mockReturnValue(
        right({
          id: 'user-123',
          email: 'user@example.com'
        })
      );

      vi.mocked(findUserById).mockResolvedValue(mockApprovedUser);
      vi.mocked(generateTokenPair).mockReturnValue(mockTokens);

      const result = await refreshToken({ refreshToken: 'valid-user-token' });

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value).toEqual(mockTokens);
      }

      expect(findUserById).toHaveBeenCalledWith('user-123');
      expect(generateTokenPair).toHaveBeenCalledWith({
        id: 'user-123',
        email: 'user@example.com'
      });
    });

    it('should return error when user not found', async () => {
      vi.mocked(verifyToken).mockReturnValue(
        right({
          id: 'user-999',
          email: 'user@example.com'
        })
      );

      vi.mocked(findUserById).mockResolvedValue(null);

      const result = await refreshToken({ refreshToken: 'valid-token' });

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value.reason).toBe('User not found');
        expect(result.value.statusCode).toBe(404);
      }

      expect(findUserById).toHaveBeenCalledWith('user-999');
      expect(generateTokenPair).not.toHaveBeenCalled();
    });

    it('should return error when user status is pending', async () => {
      vi.mocked(verifyToken).mockReturnValue(
        right({
          id: 'user-123',
          email: 'user@example.com'
        })
      );

      vi.mocked(findUserById).mockResolvedValue(mockUser);

      const result = await refreshToken({ refreshToken: 'valid-token' });

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value.reason).toBe('User not approved yet');
        expect(result.value.statusCode).toBe(403);
      }

      expect(generateTokenPair).not.toHaveBeenCalled();
    });

    it('should return error when user status is rejected', async () => {
      const mockRejectedUser = {
        ...mockUser,
        status: 'rejected'
      };

      vi.mocked(verifyToken).mockReturnValue(
        right({
          id: 'user-123',
          email: 'user@example.com'
        })
      );

      vi.mocked(findUserById).mockResolvedValue(mockRejectedUser);

      const result = await refreshToken({ refreshToken: 'valid-token' });

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value.reason).toBe('User application was rejected');
        expect(result.value.statusCode).toBe(403);
      }

      expect(generateTokenPair).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle user with approved status correctly', async () => {
      const mockApprovedUser = {
        ...mockUser,
        status: 'approved'
      };

      const mockTokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token'
      };

      vi.mocked(verifyToken).mockReturnValue(
        right({
          id: 'user-123',
          email: 'user@example.com'
        })
      );

      vi.mocked(findUserById).mockResolvedValue(mockApprovedUser);
      vi.mocked(generateTokenPair).mockReturnValue(mockTokens);

      const result = await refreshToken({ refreshToken: 'valid-token' });

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value).toEqual(mockTokens);
      }
    });

    it('should not call findUserById when payload is admin', async () => {
      const mockAdmin = {
        id: 'admin-123',
        email: 'admin@example.com',
        name: 'Admin',
        lastName: 'User',
        cpf: '12345678900',
        phone: '11999999999',
        createdAt: new Date().toISOString()
      };

      vi.mocked(verifyToken).mockReturnValue(
        right({
          id: 'admin-123',
          email: 'admin@example.com',
          isAdmin: true
        })
      );

      vi.mocked(findAdminById).mockResolvedValue(mockAdmin);
      vi.mocked(generateTokenPair).mockReturnValue({
        accessToken: 'token',
        refreshToken: 'refresh'
      });

      await refreshToken({ refreshToken: 'admin-token' });

      expect(findAdminById).toHaveBeenCalled();
      expect(findUserById).not.toHaveBeenCalled();
    });

    it('should not call findAdminById when payload is regular user', async () => {
      vi.mocked(verifyToken).mockReturnValue(
        right({
          id: 'user-123',
          email: 'user@example.com'
        })
      );

      vi.mocked(findUserById).mockResolvedValue(mockUser);
      vi.mocked(generateTokenPair).mockReturnValue({
        accessToken: 'token',
        refreshToken: 'refresh'
      });

      await refreshToken({ refreshToken: 'user-token' });

      expect(findUserById).toHaveBeenCalled();
      expect(findAdminById).not.toHaveBeenCalled();
    });
  });
});
