import { describe, it, expect } from 'vitest';
import { normalizeCpf } from './normalizeCpf';

describe('normalizeCpf', () => {
  it('should remove all non-digit characters from CPF', () => {
    const result = normalizeCpf('123.456.789-00');
    expect(result).toBe('12345678900');
  });

  it('should handle CPF with only dots', () => {
    const result = normalizeCpf('123.456.789.00');
    expect(result).toBe('12345678900');
  });

  it('should handle CPF with spaces', () => {
    const result = normalizeCpf('123 456 789 00');
    expect(result).toBe('12345678900');
  });

  it('should return empty string when input has no digits', () => {
    const result = normalizeCpf('abc-def');
    expect(result).toBe('');
  });

  it('should handle CPF with only digits', () => {
    const result = normalizeCpf('12345678900');
    expect(result).toBe('12345678900');
  });

  it('should handle CPF with mixed special characters', () => {
    const result = normalizeCpf('123.456.789/00');
    expect(result).toBe('12345678900');
  });
});
