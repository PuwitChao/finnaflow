import { describe, it, expect } from 'vitest';
import { normalizeToMonthly } from './financeEngine';

describe('normalizeToMonthly', () => {
  it('should normalize Weekly amounts', () => {
    // 100 * (52 / 12) = 100 * 4.333333333333333 = 433.3333333333333
    expect(normalizeToMonthly(100, 'Weekly')).toBeCloseTo(433.3333333333333);
  });
  it('should normalize Monthly amounts', () => {
    expect(normalizeToMonthly(100, 'Monthly')).toBe(100);
  });
  it('should normalize Yearly amounts', () => {
    // 100 / 12 = 8.333333333333334
    expect(normalizeToMonthly(100, 'Yearly')).toBeCloseTo(8.333333333333334);
  });
  it('should handle default case as monthly', () => {
    // @ts-expect-error - testing invalid frequency fallback
    expect(normalizeToMonthly(100, 'Daily')).toBe(100);
  });
});
