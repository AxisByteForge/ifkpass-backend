import { getPresignedUploadUrl } from '@/infra/storage/s3.service';
import {
  SendPhotoServiceRequest,
  SendPhotoUseCaseResponse
} from './send-photo.service.interface';
import { right } from '@/shared/types/either';

export const sendPhoto = async (
  input: SendPhotoServiceRequest
): Promise<SendPhotoUseCaseResponse> => {
  const bucketName = process.env.PROFILE_BUCKET_NAME as string;
  const key = `users/${input.Id}/profile-photo.jpg`;

  const { photoUrl, uploadUrl } = await getPresignedUploadUrl(key, bucketName);

  return right({
    photoUrl,
    uploadUrl
  });
};
