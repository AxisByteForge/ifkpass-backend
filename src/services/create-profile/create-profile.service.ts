import {
  findUserById,
  updateUser
} from '@/infra/database/repository/user/user-db.service';
import {
  normalizeRank,
  beltCategoryFromRank,
  generateCardId
} from '@/shared/utils/karate-utils';
import {
  CreateProfileServiceRequest,
  CreateProfileUseCaseResponse
} from './create-profile.service.interface';
import { left, right } from '@/shared/types/either';

export const createProfile = async (
  input: CreateProfileServiceRequest
): Promise<CreateProfileUseCaseResponse> => {
  const user = await findUserById(input.id);

  if (!user) {
    return left({
      reason: 'User not found',
      statusCode: 404
    });
  }

  const normalizedRank = normalizeRank(input.body.rank);
  const cardId = generateCardId();
  const now = new Date().toISOString();

  // Prepare payment details update
  const currentPaymentDetails = user.paymentDetails || {
    alreadyPaid: false,
    status: 'pending',
    updatedAt: now
  };

  const updatedPaymentDetails = {
    ...currentPaymentDetails,
    rank: normalizedRank,
    beltCategory: beltCategoryFromRank(normalizedRank),
    updatedAt: now
  };

  await updateUser(input.id, {
    birthDate: input.body.birthDate,
    city: input.body.city,
    cpf: input.body.cpf,
    dojo: input.body.dojo,
    rank: normalizedRank,
    sensei: input.body.sensei,
    cardId,
    paymentDetails: updatedPaymentDetails
  });

  return right({
    message: 'Created'
  });
};
