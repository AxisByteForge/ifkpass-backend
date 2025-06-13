/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  User,
  UserProps,
} from '../../../core/user/domain/entities/User.entity';

export class UserMapper {
  static toDomain(raw: any): User {
    return User.fromPersistence(raw as Required<UserProps>);
  }

  static toPersistence(user: User): Omit<UserProps, 'password'> {
    const { password, ...rest } = user.getProps();
    return rest;
  }
}
