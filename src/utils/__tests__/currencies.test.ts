import { describe, it, expect } from 'vitest';
import { scaleTemplateAmount, getCurrencySymbol } from '../currencies';

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

describe('scaleTemplateAmount', () => {


    it('should fallback to 0.028 if currency scale is missing', () => {
        expect(scaleTemplateAmount(100, 'UNKNOWN')).toBe(2.8);
    });

    it('should round correctly when raw < 10', () => {
        expect(scaleTemplateAmount(100, 'USD')).toBe(2.8);
    });

    it('should round correctly when raw < 100', () => {
        expect(scaleTemplateAmount(1000, 'USD')).toBe(30);
    });

    it('should round correctly when raw < 1000', () => {
        expect(scaleTemplateAmount(10000, 'USD')).toBe(300);
    });

    it('should round correctly when raw < 10000', () => {
        expect(scaleTemplateAmount(100000, 'USD')).toBe(3000);
    });

    it('should round correctly when raw >= 10000', () => {
        expect(scaleTemplateAmount(1000000, 'USD')).toBe(30000);
    });
});
