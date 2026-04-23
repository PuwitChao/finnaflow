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

/**
 * Splits a single CSV line into fields, correctly handling quoted fields that
 * may contain commas or escaped double-quotes ("").
 *
 * Replaces the old regex-based approach which silently broke on commas inside
 * quoted strings (e.g. "Smith, John" would be split at the comma).
 */
const splitCSVLine = (line: string): string[] => {
    const fields: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (inQuotes) {
            if (ch === '"') {
                // Peek ahead: "" is an escaped quote inside a field
                if (i + 1 < line.length && line[i + 1] === '"') {
                    current += '"';
                    i++; // skip the second quote
                } else {
                    inQuotes = false; // closing quote
                }
            } else {
                current += ch;
            }
        } else {
            if (ch === '"') {
                inQuotes = true;
            } else if (ch === ',') {
                fields.push(current);
                current = '';
            } else {
                current += ch;
            }
        }
    }
    fields.push(current); // push final field
    return fields;
};

export const parseCSV = (csvText: string): { income: FinanceItem[], expenses: FinanceItem[], assets: NetWorthItem[], liabilities: NetWorthItem[] } => {
    const lines = csvText.split(/\r?\n/);
    const income: FinanceItem[] = [];
    const expenses: FinanceItem[] = [];
    const assets: NetWorthItem[] = [];
    const liabilities: NetWorthItem[] = [];

    // Skip header row
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const parts = splitCSVLine(line);
        if (parts.length < 5) continue;

        const type = parts[0].trim().toLowerCase();
        const name = parts[1].trim();
        const amount = parseFloat(parts[2]);
        const frequency = parts[3].trim() as Frequency;
        const category = parts[4].trim();

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
