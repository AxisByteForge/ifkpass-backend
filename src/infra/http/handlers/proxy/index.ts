import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { createUser } from '../functions/create-user';
import { verifyEmail } from '../functions/verify-email';

export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  const path = event.path;
  const method = event.httpMethod;

  try {
    const routes: Record<
      string,
      Record<
        string,
        (e: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult>
      >
    > = {
      POST: {
        '/create-user': createUser,
        '/verify-email': verifyEmail,
      },
    };

    const handlerFn = routes[method]?.[path];

    if (handlerFn) {
      return handlerFn(event);
    }

    return {
      statusCode: 404,
      body: JSON.stringify({ message: 'Rota não encontrada' }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: error instanceof Error ? error.message : 'Erro interno',
      }),
    };
  }
};
