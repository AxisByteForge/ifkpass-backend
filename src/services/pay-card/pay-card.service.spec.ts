import { describe, it, expect, vi, beforeEach } from 'vitest';
import { payCard } from './pay-card.service';
import {
  findUserById,
  updateUser
} from '@/infra/database/repository/user/user-db.service';
import { createCheckoutPreference } from '@/infra/mercado-pago/mercado-pago.service';
import { isDiscountAvailable } from '@/shared/utils/isDiscountAvailabre';

vi.mock('@/shared/lib/db', () => ({
  db: {}
}));
vi.mock('@/infra/database/repository/user/user-db.service');
vi.mock('@/infra/mercado-pago/mercado-pago.service');
vi.mock('@/shared/utils/isDiscountAvailabre');

describe('PayCard Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(isDiscountAvailable).mockReturnValue(false);
  });

  describe('User Validation', () => {
    it('should return error when user not found', async () => {
      vi.mocked(findUserById).mockResolvedValue(null);

      const result = await payCard({
        userId: 'user-999',
        action: 'create'
      });

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value.reason).toBe('User not found');
        expect(result.value.statusCode).toBe(404);
      }
    });

    it('should return error when user is rejected', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        name: 'John',
        lastName: 'Doe',
        cpf: '12345678900',
        phone: '11999999999',
        status: 'rejected',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      vi.mocked(findUserById).mockResolvedValue(mockUser);

      const result = await payCard({
        userId: 'user-123',
        action: 'create'
      });

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value.reason).toContain('rejected');
        expect(result.value.statusCode).toBe(403);
      }
    });
  });

  describe('Payment Generation', () => {
    it('should generate payment for colored belt without discount', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        name: 'John',
        lastName: 'Doe',
        cpf: '12345678900',
        phone: '11999999999',
        status: 'approved',
        rank: 'Amarela',
        cardId: 'CARD-123',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const mockPreference = {
        id: 'pref-123',
        initPoint: 'https://mercadopago.com/checkout',
        sandboxInitPoint: 'https://mercadopago.com/sandbox'
      };

      vi.mocked(findUserById).mockResolvedValue(mockUser);
      vi.mocked(isDiscountAvailable).mockReturnValue(false);
      vi.mocked(createCheckoutPreference).mockResolvedValue(mockPreference);
      vi.mocked(updateUser).mockResolvedValue();

      const result = await payCard({
        userId: 'user-123',
        action: 'create'
      });

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.checkoutUrl).toBe(mockPreference.initPoint);
        expect(result.value.sandBoxUrl).toBe(mockPreference.sandboxInitPoint);
      }

      expect(createCheckoutPreference).toHaveBeenCalledWith(
        expect.objectContaining({
          unitPrice: 85
        })
      );
    });

    it('should generate payment for colored belt with discount', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        name: 'John',
        lastName: 'Doe',
        cpf: '12345678900',
        phone: '11999999999',
        status: 'approved',
        rank: 'Verde',
        cardId: 'CARD-123',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const mockPreference = {
        id: 'pref-123',
        initPoint: 'https://mercadopago.com/checkout',
        sandboxInitPoint: 'https://mercadopago.com/sandbox'
      };

      vi.mocked(findUserById).mockResolvedValue(mockUser);
      vi.mocked(isDiscountAvailable).mockReturnValue(true);
      vi.mocked(createCheckoutPreference).mockResolvedValue(mockPreference);
      vi.mocked(updateUser).mockResolvedValue();

      await payCard({
        userId: 'user-123',
        action: 'generate-checkout'
      });

      expect(createCheckoutPreference).toHaveBeenCalledWith(
        expect.objectContaining({
          unitPrice: 55
        })
      );
    });

    it('should generate payment for black belt without discount', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        name: 'John',
        lastName: 'Doe',
        cpf: '12345678900',
        phone: '11999999999',
        status: 'approved',
        rank: 'Preta',
        cardId: 'CARD-123',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const mockPreference = {
        id: 'pref-123',
        initPoint: 'https://mercadopago.com/checkout',
        sandboxInitPoint: 'https://mercadopago.com/sandbox'
      };

      vi.mocked(findUserById).mockResolvedValue(mockUser);
      vi.mocked(isDiscountAvailable).mockReturnValue(false);
      vi.mocked(createCheckoutPreference).mockResolvedValue(mockPreference);
      vi.mocked(updateUser).mockResolvedValue();

      await payCard({
        userId: 'user-123',
        action: 'generate-checkout'
      });

      expect(createCheckoutPreference).toHaveBeenCalledWith(
        expect.objectContaining({
          unitPrice: 105
        })
      );
    });

    it('should generate payment for black belt with discount', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        name: 'John',
        lastName: 'Doe',
        cpf: '12345678900',
        phone: '11999999999',
        status: 'approved',
        rank: 'Preta',
        cardId: 'CARD-123',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const mockPreference = {
        id: 'pref-123',
        initPoint: 'https://mercadopago.com/checkout',
        sandboxInitPoint: 'https://mercadopago.com/sandbox'
      };

      vi.mocked(findUserById).mockResolvedValue(mockUser);
      vi.mocked(isDiscountAvailable).mockReturnValue(true);
      vi.mocked(createCheckoutPreference).mockResolvedValue(mockPreference);
      vi.mocked(updateUser).mockResolvedValue();

      await payCard({
        userId: 'user-123',
        action: 'generate-checkout'
      });

      expect(createCheckoutPreference).toHaveBeenCalledWith(
        expect.objectContaining({
          unitPrice: 85
        })
      );
    });

    it('should generate payment for user without rank', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        name: 'John',
        lastName: 'Doe',
        cpf: '12345678900',
        phone: '11999999999',
        status: 'approved',
        rank: undefined,
        cardId: 'CARD-123',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const mockPreference = {
        id: 'pref-123',
        initPoint: 'https://mercadopago.com/checkout',
        sandboxInitPoint: 'https://mercadopago.com/sandbox'
      };

      vi.mocked(findUserById).mockResolvedValue(mockUser);
      vi.mocked(isDiscountAvailable).mockReturnValue(false);
      vi.mocked(createCheckoutPreference).mockResolvedValue(mockPreference);
      vi.mocked(updateUser).mockResolvedValue();

      const result = await payCard({
        userId: 'user-123',
        action: 'create'
      });

      expect(result.isRight()).toBe(true);
      expect(createCheckoutPreference).toHaveBeenCalledWith(
        expect.objectContaining({
          unitPrice: 85,
          metadata: expect.objectContaining({
            userId: 'user-123',
            rank: 'Não informado',
            beltCategory: 'colored',
            cardId: 'CARD-123'
          }),
          idempotencyKey: 'CARD-123'
        })
      );
    });

    it('should update user with payment details including preferenceId', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        name: 'John',
        lastName: 'Doe',
        cpf: '12345678900',
        phone: '11999999999',
        status: 'approved',
        rank: 'Verde',
        cardId: 'CARD-123',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const mockPreference = {
        id: 'pref-456',
        initPoint: 'https://mercadopago.com/checkout',
        sandboxInitPoint: 'https://mercadopago.com/sandbox'
      };

      vi.mocked(findUserById).mockResolvedValue(mockUser);
      vi.mocked(isDiscountAvailable).mockReturnValue(true);
      vi.mocked(createCheckoutPreference).mockResolvedValue(mockPreference);
      vi.mocked(updateUser).mockResolvedValue();

      await payCard({
        userId: 'user-123',
        action: 'create'
      });

      expect(updateUser).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({
          paymentDetails: expect.objectContaining({
            alreadyPaid: false,
            status: 'pending',
            preferenceId: 'pref-456',
            amount: 55,
            currency: 'BRL',
            discountApplied: true,
            rank: 'Verde',
            beltCategory: 'colored',
            cardId: 'CARD-123'
          })
        })
      );
    });

    it('should use cardId as idempotencyKey when present', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        name: 'John',
        lastName: 'Doe',
        cpf: '12345678900',
        phone: '11999999999',
        status: 'approved',
        rank: 'Preta',
        cardId: 'UNIQUE-CARD-ID',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const mockPreference = {
        id: 'pref-789',
        initPoint: 'https://mercadopago.com/checkout',
        sandboxInitPoint: 'https://mercadopago.com/sandbox'
      };

      vi.mocked(findUserById).mockResolvedValue(mockUser);
      vi.mocked(isDiscountAvailable).mockReturnValue(false);
      vi.mocked(createCheckoutPreference).mockResolvedValue(mockPreference);
      vi.mocked(updateUser).mockResolvedValue();

      await payCard({
        userId: 'user-123',
        action: 'create'
      });

      expect(createCheckoutPreference).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            cardId: 'UNIQUE-CARD-ID'
          }),
          idempotencyKey: 'UNIQUE-CARD-ID'
        })
      );
    });

    it('should use undefined as idempotencyKey when cardId is not present', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        name: 'John',
        lastName: 'Doe',
        cpf: '12345678900',
        phone: '11999999999',
        status: 'approved',
        rank: 'Amarela',
        cardId: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const mockPreference = {
        id: 'pref-000',
        initPoint: 'https://mercadopago.com/checkout',
        sandboxInitPoint: 'https://mercadopago.com/sandbox'
      };

      vi.mocked(findUserById).mockResolvedValue(mockUser);
      vi.mocked(isDiscountAvailable).mockReturnValue(false);
      vi.mocked(createCheckoutPreference).mockResolvedValue(mockPreference);
      vi.mocked(updateUser).mockResolvedValue();

      await payCard({
        userId: 'user-123',
        action: 'create'
      });

      expect(createCheckoutPreference).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            cardId: 'Não informado'
          }),
          idempotencyKey: undefined
        })
      );
    });

    it('should preserve existing paymentDetails.alreadyPaid when generating new payment', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        name: 'John',
        lastName: 'Doe',
        cpf: '12345678900',
        phone: '11999999999',
        status: 'approved',
        rank: 'Verde',
        cardId: 'CARD-XYZ',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        paymentDetails: {
          alreadyPaid: true,
          status: 'approved',
          updatedAt: new Date().toISOString()
        }
      };

      const mockPreference = {
        id: 'pref-new',
        initPoint: 'https://mercadopago.com/checkout',
        sandboxInitPoint: 'https://mercadopago.com/sandbox'
      };

      vi.mocked(findUserById).mockResolvedValue(mockUser);
      vi.mocked(isDiscountAvailable).mockReturnValue(false);
      vi.mocked(createCheckoutPreference).mockResolvedValue(mockPreference);
      vi.mocked(updateUser).mockResolvedValue();

      await payCard({
        userId: 'user-123',
        action: 'create'
      });

      expect(updateUser).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({
          paymentDetails: expect.objectContaining({
            alreadyPaid: true,
            cardId: 'CARD-XYZ'
          })
        })
      );
    });
  });

  describe('Payment Completion', () => {
    it('should complete payment successfully when approved', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        name: 'John',
        lastName: 'Doe',
        cpf: '12345678900',
        phone: '11999999999',
        status: 'approved',
        rank: 'Verde',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        paymentDetails: {
          amount: 85,
          currency: 'BRL',
          preferenceId: 'pref-123',
          discountApplied: false,
          status: 'pending',
          alreadyPaid: false,
          cardId: 'CARD-123',
          updatedAt: new Date().toISOString()
        }
      };

      vi.mocked(findUserById).mockResolvedValue(mockUser);
      vi.mocked(updateUser).mockResolvedValue();

      const result = await payCard({
        userId: 'user-123',
        action: 'complete-payment',
        paymentStatus: 'approved',
        paymentId: 'payment-123'
      });

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.message).toContain('confirmed successfully');
      }

      expect(updateUser).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({
          paymentDetails: expect.objectContaining({
            alreadyPaid: true,
            status: 'approved',
            paymentId: 'payment-123',
            cardId: 'CARD-123',
            amount: 85,
            currency: 'BRL',
            preferenceId: 'pref-123',
            discountApplied: false
          })
        })
      );
    });

    it('should handle payment rejection', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        name: 'John',
        lastName: 'Doe',
        cpf: '12345678900',
        phone: '11999999999',
        status: 'approved',
        rank: 'Verde',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        paymentDetails: {
          amount: 55,
          currency: 'BRL',
          preferenceId: 'pref-456',
          discountApplied: true,
          status: 'pending',
          alreadyPaid: false,
          cardId: 'CARD-456',
          updatedAt: new Date().toISOString()
        }
      };

      vi.mocked(findUserById).mockResolvedValue(mockUser);
      vi.mocked(updateUser).mockResolvedValue();

      const result = await payCard({
        userId: 'user-123',
        action: 'complete-payment',
        paymentStatus: 'rejected',
        paymentId: 'payment-123'
      });

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.message).toContain('not approved');
      }

      expect(updateUser).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({
          paymentDetails: expect.objectContaining({
            alreadyPaid: false,
            status: 'rejected',
            cardId: 'CARD-456',
            amount: 55,
            currency: 'BRL',
            preferenceId: 'pref-456',
            discountApplied: true
          })
        })
      );
    });

    it('should handle payment with pending status', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        name: 'John',
        lastName: 'Doe',
        cpf: '12345678900',
        phone: '11999999999',
        status: 'approved',
        rank: 'Verde',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        paymentDetails: {
          amount: 85,
          currency: 'BRL',
          preferenceId: 'pref-789',
          discountApplied: false,
          status: 'pending',
          alreadyPaid: false,
          cardId: 'CARD-789',
          updatedAt: new Date().toISOString()
        }
      };

      vi.mocked(findUserById).mockResolvedValue(mockUser);
      vi.mocked(updateUser).mockResolvedValue();

      const result = await payCard({
        userId: 'user-123',
        action: 'complete-payment',
        paymentStatus: 'pending',
        paymentId: 'payment-123'
      });

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.message).toBe(
          'Payment not approved. Check status on payment platform.'
        );
      }

      expect(updateUser).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({
          paymentDetails: expect.objectContaining({
            alreadyPaid: false,
            status: 'pending',
            cardId: 'CARD-789',
            amount: 85,
            currency: 'BRL',
            preferenceId: 'pref-789',
            discountApplied: false
          })
        })
      );
    });

    it('should return error when payment status is missing', async () => {
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

      vi.mocked(findUserById).mockResolvedValue(mockUser);

      const result = await payCard({
        userId: 'user-123',
        action: 'complete-payment',
        paymentId: 'payment-123'
      });

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value.reason).toBe('Payment status is required');
        expect(result.value.statusCode).toBe(400);
      }
    });

    it('should skip update if payment already processed', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        name: 'John',
        lastName: 'Doe',
        cpf: '12345678900',
        phone: '11999999999',
        status: 'approved',
        rank: 'Verde',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        paymentDetails: {
          paymentId: 'payment-123',
          status: 'approved',
          alreadyPaid: true,
          updatedAt: new Date().toISOString()
        }
      };

      vi.mocked(findUserById).mockResolvedValue(mockUser);

      const result = await payCard({
        userId: 'user-123',
        action: 'complete-payment',
        paymentStatus: 'approved',
        paymentId: 'payment-123'
      });

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.message).toBe('Payment already processed.');
      }

      expect(updateUser).not.toHaveBeenCalled();
    });

    it('should use default values when payment details are missing', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        name: 'John',
        lastName: 'Doe',
        cpf: '12345678900',
        phone: '11999999999',
        status: 'approved',
        rank: 'Verde',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      vi.mocked(findUserById).mockResolvedValue(mockUser);
      vi.mocked(updateUser).mockResolvedValue();

      const result = await payCard({
        userId: 'user-123',
        action: 'complete-payment',
        paymentStatus: 'approved',
        paymentId: 'payment-123'
      });

      expect(result.isRight()).toBe(true);

      expect(updateUser).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({
          paymentDetails: expect.objectContaining({
            alreadyPaid: true,
            status: 'approved',
            paymentId: 'payment-123',
            cardId: '',
            amount: 0,
            currency: '',
            preferenceId: '',
            discountApplied: false
          })
        })
      );
    });
  });
});
