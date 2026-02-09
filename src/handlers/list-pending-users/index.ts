import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { z } from 'zod';
import { RequestHeaders } from '@/shared/types/headers.type';
import { listPendingUsers as listPendingUsersService } from '@/services/list-pending-users/list-pending-users.service';
import { verifyToken } from '@/infra/jwt/jwt.service';
import { mapZodErrorToFailure } from '@/shared/utils/map-error-to-failure';

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0)
});

export const listPendingUsers = async (
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
          message: 'Administrator required to list pending users'
        })
      };
    }

    const query = querySchema.parse({
      limit: event.queryStringParameters?.limit,
      offset: event.queryStringParameters?.offset
    });

    const result = await listPendingUsersService({
      limit: query.limit,
      offset: query.offset
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
