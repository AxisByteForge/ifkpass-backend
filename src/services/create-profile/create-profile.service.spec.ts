import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createProfile } from './create-profile.service';
import {
  findUserById,
  updateUser
} from '@/infra/database/repository/user/user-db.service';
import {
  normalizeRank,
  beltCategoryFromRank,
  generateCardId
} from '@/shared/utils/karate-utils';

vi.mock('@/shared/lib/db', () => ({
  db: {}
}));
vi.mock('@/infra/database/repository/user/user-db.service');
vi.mock('@/shared/utils/karate-utils');

const mockUser = {
  id: 'user-123',
  email: 'user@example.com',
  name: 'John',
  lastName: 'Doe',
  cpf: '12345678900',
  phone: '11999999999',
  status: 'approved',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

describe('CreateProfile Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(normalizeRank).mockReturnValue('Amarela');
    vi.mocked(beltCategoryFromRank).mockReturnValue('colored');
    vi.mocked(generateCardId).mockReturnValue('CARD-123456');
  });

  describe('Profile Creation', () => {
    it('should successfully create user profile', async () => {
      vi.mocked(findUserById).mockResolvedValue(mockUser);
      vi.mocked(updateUser).mockResolvedValue();

      const result = await createProfile({
        id: 'user-123',
        body: {
          birthDate: '1990-01-01',
          city: 'São Paulo',
          cpf: '12345678900',
          dojo: 'Dojo São Paulo',
          rank: 'amarela',
          sensei: 'Sensei Name'
        }
      });

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.message).toBe('Created');
      }

      expect(findUserById).toHaveBeenCalledWith('user-123');
      expect(normalizeRank).toHaveBeenCalledWith('amarela');
      expect(beltCategoryFromRank).toHaveBeenCalledWith('Amarela');
      expect(generateCardId).toHaveBeenCalled();
      expect(updateUser).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({
          birthDate: '1990-01-01',
          city: 'São Paulo',
          cpf: '12345678900',
          dojo: 'Dojo São Paulo',
          rank: 'Amarela',
          sensei: 'Sensei Name',
          cardId: 'CARD-123456'
        })
      );
    });

    it('should return error when user not found', async () => {
      vi.mocked(findUserById).mockResolvedValue(null);

      const result = await createProfile({
        id: 'user-999',
        body: {
          birthDate: '1990-01-01',
          city: 'São Paulo',
          cpf: '12345678900',
          dojo: 'Dojo São Paulo',
          rank: 'amarela',
          sensei: 'Sensei Name'
        }
      });

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value.reason).toBe('User not found');
        expect(result.value.statusCode).toBe(404);
      }

      expect(findUserById).toHaveBeenCalledWith('user-999');
      expect(updateUser).not.toHaveBeenCalled();
    });
  });

  describe('Payment Details', () => {
    it('should create payment details for new profile', async () => {
      vi.mocked(findUserById).mockResolvedValue(mockUser);
      vi.mocked(updateUser).mockResolvedValue();

      await createProfile({
        id: 'user-123',
        body: {
          birthDate: '1990-01-01',
          city: 'São Paulo',
          cpf: '12345678900',
          dojo: 'Dojo São Paulo',
          rank: 'amarela',
          sensei: 'Sensei Name'
        }
      });

      expect(updateUser).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({
          paymentDetails: expect.objectContaining({
            alreadyPaid: false,
            status: 'pending',
            rank: 'Amarela',
            beltCategory: 'colored',
            updatedAt: expect.any(String)
          })
        })
      );
    });

    it('should preserve existing payment details when updating profile', async () => {
      const mockUserPayment = {
        id: 'user-123',
        email: 'user@example.com',
        name: 'John',
        lastName: 'Doe',
        cpf: '12345678900',
        phone: '11999999999',
        status: 'approved',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        paymentDetails: {
          alreadyPaid: true,
          status: 'approved',
          paymentId: 'payment-123',
          updatedAt: new Date().toISOString()
        }
      };

      vi.mocked(findUserById).mockResolvedValue(mockUserPayment);
      vi.mocked(updateUser).mockResolvedValue();

      await createProfile({
        id: 'user-123',
        body: {
          birthDate: '1990-01-01',
          city: 'São Paulo',
          cpf: '12345678900',
          dojo: 'Dojo São Paulo',
          rank: 'verde',
          sensei: 'Sensei Name'
        }
      });

      expect(updateUser).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({
          paymentDetails: expect.objectContaining({
            alreadyPaid: true,
            status: 'approved',
            paymentId: 'payment-123',
            rank: 'Amarela',
            beltCategory: 'colored'
          })
        })
      );
    });
  });

  describe('Card ID Generation', () => {
    it('should generate unique card ID for new profile', async () => {
      vi.mocked(findUserById).mockResolvedValue(mockUser);
      vi.mocked(updateUser).mockResolvedValue();

      await createProfile({
        id: 'user-123',
        body: {
          birthDate: '1990-01-01',
          city: 'São Paulo',
          cpf: '12345678900',
          dojo: 'Dojo São Paulo',
          rank: 'amarela',
          sensei: 'Sensei Name'
        }
      });

      expect(generateCardId).toHaveBeenCalled();
      expect(updateUser).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({
          cardId: 'CARD-123456'
        })
      );
    });
  });
});
