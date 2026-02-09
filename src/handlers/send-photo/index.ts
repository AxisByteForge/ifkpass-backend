import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { RequestHeaders } from '@/shared/types/headers.type';
import { sendPhoto as sendPhotoService } from '@/services/send-photo/send-photo.service';
import { verifyToken } from '@/infra/jwt/jwt.service';

export const sendPhoto = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const headers = event.headers as Partial<RequestHeaders>;
  const tokenResult = verifyToken(headers.Authorization ?? '');

  if (tokenResult.isLeft()) {
    const { reason, statusCode } = tokenResult.value;
    return {
      statusCode,
      body: JSON.stringify({ message: reason })
    };
  }

  const { id } = tokenResult.value;

  const result = await sendPhotoService({ Id: id });

  if (result.isLeft()) {
    const { reason, statusCode } = result.value;
    return {
      statusCode,
      body: JSON.stringify({ message: reason })
    };
  }

  return {
    statusCode: 201,
    body: JSON.stringify(result.value)
  };
};
