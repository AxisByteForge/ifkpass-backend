import {
  SendPhotoUseCaseRequest,
  SendPhotoUseCaseResponse,
} from './send-photo.use-case.interface';
import { IdentityProviderServiceAdapter } from '../../../domain/adapters/aws/aws-cognito-adapter';
import { right } from '../../../domain/either';

export class SendPhotoUseCase {
  constructor(private identityProvider: IdentityProviderServiceAdapter) {}

  async execute({
    userId,
  }: SendPhotoUseCaseRequest): Promise<SendPhotoUseCaseResponse> {
    return right({
      photoUrl: '',
      uploadUrl: '',
    });
  }
}
