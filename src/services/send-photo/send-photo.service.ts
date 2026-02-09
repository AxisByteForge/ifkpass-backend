import { getPresignedUploadUrl } from '@/infra/storage/s3.service';
import { getConfig } from '@/shared/lib/config/env/get-env';
import {
  SendPhotoServiceRequest,
  SendPhotoUseCaseResponse
} from './send-photo.service.interface';
import { right } from '@/shared/types/either';

const bucketName = getConfig('PROFILE_BUCKET_NAME');

export const sendPhoto = async (
  input: SendPhotoServiceRequest
): Promise<SendPhotoUseCaseResponse> => {
  const key = `users/${input.Id}/profile-photo.jpg`;

  const { photoUrl, uploadUrl } = await getPresignedUploadUrl(key, bucketName);

  return right({
    photoUrl,
    uploadUrl
  });
};
