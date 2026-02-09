import { describe, it, expect } from 'vitest';
import { mapStatus } from './mapStatus';

describe('mapStatus', () => {
  it('should map "approved" to "approved"', () => {
    const result = mapStatus('approved');
    expect(result).toBe('approved');
  });

  it('should map "rejected" to "rejected"', () => {
    const result = mapStatus('rejected');
    expect(result).toBe('rejected');
  });

  it('should map "cancelled" to "rejected"', () => {
    const result = mapStatus('cancelled');
    expect(result).toBe('rejected');
  });

  it('should map "refunded" to "rejected"', () => {
    const result = mapStatus('refunded');
    expect(result).toBe('rejected');
  });

  it('should map "charged_back" to "rejected"', () => {
    const result = mapStatus('charged_back');
    expect(result).toBe('rejected');
  });

  it('should map "pending" to "pending"', () => {
    const result = mapStatus('pending');
    expect(result).toBe('pending');
  });

  it('should map "in_process" to "pending"', () => {
    const result = mapStatus('in_process');
    expect(result).toBe('pending');
  });

  it('should map "in_mediation" to "pending"', () => {
    const result = mapStatus('in_mediation');
    expect(result).toBe('pending');
  });

  it('should map unknown status to "pending"', () => {
    const result = mapStatus('unknown_status');
    expect(result).toBe('pending');
  });

  it('should map empty string to "pending"', () => {
    const result = mapStatus('');
    expect(result).toBe('pending');
  });

  it('should handle case-sensitive status values correctly', () => {
    const result = mapStatus('APPROVED');
    expect(result).toBe('pending'); // Not 'approved' because it's case-sensitive
  });
});
