import React from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { useI18n, Language } from '../../i18n';
import { getCurrencySymbol, SUPPORTED_CURRENCIES, Currency } from '../../utils/currencies';
import { PieChart, Download, Upload, LogOut, FileText, HelpCircle, Coins, Globe, Sun, Moon, Eye, EyeOff, Sparkles } from 'lucide-react';

interface HeaderProps {
    onSave: () => void;
    onLoadClick: () => void;
    onNewSession: () => void;
    onCSVExport: () => void;
    onCSVImportClick: () => void;
    onViewToggle: (view: 'dashboard' | 'wiki' | 'networth') => void;
    onLoadTemplate: (type: 'beginner' | 'standard') => void;
    showLangMenu: boolean;
    setShowLangMenu: (show: boolean) => void;
    showCurrencyMenu: boolean;
    setShowCurrencyMenu: (show: boolean) => void;
    showTemplateMenu: boolean;
    setShowTemplateMenu: (show: boolean) => void;
    isRefreshing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
    onSave,
    onLoadClick,
    onNewSession,
    onCSVExport,
    onCSVImportClick,
    onViewToggle,
    onLoadTemplate,
    showLangMenu,
    setShowLangMenu,
    showCurrencyMenu,
    setShowCurrencyMenu,
    showTemplateMenu,
    setShowTemplateMenu,
}) => {
    const { t, language, setLanguage } = useI18n();
    const store = useFinanceStore();
    const { darkMode, toggleTheme, currency, setCurrency, isPrivacyMode, togglePrivacyMode } = store;

    const handleLanguageChange = (lang: Language) => {
        setLanguage(lang);
        setShowLangMenu(false);
    };

    const sym = getCurrencySymbol(currency);
    
    // Hardcoded template values for display in the menu (matching App.tsx logic)
    const currencyScale: Record<string, number> = {
        THB: 1, USD: 0.028, EUR: 0.026, GBP: 0.022, JPY: 4.2, CNY: 0.2, INR: 2.35, KRW: 37.5, AUD: 0.043, CAD: 0.039, SGD: 0.038,
    };

    const scaleAmount = (thbAmount: number): number => {
        const scale = currencyScale[currency] ?? 0.028;
        const raw = thbAmount * scale;
        if (raw < 10) return Math.round(raw * 100) / 100;
        if (raw < 100) return Math.round(raw / 5) * 5;
        if (raw < 1000) return Math.round(raw / 50) * 50;
        if (raw < 10000) return Math.round(raw / 500) * 500;
        return Math.round(raw / 5000) * 5000;
    };

    const templateBeginnerIncome = scaleAmount(15000);
    const templateStandardIncome = scaleAmount(30000);

    return (
        <header className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-6 sm:gap-10 mb-10 sm:mb-20 relative z-50">
            <div className="flex items-center gap-4 sm:gap-6 group cursor-pointer" onClick={() => onViewToggle('dashboard')}>
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#1D1D1F] dark:bg-white rounded-[1.1rem] sm:rounded-[1.4rem] flex items-center justify-center shadow-2xl transition-all group-hover:scale-105 active:scale-95">
                    <PieChart className="text-white dark:text-[#1D1D1F] w-7 h-7 sm:w-9 sm:h-9" strokeWidth={2} />
                </div>
                <div>
                    <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] leading-none mb-1">{t('app.name')}</h1>
                    <p className="text-[12px] sm:text-[14px] text-gray-500 dark:text-gray-400 font-medium tracking-tight">{t('app.tagline')}</p>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-1 p-1 bg-white/40 dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-white/5">
                    <button onClick={onSave} className="apple-icon-btn" title={t('inputs.hints.save')}><Download size={19} /></button>
                    <button onClick={onLoadClick} className="apple-icon-btn" title={t('inputs.hints.load')}><Upload size={19} /></button>
                    <div className="w-[1px] h-6 bg-gray-200 dark:bg-white/10 mx-1" />
                    <button onClick={onNewSession} className="apple-icon-btn hover:text-[#FF3B30]" title={t('inputs.hints.reset')}><LogOut size={19} /></button>
                    <div className="w-[1px] h-6 bg-gray-200 dark:bg-white/10 mx-1" />
                    <button onClick={onCSVExport} className="apple-icon-btn" title={t('inputs.hints.csvExport')}><FileText size={19} /></button>
                    <button onClick={onCSVImportClick} className="apple-icon-btn" title={t('inputs.hints.csvImport')}><div className="relative"><FileText size={19} /><div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#FF9500] rounded-full border-2 border-[#F5F5F7] dark:border-[#000000]" /></div></button>
                </div>

                <div className="flex items-center gap-1 p-1 bg-white/40 dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-white/5">
                    <button onClick={() => onViewToggle('networth')} className="apple-icon-btn" title={t('inputs.hints.networth')}><Coins size={19} /></button>
                    <div className="w-[1px] h-6 bg-gray-200 dark:bg-white/10 mx-1" />
                    <button onClick={() => onViewToggle('wiki')} className="apple-icon-btn" title={t('inputs.hints.wiki')}><HelpCircle size={19} /></button>
                    <div className="w-[1px] h-6 bg-gray-200 dark:bg-white/10 mx-1" />
                    <div className="relative">
                        <button onClick={() => { setShowCurrencyMenu(!showCurrencyMenu); setShowLangMenu(false); setShowTemplateMenu(false); }} className={`px-4 py-2 rounded-xl transition-all text-[13px] font-semibold flex items-center gap-2 ${showCurrencyMenu ? 'bg-[#007AFF] text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10'}`} title={t('inputs.hints.currency')}>
                            <Coins size={16} /><span className="uppercase">{currency}</span>
                        </button>
                        {showCurrencyMenu && (
                            <div className="absolute right-0 top-full mt-3 apple-card rounded-[1.8rem] overflow-hidden z-[100] w-64 p-2 grid grid-cols-2 gap-1.5 animate-in fade-in zoom-in-95 duration-200">
                                {SUPPORTED_CURRENCIES.map((curr: Currency) => (
                                    <button key={curr.code} onClick={() => { setCurrency(curr.code); setShowCurrencyMenu(false); }} className={`px-4 py-2.5 text-left rounded-xl transition-all text-xs font-semibold ${currency === curr.code ? 'bg-[#007AFF] text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10'}`}>
                                        <div className="flex flex-col"><span className="opacity-60 text-[10px]">{curr.symbol}</span><span>{curr.code}</span></div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="relative">
                        <button onClick={() => { setShowLangMenu(!showLangMenu); setShowCurrencyMenu(false); setShowTemplateMenu(false); }} className={`px-4 py-2 rounded-xl transition-all text-[13px] font-semibold flex items-center gap-2 ${showLangMenu ? 'bg-[#007AFF] text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10'}`} title={t('inputs.hints.language')}>
                            <Globe size={16} /><span className="uppercase">{language}</span>
                        </button>
                        {showLangMenu && (
                            <div className="absolute right-0 top-full mt-3 apple-card rounded-2xl overflow-hidden z-[100] w-44 p-2 flex flex-col gap-1 animate-in fade-in zoom-in-95 duration-200">
                                <button onClick={() => handleLanguageChange('en')} className={`w-full px-4 py-2 text-left rounded-xl transition-all flex items-center gap-3 text-sm font-semibold ${language === 'en' ? 'bg-[#007AFF] text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10'}`}><span>🇺🇸</span><span>English</span></button>
                                <button onClick={() => handleLanguageChange('th')} className={`w-full px-4 py-2 text-left rounded-xl transition-all flex items-center gap-3 text-sm font-semibold ${language === 'th' ? 'bg-[#007AFF] text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10'}`}><span>🇹🇭</span><span>ไทย</span></button>
                            </div>
                        )}
                    </div>
                    <button onClick={toggleTheme} className="apple-icon-btn" title={t('inputs.hints.theme')}>{darkMode ? <Sun size={19} /> : <Moon size={19} />}</button>
                    <div className="w-[1px] h-6 bg-gray-200 dark:bg-white/10 mx-1" />
                    <button 
                        onClick={togglePrivacyMode} 
                        className={`apple-icon-btn ${isPrivacyMode ? 'text-[#007AFF] bg-[#007AFF]/10 scale-110' : ''}`} 
                        title="Toggle Privacy Mode"
                    >
                        {isPrivacyMode ? <EyeOff size={19} /> : <Eye size={19} />}
                    </button>
                </div>

                <div className="relative">
                    <button onClick={() => { setShowTemplateMenu(!showTemplateMenu); setShowLangMenu(false); setShowCurrencyMenu(false); }} className={`px-7 py-3 rounded-full transition-all text-[14px] font-semibold flex items-center gap-2.5 shadow-sm active:scale-95 ${showTemplateMenu ? 'bg-[#34C759] text-white' : 'bg-[#34C759] text-white hover:bg-[#30B752]'}`} title={t('inputs.hints.templates')}>
                        <Sparkles size={17} strokeWidth={2.5} className={showTemplateMenu ? '' : 'animate-pulse'} />
                        <span>{t('header.exampleTemplate')}</span>
                    </button>
                    {showTemplateMenu && (
                        <div className="absolute right-0 top-full mt-4 apple-card rounded-[2rem] overflow-hidden z-[100] w-72 p-3 flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
                            <button onClick={() => onLoadTemplate('beginner')} className="w-full p-4 text-left rounded-2xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white"><PieChart size={20} /></div>
                                <div className="flex flex-col"><span className="text-[10px] font-bold text-[#FF9500] uppercase tracking-wide">{t('file.templates.beginner')}</span><span className="text-sm font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">{sym}{templateBeginnerIncome.toLocaleString()}{t('projector.perMonth')}</span></div>
                            </button>
                            <button onClick={() => onLoadTemplate('standard')} className="w-full p-4 text-left rounded-2xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-[#AF52DE] flex items-center justify-center text-white"><Sparkles size={20} /></div>
                                <div className="flex flex-col"><span className="text-[10px] font-bold text-[#34C759] uppercase tracking-wide">{t('file.templates.standard')}</span><span className="text-sm font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">{sym}{templateStandardIncome.toLocaleString()}{t('projector.perMonth')}</span></div>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};
