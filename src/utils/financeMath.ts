import { FinanceItem } from '../store/useFinanceStore';
import { normalizeToMonthly } from './financeEngine';

/**
 * Normalizes any frequency-based finance item into a monthly amount.
 * Delegates to the canonical normalizeToMonthly from financeEngine to
 * ensure consistency across the whole app.
 */
export const getMonthlyAmount = (item: FinanceItem): number =>
    normalizeToMonthly(item.amount, item.frequency);

/**
 * Calculates current total monthly surplus (savings velocity).
 * NOTE: Can return a negative number if expenses exceed income — callers
 * should handle and display the deficit rather than clamping to zero.
 */
export const getMonthlySurplus = (income: FinanceItem[], expenses: FinanceItem[]): number => {
    const totalIncome = income.reduce((acc, i) => acc + normalizeToMonthly(i.amount, i.frequency), 0);
    const totalExpenses = expenses.reduce((acc, i) => acc + normalizeToMonthly(i.amount, i.frequency), 0);
    return totalIncome - totalExpenses;
};

/**
 * Solves for the number of months required to reach a target FIRE goal.
 * Based on the Future Value of an Annuity formula.
 * 
 * @param currentNetWorth Current starting capital (PV)
 * @param monthlySavings Amount added each month (PMT)
 * @param targetValue The FIRE goal (FV)
 * @param annualROI Expected annual return percentage (e.g., 7)
 * @returns Number of months required, or Infinity if unreachable.
 */
export const solveForFireDuration = (
    currentNetWorth: number,
    monthlySavings: number,
    targetValue: number,
    annualROI: number
): number => {
    if (currentNetWorth >= targetValue) return 0;
    
    // Convert annual ROI to monthly rate
    const r = annualROI / 100 / 12;
    
    // If no growth and no savings, it's impossible
    if (r <= 0 && monthlySavings <= 0) return Infinity;
    
    // Special case: no interest growth
    if (r <= 0) {
        return (targetValue - currentNetWorth) / monthlySavings;
    }

    // Solve for n:
    // n = ln((FV + PMT/r) / (PV + PMT/r)) / ln(1 + r)
    // Note: If (PV + PMT/r) is negative (debt > savings potential), it's a critical state.
    const denominator = currentNetWorth + monthlySavings / r;
    const numerator = targetValue + monthlySavings / r;
    
    if (denominator <= 0) return Infinity; // Cannot grow out of current debt state with this ROI/Savings

    const months = Math.log(numerator / denominator) / Math.log(1 + r);
    return Math.max(0, months);
};

/**
 * Calculates the FIRE Number (Target Pot) based on annual expenses and withdrawal rate.
 */
export const calculateFireNumber = (annualExpenses: number, swr: number): number => {
    if (swr <= 0) return Infinity;
    return annualExpenses / (swr / 100);
};
