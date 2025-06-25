import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { createProfile } from '../functions/create-profile';
import { createUser } from '../functions/create-user';
import { sendPhoto } from '../functions/send-photo';
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
        '/user': createUser,
        '/verify-email': verifyEmail,
        '/profile': createProfile,
        '/profile/photo': sendPhoto,
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
