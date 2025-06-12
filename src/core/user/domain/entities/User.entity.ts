import { randomUUID } from 'crypto';

export interface UserProps {
  userId: string;
  name: string;
  lastName: string;
  email: string;
  password: string;
  emailVerificationCode: string;
  emailVerificationExpires: string;
  isEmailVerified: boolean;
  createdAt: string;
}

export class User {
  readonly userId: string;
  readonly createdAt: string;
  readonly emailVerificationExpires: string;
  readonly isEmailVerified: boolean;
  readonly emailVerificationCode: string;
  readonly name: string;
  readonly lastName: string;
  readonly email: string;
  readonly password: string;

  private constructor(props: UserProps) {
    this.userId = props.userId;
    this.createdAt = props.createdAt;
    this.emailVerificationExpires = props.emailVerificationExpires;
    this.isEmailVerified = props.isEmailVerified;
    this.emailVerificationCode = props.emailVerificationCode;
    this.name = props.name;
    this.lastName = props.lastName;
    this.email = props.email;
    this.password = props.password;
  }

  static create(
    props: Omit<
      UserProps,
      'userId' | 'createdAt' | 'emailVerificationExpires' | 'isEmailVerified'
    >,
  ): User {
    return new User({
      ...props,
      userId: randomUUID(),
      createdAt: new Date().toISOString(),
      emailVerificationExpires: new Date(
        Date.now() + 15 * 60 * 1000,
      ).toISOString(),
      isEmailVerified: false,
    });
  }

  static fromPersistence(props: UserProps): User {
    return new User(props);
  }

  static generateVerificationCode(length = 6): string {
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    return Math.floor(Math.random() * (max - min + 1) + min).toString();
  }

  getProps(): UserProps {
    return {
      userId: this.userId,
      createdAt: this.createdAt,
      emailVerificationExpires: this.emailVerificationExpires,
      isEmailVerified: this.isEmailVerified,
      emailVerificationCode: this.emailVerificationCode,
      name: this.name,
      lastName: this.lastName,
      email: this.email,
      password: this.password,
    };
  }
}
