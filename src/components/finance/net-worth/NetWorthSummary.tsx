import React from 'react';
import { useFinanceStore } from '../../../store/useFinanceStore';
import { useI18n } from '../../../i18n';
import { getCurrencySymbol } from '../../../utils/currencies';
import { ShieldCheck, TrendingUp, TrendingDown, Percent, Zap } from 'lucide-react';

export const NetWorthSummary: React.FC = () => {
    const { currency, isPrivacyMode, getTotalAssets, getTotalLiabilities } = useFinanceStore();
    const { t } = useI18n();
    
    const assets = getTotalAssets();
    const liabilities = getTotalLiabilities();
    const netWorth = assets - liabilities;
    const debtRatio = assets > 0 ? (liabilities / assets) * 100 : 0;
    const sym = getCurrencySymbol(currency);

    const formatAmount = (val: number) => {
        if (isPrivacyMode) return '••••••';
        const absVal = Math.abs(val);
        return `${val < 0 ? '-' : ''}${sym}${absVal.toLocaleString()}`;
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Main Net Worth Card */}
            <div className="md:col-span-8 apple-card p-8 sm:p-12 rounded-[2.5rem] bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] border-0 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] dark:opacity-[0.07] group-hover:scale-110 transition-transform duration-1000">
                    <ShieldCheck size={280} />
                </div>
                
                <div className="relative z-10 flex flex-col justify-between h-full space-y-8">
                    <div className="space-y-2">
                        <p className="text-white/40 dark:text-[#1D1D1F]/40 font-bold uppercase tracking-[0.2em] text-[10px]">{t('inputs.netWorth.totalWealthBaseline')}</p>
                        <h2 className={`text-5xl sm:text-7xl font-black tracking-tighter leading-none transition-all duration-500 ${isPrivacyMode ? 'blur-md' : ''}`}>
                            {formatAmount(netWorth)}
                        </h2>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2 bg-white/10 dark:bg-[#1D1D1F]/10 px-4 py-2 rounded-full backdrop-blur-md border border-white/10 dark:border-[#1D1D1F]/10">
                            <TrendingUp size={16} strokeWidth={2.5} className="text-emerald-400 dark:text-emerald-600" />
                            <span className="text-xs font-bold uppercase tracking-widest">+4.2% {t('inputs.netWorth.growth')}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/10 dark:bg-[#1D1D1F]/10 px-4 py-2 rounded-full backdrop-blur-md border border-white/10 dark:border-[#1D1D1F]/10">
                            <Zap size={16} strokeWidth={2.5} className="text-blue-400 dark:text-blue-600" />
                            <span className="text-xs font-bold uppercase tracking-widest text-white/60 dark:text-[#1D1D1F]/60">{t('inputs.netWorth.resilienceLevel')}: {t('inputs.netWorth.high')}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Side Metrics */}
            <div className="md:col-span-4 grid grid-cols-1 gap-6">
                <div className="apple-card p-8 rounded-[2rem] bg-emerald-500/10 dark:bg-emerald-500/[0.05] border-emerald-500/20 flex flex-col justify-between group overflow-hidden relative">
                     <div className="absolute -bottom-6 -right-6 text-emerald-500/10 group-hover:scale-110 transition-transform duration-500">
                        <TrendingUp size={120} />
                    </div>
                    <div className="relative z-10">
                        <p className="text-emerald-600/60 font-bold uppercase tracking-widest text-[10px] mb-2">{t('inputs.assets.title')}</p>
                        <h3 className={`text-3xl font-black text-emerald-600 tracking-tight transition-all duration-500 ${isPrivacyMode ? 'blur-sm' : ''}`}>{formatAmount(assets)}</h3>
                    </div>
                    <p className="relative z-10 text-[10px] font-bold text-emerald-600/40 uppercase mt-4 tracking-wider">{t('inputs.netWorth.securityPercentile')}</p>
                </div>

                <div className="apple-card p-8 rounded-[2rem] bg-rose-500/10 dark:bg-rose-500/[0.05] border-rose-500/20 flex flex-col justify-between group overflow-hidden relative">
                    <div className="absolute -bottom-6 -right-6 text-rose-500/10 group-hover:scale-110 transition-transform duration-500">
                        <TrendingDown size={120} />
                    </div>
                    <div className="relative z-10">
                        <p className="text-rose-600/60 font-bold uppercase tracking-widest text-[10px] mb-2">{t('inputs.liabilities.title')}</p>
                        <h3 className={`text-3xl font-black text-rose-600 tracking-tight transition-all duration-500 ${isPrivacyMode ? 'blur-sm' : ''}`}>{formatAmount(liabilities)}</h3>
                    </div>
                    <div className="relative z-10 flex items-center gap-2 mt-4 text-rose-600/40 font-bold text-[10px] uppercase tracking-wider">
                        <Percent size={12} strokeWidth={3} />
                        <span>{debtRatio.toFixed(1)}% {t('inputs.netWorth.leverageRatio')}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
