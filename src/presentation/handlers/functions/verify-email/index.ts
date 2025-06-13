import { factory } from './factory';
import { verifyEmailValidate } from './validate';
import { EmailAlreadyVerifiedException } from '../../../../core/user/domain/errors/email-already-verified-exception';
import {
  BadRequestException,
  ConflictException,
} from '../../../../core/user/domain/errors/http-errors';
import { UserAlreadyExistsException } from '../../../../core/user/domain/errors/user-already-exists-exception';

async function verifyEmail(event: any): Promise<any> {
  const body = JSON.parse(event.body || '{}');
  const parsed = verifyEmailValidate.safeParse(body);

  if (!parsed.success) {
    const { fieldErrors } = parsed.error.flatten();

    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Validation Error',
        errors: fieldErrors,
      }),
    };
  }

  const useCase = factory();

  const response = await useCase.execute({
    email: parsed.data.email,
    code: parsed.data.emailVerificationCode,
    password: parsed.data.password,
  });

  if (response.isLeft()) {
    const error = response.value;

    switch (error.constructor) {
      case UserAlreadyExistsException:
        throw new ConflictException(error.message);
      case EmailAlreadyVerifiedException:
        throw new BadRequestException(error.message);
      default:
        throw new BadRequestException(error.message);
    }
  }

  return {
    statusCode: 201,
    body: JSON.stringify(response.value),
  };
}

export { verifyEmail };
