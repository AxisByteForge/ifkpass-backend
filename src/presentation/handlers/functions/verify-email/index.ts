import { factory } from './factory';
import { verifyEmailValidate } from './validate';

async function verifyEmail(event: any): Promise<any> {
  const body = JSON.parse(event.body || '{}');
  const parsed = verifyEmailValidate.safeParse(body);

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

  const useCase = factory();

  const result = await useCase.execute({ props: parsed.data });

  return {
    statusCode: 201,
    body: JSON.stringify(result),
  };
}

export { verifyEmail };
