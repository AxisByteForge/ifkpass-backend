import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { z } from 'zod';
import { createUser as createUserUseCase } from '@/services/create-user/create-user.service';
import { mapZodErrorToFailure } from '@/shared/utils/map-error-to-failure';

export const schema = z.object({
  name: z.string(),
  lastName: z.string(),
  email: z.string().email()
});

export const createUser = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const body = schema.parse(JSON.parse(event.body || '{}'));
    const result = await createUserUseCase(body);

    if (result.isLeft()) {
      const { reason, statusCode } = result.value;
      return {
        statusCode,
        body: JSON.stringify({ message: reason })
      };
    }

    return {
      statusCode: 201,
      body: JSON.stringify({ userId: result.value })
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
