import { describe, it, expect } from 'vitest';
import { exportToCSV } from '../src/utils/csvProcessor';
import { FinanceItem, NetWorthItem } from '../src/store/useFinanceStore';

describe('exportToCSV', () => {
    const CSV_HEADER = 'Type,Name,Amount,Frequency,Category';

    it('should return just the header if all inputs are empty', () => {
        const result = exportToCSV([], [], [], []);
        expect(result).toBe(CSV_HEADER);
    });

    it('should properly format typical income, expense, asset, and liability records', () => {
        const income: FinanceItem[] = [
            { id: '1', name: 'Salary', amount: 5000, frequency: 'Monthly', category: 'Job' }
        ];
        const expenses: FinanceItem[] = [
            { id: '2', name: 'Rent', amount: 1500, frequency: 'Monthly', category: 'Housing' }
        ];
        const assets: NetWorthItem[] = [
            { id: '3', name: 'Savings Account', amount: 10000, category: 'Cash' }
        ];
        const liabilities: NetWorthItem[] = [
            { id: '4', name: 'Car Loan', amount: 5000, category: 'Debt' }
        ];

        const result = exportToCSV(income, expenses, assets, liabilities);
        const lines = result.split('\n');

        expect(lines[0]).toBe(CSV_HEADER);
        expect(lines[1]).toBe('Income,"Salary",5000,Monthly,"Job"');
        expect(lines[2]).toBe('Expense,"Rent",1500,Monthly,"Housing"');
        expect(lines[3]).toBe('Asset,"Savings Account",10000,None,"Cash"');
        expect(lines[4]).toBe('Liability,"Car Loan",5000,None,"Debt"');
        expect(lines.length).toBe(5);
    });

    it('should correctly escape double quotes in names and categories', () => {
        const income: FinanceItem[] = [
            { id: '1', name: 'Bonus "Year End"', amount: 1000, frequency: 'Yearly', category: 'Extra "Income"' }
        ];

        const result = exportToCSV(income, [], [], []);
        const lines = result.split('\n');

        expect(lines[1]).toBe('Income,"Bonus ""Year End""",1000,Yearly,"Extra ""Income"""');
    });

    it('should handle names and categories with commas inside the quoted output', () => {
        // Commas within strings shouldn't break CSV because the export wraps names and categories in quotes
        const expenses: FinanceItem[] = [
            { id: '2', name: 'Groceries, Food, Drinks', amount: 200, frequency: 'Weekly', category: 'Food & Dining, Supplies' }
        ];

        const result = exportToCSV([], expenses, [], []);
        const lines = result.split('\n');

        expect(lines[1]).toBe('Expense,"Groceries, Food, Drinks",200,Weekly,"Food & Dining, Supplies"');
    });
});
