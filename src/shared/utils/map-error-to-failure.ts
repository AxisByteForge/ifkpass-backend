import { ZodError } from 'zod';
import type { Failure } from '@/shared/types/failure.type';

export const mapZodErrorToFailure = (error: ZodError): Failure => {
  const errorMessages = error.errors
    .map((err) => `${err.path.join('.')}: ${err.message}`)
    .join(', ');

  return {
    reason: `Validation failed: ${errorMessages}`,
    statusCode: 400
  };
};

export const createFailure = (reason: string, statusCode: number): Failure => ({
  reason,
  statusCode
});
