import { describe, it, expect } from 'vitest';
import { normalizeBirthDate } from './normalizeBirthDate';

describe('normalizeBirthDate', () => {
  it('should convert DD/MM/YYYY to YYYY-MM-DD', () => {
    const result = normalizeBirthDate('15/03/1990');
    expect(result).toBe('1990-03-15');
  });

  it('should convert DD-MM-YYYY to YYYY-MM-DD', () => {
    const result = normalizeBirthDate('15-03-1990');
    expect(result).toBe('1990-03-15');
  });

  it('should convert DD.MM.YYYY to YYYY-MM-DD', () => {
    const result = normalizeBirthDate('15.03.1990');
    expect(result).toBe('1990-03-15');
  });

  it('should keep YYYY-MM-DD format unchanged', () => {
    const result = normalizeBirthDate('1990-03-15');
    expect(result).toBe('1990-03-15');
  });

  it('should handle date with spaces', () => {
    const result = normalizeBirthDate('15 03 1990');
    expect(result).toBe('1990-03-15');
  });

  it('should handle date with mixed separators', () => {
    const result = normalizeBirthDate('15/03-1990');
    expect(result).toBe('1990-03-15');
  });

  it('should return original string if format is not recognized', () => {
    const result = normalizeBirthDate('invalid');
    expect(result).toBe('invalid');
  });

  it('should handle DDMMYYYY without separators', () => {
    const result = normalizeBirthDate('15031990');
    expect(result).toBe('1990-03-15');
  });
});
