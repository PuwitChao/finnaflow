import { describe, it, expect } from 'vitest';
import { getCurrencySymbol } from './currencies';

describe('getCurrencySymbol', () => {
    it('returns the correct symbol for USD', () => {
        expect(getCurrencySymbol('USD')).toBe('$');
    });

    it('returns the correct symbol for THB', () => {
        expect(getCurrencySymbol('THB')).toBe('฿');
    });

    it('returns the correct symbol for EUR', () => {
        expect(getCurrencySymbol('EUR')).toBe('€');
    });

    it('returns $ for an unknown currency code', () => {
        expect(getCurrencySymbol('UNKNOWN')).toBe('$');
    });

    it('returns $ for an empty string', () => {
        expect(getCurrencySymbol('')).toBe('$');
    });
});
