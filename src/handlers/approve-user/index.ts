import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { z } from 'zod';
import { RequestHeaders } from '@/shared/types/headers.type';
import { approveUser as approveUserService } from '@/services/approve-user/approve-user.service';
import { verifyToken } from '@/infra/jwt/jwt.service';
import { mapZodErrorToFailure } from '@/shared/utils/map-error-to-failure';

const schema = z.object({
  userId: z.string(),
  status: z.enum(['approved', 'rejected'])
});

export const approveUser = async (
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

    if (!token.isAdmin) {
      return {
        statusCode: 403,
        body: JSON.stringify({
          message: 'Administrator required to approve users'
        })
      };
    }

    const body = schema.parse(JSON.parse(event.body || '{}'));
    const result = await approveUserService({
      userId: body.userId,
      status: body.status
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
