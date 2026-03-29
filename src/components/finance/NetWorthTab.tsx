import React from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { useI18n } from '../../i18n';
import { getCurrencySymbol } from '../../utils/currencies';
import { NetWorthGroup } from './NetWorthGroup';
import { NetWorthSummary } from './NetWorthSummary';
import { AssetDistributionChart } from '../viz/AssetDistributionChart';
import { TrendingUp, TrendingDown, Target, Info } from 'lucide-react';

export const NetWorthTab: React.FC = () => {
    const { t } = useI18n();

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-700 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[#007AFF] font-bold uppercase tracking-[0.2em] text-[10px] bg-[#007AFF]/10 px-3 py-1 rounded-full">Phase 3: Alpha</span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
                        {t('inputs.netWorth.wealthDashboard')}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium text-lg max-w-2xl">
                        {t('inputs.netWorth.wealthSubtitle')}
                    </p>
                </div>
                
                <div className="flex items-center gap-4 bg-white/40 dark:bg-white/5 backdrop-blur-xl p-2 rounded-2xl border border-white/20 dark:border-white/5">
                    <button className="apple-button-secondary px-6 py-3 text-xs flex items-center gap-2">
                        <Target size={14} strokeWidth={2.5} />
                        {t('inputs.netWorth.planFire')}
                    </button>
                </div>
            </div>

            {/* Summary Highlights */}
            <NetWorthSummary />

            {/* Visual Insights Section */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-6">
                <div className="md:col-span-12">
                     <AssetDistributionChart />
                </div>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-6">
                <NetWorthGroup type="asset" />
                <NetWorthGroup type="liability" />
            </div>
            
            {/* Footer Insight Widget */}
            <div className="apple-card p-6 bg-[#F5F5F7] dark:bg-white/[0.02] flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                    <Info size={20} />
                </div>
                <div className="space-y-1">
                    <p className="text-sm font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">{t('inputs.netWorth.proTipTitle')}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('inputs.netWorth.proTipContent')}</p>
                </div>
            </div>
        </div>
    );
};
