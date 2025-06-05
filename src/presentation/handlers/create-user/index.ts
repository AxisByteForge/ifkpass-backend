import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { makeRegisterUseCase } from './factory';
import { registerValidate } from './validate';

async function handler(
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> {
  try {
    const body = JSON.parse(event.body || '{}');
    const parsed = registerValidate.safeParse(body);

    if (!parsed.success) {
      const { fieldErrors } = parsed.error.flatten();

      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Erro de validação',
          errors: fieldErrors,
        }),
      };
    }

    const useCase = makeRegisterUseCase();

    const result = await useCase.execute({ props: parsed.data });

    return {
      statusCode: 201,
      body: JSON.stringify(result),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error instanceof Error ? error.message : 'Erro interno',
      }),
    };
  }
}

export { handler };
