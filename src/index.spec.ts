import { describe, it, expect, vi, beforeEach } from 'vitest';

import { handler } from './index';
import type { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { logger } from '@/shared/utils/logger';
import { approveUser } from './handlers/approve-user';
import { authenticate } from './handlers/authenticate';
import { createProfile } from './handlers/create-profile';
import { createUser } from './handlers/create-user';
import { mercadoPagoWebhook } from './handlers/webhook';
import { payCard } from './handlers/pay-card';
import { sendPhoto } from './handlers/send-photo';
import { signinUser } from './handlers/signin';
import { refreshToken } from './handlers/refresh-token';

vi.mock('@/shared/lib/db', () => ({
  db: {}
}));
vi.mock('@/infra/storage/s3.service', () => ({
  s3Client: {},
  getPresignedUploadUrl: vi.fn()
}));
vi.mock('@/shared/utils/logger');
vi.mock('./handlers/approve-user');
vi.mock('./handlers/authenticate');
vi.mock('./handlers/create-profile');
vi.mock('./handlers/create-user');
vi.mock('./handlers/webhook');
vi.mock('./handlers/pay-card');
vi.mock('./handlers/send-photo');
vi.mock('./handlers/signin');
vi.mock('./handlers/refresh-token');

process.env.REGION = 'us-test-1';
process.env.PROFILE_BUCKET_NAME = 'test-bucket-name';

describe('Lambda Handler', () => {
  let mockEvent: APIGatewayProxyEvent;
  let mockContext: Context;

  beforeEach(() => {
    vi.clearAllMocks();

    mockEvent = {
      body: null,
      headers: {},
      multiValueHeaders: {},
      httpMethod: 'POST',
      isBase64Encoded: false,
      path: '/api/v1/users/signup',
      pathParameters: null,
      queryStringParameters: null,
      multiValueQueryStringParameters: null,
      stageVariables: null,
      requestContext: {} as any,
      resource: ''
    };

    mockContext = {
      callbackWaitsForEmptyEventLoop: false,
      functionName: 'test-function',
      functionVersion: '1',
      invokedFunctionArn: 'arn:aws:lambda:us-east-1:123456789012:function:test',
      memoryLimitInMB: '128',
      awsRequestId: 'test-request-id',
      logGroupName: '/aws/lambda/test',
      logStreamName: 'test-stream',
      getRemainingTimeInMillis: () => 30000,
      done: vi.fn(),
      fail: vi.fn(),
      succeed: vi.fn()
    };
  });

  describe('Successful Route Handling', () => {
    it('should handle /api/v1/users/signup route', async () => {
      const mockResponse = {
        statusCode: 201,
        body: JSON.stringify({ message: 'User created' })
      };

      vi.mocked(createUser).mockResolvedValue(mockResponse);

      const result = await handler(mockEvent, mockContext);

      expect(result).toEqual(mockResponse);
      expect(createUser).toHaveBeenCalledWith(mockEvent);
      expect(logger).toHaveBeenCalledWith(mockEvent, mockResponse);
    });

    it('should handle /api/v1/users/signin route', async () => {
      mockEvent.path = '/api/v1/users/signin';
      const mockResponse = {
        statusCode: 200,
        body: JSON.stringify({ token: 'abc123' })
      };

      vi.mocked(signinUser).mockResolvedValue(mockResponse);

      const result = await handler(mockEvent, mockContext);

      expect(result).toEqual(mockResponse);
      expect(signinUser).toHaveBeenCalledWith(mockEvent);
    });

    it('should handle /api/v1/users/auth route', async () => {
      mockEvent.path = '/api/v1/users/auth';
      const mockResponse = {
        statusCode: 200,
        body: JSON.stringify({ success: true })
      };

      vi.mocked(authenticate).mockResolvedValue(mockResponse);

      const result = await handler(mockEvent, mockContext);

      expect(result).toEqual(mockResponse);
      expect(authenticate).toHaveBeenCalledWith(mockEvent);
    });

    it('should handle /api/v1/users/refresh-token route', async () => {
      mockEvent.path = '/api/v1/users/refresh-token';
      const mockResponse = {
        statusCode: 200,
        body: JSON.stringify({ accessToken: 'new-token' })
      };

      vi.mocked(refreshToken).mockResolvedValue(mockResponse);

      const result = await handler(mockEvent, mockContext);

      expect(result).toEqual(mockResponse);
      expect(refreshToken).toHaveBeenCalledWith(mockEvent);
    });

    it('should handle /api/v1/users/profile route', async () => {
      mockEvent.path = '/api/v1/users/profile';
      const mockResponse = {
        statusCode: 200,
        body: JSON.stringify({ message: 'Profile created' })
      };

      vi.mocked(createProfile).mockResolvedValue(mockResponse);

      const result = await handler(mockEvent, mockContext);

      expect(result).toEqual(mockResponse);
      expect(createProfile).toHaveBeenCalledWith(mockEvent);
    });

    it('should handle /api/v1/users/profile/photo route', async () => {
      mockEvent.path = '/api/v1/users/profile/photo';
      const mockResponse = {
        statusCode: 200,
        body: JSON.stringify({ photoUrl: 'https://example.com/photo.jpg' })
      };

      vi.mocked(sendPhoto).mockResolvedValue(mockResponse);

      const result = await handler(mockEvent, mockContext);

      expect(result).toEqual(mockResponse);
      expect(sendPhoto).toHaveBeenCalledWith(mockEvent);
    });

    it('should handle /api/v1/users/pay-card route', async () => {
      mockEvent.path = '/api/v1/users/pay-card';
      const mockResponse = {
        statusCode: 200,
        body: JSON.stringify({ checkoutUrl: 'https://payment.com' })
      };

      vi.mocked(payCard).mockResolvedValue(mockResponse);

      const result = await handler(mockEvent, mockContext);

      expect(result).toEqual(mockResponse);
      expect(payCard).toHaveBeenCalledWith(mockEvent);
    });

    it('should handle /api/v1/admins/approve route', async () => {
      mockEvent.path = '/api/v1/admins/approve';
      const mockResponse = {
        statusCode: 200,
        body: JSON.stringify({ message: 'User approved' })
      };

      vi.mocked(approveUser).mockResolvedValue(mockResponse);

      const result = await handler(mockEvent, mockContext);

      expect(result).toEqual(mockResponse);
      expect(approveUser).toHaveBeenCalledWith(mockEvent);
    });

    it('should handle /api/v1/mercado-pago/webhook route', async () => {
      mockEvent.path = '/api/v1/mercado-pago/webhook';
      const mockResponse = {
        statusCode: 200,
        body: JSON.stringify({ received: true })
      };

      vi.mocked(mercadoPagoWebhook).mockResolvedValue(mockResponse);

      const result = await handler(mockEvent, mockContext);

      expect(result).toEqual(mockResponse);
      expect(mercadoPagoWebhook).toHaveBeenCalledWith(mockEvent);
    });
  });

  describe('Error Handling', () => {
    it('should return 404 when route is not found', async () => {
      mockEvent.path = '/api/v1/unknown-route';

      const result = await handler(mockEvent, mockContext);

      expect(result.statusCode).toBe(404);
      expect(JSON.parse(result.body)).toEqual({ message: 'router not found' });
    });

    it('should return 404 when HTTP method is not supported', async () => {
      mockEvent.httpMethod = 'GET';
      mockEvent.path = '/api/v1/users/signup';

      const result = await handler(mockEvent, mockContext);

      expect(result.statusCode).toBe(404);
      expect(JSON.parse(result.body)).toEqual({ message: 'router not found' });
    });

    it('should return 500 when handler throws an error', async () => {
      const mockError = new Error('Database connection failed');
      vi.mocked(createUser).mockRejectedValue(mockError);

      const result = await handler(mockEvent, mockContext);

      expect(result.statusCode).toBe(500);
      expect(JSON.parse(result.body)).toEqual({
        message: 'Database connection failed'
      });
      expect(logger).toHaveBeenCalledWith(
        mockEvent,
        expect.objectContaining({ statusCode: 500 }),
        mockError
      );
    });

    it('should return 500 with default message when error is not an Error instance', async () => {
      vi.mocked(createUser).mockRejectedValue('string error');

      const result = await handler(mockEvent, mockContext);

      expect(result.statusCode).toBe(500);
      expect(JSON.parse(result.body)).toEqual({
        message: 'internal server error'
      });
    });
  });

  describe('Timeout Handling', () => {
    it('should return 408 when handler execution exceeds time limit', async () => {
      vi.mocked(createUser).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                statusCode: 200,
                body: JSON.stringify({ message: 'Success' })
              });
            }, 32000); // Longer than getRemainingTimeInMillis
          })
      );

      mockContext.getRemainingTimeInMillis = () => 3000; // 3 seconds remaining

      const result = await handler(mockEvent, mockContext);

      expect(result.statusCode).toBe(408);
      expect(JSON.parse(result.body)).toEqual({ message: 'timeout' });
    });

    it('should complete successfully when handler finishes before timeout', async () => {
      const mockResponse = {
        statusCode: 200,
        body: JSON.stringify({ message: 'Success' })
      };

      vi.mocked(createUser).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve(mockResponse);
            }, 100); // Fast response
          })
      );

      mockContext.getRemainingTimeInMillis = () => 30000;

      const result = await handler(mockEvent, mockContext);

      expect(result).toEqual(mockResponse);
    });
  });
});
