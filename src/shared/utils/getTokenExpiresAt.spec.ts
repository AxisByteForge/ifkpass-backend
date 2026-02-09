import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getTokenExpiresAt } from './getTokenExpiresAt';

describe('getTokenExpiresAt', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return a date 10 minutes in the future', () => {
    const now = new Date('2024-01-01T12:00:00.000Z');
    vi.setSystemTime(now);

    const result = getTokenExpiresAt();
    const expected = new Date('2024-01-01T12:10:00.000Z');

    expect(result).toEqual(expected);
  });

  it('should return a date exactly 10 minutes (600000ms) from now', () => {
    const now = new Date('2024-06-15T18:30:00.000Z');
    vi.setSystemTime(now);

    const result = getTokenExpiresAt();
    const diff = result.getTime() - now.getTime();

    expect(diff).toBe(10 * 60 * 1000);
  });
});
