import { User } from '../entities/User.entity';

export interface UserRepository {
  findByEmail(id: string): Promise<User | null>;
  create(user: User): Promise<void>;
  updateEmailVerificationStatus(
    userId: string,
    isVerified: boolean,
  ): Promise<void>;
}
