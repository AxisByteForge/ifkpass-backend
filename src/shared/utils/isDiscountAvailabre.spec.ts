import { describe, it, expect } from 'vitest';
import { isDiscountAvailable } from './isDiscountAvailabre';

describe('isDiscountAvailable', () => {
  it('should return true when current date is before the discount deadline', () => {
    const currentDate = new Date('2024-03-01T00:00:00.000Z');

    const result = isDiscountAvailable(currentDate);

    expect(result).toBe(true);
  });

  it('should return true when current date is exactly at the discount deadline', () => {
    const currentYear = new Date().getFullYear();
    const currentDate = new Date(`${currentYear}-03-08T23:59:59.999Z`);

    const result = isDiscountAvailable(currentDate);

    expect(result).toBe(true);
  });

  it('should return false when current date is after the discount deadline', () => {
    const currentYear = new Date().getFullYear();
    const currentDate = new Date(`${currentYear}-03-09T00:00:00.000Z`);

    const result = isDiscountAvailable(currentDate);

    expect(result).toBe(false);
  });

  it('should return false when current date is significantly after the deadline', () => {
    const currentYear = new Date().getFullYear();
    const currentDate = new Date(`${currentYear}-12-31T23:59:59.999Z`);

    const result = isDiscountAvailable(currentDate);

    expect(result).toBe(false);
  });
});
