import React, { useState, useEffect, useRef } from 'react';
import { useFinanceStore, FinanceItem } from './store/useFinanceStore';
import { useI18n } from './i18n';
import { APP_VERSION } from './constants/version';
import { scaleTemplateAmount, CURRENCY_SCALE } from './utils/currencies';
import { SankeyChart } from './components/viz/SankeyChart';
import { ProjectorPanel } from './components/viz/ProjectorPanel';
import { AppGuide } from './components/layout/modals/AppGuide';
import { WikiPage } from './components/layout/modals/WikiPage';
import { InsuranceAudit } from './components/viz/InsuranceAudit';
import { exportToCSV, parseCSV } from './utils/csvProcessor';
import { RefreshCw } from 'lucide-react';

// App version — kept in sync with package.json
import pkgJson from '../package.json';
const APP_VERSION: string = pkgJson.version;

// New Modular Components
import { FinanceInput } from './components/finance/inputs/FinanceInput';
import { NetWorthInput } from './components/finance/inputs/NetWorthInput';
import { NetWorthCard } from './components/finance/net-worth/NetWorthCard';
import { OnboardingOverlay } from './components/layout/modals/OnboardingOverlay';
import { Header } from './components/layout/navigation/Header';
import { Footer } from './components/layout/navigation/Footer';
import { NetWorthTab } from './components/finance/net-worth/NetWorthTab';
import { BatchPasteModal } from './components/finance/modals/BatchPasteModal';
import { UserGuideView } from './components/layout/modals/UserGuideView';

function App() {
    const store = useFinanceStore();
    const { incomeItems, expenseItems, assetItems, liabilityItems, isUnlocked, darkMode, clearSession, hasSetPreferences, isPrivacyMode } = store;
    const { t, language } = useI18n();

    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showLangMenu, setShowLangMenu] = useState(false);
    const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);
    const [showTemplateMenu, setShowTemplateMenu] = useState(false);
    const [view, setView] = useState<'dashboard' | 'wiki' | 'networth' | 'guide'>('dashboard');
    const [netWorthTab, setNetWorthTab] = useState<'composition' | 'insurance'>('composition');
    const [showBatchPaste, setShowBatchPaste] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const csvInputRef = useRef<HTMLInputElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);

    // Close dropdown menus when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
                setShowLangMenu(false);
                setShowCurrencyMenu(false);
                setShowTemplateMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    if (!hasSetPreferences) {
        return <OnboardingOverlay />;
    }

    const handleRecalculate = () => {
        setIsRefreshing(true);
        setTimeout(() => setIsRefreshing(false), 800);
    };

    const handleNewSession = () => {
        const confirmMsg = language === 'th' ? 'คุณแน่ใจหรือไม่? ข้อมูลทั้งหมดจะถูกลบ' : 'Are you sure? This will delete all your current financial data.';
        if (window.confirm(confirmMsg)) {
            clearSession();
            store.showNotification(t('header.newSession') || 'Session cleared', 'info');
        }
    };

    const handleSave = () => {
        if (isPrivacyMode) {
            store.showNotification(t('file.privacyModeBlocked'), 'error');
            return;
        }
        const data = { version: APP_VERSION, incomeItems, expenseItems, isUnlocked, darkMode, language };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `finnaflow-session-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleLoad = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target?.result as string);
                if (data.incomeItems && data.expenseItems) {
                    clearSession();
                    data.incomeItems.forEach((item: FinanceItem) => store.addIncome(item));
                    data.expenseItems.forEach((item: FinanceItem) => store.addExpense(item));
                    if (data.assetItems) data.assetItems.forEach((item: any) => store.addAsset(item));
                    if (data.liabilityItems) data.liabilityItems.forEach((item: any) => store.addLiability(item));
                    store.showNotification(t('file.importSuccess'), 'success');
                }
            } catch { store.showNotification(t('file.importError'), 'error'); }
        };
        reader.readAsText(file);
        event.target.value = ''; // Reset so the same file can be re-imported
    };

    const handleCSVExport = () => {
        if (isPrivacyMode) {
            store.showNotification(t('file.privacyModeBlocked'), 'error');
            return;
        }
        const csv = exportToCSV(incomeItems, expenseItems, assetItems, liabilityItems);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `finnaflow-data-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleCSVImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const { income, expenses, assets, liabilities } = parseCSV(e.target?.result as string);
                if (income.length > 0 || expenses.length > 0 || assets.length > 0 || liabilities.length > 0) {
                    clearSession();
                    income.forEach(item => store.addIncome(item));
                    expenses.forEach(item => store.addExpense(item));
                    assets.forEach(item => store.addAsset(item));
                    liabilities.forEach(item => store.addLiability(item));
                    store.showNotification(t('file.importSuccess'), 'success');
                } else {
                    store.showNotification(t('file.csvError'), 'error');
                }
            } catch { store.showNotification(t('file.csvError'), 'error'); }
        };
        reader.readAsText(file);
        event.target.value = '';
    };

    const handleLoadTemplate = (type: 'beginner' | 'standard') => {
        if (store.currency !== 'THB' && !window.confirm(
            `${t('file.templateCurrencyNote')} ${store.currency}. ${language === 'th' ? 'ดำเนินการต่อ?' : 'Continue?'}`
        )) return;

        const scaleAmount = (thbAmount: number): number => scaleTemplateAmount(thbAmount, store.currency);

        let income: FinanceItem[];
        let expenses: FinanceItem[];
        let assets: any[] = [];
        let liabilities: any[] = [];

        if (type === 'beginner') {
            income = [{ id: crypto.randomUUID(), name: t('inputs.income.common.Salary'), amount: scaleAmount(15000), frequency: 'Monthly', category: 'Needs' }];
            expenses = [
                { id: crypto.randomUUID(), name: t('inputs.expense.common.Rent'), amount: scaleAmount(4500), frequency: 'Monthly', category: 'Needs' },
                { id: crypto.randomUUID(), name: t('inputs.expense.common.Groceries'), amount: scaleAmount(3500), frequency: 'Monthly', category: 'Needs' },
                { id: crypto.randomUUID(), name: t('inputs.expense.common.Fun'), amount: scaleAmount(1500), frequency: 'Monthly', category: 'Wants' },
                { id: crypto.randomUUID(), name: t('file.templateItems.emergencyFund'), amount: scaleAmount(1000), frequency: 'Monthly', category: 'Savings' }
            ];
            assets = [{ id: crypto.randomUUID(), name: t('inputs.assets.common.Cash'), amount: scaleAmount(25000), category: 'Cash' }];
        } else {
            income = [
                { id: crypto.randomUUID(), name: t('inputs.income.common.Salary'), amount: scaleAmount(30000), frequency: 'Monthly', category: 'Needs' },
                { id: crypto.randomUUID(), name: t('inputs.income.common.Dividends'), amount: scaleAmount(2500), frequency: 'Monthly', category: 'Investments' }
            ];
            expenses = [
                { id: crypto.randomUUID(), name: t('inputs.expense.common.Rent'), amount: scaleAmount(8000), frequency: 'Monthly', category: 'Needs' },
                { id: crypto.randomUUID(), name: t('inputs.expense.common.Groceries'), amount: scaleAmount(5000), frequency: 'Monthly', category: 'Needs' },
                { id: crypto.randomUUID(), name: t('inputs.expense.common.Transport'), amount: scaleAmount(2000), frequency: 'Monthly', category: 'Needs' },
                { id: crypto.randomUUID(), name: t('inputs.expense.common.Shopping'), amount: scaleAmount(3000), frequency: 'Monthly', category: 'Wants' },
                { id: crypto.randomUUID(), name: t('file.templateItems.etfPortfolio'), amount: scaleAmount(4000), frequency: 'Monthly', category: 'Investments' },
                { id: crypto.randomUUID(), name: t('file.templateItems.retirementFund'), amount: scaleAmount(2500), frequency: 'Monthly', category: 'Savings' },
                { id: crypto.randomUUID(), name: t('file.templateItems.creditCardPayoff'), amount: scaleAmount(1500), frequency: 'Monthly', category: 'Debt' }
            ];
            assets = [
                { id: crypto.randomUUID(), name: t('inputs.assets.common.Cash'), amount: scaleAmount(50000), category: 'Cash' },
                { id: crypto.randomUUID(), name: t('inputs.assets.common.Investments'), amount: scaleAmount(120000), category: 'Stocks' }
            ];
            liabilities = [{ id: crypto.randomUUID(), name: t('inputs.liabilities.common.CarLoan'), amount: scaleAmount(250000), category: 'Car Loan' }];
        }
        store.loadExampleTemplate({ income, expenses, assets, liabilities });
        store.showNotification(t('file.templateSuccess'), 'success');
        setShowTemplateMenu(false);
    };

    return (
        <div className="min-h-screen p-4 sm:p-6 md:p-14 transition-all duration-500 selection:bg-[#007AFF]/20 selection:text-[#007AFF]">
            <div ref={headerRef}>
                <Header 
                    onSave={handleSave}
                    onLoadClick={() => fileInputRef.current?.click()}
                    onNewSession={handleNewSession}
                    onCSVExport={handleCSVExport}
                    onCSVImportClick={() => csvInputRef.current?.click()}
                    onBatchPasteClick={() => setShowBatchPaste(true)}
                    onViewToggle={(v) => setView(v)}
                    onLoadTemplate={handleLoadTemplate}
                    showLangMenu={showLangMenu}
                    setShowLangMenu={setShowLangMenu}
                    showCurrencyMenu={showCurrencyMenu}
                    setShowCurrencyMenu={setShowCurrencyMenu}
                    showTemplateMenu={showTemplateMenu}
                    setShowTemplateMenu={setShowTemplateMenu}
                    isRefreshing={isRefreshing}
                />
            </div>

            <input ref={fileInputRef} type="file" accept=".json" onChange={handleLoad} className="hidden" />
            <input ref={csvInputRef} type="file" accept=".csv" onChange={handleCSVImport} className="hidden" />

            {view === 'wiki' ? (
                <WikiPage onBack={() => setView('dashboard')} onNavigate={(v) => setView(v)} />
            ) : view === 'guide' ? (
                <UserGuideView onBack={() => setView('dashboard')} />
            ) : view === 'networth' ? (
                <main className="max-w-7xl mx-auto pb-16 sm:pb-32">
                    <NetWorthTab />
                </main>
            ) : (
                <main className="max-w-7xl mx-auto space-y-12 sm:space-y-24 pb-16 sm:pb-32">
                    <AppGuide />
                    <article className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
                        <FinanceInput type="income" />
                        <FinanceInput type="expense" />
                    </article>

                    <section className="space-y-10 pt-10 border-t border-gray-100 dark:border-white/5 animate-in fade-in slide-in-from-bottom-5 duration-1000">
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                            <div className="space-y-2">
                                <span className="text-blue-500 font-bold uppercase tracking-widest text-xs ml-1">{t('inputs.netWorth.subtitle') || 'Wealth & Assets'}</span>
                                <h2 className="text-3xl sm:text-4xl font-black text-[#1D1D1F] dark:text-[#F5F5F7]">
                                    {t('inputs.netWorth.title') || 'Net Worth Explorer'}
                                </h2>
                            </div>
                        </div>

                        <NetWorthCard />

                        <div className="flex gap-4 p-1 bg-gray-100 dark:bg-white/5 rounded-2xl mb-8 w-fit">
                            <button onClick={() => setNetWorthTab('composition')} className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${netWorthTab === 'composition' ? 'bg-white dark:bg-white/10 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>Net Worth</button>
                            <button onClick={() => setNetWorthTab('insurance')} className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${netWorthTab === 'insurance' ? 'bg-white dark:bg-white/10 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>Insurance Audit</button>
                        </div>

                        {netWorthTab === 'composition' ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
                                <NetWorthInput type="asset" />
                                <NetWorthInput type="liability" />
                            </div>
                        ) : (
                            <InsuranceAudit />
                        )}
                    </section>

                    <section className="apple-card p-6 sm:p-12 md:p-20 rounded-[1.5rem] sm:rounded-[3rem] overflow-hidden transition-all duration-700 relative">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 sm:gap-10 mb-10 sm:mb-20 relative z-10">
                            <div className="flex items-center gap-4 sm:gap-6">
                                <div className="w-2 sm:w-2.5 h-10 sm:h-12 bg-[#007AFF] rounded-full" />
                                <div>
                                    <h2 className="text-2xl sm:text-4xl font-bold tracking-tight mb-1 sm:mb-2">{t('chart.title')}</h2>
                                    <p className="text-[12px] sm:text-[14px] text-gray-500 dark:text-gray-400 font-medium">{t('chart.recalculate')}</p>
                                </div>
                            </div>
                            <button onClick={handleRecalculate} disabled={isRefreshing} className={`apple-button-secondary px-9 py-4 text-sm ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                <RefreshCw size={18} strokeWidth={2.5} className={isRefreshing ? 'animate-spin' : ''} />
                                {isRefreshing ? t('chart.recalculating') : t('chart.recalculate')}
                            </button>
                        </div>
                        <div className={`transition-all duration-700 relative z-10 ${isRefreshing ? 'opacity-20 blur-2xl scale-[0.98]' : 'opacity-100 blur-0 scale-100'}`}>
                            <div className="min-h-[350px] sm:min-h-[500px] md:min-h-[600px] relative"><SankeyChart /></div>
                        </div>
                    </section>
                </main>
            )}

            <Footer />

            {store.notification && (
                <div className={`fixed bottom-12 left-1/2 -translate-x-1/2 z-[1000] px-8 py-5 rounded-full shadow-[0_12px_44px_rgba(0,0,0,0.15)] flex items-center gap-4 animate-in slide-in-from-bottom-10 duration-500 backdrop-blur-3xl border border-white/20 ${store.notification.type === 'success' ? 'bg-[#34C759]/90 text-white' :
                    store.notification.type === 'error' ? 'bg-[#FF3B30]/90 text-white' :
                        'bg-[#1D1D1F]/90 text-white dark:bg-white/95 dark:text-[#1D1D1F]'
                    }`}>
                    <span className="text-sm font-bold">{store.notification.message}</span>
                </div>
            )}
            <ProjectorPanel />
            {showBatchPaste && <BatchPasteModal onClose={() => setShowBatchPaste(false)} />}
        </div>
    );
}

export default App;
