import { randomUUID } from 'crypto';

interface UserProps {
  id?: string;
  name: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  createdAt?: string;
}

export class User {
  readonly id: string;
  readonly createdAt: string;
  name: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;

  private constructor(props: UserProps) {
    this.id = props.id ?? randomUUID();
    this.createdAt = props.createdAt ?? new Date().toISOString();

    this.name = props.name;
    this.lastName = props.lastName;
    this.email = props.email;
    this.password = props.password;
    this.phone = props.phone;
  }

  static create(props: UserProps): User {
    return new User(props);
  }
}
