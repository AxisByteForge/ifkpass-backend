import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { z } from 'zod';
import { refreshToken as refreshTokenService } from '@/services/refresh-token/refresh-token.service';
import { mapZodErrorToFailure } from '@/shared/utils/map-error-to-failure';

const schema = z.object({
  refreshToken: z.string()
});

const refreshToken = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const body = schema.parse(JSON.parse(event.body || '{}'));
    const result = await refreshTokenService(body);

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

export { refreshToken };
