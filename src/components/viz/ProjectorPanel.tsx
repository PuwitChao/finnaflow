import React from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { useI18n } from '../../i18n';
import { Sliders, X, TrendingUp, TrendingDown, Info } from 'lucide-react';
import { getCurrencySymbol } from '../../utils/currencies';
import { normalizeToMonthly } from '../../utils/financeEngine';

export const ProjectorPanel: React.FC = () => {
    const {
        expenseItems,
        incomeItems,
        isProjectionMode,
        toggleProjectionMode,
        categoryMultipliers,
        setCategoryMultiplier,
        macroConfig,
        setMacroConfig,
        applyPreset,
        currency
    } = useFinanceStore();
    const { t } = useI18n();

    if (!isProjectionMode) {
        return (
            <button
                onClick={toggleProjectionMode}
                className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 apple-button-primary shadow-2xl z-50 py-3 px-6 sm:py-4 sm:px-8"
            >
                <Sliders className="w-5 h-5" />
                <span>{t('projector.enterMode') || 'Projection Mode'}</span>
            </button>
        );
    }

    const categories = Array.from(new Set(expenseItems.map(i => i.category)));

    const infFactor = 1 + (macroConfig.inflation / 100);
    const mktFactor = 1 - (macroConfig.marketShock / 100);

    const today = new Date().toISOString().split('T')[0];

    const projectedIncome = incomeItems.reduce((acc, item) => {
        if (item.endDate && item.endDate < today) return acc;
        const base = normalizeToMonthly(item.amount, item.frequency);
        const isInvestment = item.category === 'Investments' || item.category === 'Dividends' || item.name.toLowerCase().includes('investment');
        return acc + (isInvestment ? base * mktFactor : base);
    }, 0);

    const projectedExpense = expenseItems.reduce((acc, item) => {
        if (item.endDate && item.endDate < today) return acc;
        const base = normalizeToMonthly(item.amount, item.frequency);
        const mult = categoryMultipliers[item.category] ?? 1;
        return acc + (base * mult * infFactor);
    }, 0);

    const surplus = projectedIncome - projectedExpense;
    const surplusPercent = projectedIncome > 0 ? (surplus / projectedIncome) * 100 : 0;

    let verdict = { label: 'Resilient', color: 'text-[#34C759]', bg: 'bg-[#34C759]/10', icon: <TrendingUp className="w-4 h-4" /> };
    if (surplusPercent <= 0) {
        verdict = { label: 'Critical', color: 'text-[#FF3B30]', bg: 'bg-[#FF3B30]/10', icon: <TrendingDown className="w-4 h-4" /> };
    } else if (surplusPercent < 10) {
        verdict = { label: 'Strained', color: 'text-[#FF9500]', bg: 'bg-[#FF9500]/10', icon: <Info className="w-4 h-4" /> };
    }

    return (
        <div className="fixed bottom-0 right-0 sm:bottom-8 sm:right-8 w-full sm:w-80 apple-card rounded-t-[2rem] sm:rounded-[2.5rem] z-50 overflow-hidden flex flex-col animate-in slide-in-from-bottom-8 duration-500 shadow-[0_-4px_30px_rgba(0,0,0,0.15)] sm:shadow-[0_20px_60px_rgba(0,0,0,0.15)] max-h-[85vh] sm:max-h-none">
            <div className="p-6 flex items-center justify-between bg-[#1D1D1F] dark:bg-[#1C1C1E]">
                <div className="flex items-center gap-3 text-white">
                    <TrendingUp className="w-5 h-5 text-[#34C759]" />
                    <h3 className="font-bold text-sm tracking-tight">{t('projector.hubTitle')}</h3>
                </div>
                <button
                    onClick={toggleProjectionMode}
                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors text-white/50 hover:text-white"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            <div className={`p-4 mx-6 mt-6 rounded-[1.2rem] flex items-center justify-between ${verdict.bg}`}>
                <div className="flex items-center gap-2">
                    <span className={verdict.color}>{verdict.icon}</span>
                    <span className={`text-xs font-bold tracking-tight ${verdict.color}`}>
                        {t(`resilience.${verdict.label}`)}
                    </span>
                </div>
                <span className={`text-xs font-bold ${verdict.color}`}>
                    {getCurrencySymbol(currency)}{surplus.toLocaleString(undefined, { maximumFractionDigits: 0 })}{t('projector.perMonth')}
                </span>
            </div>

            <div className="p-6 space-y-8 max-h-[50vh] overflow-y-auto scrollbar-hide">
                <section className="space-y-4">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-400">{t('projector.macroTitle')}</h4>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => applyPreset(10, 0)}
                            className="text-xs font-semibold py-3 border border-gray-100 dark:border-white/5 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all active:scale-95 text-gray-600 dark:text-gray-300"
                        >
                            {t('projector.inflationPreset')}
                        </button>
                        <button
                            onClick={() => applyPreset(0, 30)}
                            className="text-xs font-semibold py-3 border border-gray-100 dark:border-white/5 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all active:scale-95 text-gray-600 dark:text-gray-300"
                        >
                            {t('projector.crashPreset')}
                        </button>
                    </div>

                    <div className="space-y-5 pt-2">
                        <div className="space-y-3">
                            <div className="flex justify-between text-[13px] font-semibold text-gray-500">
                                <span>{t('projector.inflation')}</span>
                                <span className="text-[#FF3B30]">+{macroConfig.inflation}%</span>
                            </div>
                            <input
                                type="range" min="0" max="20" step="1"
                                value={macroConfig.inflation}
                                onChange={(e) => setMacroConfig({ inflation: parseFloat(e.target.value) })}
                                className="w-full h-[3px] bg-gray-100 dark:bg-[#1C1C1E] rounded-full appearance-none cursor-pointer accent-[#FF3B30]"
                            />
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between text-[13px] font-semibold text-gray-500">
                                <span>{t('projector.market')}</span>
                                <span className="text-[#FF3B30]">-{macroConfig.marketShock}%</span>
                            </div>
                            <input
                                type="range" min="0" max="50" step="5"
                                value={macroConfig.marketShock}
                                onChange={(e) => setMacroConfig({ marketShock: parseFloat(e.target.value) })}
                                className="w-full h-[3px] bg-gray-100 dark:bg-[#1C1C1E] rounded-full appearance-none cursor-pointer accent-[#FF3B30]"
                            />
                        </div>
                    </div>
                </section>

                <div className="h-px bg-gray-100 dark:bg-white/5" />

                <section className="space-y-6">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-400">{t('projector.budgetTitle')}</h4>
                    {categories.length === 0 ? (
                        <div className="text-center py-4 text-gray-400">
                            <p className="text-xs font-semibold">{t('category.noCategories')}</p>
                        </div>
                    ) : (
                        categories.map(cat => (
                            <div key={cat} className="space-y-3">
                                <div className="flex justify-between items-center text-[13px] font-semibold text-gray-600 dark:text-gray-300">
                                    <span>{t(`category.${cat}`) === `category.${cat}` ? cat : t(`category.${cat}`)}</span>
                                    <span className="text-[#007AFF] bg-[#007AFF]/5 px-2.5 py-0.5 rounded-lg text-xs font-bold">
                                        {Math.round((categoryMultipliers[cat] ?? 1) * 100)}%
                                    </span>
                                </div>
                                <input
                                    type="range" min="0" max="2" step="0.1"
                                    value={categoryMultipliers[cat] ?? 1}
                                    onChange={(e) => setCategoryMultiplier(cat, parseFloat(e.target.value))}
                                    className="w-full h-[3px] bg-gray-100 dark:bg-[#1C1C1E] rounded-full appearance-none cursor-pointer accent-[#007AFF]"
                                />
                            </div>
                        ))
                    )}
                </section>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-[#1C1C1E]/30 text-[11px] text-gray-400 text-center font-bold tracking-tight">
                {t('projector.simulationNote')}
            </div>
        </div>
    );
};
