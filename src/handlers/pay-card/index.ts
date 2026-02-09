import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { z } from 'zod';
import { RequestHeaders } from '@/shared/types/headers.type';
import { payCard as payCardService } from '@/services/pay-card/pay-card.service';
import { verifyToken } from '@/infra/jwt/jwt.service';
import { mapZodErrorToFailure } from '@/shared/utils/map-error-to-failure';

const schema = z.object({
  action: z.enum(['generate-checkout', 'complete-payment']),
  paymentStatus: z.enum(['approved', 'pending', 'rejected']).optional(),
  paymentId: z.string().optional()
});

const payCard = async (
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

    const token = tokenResult.value;

    const body = schema.parse(JSON.parse(event.body || '{}'));
    const result = await payCardService({
      userId: token.id,
      action: body.action,
      paymentStatus: body.paymentStatus,
      paymentId: body.paymentId
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

export { payCard };
