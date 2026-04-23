import { FinanceItem, Frequency } from '../store/useFinanceStore';
import { WEEKS_PER_MONTH } from '../constants/version';

/**
 * Normalizes a financial amount to its monthly average based on frequency.
 *
 * @param amount - The numeric value to normalize.
 * @param frequency - The frequency of the transaction ('Weekly', 'Monthly', 'Yearly').
 * @returns The monthly average value.
 */
export const normalizeToMonthly = (amount: number, frequency: Frequency): number => {
    switch (frequency) {
        case 'Weekly':
            return amount * WEEKS_PER_MONTH; // 52/12 — exact, from constants/version
        case 'Monthly':
            return amount;
        case 'Yearly':
            return amount / 12;
        default:
            return amount;
    }
};

/**
 * Represents the structured data required for a Plotly Sankey diagram.
 */
export interface SankeyData {
    /** Array of node labels. */
    nodes: string[];
    /** Array of metadata for each node. */
    nodeMetadata: {
        type: 'debt' | 'wallet' | 'unallocated' | 'category' | 'income' | 'expense';
        id?: string;
        name?: string;
        category?: string;
    }[];
    /** Array of link objects defining the flow between nodes. */
    links: {
        source: number;
        target: number;
        value: number;
        label: string;
        color?: string;
    }[];
    /** Array of node colors. */
    nodeColors: string[];
}

/**
 * Generates the Sankey diagram configuration based on user income and expense items.
 * Items with an endDate in the past are excluded from the diagram.
 */
export const generateSankeyConfig = (
    incomeItems: FinanceItem[],
    expenseItems: FinanceItem[],
    multipliers: Record<string, number> = {},
    macro: { inflation: number; marketShock: number } = { inflation: 0, marketShock: 0 },
    t: (key: string) => string = (k) => k,
    isPrivacyMode: boolean = false
): SankeyData => {
    const today = new Date().toISOString().split('T')[0];
    const activeIncome = incomeItems.filter(i => !i.endDate || i.endDate >= today);
    const activeExpenses = expenseItems.filter(i => !i.endDate || i.endDate >= today);

    const infFactor = 1 + (macro.inflation / 100);
    const mktFactor = 1 - (macro.marketShock / 100);

    const getProjectedIncome = (item: FinanceItem) => {
        const base = normalizeToMonthly(item.amount, item.frequency);
        const isInvestment = item.category === 'Investments' || item.category === 'Dividends' || item.name.toLowerCase().includes('investment');
        return isInvestment ? base * mktFactor : base;
    };

    const totalMonthlyIncome = activeIncome.reduce((acc, item) => acc + getProjectedIncome(item), 0);

    const getProjectedAmount = (item: FinanceItem) => {
        const base = normalizeToMonthly(item.amount, item.frequency);
        const multiplier = multipliers[item.category] ?? 1;
        return base * multiplier * infFactor;
    };

    const totalMonthlyExpense = activeExpenses.reduce((acc, item) => acc + getProjectedAmount(item), 0);

    const nodes = [
        t('chart.nodes.debtSource'),
        t('chart.nodes.wallet'),
        t('chart.nodes.unallocated'),
    ];

    const nodeColors = [
        '#ef4444',
        '#64748b',
        '#059669',
    ];

    const nodeMetadata: SankeyData['nodeMetadata'] = [
        { type: 'debt' },
        { type: 'wallet' },
        { type: 'unallocated' }
    ];

    const categories = Array.from(new Set(activeExpenses.map(i => i.category)));
    const categoryNodeOffset = nodes.length;

    const catColorMap: Record<string, string> = {
        'Needs': '#007AFF',
        'Wants': '#FF3B30',
        'Savings': '#34C759',
        'Investments': '#AF52DE',
        'Debt': '#8E8E93',
    };

    categories.forEach(cat => {
        const translatedCat = t(`category.${cat}`);
        nodes.push(translatedCat === `category.${cat}` ? cat : translatedCat);
        nodeColors.push(catColorMap[cat] || '#94a3b8');
        nodeMetadata.push({ type: 'category', category: cat });
    });

    const incomeNodeOffset = nodes.length;
    activeIncome.forEach(item => {
        nodes.push(item.name);
        nodeColors.push('#10b981');
        nodeMetadata.push({ type: 'income', id: item.id, name: item.name });
    });

    const expenseNodeOffset = nodes.length;
    activeExpenses.forEach(item => {
        nodes.push(item.name);
        nodeColors.push(catColorMap[item.category] || '#94a3b8');
        nodeMetadata.push({ type: 'expense', id: item.id, name: item.name, category: item.category });
    });

    const links: SankeyData['links'] = [];

    activeIncome.forEach((item, index) => {
        links.push({
            source: incomeNodeOffset + index,
            target: 1,
            value: getProjectedIncome(item),
            label: item.name,
            color: 'rgba(16, 185, 129, 0.2)'
        });
    });

    if (totalMonthlyExpense > totalMonthlyIncome) {
        links.push({
            source: 0,
            target: 1,
            value: totalMonthlyExpense - totalMonthlyIncome,
            label: t('chart.links.debt'),
            color: 'rgba(239, 68, 68, 0.4)'
        });
    }

    categories.forEach((cat, index) => {
        const catTotal = activeExpenses
            .filter(i => i.category === cat)
            .reduce((acc, i) => acc + getProjectedAmount(i), 0);

        const baseColor = catColorMap[cat] || '#94a3b8';
        const rgbaColor = baseColor.startsWith('#')
            ? `rgba(${parseInt(baseColor.slice(1, 3), 16)}, ${parseInt(baseColor.slice(3, 5), 16)}, ${parseInt(baseColor.slice(5, 7), 16)}, 0.2)`
            : 'rgba(148, 163, 184, 0.2)';

        if (catTotal > 0) {
            links.push({
                source: 1,
                target: categoryNodeOffset + index,
                value: catTotal,
                label: `${t('chart.nodes.poolPrefix')}${t(`category.${cat}`) || cat}${t('chart.nodes.poolSuffix')}`,
                color: rgbaColor
            });
        }
    });

    if (totalMonthlyIncome > totalMonthlyExpense) {
        links.push({
            source: 1,
            target: 2,
            value: totalMonthlyIncome - totalMonthlyExpense,
            label: t('chart.links.surplus'),
            color: 'rgba(5, 150, 105, 0.4)'
        });
    }

    activeExpenses.forEach((item, index) => {
        const catIndex = categories.indexOf(item.category);
        const itemAmount = getProjectedAmount(item);
        const percentage = totalMonthlyIncome > 0 ? (itemAmount / totalMonthlyIncome * 100).toFixed(1) : '0';

        const baseColor = catColorMap[item.category] || '#94a3b8';
        const rgbaColor = baseColor.startsWith('#')
            ? `rgba(${parseInt(baseColor.slice(1, 3), 16)}, ${parseInt(baseColor.slice(3, 5), 16)}, ${parseInt(baseColor.slice(5, 7), 16)}, 0.1)`
            : 'rgba(148, 163, 184, 0.1)';

        links.push({
            source: categoryNodeOffset + catIndex,
            target: expenseNodeOffset + index,
            value: itemAmount,
            label: isPrivacyMode ? item.name : `${item.name} (${percentage}%)`,
            color: rgbaColor
        });
    });

    return { nodes, links, nodeColors, nodeMetadata };
};

/** Individual score components from the resilience calculation. */
export interface ResilienceBreakdown {
    score: number;
    savingsScore: number;
    needsScore: number;
    wantsScore: number;
    assetsScore: number;
    insuranceScore: number;
    savingsRate: number;
    needsRate: number;
    wantsRate: number;
}

/**
 * Calculates a financial resilience score (0–100) and returns a full breakdown
 * of each component so the UI can explain the score to the user.
 */
export const getResilienceBreakdown = (
    incomeItems: FinanceItem[],
    expenseItems: FinanceItem[],
    assetItems: { amount?: number }[],
    insuranceItems: { type: string }[] = []
): ResilienceBreakdown => {
    const totalIncome = incomeItems.reduce((acc, i) => acc + normalizeToMonthly(i.amount, i.frequency), 0);
    const totalExpense = expenseItems.reduce((acc, i) => acc + normalizeToMonthly(i.amount, i.frequency), 0);

    if (totalIncome === 0) {
        return { score: 0, savingsScore: 0, needsScore: 0, wantsScore: 0, assetsScore: 0, insuranceScore: 0, savingsRate: 0, needsRate: 0, wantsRate: 0 };
    }

    const needs = expenseItems.filter(i => i.category === 'Needs').reduce((acc, i) => acc + normalizeToMonthly(i.amount, i.frequency), 0);
    const wants = expenseItems.filter(i => i.category === 'Wants').reduce((acc, i) => acc + normalizeToMonthly(i.amount, i.frequency), 0);
    const savings = expenseItems.filter(i => i.category === 'Savings' || i.category === 'Investments').reduce((acc, i) => acc + normalizeToMonthly(i.amount, i.frequency), 0);

    const savingsRate = savings / totalIncome;
    const needsRate = needs / totalIncome;
    const wantsRate = wants / totalIncome;

    const savingsScore = Math.min(savingsRate / 0.2 * 40, 40);
    const needsScore = needsRate <= 0.5 ? 30 : Math.max(30 - (needsRate - 0.5) * 100, 0);
    const wantsScore = wantsRate <= 0.3 ? 20 : Math.max(20 - (wantsRate - 0.3) * 100, 0);

    const totalAssets = assetItems.reduce((acc, i) => acc + (i.amount || 0), 0);
    const assetsScore = totalExpense > 0 ? Math.min((totalAssets / totalExpense) / 3 * 5, 5) : 0;

    const coveredTypes = new Set(insuranceItems.map(i => i.type));
    const essentialTypes = ['Life', 'Health', 'Auto', 'Home'];
    const insuranceScore = essentialTypes.filter(t => coveredTypes.has(t)).length * 1.25;

    const score = Math.round(savingsScore + needsScore + wantsScore + assetsScore + insuranceScore);

    return { score, savingsScore, needsScore, wantsScore, assetsScore, insuranceScore, savingsRate, needsRate, wantsRate };
};

/**
 * Calculates a financial resilience score (0-100) based on budgeting best practices.
 */
export const calculateResilienceScore = (
    incomeItems: FinanceItem[],
    expenseItems: FinanceItem[],
    assetItems: { amount?: number }[],
    insuranceItems: { type: string }[] = []
): number => getResilienceBreakdown(incomeItems, expenseItems, assetItems, insuranceItems).score;
