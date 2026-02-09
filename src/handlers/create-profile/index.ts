import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { z } from 'zod';
import { RequestHeaders } from '@/shared/types/headers.type';
import { createProfile as createProfileService } from '@/services/create-profile/create-profile.service';
import { verifyToken } from '@/infra/jwt/jwt.service';
import { mapZodErrorToFailure } from '@/shared/utils/map-error-to-failure';

const schema = z.object({
  birthDate: z.string(),
  city: z.string(),
  cpf: z.string(),
  dojo: z.string(),
  rank: z.string(),
  sensei: z.string(),
  phone: z.string(),
  photoUrl: z.string().optional()
});

export const createProfile = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const headers = event.headers as Partial<RequestHeaders>;
    const tokenResult = verifyToken(headers.Authorization ?? '');

    if (tokenResult.isLeft()) {
      const { reason, statusCode } = tokenResult.value;
      return {
        statusCode,
        body: JSON.stringify({ message: reason })
      };
    }

    const { id } = tokenResult.value;

    const body = schema.parse(JSON.parse(event.body || '{}'));
    const result = await createProfileService({ id, body });

    if (result.isLeft()) {
      const { reason, statusCode } = result.value;
      return {
        statusCode,
        body: JSON.stringify({ message: reason })
      };
    }

    return {
      statusCode: 201,
      body: JSON.stringify(result.value)
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const failure = mapZodErrorToFailure(error);
      return {
        statusCode: failure.statusCode,
        body: JSON.stringify({ message: failure.reason })
      };
    }

    throw error;
  }
};
