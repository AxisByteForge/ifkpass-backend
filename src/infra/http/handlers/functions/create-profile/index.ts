import { APIGatewayProxyEvent } from 'aws-lambda';

import { makeCreateProfileUseCase } from './factory';
import { profileValidate } from './validate';
import { RequestHeaders } from '../../../../../core/domain/types/header.type';
import { verifyToken } from '../../../../jwt/jose/jose.jwt';

async function createProfile(event: APIGatewayProxyEvent) {
  const body = JSON.parse(event.body || '{}');
  const parsed = profileValidate.safeParse(body);
  const headers = event.headers as Partial<RequestHeaders>;

  const userId = await verifyToken(headers.Authorization);

  if (!parsed.success) {
    const { fieldErrors } = parsed.error.flatten();

    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Validation error',
        errors: fieldErrors,
      }),
    };
  }

  const useCase = makeCreateProfileUseCase();

  const result = await useCase.execute({
    userId,
    body: parsed.data,
  });

  return {
    statusCode: 201,
    body: JSON.stringify(result),
  };
}

export { createProfile };
