import { describe, it, expect } from 'vitest';
import { calculateFireNumber } from '../financeMath';

describe('calculateFireNumber', () => {
    it('calculates the target pot correctly for standard inputs', () => {
        expect(calculateFireNumber(40000, 4)).toBe(1000000);
        expect(calculateFireNumber(30000, 3)).toBe(1000000);
        expect(calculateFireNumber(50000, 5)).toBe(1000000);
        expect(calculateFireNumber(100000, 4)).toBe(2500000);
    });

    it('returns Infinity when SWR is 0 or less', () => {
        expect(calculateFireNumber(40000, 0)).toBe(Infinity);
        expect(calculateFireNumber(40000, -1)).toBe(Infinity);
        expect(calculateFireNumber(40000, -5)).toBe(Infinity);
    });

    it('handles zero annual expenses correctly', () => {
        expect(calculateFireNumber(0, 4)).toBe(0);
        expect(calculateFireNumber(0, 10)).toBe(0);
    });

    it('handles negative annual expenses (unusual but mathematically possible)', () => {
        expect(calculateFireNumber(-40000, 4)).toBe(-1000000);
    });

    it('handles fractional SWR correctly', () => {
        expect(calculateFireNumber(40000, 3.5)).toBeCloseTo(1142857.14, 2);
        expect(calculateFireNumber(40000, 4.5)).toBeCloseTo(888888.89, 2);
    });
});
