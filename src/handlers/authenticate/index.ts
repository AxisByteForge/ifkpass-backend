import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { z } from 'zod';
import { authenticate as authenticateService } from '@/services/authenticate/authenticate.service';
import { mapZodErrorToFailure } from '@/shared/utils/map-error-to-failure';

const schema = z.object({
  email: z.string().email(),
  code: z.string().length(6)
});

const authenticate = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const body = schema.parse(JSON.parse(event.body || '{}'));
    const result = await authenticateService(body);

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

export { authenticate };
