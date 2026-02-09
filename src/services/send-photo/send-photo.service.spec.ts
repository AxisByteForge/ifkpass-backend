import { describe, it, expect, vi, beforeEach } from 'vitest';

import { sendPhoto } from './send-photo.service';
import { getPresignedUploadUrl } from '@/infra/storage/s3.service';

process.env.REGION = 'us-test-1';
process.env.PROFILE_BUCKET_NAME = 'test-bucket-name';

vi.mock('@/infra/storage/s3.service', () => ({
  s3Client: {},
  getPresignedUploadUrl: vi.fn()
}));

describe('SendPhoto Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.PROFILE_BUCKET_NAME = 'test-bucket-name';
  });

  describe('Photo Upload URL Generation', () => {
    it('should successfully generate presigned upload URL', async () => {
      const mockUrls = {
        photoUrl:
          'https://s3.amazonaws.com/test-bucket/users/user-123/profile-photo.jpg',
        uploadUrl:
          'https://s3.amazonaws.com/test-bucket/users/user-123/profile-photo.jpg?signature=xyz'
      };

      vi.mocked(getPresignedUploadUrl).mockResolvedValue(mockUrls);

      const result = await sendPhoto({ Id: 'user-123' });

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value).toEqual(mockUrls);
      }

      expect(getPresignedUploadUrl).toHaveBeenCalledWith(
        'users/user-123/profile-photo.jpg',
        'test-bucket-name'
      );
    });

    it('should use correct S3 key format', async () => {
      const userId = 'test-user-456';
      const mockUrls = {
        photoUrl: 'https://s3.amazonaws.com/bucket/key',
        uploadUrl: 'https://s3.amazonaws.com/bucket/key?sig=123'
      };

      vi.mocked(getPresignedUploadUrl).mockResolvedValue(mockUrls);

      await sendPhoto({ Id: userId });

      expect(getPresignedUploadUrl).toHaveBeenCalledWith(
        `users/${userId}/profile-photo.jpg`,
        expect.any(String)
      );
    });

    it('should use configured bucket name', async () => {
      vi.mocked(getPresignedUploadUrl).mockResolvedValue({
        photoUrl: 'url',
        uploadUrl: 'upload-url'
      });

      await sendPhoto({ Id: 'user-123' });

      expect(getPresignedUploadUrl).toHaveBeenCalledWith(
        expect.any(String),
        'test-bucket-name'
      );
    });
  });

  describe('URL Response', () => {
    it('should return both photoUrl and uploadUrl', async () => {
      const mockUrls = {
        photoUrl: 'https://example.com/photo.jpg',
        uploadUrl: 'https://example.com/upload?signature=abc'
      };

      vi.mocked(getPresignedUploadUrl).mockResolvedValue(mockUrls);

      const result = await sendPhoto({ Id: 'user-123' });

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.photoUrl).toBe(mockUrls.photoUrl);
        expect(result.value.uploadUrl).toBe(mockUrls.uploadUrl);
      }
    });
  });
});
