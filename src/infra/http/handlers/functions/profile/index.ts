import { makeRegisterUseCase } from './factory';
import { registerValidate } from './validate';

async function createProfile(event: any): Promise<any> {
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
}

export { createProfile };
