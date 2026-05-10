import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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
    isInvestment?: boolean;
}


export interface NetWorthItem {
    id: string;
    name: string;
    amount: number;
    category: string;
    description?: string;
    isInvestment?: boolean;
}


export interface InsuranceItem {
    id: string;
    name: string;
    type: 'Life' | 'Health' | 'Auto' | 'Home' | 'Other';
    premium: number;
    coverage: number;
    frequency: Frequency;
}

/** A named snapshot of FIRE tracker inputs saved by the user. */
export interface FireScenario {
    id: string;
    name: string;
    roi: number;
    swr: number;
    fireNumber: number;
    savedAt: string;
}

export type ModalType = 'batchPaste' | 'wiki' | 'guide' | 'csvMapper' | 'fireTracker' | 'onboarding' | 'lang' | 'currency' | 'template';

export type UpdatableFinanceItem = Partial<Omit<FinanceItem, 'id'>>;
export type UpdatableNetWorthItem = Partial<Omit<NetWorthItem, 'id'>>;
export type UpdatableInsuranceItem = Partial<Omit<InsuranceItem, 'id'>>;

interface FinanceState {
    incomeItems: FinanceItem[];
    expenseItems: FinanceItem[];
    assetItems: NetWorthItem[];
    liabilityItems: NetWorthItem[];
    insuranceItems: InsuranceItem[];
    fireScenarios: FireScenario[];
    activeModal: ModalType | null;
    csvDataToMap: { headers: string[], rows: string[][] } | null;
    isUnlocked: boolean;
    darkMode: boolean;
    isProjectionMode: boolean;
    isPrivacyMode: boolean;
    currency: string;
    categoryMultipliers: Record<string, number>;
    macroConfig: { inflation: number; marketShock: number };
    history: { date: string, netWorth: number }[];
    hasSetPreferences: boolean;
    lastUpdated: string | null;
    _notificationTimeout: ReturnType<typeof setTimeout> | null;
    _snapshotTimeout: ReturnType<typeof setTimeout> | null;
    openModal: (type: ModalType) => void;

    closeModal: () => void;
    setCSVDataToMap: (data: { headers: string[], rows: string[][] } | null) => void;
    captureSnapshot: () => void;
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
    updateItems: (ids: string[], type: 'income' | 'expense' | 'asset' | 'liability', updates: UpdatableFinanceItem | UpdatableNetWorthItem) => void;
    removeItems: (ids: string[], type: 'income' | 'expense' | 'asset' | 'liability') => void;
    setUnlocked: (unlocked: boolean) => void;
    setCurrency: (currency: string) => void;
    toggleTheme: () => void;
    toggleProjectionMode: () => void;
    setCategoryMultiplier: (category: string, value: number) => void;
    setMacroConfig: (config: Partial<FinanceState['macroConfig']>) => void;
    applyPreset: (inflation: number, marketShock: number) => void;
    saveFireScenario: (scenario: Omit<FireScenario, 'id' | 'savedAt'>) => void;
    removeFireScenario: (id: string) => void;
    notification: { message: string, type: 'info' | 'success' | 'error' } | null;
    showNotification: (message: string, type?: 'info' | 'success' | 'error') => void;
    clearSession: () => void;
    getTotalAssets: () => number;
    getTotalLiabilities: () => number;
    loadBulkData: (data: { 
        income?: FinanceItem[], 
        expenses?: FinanceItem[], 
        assets?: NetWorthItem[], 
        liabilities?: NetWorthItem[], 
        insurance?: InsuranceItem[] 
    }, merge?: boolean) => void;
    loadExampleTemplate: (items: { income: FinanceItem[], expenses: FinanceItem[], assets?: NetWorthItem[], liabilities?: NetWorthItem[], insurance?: InsuranceItem[] }) => void;
}


const safeStorage = createJSONStorage(() => ({
    getItem: (name: string): string | null => {
        try { return localStorage.getItem(name); } catch { return null; }
    },
    setItem: (name: string, value: string): void => {
        try { localStorage.setItem(name, value); } catch (e) {
            console.warn('FinnaFlow: Unable to persist data (storage quota may be exceeded).', e);
        }
    },
    removeItem: (name: string): void => {
        try { localStorage.removeItem(name); } catch { /* ignore */ }
    }
}));

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
            fireScenarios: [],
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
            _notificationTimeout: null,
            _snapshotTimeout: null,
            activeModal: null,
            csvDataToMap: null,
            history: [],
            openModal: (type: ModalType) => set({ activeModal: type }),
            closeModal: () => set({ activeModal: null }),
            setCSVDataToMap: (data) => set({ csvDataToMap: data }),
            captureSnapshot: () => {
                const existingTimeout = get()._snapshotTimeout;
                if (existingTimeout) clearTimeout(existingTimeout);

                const timeoutId = setTimeout(() => {
                    set((state: FinanceState) => {
                        const totalAssets = state.assetItems.reduce((acc, i) => acc + i.amount, 0);
                        const totalLiabilities = state.liabilityItems.reduce((acc, i) => acc + i.amount, 0);
                        const netWorth = totalAssets - totalLiabilities;
                        const today = new Date().toISOString().split('T')[0];
                        
                        // Prevent duplicates for the same day
                        const filteredHistory = state.history.filter(h => h.date !== today);
                        const newHistory = [...filteredHistory, { date: today, netWorth }];
                        
                        return { history: newHistory.slice(-365), _snapshotTimeout: null };
                    });
                }, 1000); // 1 second debounce

                set({ _snapshotTimeout: timeoutId });
            },


            addIncome: (item: FinanceItem) => set((state: FinanceState) => {
                const newState = {
                    incomeItems: [...state.incomeItems, item],
                    lastUpdated: new Date().toISOString()
                };
                return newState;
            }),
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
            addAsset: (item: NetWorthItem) => {
                set((state: FinanceState) => ({
                    assetItems: [...state.assetItems, item],
                    lastUpdated: new Date().toISOString()
                }));
                get().captureSnapshot();
            },
            removeAsset: (id: string) => {
                set((state: FinanceState) => ({
                    assetItems: state.assetItems.filter(i => i.id !== id),
                    lastUpdated: new Date().toISOString()
                }));
                get().captureSnapshot();
            },
            addLiability: (item: NetWorthItem) => {
                set((state: FinanceState) => ({
                    liabilityItems: [...state.liabilityItems, item],
                    lastUpdated: new Date().toISOString()
                }));
                get().captureSnapshot();
            },
            removeLiability: (id: string) => {
                set((state: FinanceState) => ({
                    liabilityItems: state.liabilityItems.filter(i => i.id !== id),
                    lastUpdated: new Date().toISOString()
                }));
                get().captureSnapshot();
            },
            addInsurance: (item: InsuranceItem) => set((state: FinanceState) => ({
                insuranceItems: [...state.insuranceItems, item],
                lastUpdated: new Date().toISOString()
            })),
            removeInsurance: (id: string) => set((state: FinanceState) => ({
                insuranceItems: state.insuranceItems.filter(i => i.id !== id),
                lastUpdated: new Date().toISOString()
            })),
            updateItems: (ids: string[], type, updates) => {
                set((state: FinanceState) => {
                    const key = type === 'income' ? 'incomeItems' :
                                type === 'expense' ? 'expenseItems' :
                                type === 'asset' ? 'assetItems' : 'liabilityItems';
                    return {
                        [key]: (state[key] as Array<FinanceItem | NetWorthItem>).map((item) => ids.includes(item.id) ? { ...item, ...updates } : item),
                        lastUpdated: new Date().toISOString()
                    };
                });
                if (type === 'asset' || type === 'liability') get().captureSnapshot();
            },
            removeItems: (ids: string[], type) => {
                set((state: FinanceState) => {
                    const key = type === 'income' ? 'incomeItems' :
                                type === 'expense' ? 'expenseItems' :
                                type === 'asset' ? 'assetItems' : 'liabilityItems';
                    return {
                        [key]: (state[key] as Array<FinanceItem | NetWorthItem>).filter((item) => !ids.includes(item.id)),
                        lastUpdated: new Date().toISOString()
                    };
                });
                if (type === 'asset' || type === 'liability') get().captureSnapshot();
            },
            setUnlocked: (unlocked: boolean) => set({ isUnlocked: unlocked }),
            setCurrency: (currency: string) => set({ currency }),
            setPreferencesSet: (val: boolean) => set((state) => ({ 
                hasSetPreferences: val,
                activeModal: state.activeModal === 'onboarding' ? null : state.activeModal 
            })),
            duplicateItem: (id: string, type: 'income' | 'expense' | 'asset' | 'liability' | 'insurance') => set((state: FinanceState) => {
                const lastUpdated = new Date().toISOString();
                if (type === 'income') {
                    const item = state.incomeItems.find(i => i.id === id);
                    if (!item) return state;
                    return { incomeItems: [...state.incomeItems, { ...item, id: crypto.randomUUID(), name: `${item.name} (Copy)` }], lastUpdated };
                }
                if (type === 'expense') {
                    const item = state.expenseItems.find(i => i.id === id);
                    if (!item) return state;
                    return { expenseItems: [...state.expenseItems, { ...item, id: crypto.randomUUID(), name: `${item.name} (Copy)` }], lastUpdated };
                }
                if (type === 'asset') {
                    const item = state.assetItems.find(i => i.id === id);
                    if (!item) return state;
                    return { assetItems: [...state.assetItems, { ...item, id: crypto.randomUUID(), name: `${item.name} (Copy)` }], lastUpdated };
                }
                if (type === 'liability') {
                    const item = state.liabilityItems.find(i => i.id === id);
                    if (!item) return state;
                    return { liabilityItems: [...state.liabilityItems, { ...item, id: crypto.randomUUID(), name: `${item.name} (Copy)` }], lastUpdated };
                }
                const item = state.insuranceItems.find(i => i.id === id);
                if (!item) return state;
                return { insuranceItems: [...state.insuranceItems, { ...item, id: crypto.randomUUID(), name: `${item.name} (Copy)` }], lastUpdated };
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
            saveFireScenario: (scenario) => set((state: FinanceState) => ({
                fireScenarios: [
                    { ...scenario, id: crypto.randomUUID(), savedAt: new Date().toISOString() },
                    ...state.fireScenarios.slice(0, 4),
                ]
            })),
            removeFireScenario: (id: string) => set((state: FinanceState) => ({
                fireScenarios: state.fireScenarios.filter(s => s.id !== id)
            })),
            showNotification: (message: string, type: 'info' | 'success' | 'error' = 'info') => {
                const existingTimeout = get()._notificationTimeout;
                if (existingTimeout) clearTimeout(existingTimeout);

                set({ notification: { message, type } });
                const timeoutId = setTimeout(() => set({ notification: null, _notificationTimeout: null }), 3000);
                set({ _notificationTimeout: timeoutId });
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
            loadBulkData: (data, merge = false) => {
                set((state: FinanceState) => ({
                    incomeItems: merge ? [...state.incomeItems, ...(data.income || [])] : (data.income || state.incomeItems),
                    expenseItems: merge ? [...state.expenseItems, ...(data.expenses || [])] : (data.expenses || state.expenseItems),
                    assetItems: merge ? [...state.assetItems, ...(data.assets || [])] : (data.assets || state.assetItems),
                    liabilityItems: merge ? [...state.liabilityItems, ...(data.liabilities || [])] : (data.liabilities || state.liabilityItems),
                    insuranceItems: merge ? [...state.insuranceItems, ...(data.insurance || [])] : (data.insurance || state.insuranceItems),
                    lastUpdated: new Date().toISOString()
                }));
                get().captureSnapshot();
            },
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
            storage: safeStorage,
        }
    )
);
