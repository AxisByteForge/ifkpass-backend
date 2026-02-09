import { describe, it, expect } from 'vitest';
import { normalizePhone } from './normalizePhone';

describe('normalizePhone', () => {
  it('should remove all non-digit characters from phone', () => {
    const result = normalizePhone('(11) 98765-4321');
    expect(result).toBe('11987654321');
  });

  it('should handle phone with spaces and dashes', () => {
    const result = normalizePhone('11 9 8765-4321');
    expect(result).toBe('11987654321');
  });

  it('should handle phone with country code', () => {
    const result = normalizePhone('+55 11 98765-4321');
    expect(result).toBe('5511987654321');
  });

  it('should return empty string when input has no digits', () => {
    const result = normalizePhone('abc-def');
    expect(result).toBe('');
  });

  it('should handle phone with only digits', () => {
    const result = normalizePhone('11987654321');
    expect(result).toBe('11987654321');
  });

  it('should handle phone with parentheses', () => {
    const result = normalizePhone('(11)98765-4321');
    expect(result).toBe('11987654321');
  });

  it('should handle phone with dots', () => {
    const result = normalizePhone('11.98765.4321');
    expect(result).toBe('11987654321');
  });
});
