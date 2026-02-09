import { signinUserService } from '@/services/signin/signin-service';
import { mapZodErrorToFailure } from '@/shared/utils/map-error-to-failure';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email()
});

export const signinUser = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const body = schema.parse(JSON.parse(event.body || '{}'));
    const result = await signinUserService({
      email: body.email
    });

    if (result.isLeft()) {
      const { reason, statusCode } = result.value;
      return {
        statusCode,
        body: JSON.stringify({ message: reason })
      };
    }

    return {
      statusCode: 200,
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
