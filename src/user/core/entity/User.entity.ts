import { randomBytes, randomUUID } from 'crypto';

interface UserProps {
  userId?: string;
  name: string;
  lastName: string;
  email: string;
  password: string;
  emailVerificationCode?: string;
  emailVerificationExpires?: string;
  isEmailVerified?: boolean;
  createdAt?: string;
}

export class User {
  readonly userId: string;
  readonly createdAt: string;
  readonly emailVerificationCode: string;
  readonly emailVerificationExpires: string;
  readonly isEmailVerified: boolean;
  name: string;
  lastName: string;
  email: string;
  password: string;

  private constructor(props: UserProps) {
    this.userId = props.userId ?? randomUUID();
    this.createdAt = props.createdAt ?? new Date().toISOString();
    this.emailVerificationCode = randomBytes(3).toString('hex');
    this.emailVerificationExpires =
      props.emailVerificationExpires ??
      new Date(Date.now() + 15 * 60 * 1000).toISOString();
    this.isEmailVerified = props.isEmailVerified ?? false;

    this.name = props.name;
    this.lastName = props.lastName;
    this.email = props.email;
    this.password = props.password;
  }

  static create(props: UserProps): User {
    return new User(props);
  }
}
