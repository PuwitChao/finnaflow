import React from 'react';
import { FinanceItem, useFinanceStore } from '../../store/useFinanceStore';
import { useI18n } from '../../i18n';
import { getCurrencySymbol } from '../../utils/currencies';
import { X, PieChart, Wallet, Activity, ArrowRight, Info, TrendingUp, TrendingDown, Sparkles } from 'lucide-react';
import { normalizeToMonthly } from '../../utils/financeEngine';

interface DrillDownModalProps {
    node: {
        type: 'debt' | 'wallet' | 'unallocated' | 'category' | 'income' | 'expense';
        id?: string;
        name?: string;
        category?: string;
        label: string;
    };
    onClose: () => void;
}

export const DrillDownModal: React.FC<DrillDownModalProps> = ({ node, onClose }) => {
    const { incomeItems, expenseItems, currency, isProjectionMode, categoryMultipliers, macroConfig } = useFinanceStore();
    const { t } = useI18n();
    const symbol = getCurrencySymbol(currency);

    const infFactor = 1 + (macroConfig.inflation / 100);
    const mktFactor = 1 - (macroConfig.marketShock / 100);

    const getAdjustedAmount = (item: FinanceItem, isIncome: boolean) => {
        const base = normalizeToMonthly(item.amount, item.frequency);
        if (isProjectionMode) {
            if (isIncome) {
                const isInvestment = item.category === 'Investments' || item.category === 'Dividends' || item.name.toLowerCase().includes('investment');
                return isInvestment ? base * mktFactor : base;
            } else {
                const multiplier = categoryMultipliers[item.category] ?? 1;
                return base * multiplier * infFactor;
            }
        }
        return base;
    };

    let title = node.label;
    let icon = <Info size={24} />;
    let itemsToShow: { name: string, amount: number, category: string, subtext: string }[] = [];
    let summaryText = "";

    const totalIncome = incomeItems.reduce((acc, i) => acc + getAdjustedAmount(i, true), 0);
    const totalExpense = expenseItems.reduce((acc, i) => acc + getAdjustedAmount(i, false), 0);

    if (node.type === 'income') {
        const item = incomeItems.find(i => i.id === node.id);
        if (item) {
            itemsToShow = [{
                name: item.name,
                amount: getAdjustedAmount(item, true),
                category: item.category,
                subtext: `${symbol}${item.amount.toLocaleString()} / ${t(`frequency.${item.frequency}`)}`
            }];
            icon = <Wallet className="text-emerald-500" />;
        }
    } else if (node.type === 'expense') {
        const item = expenseItems.find(i => i.id === node.id);
        if (item) {
            itemsToShow = [{
                name: item.name,
                amount: getAdjustedAmount(item, false),
                category: item.category,
                subtext: `${symbol}${item.amount.toLocaleString()} / ${t(`frequency.${item.frequency}`)}`
            }];
            icon = <Activity className="text-rose-500" />;
        }
    } else if (node.type === 'category') {
        itemsToShow = expenseItems
            .filter(i => i.category === node.category)
            .map(i => ({
                name: i.name,
                amount: getAdjustedAmount(i, false),
                category: i.category,
                subtext: `${symbol}${i.amount.toLocaleString()} / ${t(`frequency.${i.frequency}`)}`
            }));
        icon = <PieChart className="text-blue-500" />;
        title = t(`category.${node.category}`) || node.category || node.label;
    } else if (node.type === 'wallet') {
        title = t('chart.nodes.wallet');
        icon = <Wallet className="text-slate-500" />;
        summaryText = t('guide.howItWorks.description');
        itemsToShow = [
            { name: t('inputs.income.title'), amount: totalIncome, category: 'Income', subtext: t('chart.nodes.wallet') },
            { name: t('inputs.expense.title'), amount: totalExpense, category: 'Expense', subtext: t('chart.nodes.wallet') }
        ];
    } else if (node.type === 'unallocated') {
        title = t('chart.nodes.unallocated');
        icon = <TrendingUp className="text-emerald-500" />;
        const surplus = totalIncome - totalExpense;
        summaryText = t('chart.links.surplus');
        itemsToShow = [{
            name: t('chart.nodes.unallocated'),
            amount: Math.max(0, surplus),
            category: 'Surplus',
            subtext: t('resilience.Resilient')
        }];
    } else if (node.type === 'debt') {
        title = t('chart.nodes.debtSource');
        icon = <TrendingDown className="text-rose-500" />;
        const deficit = totalExpense - totalIncome;
        summaryText = t('chart.links.debt');
        itemsToShow = [{
            name: t('chart.nodes.debtSource'),
            amount: Math.max(0, deficit),
            category: 'Debt',
            subtext: t('resilience.Critical')
        }];
    }

    const totalNodeAmount = itemsToShow.reduce((acc, i) => acc + i.amount, 0);
    const percentageOfIncome = totalIncome > 0 ? (totalNodeAmount / totalIncome * 100) : 0;
    const percentageDisplay = percentageOfIncome.toFixed(1);

    // Budget Nudging Logic
    let nudgeTip = "";
    if (node.type === 'category') {
        if (node.category === 'Needs' && percentageOfIncome > 50) {
            nudgeTip = t('nudge.needsHigh') || "Your needs are above the recommended 50%. Consider auditing fixed costs like subscriptions or utilities.";
        } else if (node.category === 'Wants' && percentageOfIncome > 30) {
            nudgeTip = t('nudge.wantsHigh') || "Spending on wants exceeds 30%. Try the 48-hour rule for impulsive purchases.";
        } else if (node.category === 'Savings' && percentageOfIncome < 20) {
            nudgeTip = t('nudge.savingsLow') || "Savings are below 20%. Aim to automate a small increase in your monthly contributions.";
        }
    }

    return (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 sm:p-6 bg-black/40 dark:bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="w-full max-w-xl apple-card rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 flex flex-col max-h-[90vh]">
                <div className="p-8 pb-4 flex items-center justify-between border-b border-gray-100 dark:border-white/5 bg-white/50 dark:bg-white/5 backdrop-blur-xl">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-white/10 flex items-center justify-center">
                            {icon}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">{title}</h2>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{node.type}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 transition-all active:scale-90">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-6 rounded-3xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t('inputs.labels.value')}</p>
                            <p className="text-2xl font-black text-[#1D1D1F] dark:text-white">{symbol}{totalNodeAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                        </div>
                        <div className="p-6 rounded-3xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t('inputs.netWorth.ratio')}</p>
                            <p className="text-2xl font-black text-blue-500">{percentageDisplay}%</p>
                        </div>
                    </div>

                    {nudgeTip && (
                        <div className="p-5 rounded-3xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex gap-4 animate-in slide-in-from-left-4 duration-500">
                            <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
                                <Sparkles size={18} className="text-white" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-tighter">Pro Tip • Smart Nudging</p>
                                <p className="text-sm text-amber-900 dark:text-amber-200 font-semibold leading-relaxed">{nudgeTip}</p>
                            </div>
                        </div>
                    )}

                    {summaryText && (
                        <div className="p-5 rounded-2xl bg-blue-50/50 dark:bg-blue-500/5 text-sm text-blue-600 dark:text-blue-400 font-medium leading-relaxed border border-blue-100 dark:border-blue-500/10">
                            {summaryText}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="flex items-center justify-between ml-1">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">{t('wiki.csv.columns') || 'Breakdown'}</h3>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400">
                                {itemsToShow.length} {itemsToShow.length === 1 ? 'Item' : 'Items'}
                            </span>
                        </div>
                        
                        <div className="space-y-3">
                            {itemsToShow.length === 0 ? (
                                <div className="text-center py-12 text-gray-400 font-medium italic">
                                    {t('inputs.noItems')}
                                </div>
                            ) : (
                                itemsToShow.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-5 rounded-2xl bg-white/50 dark:bg-white/5 border border-gray-100/50 dark:border-white/5 hover:bg-white dark:hover:bg-white/10 transition-all cursor-default group">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-[#1D1D1F] dark:text-[#F5F5F7] group-hover:text-blue-500 transition-colors">{item.name}</span>
                                            <span className="text-xs text-gray-400 mt-1 font-medium">{item.subtext}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="font-black text-[#1D1D1F] dark:text-white block">{symbol}{item.amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase">{t('frequency.Monthly')}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-8 pt-4 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20">
                    <button 
                        onClick={onClose}
                        className="w-full py-4 rounded-2xl bg-[#1D1D1F] dark:bg-white text-white dark:text-black font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all"
                    >
                        <span>{t('onboarding.continue')}</span>
                        <ArrowRight size={18} />
                    </button>
                    <p className="text-center mt-4 text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                        {t('app.name')} • {t('app.tagline')}
                    </p>
                </div>
            </div>
        </div>
    );
};
