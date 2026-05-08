import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { parseCSV } from './csvProcessor';

describe('parseCSV', () => {
    beforeEach(() => {
        // Mock crypto.randomUUID
        let counter = 0;
        vi.stubGlobal('crypto', {
            randomUUID: () => `mock-uuid-${++counter}`,
        });
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('should parse standard unquoted input', () => {
        const csv = `Type,Name,Amount,Frequency,Category
Income,Salary,5000,Monthly,Job
Expense,Rent,1500,Monthly,Housing
Asset,House,300000,None,Property
Liability,Mortgage,200000,None,Debt`;

        const result = parseCSV(csv);

        expect(result.income).toHaveLength(1);
        expect(result.income[0]).toEqual({
            id: 'mock-uuid-1',
            name: 'Salary',
            amount: 5000,
            frequency: 'Monthly',
            category: 'Job'
        });

        expect(result.expenses).toHaveLength(1);
        expect(result.expenses[0]).toEqual({
            id: 'mock-uuid-2',
            name: 'Rent',
            amount: 1500,
            frequency: 'Monthly',
            category: 'Housing'
        });

        expect(result.assets).toHaveLength(1);
        expect(result.assets[0]).toEqual({
            id: 'mock-uuid-3',
            name: 'House',
            amount: 300000,
            category: 'Property'
        });

        expect(result.liabilities).toHaveLength(1);
        expect(result.liabilities[0]).toEqual({
            id: 'mock-uuid-4',
            name: 'Mortgage',
            amount: 200000,
            category: 'Debt'
        });
    });

    it('should parse quoted fields correctly', () => {
        const csv = `Type,Name,Amount,Frequency,Category
Expense,"Groceries",300,Weekly,"Food"`;

        const result = parseCSV(csv);

        expect(result.expenses).toHaveLength(1);
        expect(result.expenses[0].name).toBe('Groceries');
        expect(result.expenses[0].category).toBe('Food');
    });

    it('should correctly handle commas inside quoted strings', () => {
        const csv = `Type,Name,Amount,Frequency,Category
Expense,"Groceries, Weekly",300,Weekly,"Food, Supermarket"`;

        const result = parseCSV(csv);

        expect(result.expenses).toHaveLength(1);
        expect(result.expenses[0].name).toBe('Groceries, Weekly');
        expect(result.expenses[0].category).toBe('Food, Supermarket');
        expect(result.expenses[0].amount).toBe(300);
    });

    it('should correctly handle escaped quotes inside quoted strings', () => {
        const csv = `Type,Name,Amount,Frequency,Category
Expense,"Alice ""The Chef""'s Dinner",50,Monthly,"Food"`;

        const result = parseCSV(csv);

        expect(result.expenses).toHaveLength(1);
        expect(result.expenses[0].name).toBe('Alice "The Chef"\'s Dinner');
    });

    it('should ignore empty lines and invalid rows', () => {
        const csv = `Type,Name,Amount,Frequency,Category

Expense,Food,100,Weekly,Groceries

InvalidRow
Asset,Car,20000`; // Missing category for Asset (length < 5)

        const result = parseCSV(csv);

        expect(result.expenses).toHaveLength(1);
        expect(result.assets).toHaveLength(0); // Asset was ignored because parts.length < 5
    });

    it('should handle Windows style line endings (CRLF)', () => {
        const csv = 'Type,Name,Amount,Frequency,Category\r\nIncome,Salary,5000,Monthly,Job\r\nExpense,Rent,1500,Monthly,Housing';
        const result = parseCSV(csv);

        expect(result.income).toHaveLength(1);
        expect(result.expenses).toHaveLength(1);
    });
});