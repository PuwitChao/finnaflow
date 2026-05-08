import { describe, it, expect } from 'vitest';
import { suggestCategory } from './statementParser';

describe('suggestCategory', () => {
    it('matches keywords exactly', () => {
        expect(suggestCategory('GRAB')).toEqual({ category: 'Transportation', confidence: 'high' });
        expect(suggestCategory('SHOPEE')).toEqual({ category: 'Shopping', confidence: 'high' });
        expect(suggestCategory('7-ELEVEN')).toEqual({ category: 'Groceries', confidence: 'high' });
    });

    it('matches keywords case-insensitively', () => {
        expect(suggestCategory('grab')).toEqual({ category: 'Transportation', confidence: 'high' });
        expect(suggestCategory('ShoPee')).toEqual({ category: 'Shopping', confidence: 'high' });
        expect(suggestCategory('shabu')).toEqual({ category: 'Dining Out', confidence: 'high' });
    });

    it('matches keywords embedded in longer strings', () => {
        expect(suggestCategory('Payment to GRAB taxi')).toEqual({ category: 'Transportation', confidence: 'high' });
        expect(suggestCategory('Transfer to 7-ELEVEN store')).toEqual({ category: 'Groceries', confidence: 'high' });
        expect(suggestCategory('BUY LOTUS ONLINE')).toEqual({ category: 'Groceries', confidence: 'high' });
    });

    it('returns "Other" with "low" confidence for unknown descriptions', () => {
        expect(suggestCategory('Random unknown store')).toEqual({ category: 'Other', confidence: 'low' });
        expect(suggestCategory('Transfer to friend')).toEqual({ category: 'Other', confidence: 'low' });
    });

    it('handles empty strings and spaces', () => {
        expect(suggestCategory('')).toEqual({ category: 'Other', confidence: 'low' });
        expect(suggestCategory('   ')).toEqual({ category: 'Other', confidence: 'low' });
    });
});
