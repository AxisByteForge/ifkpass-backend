import { describe, it, expect, vi, beforeEach } from 'vitest';
import { listPendingUsers } from './list-pending-users.service';
import { findUsersByStatus } from '@/infra/database/repository/user/user-db.service';

vi.mock('@/shared/lib/db', () => ({
  db: {}
}));
vi.mock('@/infra/database/repository/user/user-db.service');

const mockPendingUsers = [
  {
    id: 'user-1',
    email: 'user1@example.com',
    name: 'John',
    lastName: 'Doe',
    cpf: '12345678900',
    phone: '11999999999',
    status: 'pending',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'user-2',
    email: 'user2@example.com',
    name: 'Jane',
    lastName: 'Smith',
    cpf: '98765432100',
    phone: '11888888888',
    status: 'pending',
    createdAt: '2026-01-02T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z'
  }
];

describe('ListPendingUsers Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return pending users with pagination info', async () => {
    vi.mocked(findUsersByStatus).mockResolvedValue({
      data: mockPendingUsers,
      total: 2
    });

    const result = await listPendingUsers({ limit: 50, offset: 0 });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.users).toHaveLength(2);
      expect(result.value.total).toBe(2);
      expect(result.value.limit).toBe(50);
      expect(result.value.offset).toBe(0);
    }

    expect(findUsersByStatus).toHaveBeenCalledWith('pending', 50, 0);
  });

  it('should return empty list when no pending users exist', async () => {
    vi.mocked(findUsersByStatus).mockResolvedValue({
      data: [],
      total: 0
    });

    const result = await listPendingUsers({ limit: 50, offset: 0 });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.users).toHaveLength(0);
      expect(result.value.total).toBe(0);
    }
  });

  it('should pass custom limit and offset to repository', async () => {
    vi.mocked(findUsersByStatus).mockResolvedValue({
      data: [mockPendingUsers[0]],
      total: 2
    });

    const result = await listPendingUsers({ limit: 1, offset: 1 });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.users).toHaveLength(1);
      expect(result.value.total).toBe(2);
      expect(result.value.limit).toBe(1);
      expect(result.value.offset).toBe(1);
    }

    expect(findUsersByStatus).toHaveBeenCalledWith('pending', 1, 1);
  });

  it('should return failure when repository throws an error', async () => {
    vi.mocked(findUsersByStatus).mockRejectedValue(
      new Error('Database connection failed')
    );

    const result = await listPendingUsers({ limit: 50, offset: 0 });

    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value.reason).toBe('Failed to fetch pending users');
      expect(result.value.statusCode).toBe(500);
    }
  });
});
