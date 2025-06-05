import { User } from '../../domain/entities/User.entity';

interface VerifyEmailUseCaseRequest {
  props: Pick<User, 'email' | 'emailVerificationCode'>;
}

type VerifyEmailUseCaseResponse = { ok: true } | any;

export { VerifyEmailUseCaseRequest, VerifyEmailUseCaseResponse };
