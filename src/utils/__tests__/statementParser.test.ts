import { describe, it, expect } from 'vitest';
import { suggestCategory } from '../statementParser';

describe('suggestCategory', () => {
    it('should map exact keywords correctly with high confidence', () => {
        expect(suggestCategory('GRAB')).toEqual({ category: 'Transportation', confidence: 'high' });
        expect(suggestCategory('LINEMAN')).toEqual({ category: 'Food & Delivery', confidence: 'high' });
        expect(suggestCategory('7-ELEVEN')).toEqual({ category: 'Groceries', confidence: 'high' });
        expect(suggestCategory('BINANCE')).toEqual({ category: 'Investment', confidence: 'high' });
    });

    it('should handle case insensitivity', () => {
        expect(suggestCategory('grab')).toEqual({ category: 'Transportation', confidence: 'high' });
        expect(suggestCategory('Grab')).toEqual({ category: 'Transportation', confidence: 'high' });
        expect(suggestCategory('sHoPeE')).toEqual({ category: 'Shopping', confidence: 'high' });
    });

    it('should match keyword as a substring', () => {
        expect(suggestCategory('Payment to GRAB')).toEqual({ category: 'Transportation', confidence: 'high' });
        expect(suggestCategory('Shopping at 7-ELEVEN today')).toEqual({ category: 'Groceries', confidence: 'high' });
        expect(suggestCategory('STARBUCKS COFFEE CO')).toEqual({ category: 'Dining Out', confidence: 'high' });
    });

    it('should fallback to Other with low confidence when no keyword matches', () => {
        expect(suggestCategory('Random Merchant')).toEqual({ category: 'Other', confidence: 'low' });
        expect(suggestCategory('Unknown Transfer')).toEqual({ category: 'Other', confidence: 'low' });
    });

    it('should handle empty string', () => {
        expect(suggestCategory('')).toEqual({ category: 'Other', confidence: 'low' });
    });
});
