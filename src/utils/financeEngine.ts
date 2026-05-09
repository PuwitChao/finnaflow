import { FinanceItem, Frequency } from '../store/useFinanceStore';
import { WEEKS_PER_MONTH } from '../constants/version';
import { CATEGORY_COLORS, NODE_COLORS, CHART_ALPHA, CHART_ALPHA_EXPENSE } from '../constants/theme';


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
 * Calculates the projected monthly income for an item, applying market shock multipliers
 * if the item is flagged as an investment.
 */
export const getProjectedIncome = (item: FinanceItem, marketShock: number = 0) => {
    const base = normalizeToMonthly(item.amount, item.frequency);
    const mktFactor = 1 - (marketShock / 100);
    const investmentCategories = ['Investments', 'Dividends', 'Interest', 'Capital Gains'];
    
    // Use flag if explicitly set, otherwise fallback to heuristics
    const isInvestment = item.isInvestment !== undefined 
        ? item.isInvestment 
        : (investmentCategories.includes(item.category) || /invest|dividend|interest|yield/i.test(item.name));
    
    return isInvestment ? base * mktFactor : base;
};

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

    const totalMonthlyIncome = activeIncome.reduce((acc, item) => acc + getProjectedIncome(item, macro.marketShock), 0);

    const getProjectedAmount = (item: FinanceItem) => {
        const base = normalizeToMonthly(item.amount, item.frequency);

        const multiplier = multipliers[item.category] ?? 1;
        return base * multiplier * infFactor;
    };

    let totalMonthlyExpense = 0;
    const projectedExpenseAmounts: number[] = new Array(activeExpenses.length);
    const catTotals: Record<string, number> = {};
    const categoryIndices: Record<string, number> = {};
    const categories: string[] = [];

    const toRgba = (hex: string, alpha: number) => {
        try {
            const cleanHex = hex.startsWith('#') ? hex : '#808080';
            const r = parseInt(cleanHex.slice(1, 3), 16);
            const g = parseInt(cleanHex.slice(3, 5), 16);
            const b = parseInt(cleanHex.slice(5, 7), 16);
            if (isNaN(r) || isNaN(g) || isNaN(b)) return `rgba(128, 128, 128, ${alpha})`;
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        } catch {
            return `rgba(128, 128, 128, ${alpha})`;
        }
    };

    for (let i = 0; i < activeExpenses.length; i++) {
        const item = activeExpenses[i];
        const amount = getProjectedAmount(item);
        projectedExpenseAmounts[i] = amount;
        totalMonthlyExpense += amount;

        const cat = item.category;
        if (catTotals[cat] === undefined) {
            catTotals[cat] = 0;
            categoryIndices[cat] = categories.length;
            categories.push(cat);
        }
        catTotals[cat] += amount;
    }

    const nodes = [
        t('chart.nodes.debtSource'),
        t('chart.nodes.wallet'),
        t('chart.nodes.unallocated'),
    ];

    const nodeColors = [
        NODE_COLORS.DEBT,
        NODE_COLORS.WALLET,
        NODE_COLORS.UNALLOCATED,
    ];


    const nodeMetadata: SankeyData['nodeMetadata'] = [
        { type: 'debt' },
        { type: 'wallet' },
        { type: 'unallocated' }
    ];
    const categoryNodeOffset = nodes.length;

    categories.forEach(cat => {
        const translatedCat = t(`category.${cat}`);
        nodes.push(translatedCat === `category.${cat}` ? cat : translatedCat);
        nodeColors.push(CATEGORY_COLORS[cat] || CATEGORY_COLORS.Other);
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
        nodeColors.push(CATEGORY_COLORS[item.category] || CATEGORY_COLORS.Other);
        nodeMetadata.push({ type: 'expense', id: item.id, name: item.name, category: item.category });
    });


    const links: SankeyData['links'] = [];

    activeIncome.forEach((item, index) => {
        links.push({
            source: incomeNodeOffset + index,
            target: 1,
            value: getProjectedIncome(item, macro.marketShock),
            label: item.name,
            color: `rgba(16, 185, 129, ${CHART_ALPHA})`
        });
    });



    if (totalMonthlyExpense > totalMonthlyIncome) {
        links.push({
            source: 0,
            target: 1,
            value: totalMonthlyExpense - totalMonthlyIncome,
            label: t('chart.links.debt'),
            color: `rgba(239, 68, 68, ${CHART_ALPHA * 2})`
        });
    }


    categories.forEach((cat, index) => {
        const catTotal = catTotals[cat];
        const baseColor = CATEGORY_COLORS[cat] || CATEGORY_COLORS.Other;
        


        if (catTotal > 0) {
            links.push({
                source: 1,
                target: categoryNodeOffset + index,
                value: catTotal,
                label: `${t('chart.nodes.poolPrefix')}${t(`category.${cat}`) || cat}${t('chart.nodes.poolSuffix')}`,
                color: toRgba(baseColor, CHART_ALPHA)
            });
        }
    });


    if (totalMonthlyIncome > totalMonthlyExpense) {
        links.push({
            source: 1,
            target: 2,
            value: totalMonthlyIncome - totalMonthlyExpense,
            label: t('chart.links.surplus'),
            color: `rgba(5, 150, 105, ${CHART_ALPHA * 2})`
        });
    }


    activeExpenses.forEach((item, index) => {
        const catIndex = categoryIndices[item.category];
        const itemAmount = projectedExpenseAmounts[index];
        const percentage = totalMonthlyIncome > 0 ? (itemAmount / totalMonthlyIncome * 100).toFixed(1) : '0';

        const baseColor = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.Other;
        


        links.push({
            source: categoryNodeOffset + catIndex,
            target: expenseNodeOffset + index,
            value: itemAmount,
            label: isPrivacyMode ? item.name : `${item.name} (${percentage}%)`,
            color: toRgba(baseColor, CHART_ALPHA_EXPENSE)
        });
    });


    return { nodes, links, nodeColors, nodeMetadata };
};

/**
 * Calculates a financial resilience score (0–100) and returns a full breakdown
 * of each component so the UI can explain the score to the user.
 */
export const getResilienceBreakdown = (
    incomeItems: FinanceItem[],
    expenseItems: FinanceItem[],
    assetItems: { amount?: number }[],
    insuranceItems: { type: string }[] = []
) => {
    const totalIncome = incomeItems.reduce((acc, i) => acc + normalizeToMonthly(i.amount, i.frequency), 0);
    const totalExpense = expenseItems.reduce((acc, i) => acc + normalizeToMonthly(i.amount, i.frequency), 0);

    if (totalIncome === 0) {
        return { score: 0, savingsScore: 0, needsScore: 0, wantsScore: 0, assetsScore: 0, insuranceScore: 0, savingsRate: 0, needsRate: 0, wantsRate: 0 };
    }

    let needs = 0;
    let wants = 0;
    let savings = 0;

    for (const item of expenseItems) {
        const monthlyAmount = normalizeToMonthly(item.amount, item.frequency);
        if (item.category === 'Needs') {
            needs += monthlyAmount;
        } else if (item.category === 'Wants') {
            wants += monthlyAmount;
        } else if (item.category === 'Savings' || item.category === 'Investments') {
            savings += monthlyAmount;
        }
    }

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
