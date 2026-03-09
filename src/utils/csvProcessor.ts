import { FinanceItem, Frequency } from '../store/useFinanceStore';

/**
 * Utility for processing CSV data for FinnaFlow.
 * Supports exporting current state to CSV and importing from CSV.
 */

const CSV_HEADER = 'Type,Name,Amount,Frequency,Category';

export const exportToCSV = (income: FinanceItem[], expenses: FinanceItem[]): string => {
    const lines = [CSV_HEADER];

    income.forEach(item => {
        lines.push(`Income,"${item.name.replace(/"/g, '""')}",${item.amount},${item.frequency},"${item.category.replace(/"/g, '""')}"`);
    });

    expenses.forEach(item => {
        lines.push(`Expense,"${item.name.replace(/"/g, '""')}",${item.amount},${item.frequency},"${item.category.replace(/"/g, '""')}"`);
    });

    return lines.join('\n');
};

export const parseCSV = (csvText: string): { income: FinanceItem[], expenses: FinanceItem[] } => {
    const lines = csvText.split(/\r?\n/);
    const income: FinanceItem[] = [];
    const expenses: FinanceItem[] = [];

    // Skip header
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Simple CSV parser for quoted strings
        const parts = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
        if (!parts || parts.length < 5) continue;

        const type = parts[0].trim();
        const name = parts[1].replace(/^"|"$/g, '').replace(/""/g, '"').trim();
        const amount = parseFloat(parts[2]);
        const frequency = parts[3].trim() as Frequency;
        const category = parts[4].replace(/^"|"$/g, '').replace(/""/g, '"').trim();

        const item: FinanceItem = {
            id: crypto.randomUUID(),
            name,
            amount,
            frequency,
            category
        };

        if (type.toLowerCase() === 'income') {
            income.push(item);
        } else {
            expenses.push(item);
        }
    }

    return { income, expenses };
};
