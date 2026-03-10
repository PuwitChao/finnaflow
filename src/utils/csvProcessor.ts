import { FinanceItem, Frequency, NetWorthItem } from '../store/useFinanceStore';

/**
 * Utility for processing CSV data for FinnaFlow.
 * Supports exporting current state to CSV and importing from CSV.
 */

const CSV_HEADER = 'Type,Name,Amount,Frequency,Category';

export const exportToCSV = (income: FinanceItem[], expenses: FinanceItem[], assets: NetWorthItem[], liabilities: NetWorthItem[]): string => {
    const lines = [CSV_HEADER];

    income.forEach(item => {
        lines.push(`Income,"${item.name.replace(/"/g, '""')}",${item.amount},${item.frequency},"${item.category.replace(/"/g, '""')}"`);
    });

    expenses.forEach(item => {
        lines.push(`Expense,"${item.name.replace(/"/g, '""')}",${item.amount},${item.frequency},"${item.category.replace(/"/g, '""')}"`);
    });

    assets.forEach(item => {
        lines.push(`Asset,"${item.name.replace(/"/g, '""')}",${item.amount},None,"${item.category.replace(/"/g, '""')}"`);
    });

    liabilities.forEach(item => {
        lines.push(`Liability,"${item.name.replace(/"/g, '""')}",${item.amount},None,"${item.category.replace(/"/g, '""')}"`);
    });

    return lines.join('\n');
};

export const parseCSV = (csvText: string): { income: FinanceItem[], expenses: FinanceItem[], assets: NetWorthItem[], liabilities: NetWorthItem[] } => {
    const lines = csvText.split(/\r?\n/);
    const income: FinanceItem[] = [];
    const expenses: FinanceItem[] = [];
    const assets: NetWorthItem[] = [];
    const liabilities: NetWorthItem[] = [];

    // Skip header
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Simple CSV parser for quoted strings
        const parts = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
        if (!parts || parts.length < 5) continue;

        const type = parts[0].trim().toLowerCase();
        const name = parts[1].replace(/^"|"$/g, '').replace(/""/g, '"').trim();
        const amount = parseFloat(parts[2]);
        const frequency = parts[3].trim() as Frequency;
        const category = parts[4].replace(/^"|"$/g, '').replace(/""/g, '"').trim();

        if (type === 'income') {
            income.push({ id: crypto.randomUUID(), name, amount, frequency, category });
        } else if (type === 'expense') {
            expenses.push({ id: crypto.randomUUID(), name, amount, frequency, category });
        } else if (type === 'asset') {
            assets.push({ id: crypto.randomUUID(), name, amount, category });
        } else if (type === 'liability') {
            liabilities.push({ id: crypto.randomUUID(), name, amount, category });
        }
    }

    return { income, expenses, assets, liabilities };
};
