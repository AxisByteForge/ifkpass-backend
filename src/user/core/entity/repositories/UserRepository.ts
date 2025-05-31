import { User } from '../User.entity';

export interface UserRepository {
  findByEmail(id: string): Promise<User | null>;
  create(user: User): Promise<void>;
}
