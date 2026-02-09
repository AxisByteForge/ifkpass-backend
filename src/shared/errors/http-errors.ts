/**
 * @deprecated Use Either<Failure, R> pattern instead of throwing exceptions.
 * See src/shared/types/failure.type.ts and src/shared/types/either.ts
 */
export class AppException extends Error {
  public readonly statusCode: number;
  public readonly error: string;
  public readonly message: string;

  constructor(message: string, statusCode: number, error: string) {
    super(message);
    this.name = new.target.name;
    this.statusCode = statusCode;
    this.message = message;
    this.error = error;
    Error.captureStackTrace(this, new.target);
  }

  toJSON() {
    return {
      statusCode: this.statusCode,
      message: this.message,
      error: this.error
    };
  }
}

/**
 * @deprecated Use Either<Failure, R> pattern instead of throwing exceptions.
 */
export class BadRequestException extends AppException {
  constructor(message = 'Bad Request') {
    super(message, 400, 'Bad Request');
  }
}

/**
 * @deprecated Use Either<Failure, R> pattern instead of throwing exceptions.
 */
export class UnauthorizedException extends AppException {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'Unauthorized');
  }
}

/**
 * @deprecated Use Either<Failure, R> pattern instead of throwing exceptions.
 */
export class ForbiddenException extends AppException {
  constructor(message = 'Forbidden') {
    super(message, 403, 'Forbidden');
  }
}

/**
 * @deprecated Use Either<Failure, R> pattern instead of throwing exceptions.
 */
export class NotFoundException extends AppException {
  constructor(message = 'Not Found') {
    super(message, 404, 'Not Found');
  }
}

/**
 * @deprecated Use Either<Failure, R> pattern instead of throwing exceptions.
 */
export class ConflictException extends AppException {
  constructor(message = 'Conflict') {
    super(message, 409, 'Conflict');
  }
}

/**
 * @deprecated Use Either<Failure, R> pattern instead of throwing exceptions.
 */
export class UnprocessableEntityException extends AppException {
  constructor(message = 'Unprocessable Entity') {
    super(message, 422, 'Unprocessable Entity');
  }
}

/**
 * @deprecated Use Either<Failure, R> pattern instead of throwing exceptions.
 */
export class InternalServerErrorException extends AppException {
  constructor(message = 'Internal Server Error') {
    super(message, 500, 'Internal Server Error');
  }
}

/**
 * @deprecated Use Either<Failure, R> pattern instead of throwing exceptions.
 */
export class UnauthorizedError extends AppException {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'Unauthorized Error');
  }
}
