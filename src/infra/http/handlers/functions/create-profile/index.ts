import { APIGatewayProxyEvent } from 'aws-lambda';

import { makeCreateProfileUseCase } from './factory';
import { profileValidate } from './validate';

async function createProfile(event: APIGatewayProxyEvent): Promise<any> {
  const body = JSON.parse(event.body || '{}');
  const parsed = profileValidate.safeParse(body);

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
    body: parsed.data,
    headers: event.headers,
  });

  return {
    statusCode: 201,
    body: JSON.stringify(result),
  };
}

export { createProfile };
