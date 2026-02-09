import { describe, it, expect, vi, beforeEach } from 'vitest';
import { approveUser } from './approve-user.service';
import {
  findUserById,
  updateUserStatus
} from '@/infra/database/repository/user/user-db.service';

vi.mock('@/shared/lib/db', () => ({
  db: {}
}));
vi.mock('@/infra/database/repository/user/user-db.service');

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

describe('ApproveUser Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('User Approval', () => {
    it('should successfully approve a pending user', async () => {
      vi.mocked(findUserById).mockResolvedValue(mockUser);
      vi.mocked(updateUserStatus).mockResolvedValue();

      const result = await approveUser({
        userId: 'user-123',
        status: 'approved'
      });

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.message).toBe('User approved successfully');
      }

      expect(findUserById).toHaveBeenCalledWith('user-123');
      expect(updateUserStatus).toHaveBeenCalledWith('user-123', 'approved');
    });

    it('should successfully reject a pending user', async () => {
      vi.mocked(findUserById).mockResolvedValue(mockUser);
      vi.mocked(updateUserStatus).mockResolvedValue();

      const result = await approveUser({
        userId: 'user-123',
        status: 'rejected'
      });

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.message).toBe('User rejected successfully');
      }

      expect(findUserById).toHaveBeenCalledWith('user-123');
      expect(updateUserStatus).toHaveBeenCalledWith('user-123', 'rejected');
    });

    it('should return error when user not found', async () => {
      vi.mocked(findUserById).mockResolvedValue(null);

      const result = await approveUser({
        userId: 'user-999',
        status: 'approved'
      });

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value.reason).toBe('User with ID user-999 not found');
        expect(result.value.statusCode).toBe(404);
      }

      expect(findUserById).toHaveBeenCalledWith('user-999');
      expect(updateUserStatus).not.toHaveBeenCalled();
    });
  });

  describe('Status Update', () => {
    it('should update user status to approved', async () => {
      vi.mocked(findUserById).mockResolvedValue(mockUser);
      vi.mocked(updateUserStatus).mockResolvedValue();

      await approveUser({
        userId: 'user-123',
        status: 'approved'
      });

      expect(updateUserStatus).toHaveBeenCalledWith('user-123', 'approved');
    });

    it('should update user status to rejected', async () => {
      vi.mocked(findUserById).mockResolvedValue(mockUser);
      vi.mocked(updateUserStatus).mockResolvedValue();

      await approveUser({
        userId: 'user-123',
        status: 'rejected'
      });

      expect(updateUserStatus).toHaveBeenCalledWith('user-123', 'rejected');
    });
  });
});
