/**
 * Centralized design tokens and theme constants for FinnaFlow.
 * Follows Apple-inspired premium aesthetics.
 */

export const CATEGORY_COLORS: Record<string, string> = {
    'Needs': '#007AFF',       // Apple Blue
    'Wants': '#FF3B30',       // Apple Red
    'Savings': '#34C759',     // Apple Green
    'Investments': '#AF52DE', // Apple Purple
    'Debt': '#8E8E93',        // Apple Gray
    'Cash': '#5856D6',        // Indigo
    'Stocks': '#FF9500',      // Orange
    'Property': '#A2845E',    // Brown/Gold
    'Other': '#94a3b8',       // Slate
};

export const NODE_COLORS = {
    DEBT: '#ef4444',
    WALLET: '#64748b',
    UNALLOCATED: '#059669',
    INCOME: '#10b981',
};

export const CHART_ALPHA = 0.2;
export const CHART_ALPHA_EXPENSE = 0.1;
