import { describe, it, expect, vi } from 'vitest';
import { generateCode } from './generateCode';
import { randomInt } from 'node:crypto';

vi.mock('node:crypto', () => ({
  randomInt: vi.fn()
}));

describe('generateCode', () => {
  it('should generate a 6-digit code with leading zeros', () => {
    vi.mocked(randomInt).mockReturnValue(123);

    const result = generateCode();

    expect(result).toBe('000123');
    expect(randomInt).toHaveBeenCalledWith(0, 1000000);
  });

  it('should generate a 6-digit code when number is already 6 digits', () => {
    vi.mocked(randomInt).mockReturnValue(999999);

    const result = generateCode();

    expect(result).toBe('999999');
  });

  it('should generate a 6-digit code when number is 0', () => {
    vi.mocked(randomInt).mockReturnValue(0);

    const result = generateCode();

    expect(result).toBe('000000');
  });
});
