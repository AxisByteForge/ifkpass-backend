import { EmailAlreadyVerifiedException } from '../../../domain/errors/email-already-verified-exception';
import { UserAlreadyExistsException } from '../../../domain/errors/user-already-exists-exception';
import { Either } from '../../../either';

interface VerifyEmailUseCaseRequest {
  email: string;
  code: string;
  password: string;
}

type VerifyEmailUseCaseResponse = Either<
  UserAlreadyExistsException | EmailAlreadyVerifiedException,
  { statusCode: number; token: string }
>;

export { VerifyEmailUseCaseRequest, VerifyEmailUseCaseResponse };
