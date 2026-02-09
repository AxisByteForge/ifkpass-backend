import { describe, it, expect, vi, beforeEach } from 'vitest';
import { randomInt } from 'node:crypto';
import { generateCode } from './generateCode';

vi.mock('node:crypto', async () => {
  return {
    randomInt: vi.fn()
  };
});

const mockedRandomInt = vi.mocked(randomInt);

describe('generateCode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate a 6-digit code with leading zeros', () => {
    mockedRandomInt.mockReturnValue(123 as any);

    const result = generateCode();

    expect(result).toBe('000123');
    expect(mockedRandomInt).toHaveBeenCalledWith(0, 1_000_000);
  });

  it('should generate a 6-digit code when number is already 6 digits', () => {
    mockedRandomInt.mockReturnValue(999999 as any);

    const result = generateCode();

    expect(result).toBe('999999');
  });

  it('should generate a 6-digit code when number is 0', () => {
    mockedRandomInt.mockReturnValue(0 as any);

    const result = generateCode();

    expect(result).toBe('000000');
  });
});
