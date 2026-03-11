import { FinanceItem, Frequency } from '../store/useFinanceStore';

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
            return amount * 4.33; // Average weeks in a month
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
 * Implements sophisticated routing for surplus and deficit scenarios.
 * 
 * @param incomeItems - List of income sources from the store.
 * @param expenseItems - List of expense items from the store.
 * @param multipliers - Optional record of category-based multipliers.
 * @param macro - Optional macro config (inflation/marketShock).
 * @returns A structured SankeyData object for visualization.
 */
export const generateSankeyConfig = (
    incomeItems: FinanceItem[],
    expenseItems: FinanceItem[],
    multipliers: Record<string, number> = {},
    macro: { inflation: number; marketShock: number } = { inflation: 0, marketShock: 0 },
    t: (key: string) => string = (k) => k
): SankeyData => {
    // Inflation factor (e.g. 0.05 -> 1.05)
    const infFactor = 1 + (macro.inflation / 100);
    // Market factor (e.g. 20 -> 0.8)
    const mktFactor = 1 - (macro.marketShock / 100);

    const getProjectedIncome = (item: FinanceItem) => {
        const base = normalizeToMonthly(item.amount, item.frequency);
        const isInvestment = item.category === 'Investments' || item.category === 'Dividends' || item.name.toLowerCase().includes('investment');
        return isInvestment ? base * mktFactor : base;
    };

    const totalMonthlyIncome = incomeItems.reduce((acc, item) => acc + getProjectedIncome(item), 0);

    // Internal helper to get projected amount
    const getProjectedAmount = (item: FinanceItem) => {
        const base = normalizeToMonthly(item.amount, item.frequency);
        const multiplier = multipliers[item.category] ?? 1;
        // Apply inflation to expenses
        return base * multiplier * infFactor;
    };

    const totalMonthlyExpense = expenseItems.reduce((acc, item) => acc + getProjectedAmount(item), 0);

    // 1. Initial Static Nodes
    const nodes = [
        t('chart.nodes.debtSource'), // 0: Red
        t('chart.nodes.wallet'),     // 1: Slate
        t('chart.nodes.unallocated'),  // 2: Emerald
    ];

    const nodeColors = [
        '#ef4444', // 0: Debt Source
        '#64748b', // 1: Total Wallet
        '#059669', // 2: Unallocated
    ];

    const nodeMetadata: SankeyData['nodeMetadata'] = [
        { type: 'debt' },
        { type: 'wallet' },
        { type: 'unallocated' }
    ];

    // 2. Identify Unique Categories
    const categories = Array.from(new Set(expenseItems.map(i => i.category)));
    const categoryNodeOffset = nodes.length;

    const catColorMap: Record<string, string> = {
        'Needs': '#007AFF',     // System Blue
        'Wants': '#FF3B30',     // System Red
        'Savings': '#34C759',   // System Green
        'Investments': '#AF52DE', // System Purple
        'Debt': '#8E8E93',      // System Gray
    };

    categories.forEach(cat => {
        // Translate standard categories, keep custom as is
        const translatedCat = t(`category.${cat}`);
        nodes.push(translatedCat === `category.${cat}` ? cat : translatedCat);
        nodeColors.push(catColorMap[cat] || '#94a3b8'); // Custom categories get Gray if not mapped
        nodeMetadata.push({ type: 'category', category: cat });
    });

    // 3. Income Nodes
    const incomeNodeOffset = nodes.length;
    incomeItems.forEach(item => {
        nodes.push(item.name);
        nodeColors.push('#10b981'); // Green for income sources
        nodeMetadata.push({ type: 'income', id: item.id, name: item.name });
    });

    // 4. Expense Item Nodes
    const expenseNodeOffset = nodes.length;
    expenseItems.forEach(item => {
        nodes.push(item.name);
        nodeColors.push(catColorMap[item.category] || '#94a3b8');
        nodeMetadata.push({ type: 'expense', id: item.id, name: item.name, category: item.category });
    });

    const links: SankeyData['links'] = [];

    // Stage: Income -> Wallet
    incomeItems.forEach((item, index) => {
        links.push({
            source: incomeNodeOffset + index,
            target: 1,
            value: getProjectedIncome(item),
            label: item.name,
            color: 'rgba(16, 185, 129, 0.2)'
        });
    });

    // Handle Deficit
    if (totalMonthlyExpense > totalMonthlyIncome) {
        links.push({
            source: 0,
            target: 1,
            value: totalMonthlyExpense - totalMonthlyIncome,
            label: t('chart.links.debt'),
            color: 'rgba(239, 68, 68, 0.4)'
        });
    }

    // Stage: Wallet -> Categories (Pools)
    categories.forEach((cat, index) => {
        const catTotal = expenseItems
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

    // Handle Surplus -> Unallocated
    if (totalMonthlyIncome > totalMonthlyExpense) {
        links.push({
            source: 1,
            target: 2,
            value: totalMonthlyIncome - totalMonthlyExpense,
            label: t('chart.links.surplus'),
            color: 'rgba(5, 150, 105, 0.4)'
        });
    }

    // Stage: Categories -> Items
    expenseItems.forEach((item, index) => {
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
            label: `${item.name} (${percentage}%)`,
            color: rgbaColor
        });
    });

    return { nodes, links, nodeColors, nodeMetadata };
};
