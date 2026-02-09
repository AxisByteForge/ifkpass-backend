import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger } from './logger';

describe('logger', () => {
  let consoleLogSpy: any;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  it('should log request and response data', () => {
    const event = {
      body: JSON.stringify({ name: 'John' }),
      path: '/api/users',
      httpMethod: 'POST'
    };
    const response = { message: 'Success' };

    logger(event, response);

    expect(consoleLogSpy).toHaveBeenCalledOnce();
    const logged = JSON.parse(consoleLogSpy.mock.calls[0][0]);
    expect(logged.request.body).toEqual({ name: 'John' });
    expect(logged.request.path).toBe('/api/users');
    expect(logged.request.method).toBe('POST');
    expect(logged.response).toEqual({ message: 'Success' });
    expect(logged.error).toBeUndefined();
  });

  it('should sanitize sensitive fields in request body', () => {
    const event = {
      body: JSON.stringify({
        email: 'user@example.com',
        password: 'secret123',
        newPassword: 'newSecret456'
      }),
      path: '/api/auth',
      httpMethod: 'POST'
    };
    const response = { token: 'abc123' };

    logger(event, response);

    const logged = JSON.parse(consoleLogSpy.mock.calls[0][0]);
    expect(logged.request.body).toEqual({
      email: 'user@example.com',
      password: '[REDACTED]',
      newPassword: '[REDACTED]'
    });
  });

  it('should handle nested objects with sensitive fields', () => {
    const event = {
      body: JSON.stringify({
        user: {
          name: 'John',
          credentials: {
            oldPassword: 'old123',
            confirmPassword: 'new456'
          }
        }
      }),
      path: '/api/update',
      httpMethod: 'PUT'
    };
    const response = { success: true };

    logger(event, response);

    const logged = JSON.parse(consoleLogSpy.mock.calls[0][0]);
    expect(logged.request.body.user.credentials.oldPassword).toBe('[REDACTED]');
    expect(logged.request.body.user.credentials.confirmPassword).toBe(
      '[REDACTED]'
    );
    expect(logged.request.body.user.name).toBe('John');
  });

  it('should handle arrays in request body', () => {
    const event = {
      body: JSON.stringify({
        users: [
          { name: 'Alice', password: 'pass1' },
          { name: 'Bob', password: 'pass2' }
        ]
      }),
      path: '/api/batch',
      httpMethod: 'POST'
    };
    const response = { count: 2 };

    logger(event, response);

    const logged = JSON.parse(consoleLogSpy.mock.calls[0][0]);
    expect(logged.request.body.users[0].password).toBe('[REDACTED]');
    expect(logged.request.body.users[1].password).toBe('[REDACTED]');
    expect(logged.request.body.users[0].name).toBe('Alice');
  });

  it('should handle non-JSON body gracefully', () => {
    const event = {
      body: 'plain text body',
      path: '/api/text',
      httpMethod: 'POST'
    };
    const response = { received: true };

    logger(event, response);

    const logged = JSON.parse(consoleLogSpy.mock.calls[0][0]);
    expect(logged.request.body).toBe('plain text body');
  });

  it('should handle null body', () => {
    const event = {
      body: null,
      path: '/api/get',
      httpMethod: 'GET'
    };
    const response = { data: [] };

    logger(event, response);

    const logged = JSON.parse(consoleLogSpy.mock.calls[0][0]);
    expect(logged.request.body).toBeUndefined();
  });

  it('should handle undefined event', () => {
    const response = { message: 'Response without event' };

    logger(undefined, response);

    const logged = JSON.parse(consoleLogSpy.mock.calls[0][0]);
    expect(logged.request.body).toBeUndefined();
    expect(logged.request.path).toBeNull();
    expect(logged.request.method).toBeNull();
  });

  it('should handle Error instance in error parameter', () => {
    const event = {
      body: JSON.stringify({ action: 'test' }),
      path: '/api/error',
      httpMethod: 'POST'
    };
    const response = { error: true };
    const error = new Error('Something went wrong');
    error.stack = 'Error stack trace';

    logger(event, response, error);

    const logged = JSON.parse(consoleLogSpy.mock.calls[0][0]);
    expect(logged.error).toEqual({
      message: 'Something went wrong',
      name: 'Error',
      stack: 'Error stack trace'
    });
  });

  it('should handle non-Error error parameter', () => {
    const event = {
      body: JSON.stringify({ action: 'test' }),
      path: '/api/error',
      httpMethod: 'POST'
    };
    const response = { error: true };
    const error = { code: 500, msg: 'Custom error' };

    logger(event, response, error);

    const logged = JSON.parse(consoleLogSpy.mock.calls[0][0]);
    expect(logged.error).toEqual({ code: 500, msg: 'Custom error' });
  });

  it('should not include error field when error is undefined', () => {
    const event = {
      body: JSON.stringify({ action: 'test' }),
      path: '/api/success',
      httpMethod: 'POST'
    };
    const response = { success: true };

    logger(event, response, undefined);

    const logged = JSON.parse(consoleLogSpy.mock.calls[0][0]);
    expect(logged.error).toBeUndefined();
  });

  it('should handle empty object body', () => {
    const event = {
      body: JSON.stringify({}),
      path: '/api/empty',
      httpMethod: 'POST'
    };
    const response = { ok: true };

    logger(event, response);

    const logged = JSON.parse(consoleLogSpy.mock.calls[0][0]);
    expect(logged.request.body).toEqual({});
  });

  it('should sanitize all SENSITIVE_KEYS', () => {
    const event = {
      body: JSON.stringify({
        password: 'p1',
        newPassword: 'p2',
        oldPassword: 'p3',
        confirmPassword: 'p4',
        username: 'user123'
      }),
      path: '/api/change-password',
      httpMethod: 'POST'
    };
    const response = { updated: true };

    logger(event, response);

    const logged = JSON.parse(consoleLogSpy.mock.calls[0][0]);
    expect(logged.request.body.password).toBe('[REDACTED]');
    expect(logged.request.body.newPassword).toBe('[REDACTED]');
    expect(logged.request.body.oldPassword).toBe('[REDACTED]');
    expect(logged.request.body.confirmPassword).toBe('[REDACTED]');
    expect(logged.request.body.username).toBe('user123');
  });
});
