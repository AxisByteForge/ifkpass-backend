import {
  CreateProfileUseCaseRequest,
  CreateProfileUseCaseResponse,
} from './create-profile.use-case.interface';
import { right } from '../../../domain/either';
import { Profile } from '../../../domain/entities/Profile.entity';
import { UserRepository } from '../../../domain/repositories/UserRepository';

export class CreateProfileUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute({
    userId,
    body,
  }: CreateProfileUseCaseRequest): Promise<CreateProfileUseCaseResponse> {
    const profile = Profile.create({
      userId,
      birthDate: body.birthDate,
      city: body.city,
      cpf: body.cpf,
      dojo: body.dojo,
      rank: body.rank,
      sensei: body.sensei,
      photoUrl: body.photoUrl,
    });

    await this.userRepository.createProfile(userId, profile);

    return right({
      message: 'Created',
    });
  }
}
