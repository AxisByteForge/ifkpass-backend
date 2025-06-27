import { SendPhotoUseCase } from '../../../../../core/application/use-cases/send-photo/send-photo.use-case';
import { AwsS3Service } from '../../../../aws/aws-s3-client';
import { Config } from '../../../../env/get-env';

export function makeSendPhotoUseCase() {
  const s3Service = new AwsS3Service();
  const config = new Config();
  const sendPhotoUseCase = new SendPhotoUseCase(
    s3Service,
    config.get('PROFILE_BUCKET_NAME'),
  );
  return sendPhotoUseCase;
}
