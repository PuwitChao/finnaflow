import React, { useState, useEffect, useRef } from 'react';
import { useFinanceStore } from './store/useFinanceStore';
import { useI18n } from './i18n';

import { SankeyChart } from './components/viz/SankeyChart';
import { ProjectorPanel } from './components/viz/ProjectorPanel';
import { AppGuide } from './components/layout/modals/AppGuide';
import { InsuranceAudit } from './components/viz/InsuranceAudit';
import { RefreshCw } from 'lucide-react';

import { useFinanceIO } from './hooks/useFinanceIO';
import { useTemplates } from './hooks/useTemplates';

import { FinanceInput } from './components/finance/inputs/FinanceInput';
import { NetWorthInput } from './components/finance/inputs/NetWorthInput';
import { NetWorthCard } from './components/finance/net-worth/NetWorthCard';
import { Header } from './components/layout/navigation/Header';
import { Footer } from './components/layout/navigation/Footer';
import { NetWorthTab } from './components/finance/net-worth/NetWorthTab';
import { ModalProvider } from './components/layout/modals/ModalProvider';

function App() {
    const store = useFinanceStore();
    const { darkMode, clearSession } = store;
    const { t } = useI18n();

    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showLangMenu, setShowLangMenu] = useState(false);
    const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);
    const [showTemplateMenu, setShowTemplateMenu] = useState(false);
    const [view, setView] = useState<'dashboard' | 'networth'>('dashboard');
    const [netWorthTab, setNetWorthTab] = useState<'composition' | 'insurance'>('composition');
    const headerRef = useRef<HTMLDivElement>(null);

    const { 
        fileInputRef, 
        csvInputRef, 
        handleSave, 
        handleLoad, 
        handleCSVExport, 
        handleCSVImport, 
        handleGenerateReport 
    } = useFinanceIO();

    const { handleLoadTemplate: originalHandleLoadTemplate } = useTemplates();

    const handleLoadTemplate = (type: 'beginner' | 'standard') => {
        originalHandleLoadTemplate(type);
        setShowTemplateMenu(false);
    };


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

    const handleRecalculate = () => {
        setIsRefreshing(true);
        store.captureSnapshot();
        setTimeout(() => setIsRefreshing(false), 800);
    };


    const handleNewSession = () => {
        const confirmMsg = t('common.confirmNewSession');
        if (window.confirm(confirmMsg)) {
            clearSession();
            store.showNotification(t('header.newSession') || 'Session cleared', 'info');
        }
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
                    onBatchPasteClick={() => store.openModal('batchPaste')}
                    onGenerateReport={handleGenerateReport}
                    onViewToggle={(v) => {
                        if (v === 'wiki') store.openModal('wiki');
                        else if (v === 'guide') store.openModal('guide');
                        else setView(v as 'dashboard' | 'networth');
                    }}
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

            {view === 'networth' ? (
                <main key="networth" className="max-w-7xl mx-auto pb-16 sm:pb-32 animate-in fade-in zoom-in-98 duration-700">
                    <NetWorthTab />
                </main>
            ) : (
                <main key="dashboard" className="max-w-7xl mx-auto space-y-12 sm:space-y-24 pb-16 sm:pb-32 animate-in fade-in zoom-in-98 duration-700">
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
                            <button onClick={() => setNetWorthTab('composition')} className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${netWorthTab === 'composition' ? 'bg-white dark:bg-white/10 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>{t('inputs.netWorth.tabs.networth')}</button>
                            <button onClick={() => setNetWorthTab('insurance')} className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${netWorthTab === 'insurance' ? 'bg-white dark:bg-white/10 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>{t('inputs.netWorth.tabs.insurance')}</button>
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
                        <div id="sankey-report-area" className={`transition-all duration-700 relative z-10 ${isRefreshing ? 'opacity-20 blur-2xl scale-[0.98]' : 'opacity-100 blur-0 scale-100'}`}>
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
            <ModalProvider />
        </div>
    );
}

export default App;
