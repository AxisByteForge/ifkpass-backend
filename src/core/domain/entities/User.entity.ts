export interface UserProps {
  userId: string;
  name: string;
  lastName: string;
  email: string;
  createdAt: string;
}

export class User {
  readonly userId: string;
  readonly createdAt: string;
  readonly name: string;
  readonly lastName: string;
  readonly email: string;

  private constructor(props: UserProps) {
    this.userId = props.userId;
    this.createdAt = props.createdAt;
    this.name = props.name;
    this.lastName = props.lastName;
    this.email = props.email;
  }

  static create(
    props: Omit<UserProps, 'createdAt' | 'emailVerificationExpires'>,
  ): User {
    return new User({
      ...props,
      createdAt: new Date().toISOString(),
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
      name: this.name,
      lastName: this.lastName,
      email: this.email,
    };
  }
}
