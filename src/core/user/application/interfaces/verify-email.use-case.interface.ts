import { Either } from '../../../either';
import { User } from '../../domain/entities/User.entity';
import { UserAlreadyExistsException } from '../../domain/errors/user-already-exists-exception';
import { VerificationCodeDoesNotMatchException } from '../../domain/errors/verification-code-does-not-match';

interface VerifyEmailUseCaseRequest {
  props: Pick<User, 'email' | 'emailVerificationCode'>;
}

type VerifyEmailUseCaseResponse = Either<
  UserAlreadyExistsException | VerificationCodeDoesNotMatchException,
  { ok: boolean; message: string }
>;

export { VerifyEmailUseCaseRequest, VerifyEmailUseCaseResponse };
