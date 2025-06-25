import { SendPhotoUseCase } from '../../../../../core/application/use-cases/send-photo/send-photo.use-case';
import { AwsCognitoService } from '../../../../aws/aws-cognito-client';

export function makeSendPhotoUseCase() {
  const cognitoService = new AwsCognitoService();
  const sendPhotoUseCase = new SendPhotoUseCase(cognitoService);
  return sendPhotoUseCase;
}
