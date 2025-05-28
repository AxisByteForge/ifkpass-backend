import { APIGatewayProxyEvent } from 'aws-lambda';

import { makeRegisterUseCase } from './factories/user.factory';
import { registerDto } from './validate/create-user.dto';

export async function handler(payload: APIGatewayProxyEvent) {
  const body = JSON.parse(payload.body || '{}');

  const props = registerDto.parse(body);

  const registerUseCase = makeRegisterUseCase();

  const response = await registerUseCase.execute({ props });

  return response;
}
