import { describe, it, expect } from 'vitest';
import { getMonthlySurplus, solveForFireDuration, calculateFireNumber } from '../financeMath';
import { normalizeToMonthly } from '../financeEngine';
import { FinanceItem } from '../../store/useFinanceStore';


describe('financeMath', () => {
    describe('normalizeToMonthly', () => {
        it('normalizes monthly items correctly', () => {
            expect(normalizeToMonthly(1000, 'Monthly')).toBe(1000);
        });

        it('normalizes weekly items correctly', () => {
            expect(normalizeToMonthly(100, 'Weekly')).toBeCloseTo(433, 0);
        });

        it('normalizes yearly items correctly', () => {
            expect(normalizeToMonthly(12000, 'Yearly')).toBe(1000);
        });
    });


    describe('getMonthlySurplus', () => {
        it('calculates surplus correctly', () => {
            const income: FinanceItem[] = [
                { id: 'i1', name: 'Salary', amount: 5000, frequency: 'Monthly', category: 'Needs' }
            ];
            const expenses: FinanceItem[] = [
                { id: 'e1', name: 'Rent', amount: 1500, frequency: 'Monthly', category: 'Needs' },
                { id: 'e2', name: 'Food', amount: 100, frequency: 'Weekly', category: 'Needs' }
            ];
            // Total Expenses = 1500 + 433 = 1933
            // Surplus = 5000 - 1933 = 3067
            expect(getMonthlySurplus(income, expenses)).toBeCloseTo(3067, 0);
        });
    });

    describe('solveForFireDuration', () => {
        it('returns 0 if already reached goal', () => {
            expect(solveForFireDuration(100, 10, 50, 7)).toBe(0);
        });

        it('calculates duration correctly with simple math (no interest)', () => {
            // Target 200, Start 100, Save 10/mo -> 10 months
            expect(solveForFireDuration(100, 10, 200, 0)).toBe(10);
        });

        it('calculates duration with compound interest', () => {
            // Target 1M, Start 100k, Save 2k/mo, 7% ROI
            const months = solveForFireDuration(100000, 2000, 1000000, 7);
            expect(months).toBeGreaterThan(0);
            expect(months).toBeLessThan(20 * 12); // Less than 20 years
        });
    });

    describe('calculateFireNumber', () => {
        it('calculates FIRE number based on 4% rule', () => {
            expect(calculateFireNumber(40000, 4)).toBe(1000000);
        });
    });
});
