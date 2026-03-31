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
    description?: string;
    startDate?: string;
    endDate?: string;
}

export interface NetWorthItem {
    id: string;
    name: string;
    amount: number;
    category: string;
    description?: string;
}

export interface InsuranceItem {
    id: string;
    name: string;
    type: 'Life' | 'Health' | 'Auto' | 'Home' | 'Other';
    premium: number;
    coverage: number;
    frequency: Frequency;
}

interface FinanceState {
    incomeItems: FinanceItem[];
    expenseItems: FinanceItem[];
    assetItems: NetWorthItem[];
    liabilityItems: NetWorthItem[];
    insuranceItems: InsuranceItem[];
    isUnlocked: boolean;
    darkMode: boolean;
    isProjectionMode: boolean;
    isPrivacyMode: boolean;
    currency: string;
    categoryMultipliers: Record<string, number>;
    macroConfig: { inflation: number; marketShock: number };
    hasSetPreferences: boolean;
    lastUpdated: string | null;
    togglePrivacyMode: () => void;
    setPreferencesSet: (val: boolean) => void;
    duplicateItem: (id: string, type: 'income' | 'expense' | 'asset' | 'liability' | 'insurance') => void;
    addIncome: (item: FinanceItem) => void;
    removeIncome: (id: string) => void;
    addExpense: (item: FinanceItem) => void;
    removeExpense: (id: string) => void;
    addAsset: (item: NetWorthItem) => void;
    removeAsset: (id: string) => void;
    addLiability: (item: NetWorthItem) => void;
    removeLiability: (id: string) => void;
    addInsurance: (item: InsuranceItem) => void;
    removeInsurance: (id: string) => void;
    updateItems: (ids: string[], type: 'income' | 'expense' | 'asset' | 'liability', updates: any) => void;
    removeItems: (ids: string[], type: 'income' | 'expense' | 'asset' | 'liability') => void;
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
    getTotalAssets: () => number;
    getTotalLiabilities: () => number;
    loadExampleTemplate: (items: { income: FinanceItem[], expenses: FinanceItem[], assets?: NetWorthItem[], liabilities?: NetWorthItem[], insurance?: InsuranceItem[] }) => void;
}

/**
 * Central state management hook for FinnaFlow.
 * Handles financial items, persistence via localStorage, and premium status.
 */
export const useFinanceStore = create<FinanceState>()(
    persist(
        (set, get) => ({
            incomeItems: [],
            expenseItems: [],
            assetItems: [],
            liabilityItems: [],
            insuranceItems: [],
            isUnlocked: true,
            darkMode: false,
            isProjectionMode: false,
            isPrivacyMode: false,
            currency: 'USD',
            categoryMultipliers: {},
            macroConfig: { inflation: 0, marketShock: 0 },
            hasSetPreferences: false,
            lastUpdated: null,
            notification: null,
            addIncome: (item: FinanceItem) => set((state: FinanceState) => ({
                incomeItems: [...state.incomeItems, item],
                lastUpdated: new Date().toISOString()
            })),
            removeIncome: (id: string) => set((state: FinanceState) => ({
                incomeItems: state.incomeItems.filter(i => i.id !== id),
                lastUpdated: new Date().toISOString()
            })),
            addExpense: (item: FinanceItem) => set((state: FinanceState) => ({
                expenseItems: [...state.expenseItems, item],
                lastUpdated: new Date().toISOString()
            })),
            removeExpense: (id: string) => set((state: FinanceState) => ({
                expenseItems: state.expenseItems.filter(i => i.id !== id),
                lastUpdated: new Date().toISOString()
            })),
            addAsset: (item: NetWorthItem) => set((state: FinanceState) => ({
                assetItems: [...state.assetItems, item],
                lastUpdated: new Date().toISOString()
            })),
            removeAsset: (id: string) => set((state: FinanceState) => ({
                assetItems: state.assetItems.filter(i => i.id !== id),
                lastUpdated: new Date().toISOString()
            })),
            addLiability: (item: NetWorthItem) => set((state: FinanceState) => ({
                liabilityItems: [...state.liabilityItems, item],
                lastUpdated: new Date().toISOString()
            })),
            removeLiability: (id: string) => set((state: FinanceState) => ({
                liabilityItems: state.liabilityItems.filter(i => i.id !== id),
                lastUpdated: new Date().toISOString()
            })),
            addInsurance: (item: InsuranceItem) => set((state: FinanceState) => ({
                insuranceItems: [...state.insuranceItems, item],
                lastUpdated: new Date().toISOString()
            })),
            removeInsurance: (id: string) => set((state: FinanceState) => ({
                insuranceItems: state.insuranceItems.filter(i => i.id !== id),
                lastUpdated: new Date().toISOString()
            })),
            updateItems: (ids: string[], type, updates) => set((state: FinanceState) => {
                const key = type === 'income' ? 'incomeItems' : 
                            type === 'expense' ? 'expenseItems' : 
                            type === 'asset' ? 'assetItems' : 'liabilityItems';
                return {
                    [key]: state[key].map((item: any) => ids.includes(item.id) ? { ...item, ...updates } : item),
                    lastUpdated: new Date().toISOString()
                };
            }),
            removeItems: (ids: string[], type) => set((state: FinanceState) => {
                const key = type === 'income' ? 'incomeItems' : 
                            type === 'expense' ? 'expenseItems' : 
                            type === 'asset' ? 'assetItems' : 'liabilityItems';
                return {
                    [key]: state[key].filter((item: any) => !ids.includes(item.id)),
                    lastUpdated: new Date().toISOString()
                };
            }),
            setUnlocked: (unlocked: boolean) => set({ isUnlocked: unlocked }),
            setCurrency: (currency: string) => set({ currency }),
            setPreferencesSet: (val: boolean) => set({ hasSetPreferences: val }),
            duplicateItem: (id: string, type: 'income' | 'expense' | 'asset' | 'liability' | 'insurance') => set((state: FinanceState) => {
                let items: any[] = [];
                if (type === 'income') items = state.incomeItems;
                else if (type === 'expense') items = state.expenseItems;
                else if (type === 'asset') items = state.assetItems;
                else if (type === 'liability') items = state.liabilityItems;
                else items = state.insuranceItems;

                const item = items.find(i => i.id === id);
                if (!item) return state;
                const newItem = { ...item, id: crypto.randomUUID(), name: `${item.name} (Copy)` };

                const update: any = { lastUpdated: new Date().toISOString() };
                if (type === 'income') update.incomeItems = [...state.incomeItems, newItem];
                else if (type === 'expense') update.expenseItems = [...state.expenseItems, newItem];
                else if (type === 'asset') update.assetItems = [...state.assetItems, newItem];
                else if (type === 'liability') update.liabilityItems = [...state.liabilityItems, newItem];
                else update.insuranceItems = [...state.insuranceItems, newItem];

                return update;
            }),
            toggleTheme: () => set((state: FinanceState) => ({ darkMode: !state.darkMode })),
            toggleProjectionMode: () => set((state: FinanceState) => ({ isProjectionMode: !state.isProjectionMode })),
            togglePrivacyMode: () => set((state: FinanceState) => ({ isPrivacyMode: !state.isPrivacyMode })),
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
            getTotalAssets: () => {
                return (get().assetItems || []).reduce((acc, item) => acc + item.amount, 0);
            },
            getTotalLiabilities: () => {
                return (get().liabilityItems || []).reduce((acc, item) => acc + item.amount, 0);
            },
            clearSession: () => set({
                incomeItems: [],
                expenseItems: [],
                assetItems: [],
                liabilityItems: [],
                insuranceItems: [],
                categoryMultipliers: {},
                isProjectionMode: false,
                isPrivacyMode: false,
                currency: 'USD',
                macroConfig: { inflation: 0, marketShock: 0 },
                notification: null,
            }),
            loadExampleTemplate: ({ income, expenses, assets, liabilities, insurance }: { income: FinanceItem[], expenses: FinanceItem[], assets?: NetWorthItem[], liabilities?: NetWorthItem[], insurance?: InsuranceItem[] }) => set({
                incomeItems: income,
                expenseItems: expenses,
                assetItems: assets || [],
                liabilityItems: liabilities || [],
                insuranceItems: insurance || [],
                isProjectionMode: false,
                isPrivacyMode: false,
                categoryMultipliers: {},
                macroConfig: { inflation: 0, marketShock: 0 },
                lastUpdated: new Date().toISOString()
            }),
        }),
        {
            name: 'finnaflow-storage',
        }
    )
);
