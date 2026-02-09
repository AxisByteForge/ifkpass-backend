import {
  findUserById,
  updateUser
} from '@/infra/database/repository/user/user-db.service';
import {
  PayCardServiceRequest,
  PayCardUseCaseResponse
} from './pay-card.service.interface';
import { createCheckoutPreference } from '@/infra/mercado-pago/mercado-pago.service';
import { left, right } from '@/shared/types/either';
import { isDiscountAvailable } from '@/shared/utils/isDiscountAvailabre';
import { CURRENCY } from '@/shared/utils/consts';

const computeAmount = (rank: string | undefined, now: Date): number => {
  const discount = isDiscountAvailable(now);
  const blackBelt = rank === 'Preta';

  if (blackBelt) {
    return discount ? 80 : 100;
  }

  return discount ? 50 : 80;
};

const getBeltCategory = (rank?: string): string => {
  return rank === 'Preta' ? 'black' : 'colored';
};

export const payCard = async (
  input: PayCardServiceRequest
): Promise<PayCardUseCaseResponse> => {
  const user = await findUserById(input.userId);

  if (!user) {
    return left({
      reason: 'User not found',
      statusCode: 404
    });
  }

  if (user.status === 'rejected') {
    return left({
      reason: 'User application was rejected. Please contact administration.',
      statusCode: 403
    });
  }

  const beltCategory = getBeltCategory(user.rank || undefined);
  const currentPaymentDetails = user.paymentDetails as any;

  if (input.action === 'complete-payment') {
    if (!input.paymentStatus) {
      return left({
        reason: 'Payment status is required',
        statusCode: 400
      });
    }

    if (
      currentPaymentDetails &&
      currentPaymentDetails.paymentId === input.paymentId &&
      currentPaymentDetails.status === input.paymentStatus
    ) {
      return right({
        message: 'Payment already processed.'
      });
    }

    await updateUser(input.userId, {
      paymentDetails: {
        alreadyPaid: input.paymentStatus === 'approved',
        status: input.paymentStatus,
        paymentId: input.paymentId,
        rank: user.rank,
        beltCategory,
        cardId: currentPaymentDetails?.cardId ?? user.cardId ?? '',
        amount: currentPaymentDetails?.amount ?? 0,
        currency: currentPaymentDetails?.currency ?? '',
        preferenceId: currentPaymentDetails?.preferenceId ?? '',
        discountApplied: currentPaymentDetails?.discountApplied ?? false,
        updatedAt: new Date().toISOString()
      }
    });

    return right({
      message:
        input.paymentStatus === 'approved'
          ? 'Payment confirmed successfully.'
          : 'Payment not approved. Check status on payment platform.'
    });
  }

  const now = new Date();
  const amount = computeAmount(user.rank || undefined, now);
  const discountApplied = isDiscountAvailable(now);

  const preference = await createCheckoutPreference({
    title: 'IFK Pass - Anuidade',
    description: 'Pagamento da anuidade do cartão IFK Pass',
    quantity: 1,
    currency: CURRENCY,
    unitPrice: amount,
    payer: {
      name: `${user.name} ${user.lastName}`.trim(),
      email: user.email
    },
    metadata: {
      userId: input.userId,
      rank: user.rank ?? 'Não informado',
      beltCategory,
      cardId: user.cardId ?? 'Não informado'
    },
    idempotencyKey: user.cardId || undefined
  });

  await updateUser(input.userId, {
    paymentDetails: {
      alreadyPaid: currentPaymentDetails?.alreadyPaid ?? false,
      status: 'pending',
      preferenceId: preference.id,
      amount,
      currency: CURRENCY,
      discountApplied,
      rank: user.rank,
      beltCategory,
      cardId: user.cardId ?? '',
      updatedAt: new Date().toISOString()
    }
  });

  return right({
    checkoutUrl: preference.initPoint,
    sandBoxUrl: preference.sandboxInitPoint
  });
};
