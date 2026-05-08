import { describe, it, expect } from 'vitest';
import { solveForFireDuration } from '../financeMath';

describe('solveForFireDuration', () => {
    it('returns 0 if currentNetWorth is already greater than or equal to targetValue', () => {
        expect(solveForFireDuration(1000000, 1000, 1000000, 5)).toBe(0);
        expect(solveForFireDuration(1500000, 1000, 1000000, 5)).toBe(0);
    });

    it('returns Infinity if both ROI and monthly savings are zero or negative', () => {
        expect(solveForFireDuration(10000, 0, 1000000, 0)).toBe(Infinity);
        expect(solveForFireDuration(10000, -500, 1000000, 0)).toBe(Infinity);
        expect(solveForFireDuration(10000, 0, 1000000, -2)).toBe(Infinity);
        expect(solveForFireDuration(10000, -500, 1000000, -2)).toBe(Infinity);
    });

    it('handles zero ROI with positive savings', () => {
        // target 1,000,000. current 10,000. need 990,000. saving 10,000/mo. => 99 months
        expect(solveForFireDuration(10000, 10000, 1000000, 0)).toBeCloseTo(99, 5);
    });

    it('returns Infinity if in debt and growth cannot overcome debt', () => {
        // PV = -100,000, PMT = 100, ROI = 5%
        // r = 5 / 100 / 12 = 0.0041666...
        // PMT/r = 100 / 0.0041666... = 24,000
        // PV + PMT/r = -100,000 + 24,000 = -76,000
        // Denominator is negative. Debt interest outweighs savings.
        expect(solveForFireDuration(-100000, 100, 1000000, 5)).toBe(Infinity);
    });

    it('calculates duration correctly for realistic values', () => {
        // PV = 10,000, PMT = 2,000, FV = 1,000,000, ROI = 7%
        const result = solveForFireDuration(10000, 2000, 1000000, 7);
        // Let's do a rough estimate or exact value test.
        // It's a pure math formula test, we expect a finite number.
        expect(result).toBeGreaterThan(0);
        expect(result).toBeLessThan(Infinity);
        // ~229.78 months
        expect(result).toBeCloseTo(229.78, 1);
    });

    it('handles negative ROI but high savings where target can still be reached', () => {
        // ROI = -5%, PV = 0, PMT = 20,000, target = 1,000,000
        // In theory if r < 0, our formula handles it if denominator and numerator are same sign
        const result = solveForFireDuration(0, 20000, 1000000, -5);
        expect(result).toBeGreaterThan(0);
        expect(result).toBeLessThan(Infinity);
    });
});
