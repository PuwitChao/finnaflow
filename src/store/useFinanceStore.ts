import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Frequency = 'Weekly' | 'Monthly' | 'Yearly';
export type Category = string;

export interface FinanceItem {
    id: string;
    name: string;
    amount: number;
    frequency: Frequency;
    category: Category;
}

interface FinanceState {
    incomeItems: FinanceItem[];
    expenseItems: FinanceItem[];
    isUnlocked: boolean;
    darkMode: boolean;
    isProjectionMode: boolean;
    currency: string;
    categoryMultipliers: Record<string, number>;
    macroConfig: { inflation: number; marketShock: number };
    hasSetPreferences: boolean;
    setPreferencesSet: (set: boolean) => void;
    addIncome: (item: FinanceItem) => void;
    removeIncome: (id: string) => void;
    addExpense: (item: FinanceItem) => void;
    removeExpense: (id: string) => void;
    setUnlocked: (unlocked: boolean) => void;
    setCurrency: (currency: string) => void;
    toggleTheme: () => void;
    toggleProjectionMode: () => void;
    setCategoryMultiplier: (category: string, value: number) => void;
    setMacroConfig: (config: Partial<FinanceState['macroConfig']>) => void;
    applyPreset: (inflation: number, marketShock: number) => void;
    notification: { message: string, type: 'info' | 'success' | 'error' } | null;
    showNotification: (message: string, type?: 'info' | 'success' | 'error') => void;
    clearSession: () => void;
    loadExampleTemplate: (items: { income: FinanceItem[], expenses: FinanceItem[] }) => void;
}

/**
 * Central state management hook for FinnaFlow.
 * Handles financial items, persistence via localStorage, and premium status.
 */
export const useFinanceStore = create<FinanceState>()(
    persist(
        (set) => ({
            incomeItems: [],
            expenseItems: [],
            isUnlocked: true,
            darkMode: false,
            isProjectionMode: false,
            currency: 'USD',
            categoryMultipliers: {},
            macroConfig: { inflation: 0, marketShock: 0 },
            hasSetPreferences: false,
            notification: null,
            addIncome: (item: FinanceItem) => set((state: FinanceState) => ({
                incomeItems: [...state.incomeItems, item],
            })),
            removeIncome: (id: string) => set((state: FinanceState) => ({ incomeItems: state.incomeItems.filter(i => i.id !== id) })),
            addExpense: (item: FinanceItem) => set((state: FinanceState) => ({
                expenseItems: [...state.expenseItems, item],
            })),
            removeExpense: (id: string) => set((state: FinanceState) => ({ expenseItems: state.expenseItems.filter(i => i.id !== id) })),
            setUnlocked: (unlocked: boolean) => set({ isUnlocked: unlocked }),
            setCurrency: (currency: string) => set({ currency }),
            setPreferencesSet: (val: boolean) => set({ hasSetPreferences: val }),
            toggleTheme: () => set((state: FinanceState) => ({ darkMode: !state.darkMode })),
            toggleProjectionMode: () => set((state: FinanceState) => ({ isProjectionMode: !state.isProjectionMode })),
            setCategoryMultiplier: (category: string, value: number) =>
                set((state: FinanceState) => ({
                    categoryMultipliers: { ...state.categoryMultipliers, [category]: value }
                })),
            setMacroConfig: (config) => set((state: FinanceState) => ({
                macroConfig: { ...state.macroConfig, ...config }
            })),
            applyPreset: (inflation, marketShock) => set({
                macroConfig: { inflation, marketShock },
                isProjectionMode: true
            }),
            showNotification: (message: string, type: 'info' | 'success' | 'error' = 'info') => {
                set({ notification: { message, type } });
                setTimeout(() => set({ notification: null }), 3000);
            },
            clearSession: () => set({
                incomeItems: [],
                expenseItems: [],
                categoryMultipliers: {},
                isProjectionMode: false,
                currency: 'USD',
                macroConfig: { inflation: 0, marketShock: 0 },
                notification: null,
            }),
            loadExampleTemplate: ({ income, expenses }) => set({
                incomeItems: income,
                expenseItems: expenses,
                isProjectionMode: false,
                currency: 'THB',
                categoryMultipliers: {},
                macroConfig: { inflation: 0, marketShock: 0 },
            }),
        }),
        {
            name: 'finnaflow-storage',
        }
    )
);
