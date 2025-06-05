import { randomUUID } from 'crypto';

interface UserProps {
  userId?: string;
  name: string;
  lastName: string;
  email: string;
  password: string;
  emailVerificationCode: string;
  emailVerificationExpires?: string;
  isEmailVerified?: boolean;
  createdAt?: string;
}

export class User {
  readonly userId: string;
  readonly createdAt: string;
  readonly emailVerificationExpires: string;
  readonly isEmailVerified: boolean;
  emailVerificationCode: string;
  name: string;
  lastName: string;
  email: string;
  password: string;

  private constructor(props: UserProps) {
    this.userId = props.userId ?? randomUUID();
    this.createdAt = props.createdAt ?? new Date().toISOString();

    this.emailVerificationExpires =
      props.emailVerificationExpires ??
      new Date(Date.now() + 15 * 60 * 1000).toISOString();
    this.isEmailVerified = props.isEmailVerified ?? false;

    this.emailVerificationCode = props.emailVerificationCode;
    this.name = props.name;
    this.lastName = props.lastName;
    this.email = props.email;
    this.password = props.password;
  }

  static create(props: UserProps): User {
    return new User(props);
  }

  static generateVerificationCode(length = 6): string {
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    return Math.floor(Math.random() * (max - min + 1) + min).toString();
  }
}
