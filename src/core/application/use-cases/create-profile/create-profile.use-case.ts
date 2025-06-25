import {
  CreateProfileUseCaseRequest,
  CreateProfileUseCaseResponse,
} from './create-profile.use-case.interface';
import { IdentityProviderServiceAdapter } from '../../../domain/adapters/aws/aws-cognito-adapter';
import { right } from '../../../domain/either';
import { Profile } from '../../../domain/entities/Profile.entity';
import { UserRepository } from '../../../domain/repositories/UserRepository';

export class CreateProfileUseCase {
  constructor(
    private userRepository: UserRepository,
    private identityProvider: IdentityProviderServiceAdapter,
  ) {}

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
      registrationNumber: body.registrationNumber,
      photoUrl: body.photoUrl,
    });

    // TODO: ATUALIZAR NO DYNAMO INSERINDO OS CAMPOS DO PROFILE

    console.log(profile);

    return right({});
  }
}
