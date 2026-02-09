import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  normalizeRank,
  beltCategoryFromRank,
  generateCardId
} from './karate-utils';
import { randomUUID } from 'node:crypto';

vi.mock('node:crypto', () => ({
  randomUUID: vi.fn()
}));

describe('normalizeRank', () => {
  it('should return undefined when rank is undefined', () => {
    const result = normalizeRank(undefined);
    expect(result).toBeUndefined();
  });

  it('should normalize rank by trimming and lowercasing', () => {
    const result = normalizeRank('  BRANCA  ');
    expect(result).toBe('Branca');
  });

  it('should remove "faixa" prefix', () => {
    const result = normalizeRank('Faixa Preta');
    expect(result).toBe('Preta');
  });

  it('should match valid rank from KARATE_RANKS', () => {
    const result = normalizeRank('amarela');
    expect(result).toBe('Amarela');
  });

  it('should return undefined for invalid rank', () => {
    const result = normalizeRank('Rosa');
    expect(result).toBeUndefined();
  });

  it('should handle "Verde" rank correctly', () => {
    const result = normalizeRank('Faixa Verde');
    expect(result).toBe('Verde');
  });
});

describe('beltCategoryFromRank', () => {
  it('should return "black" for Preta rank', () => {
    const result = beltCategoryFromRank('Preta');
    expect(result).toBe('black');
  });

  it('should return "colored" for non-Preta rank', () => {
    const result = beltCategoryFromRank('Branca');
    expect(result).toBe('colored');
  });

  it('should return "colored" for undefined rank', () => {
    const result = beltCategoryFromRank(undefined);
    expect(result).toBe('colored');
  });

  it('should return "colored" for any rank that is not Preta', () => {
    const result = beltCategoryFromRank('Azul');
    expect(result).toBe('colored');
  });
});

describe('generateCardId', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should generate card ID with current year and UUID', () => {
    const mockUUID = '123e4567-e89b-12d3-a456-426614174000';
    vi.mocked(randomUUID).mockReturnValue(mockUUID);
    const testDate = new Date('2024-01-01');
    vi.setSystemTime(testDate);

    const result = generateCardId();
    const expectedYear = testDate.getFullYear();

    expect(result).toBe(`KTY-${expectedYear}-${mockUUID}`);
    expect(randomUUID).toHaveBeenCalled();
  });

  it('should generate card ID with different year', () => {
    const mockUUID = 'abcd1234-5678-90ef-ghij-klmnopqrstuv';
    vi.mocked(randomUUID).mockReturnValue(mockUUID);
    vi.setSystemTime(new Date('2025-06-15'));

    const result = generateCardId();

    expect(result).toBe(`KTY-2025-${mockUUID}`);
  });
});
