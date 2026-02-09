import { describe, it, expect } from 'vitest';
import { mapZodErrorToFailure, createFailure } from './map-error-to-failure';
import { ZodError, z } from 'zod';

describe('mapZodErrorToFailure', () => {
  it('should map ZodError to Failure with formatted error messages', () => {
    const schema = z.object({
      email: z.string().email(),
      age: z.number().min(18)
    });

    try {
      schema.parse({ email: 'invalid-email', age: 15 });
    } catch (error) {
      const result = mapZodErrorToFailure(error as ZodError);

      expect(result.statusCode).toBe(400);
      expect(result.reason).toContain('Validation failed:');
      expect(result.reason).toContain('email');
      expect(result.reason).toContain('age');
    }
  });

  it('should handle single validation error', () => {
    const schema = z.object({
      name: z.string().min(3)
    });

    try {
      schema.parse({ name: 'ab' });
    } catch (error) {
      const result = mapZodErrorToFailure(error as ZodError);

      expect(result.statusCode).toBe(400);
      expect(result.reason).toContain('Validation failed:');
      expect(result.reason).toContain('name');
    }
  });

  it('should handle nested field errors', () => {
    const schema = z.object({
      user: z.object({
        profile: z.object({
          bio: z.string().min(10)
        })
      })
    });

    try {
      schema.parse({ user: { profile: { bio: 'short' } } });
    } catch (error) {
      const result = mapZodErrorToFailure(error as ZodError);

      expect(result.statusCode).toBe(400);
      expect(result.reason).toContain('Validation failed:');
      expect(result.reason).toContain('user.profile.bio');
    }
  });

  it('should join multiple errors with comma separator', () => {
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(6),
      age: z.number().min(18)
    });

    try {
      schema.parse({ email: 'bad', password: '123', age: 10 });
    } catch (error) {
      const result = mapZodErrorToFailure(error as ZodError);

      expect(result.reason).toContain(',');
      expect(result.statusCode).toBe(400);
    }
  });
});

describe('createFailure', () => {
  it('should create a Failure object with reason and statusCode', () => {
    const result = createFailure('User not found', 404);

    expect(result).toEqual({
      reason: 'User not found',
      statusCode: 404
    });
  });

  it('should create a Failure object with validation error', () => {
    const result = createFailure('Invalid input data', 400);

    expect(result).toEqual({
      reason: 'Invalid input data',
      statusCode: 400
    });
  });

  it('should create a Failure object with server error', () => {
    const result = createFailure('Internal server error', 500);

    expect(result).toEqual({
      reason: 'Internal server error',
      statusCode: 500
    });
  });

  it('should handle any status code', () => {
    const result = createFailure('Unauthorized', 401);

    expect(result.statusCode).toBe(401);
    expect(result.reason).toBe('Unauthorized');
  });
});
