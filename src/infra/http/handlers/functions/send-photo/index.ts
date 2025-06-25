import { APIGatewayProxyEvent } from 'aws-lambda';

import { makeSendPhotoUseCase } from './factory';
import { UnauthorizedError } from '../../../../../core/domain/errors/http-errors';
import { RequestHeaders } from '../../../../../core/domain/types/header.type';
import { verifyToken } from '../../../../jwt/jose/jose.jwt';

async function sendPhoto(event: APIGatewayProxyEvent) {
  try {
    const headers = event.headers as Partial<RequestHeaders>;

    const userId = await verifyToken(headers.Authorization);

    const useCase = makeSendPhotoUseCase();

    const result = await useCase.execute({ userId });

    return {
      statusCode: 201,
      body: JSON.stringify(result),
    };
  } catch (err) {
    throw new UnauthorizedError(
      err instanceof Error ? err.message : 'Token inválido ou expirado',
    );
  }
}

export { sendPhoto };
