import { describe, it, expect } from 'vitest';
import { normalizeToMonthly } from '../financeEngine';
import { WEEKS_PER_MONTH } from '../../constants/version';
import { Frequency } from '../../store/useFinanceStore';

describe('normalizeToMonthly', () => {
  it('should normalize Weekly amounts correctly', () => {
    expect(normalizeToMonthly(100, 'Weekly')).toBe(100 * WEEKS_PER_MONTH);
  });

  it('should normalize Monthly amounts correctly', () => {
    expect(normalizeToMonthly(100, 'Monthly')).toBe(100);
  });

  it('should normalize Yearly amounts correctly', () => {
    expect(normalizeToMonthly(1200, 'Yearly')).toBe(100);
  });

  it('should handle default/unknown frequencies', () => {
    expect(normalizeToMonthly(100, 'Unknown' as Frequency)).toBe(100);
  });
});
