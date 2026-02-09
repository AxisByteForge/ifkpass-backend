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
import { normalizePhone } from '@/shared/utils/normalizePhone';
import { normalizeCpf } from '@/shared/utils/normalizeCpf';
import { normalizeBirthDate } from '@/shared/utils/normalizeBirthDate';

vi.mock('@/shared/lib/db', () => ({
  db: {}
}));
vi.mock('@/infra/database/repository/user/user-db.service');
vi.mock('@/shared/utils/karate-utils');
vi.mock('@/shared/utils/normalizePhone');
vi.mock('@/shared/utils/normalizeCpf');
vi.mock('@/shared/utils/normalizeBirthDate');

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
    vi.mocked(normalizePhone).mockImplementation((phone) =>
      phone.replace(/\D/g, '')
    );
    vi.mocked(normalizeCpf).mockImplementation((cpf) => cpf.replace(/\D/g, ''));
    vi.mocked(normalizeBirthDate).mockImplementation((date) => {
      const cleaned = date.replace(/[^\d-]/g, '');

      // If already in ISO format (YYYY-MM-DD), return as is
      if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) {
        return cleaned;
      }

      const digitsOnly = date.replace(/\D/g, '');
      if (digitsOnly.length === 8) {
        const day = digitsOnly.substring(0, 2);
        const month = digitsOnly.substring(2, 4);
        const year = digitsOnly.substring(4, 8);
        return `${year}-${month}-${day}`;
      }
      return date;
    });
  });

  describe('Profile Creation', () => {
    it('should successfully create user profile', async () => {
      vi.mocked(findUserById).mockResolvedValue(mockUser);
      vi.mocked(updateUser).mockResolvedValue();

      const result = await createProfile({
        id: 'user-123',
        body: {
          birthDate: '01/01/1990',
          city: 'São Paulo',
          cpf: '12345678900',
          dojo: 'Dojo São Paulo',
          rank: 'amarela',
          sensei: 'Sensei Name',
          phone: '11999999999',
          photoUrl: 'http://example.com/photo.jpg'
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
          sensei: 'Sensei Name',
          phone: '11999999999',
          photoUrl: 'http://example.com/photo.jpg'
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
          sensei: 'Sensei Name',
          phone: '11999999999',
          photoUrl: 'http://example.com/photo.jpg'
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
          sensei: 'Sensei Name',
          phone: '11999999999',
          photoUrl: 'http://example.com/photo.jpg'
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
          sensei: 'Sensei Name',
          phone: '11999999999',
          photoUrl: 'http://example.com/photo.jpg'
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

  describe('Phone Normalization', () => {
    it('should normalize phone number removing non-digits', async () => {
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
          sensei: 'Sensei Name',
          phone: '(11) 98765-4321',
          photoUrl: 'http://example.com/photo.jpg'
        }
      });

      expect(normalizePhone).toHaveBeenCalledWith('(11) 98765-4321');
      expect(updateUser).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({
          phone: '11987654321'
        })
      );
    });

    it('should normalize phone with country code', async () => {
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
          sensei: 'Sensei Name',
          phone: '+55 11 98765-4321',
          photoUrl: 'http://example.com/photo.jpg'
        }
      });

      expect(normalizePhone).toHaveBeenCalledWith('+55 11 98765-4321');
      expect(updateUser).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({
          phone: '5511987654321'
        })
      );
    });
  });

  describe('CPF Normalization', () => {
    it('should normalize CPF removing non-digits', async () => {
      vi.mocked(findUserById).mockResolvedValue(mockUser);
      vi.mocked(updateUser).mockResolvedValue();

      await createProfile({
        id: 'user-123',
        body: {
          birthDate: '1990-01-01',
          city: 'São Paulo',
          cpf: '123.456.789-00',
          dojo: 'Dojo São Paulo',
          rank: 'amarela',
          sensei: 'Sensei Name',
          phone: '11999999999',
          photoUrl: 'http://example.com/photo.jpg'
        }
      });

      expect(normalizeCpf).toHaveBeenCalledWith('123.456.789-00');
      expect(updateUser).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({
          cpf: '12345678900'
        })
      );
    });

    it('should normalize CPF with spaces', async () => {
      vi.mocked(findUserById).mockResolvedValue(mockUser);
      vi.mocked(updateUser).mockResolvedValue();

      await createProfile({
        id: 'user-123',
        body: {
          birthDate: '1990-01-01',
          city: 'São Paulo',
          cpf: '123 456 789 00',
          dojo: 'Dojo São Paulo',
          rank: 'amarela',
          sensei: 'Sensei Name',
          phone: '11999999999',
          photoUrl: 'http://example.com/photo.jpg'
        }
      });

      expect(normalizeCpf).toHaveBeenCalledWith('123 456 789 00');
      expect(updateUser).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({
          cpf: '12345678900'
        })
      );
    });
  });

  describe('BirthDate Normalization', () => {
    it('should normalize birth date from DD/MM/YYYY to YYYY-MM-DD', async () => {
      vi.mocked(findUserById).mockResolvedValue(mockUser);
      vi.mocked(updateUser).mockResolvedValue();

      await createProfile({
        id: 'user-123',
        body: {
          birthDate: '15/03/1990',
          city: 'São Paulo',
          cpf: '12345678900',
          dojo: 'Dojo São Paulo',
          rank: 'amarela',
          sensei: 'Sensei Name',
          phone: '11999999999',
          photoUrl: 'http://example.com/photo.jpg'
        }
      });

      expect(normalizeBirthDate).toHaveBeenCalledWith('15/03/1990');
      expect(updateUser).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({
          birthDate: '1990-03-15'
        })
      );
    });

    it('should normalize birth date from DD-MM-YYYY to YYYY-MM-DD', async () => {
      vi.mocked(findUserById).mockResolvedValue(mockUser);
      vi.mocked(updateUser).mockResolvedValue();

      await createProfile({
        id: 'user-123',
        body: {
          birthDate: '15-03-1990',
          city: 'São Paulo',
          cpf: '12345678900',
          dojo: 'Dojo São Paulo',
          rank: 'amarela',
          sensei: 'Sensei Name',
          phone: '11999999999',
          photoUrl: 'http://example.com/photo.jpg'
        }
      });

      expect(normalizeBirthDate).toHaveBeenCalledWith('15-03-1990');
      expect(updateUser).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({
          birthDate: '1990-03-15'
        })
      );
    });

    it('should normalize birth date from DD.MM.YYYY to YYYY-MM-DD', async () => {
      vi.mocked(findUserById).mockResolvedValue(mockUser);
      vi.mocked(updateUser).mockResolvedValue();

      await createProfile({
        id: 'user-123',
        body: {
          birthDate: '15.03.1990',
          city: 'São Paulo',
          cpf: '12345678900',
          dojo: 'Dojo São Paulo',
          rank: 'amarela',
          sensei: 'Sensei Name',
          phone: '11999999999',
          photoUrl: 'http://example.com/photo.jpg'
        }
      });

      expect(normalizeBirthDate).toHaveBeenCalledWith('15.03.1990');
      expect(updateUser).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({
          birthDate: '1990-03-15'
        })
      );
    });
  });
});
