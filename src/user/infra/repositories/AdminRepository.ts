import { User } from '../../core/entity/User.entity';

export interface UserRepository {
  findByEmail(id: string): Promise<User | null>;
  create(user: User): Promise<void>;
}
