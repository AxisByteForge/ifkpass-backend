import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createUser } from './create-user.service';
import {
  findUserByEmail,
  createUserInDb
} from '@/infra/database/repository/user/user-db.service';

vi.mock('@/shared/lib/db', () => ({
  db: {}
}));
vi.mock('@/infra/database/repository/user/user-db.service');
vi.mock('node:crypto', () => ({
  randomUUID: vi.fn(() => 'mocked-uuid-123')
}));

describe('CreateUser Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('User Creation', () => {
    it('should successfully create a new user', async () => {
      vi.mocked(findUserByEmail).mockResolvedValue(null);
      vi.mocked(createUserInDb).mockResolvedValue(undefined);

      const result = await createUser({
        name: 'John',
        lastName: 'Doe',
        email: 'john@example.com'
      });

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value).toBe('mocked-uuid-123');
      }

      expect(findUserByEmail).toHaveBeenCalledWith('john@example.com');
      expect(createUserInDb).toHaveBeenCalledWith({
        id: 'mocked-uuid-123',
        name: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        status: 'pending'
      });
    });

    it('should return error when user already exists', async () => {
      const existingUser = {
        id: 'user-123',
        email: 'john@example.com',
        name: 'John',
        lastName: 'Doe',
        cpf: '12345678900',
        phone: '11999999999',
        status: 'approved',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      vi.mocked(findUserByEmail).mockResolvedValue(existingUser);

      const result = await createUser({
        name: 'John',
        lastName: 'Doe',
        email: 'john@example.com'
      });

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value.reason).toBe('User already exists');
        expect(result.value.statusCode).toBe(409);
      }

      expect(findUserByEmail).toHaveBeenCalledWith('john@example.com');
      expect(createUserInDb).not.toHaveBeenCalled();
    });

    it('should create user with status pending', async () => {
      vi.mocked(findUserByEmail).mockResolvedValue(null);
      vi.mocked(createUserInDb).mockResolvedValue(undefined);

      await createUser({
        name: 'John',
        lastName: 'Doe',
        email: 'john@example.com'
      });

      expect(createUserInDb).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'pending'
        })
      );
    });
  });
});
