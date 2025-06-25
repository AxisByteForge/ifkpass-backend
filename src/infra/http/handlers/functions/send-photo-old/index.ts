import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { APIGatewayProxyEvent } from 'aws-lambda';

import { RequestHeaders } from '../../../../../core/domain/types/header.type';
import { verifyToken } from '../../../../jwt/jose/jose.jwt';

const s3 = new S3Client({ region: 'us-east-1' });
const bucketName = 'ifkpass-profile-photos';

async function sendPhotoOld(event: APIGatewayProxyEvent) {
  const headers = event.headers as Partial<RequestHeaders>;

  // const userId = '9488e438-3071-708e-3251-5ffcd51680b2';
  const userId = await verifyToken(headers.Authorization);

  if (!userId) {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: 'Unauthorized' }),
    };
  }

  const key = `users/${userId}/profile-photo.jpg`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: 'image/jpeg',
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 604800 });

  const photoUrl = `https://${bucketName}.s3.amazonaws.com/${key}`;

  return {
    statusCode: 200,
    body: JSON.stringify({
      uploadUrl,
      photoUrl,
    }),
  };
}

export { sendPhoto };
