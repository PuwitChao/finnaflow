import React, { useState, useMemo } from 'react';
import { useFinanceStore } from '../../../store/useFinanceStore';
import { useI18n } from '../../../i18n';
import { getCurrencySymbol } from '../../../utils/currencies';
import { X, TrendingUp, ShieldCheck, Clock, Info, ChevronRight, TrendingDown, Percent } from 'lucide-react';
import { 
    getMonthlySurplus, 
    calculateFireNumber, 
    solveForFireDuration 
} from '../../../utils/financeMath';

interface FireTrackerOverlayProps {
    onClose: () => void;
}

export const FireTrackerOverlay: React.FC<FireTrackerOverlayProps> = ({ onClose }) => {
    const { t } = useI18n();
    const { incomeItems, expenseItems, getTotalAssets, getTotalLiabilities, isPrivacyMode, currency } = useFinanceStore();
    
    // UI Local State for Projection Sliders
    const [roi, setRoi] = useState(7); // Default 7% annual ROI
    const [swr, setSwr] = useState(4); // Default 4% rule
    
    const netWorth = getTotalAssets() - getTotalLiabilities();
    const sym = getCurrencySymbol(currency);
    
    const formatAmount = (val: number) => {
        if (isPrivacyMode) return '••••••';
        const absVal = Math.abs(val);
        return `${val < 0 ? '-' : ''}${sym}${absVal.toLocaleString()}`;
    };
    const monthlySurplus = getMonthlySurplus(incomeItems, expenseItems);
    
    // Annualized expenses represent the lifestyle we want to maintain
    const annualExpenses = expenseItems.reduce((acc, item) => {
        let monthly = item.amount;
        if (item.frequency === 'Weekly') monthly = (item.amount * 52) / 12;
        if (item.frequency === 'Yearly') monthly = item.amount / 12;
        return acc + (monthly * 12);
    }, 0);

    const fireNumber = useMemo(() => calculateFireNumber(annualExpenses, swr), [annualExpenses, swr]);
    const totalMonths = useMemo(() => 
        solveForFireDuration(netWorth, monthlySurplus, fireNumber, roi), 
    [netWorth, monthlySurplus, fireNumber, roi]);

    const years = Math.floor(totalMonths / 12);
    const months = Math.ceil(totalMonths % 12);
    
    const progressPercent = Math.min(100, Math.max(0, (netWorth / fireNumber) * 100));

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-[#F5F5F7]/80 dark:bg-black/80 backdrop-blur-2xl animate-in fade-in duration-500">
            <div className="relative w-full max-w-4xl bg-white dark:bg-[#1D1D1F] rounded-[3rem] shadow-2xl border border-white dark:border-white/5 overflow-hidden flex flex-col md:flex-row animate-in slide-in-from-bottom-8 duration-700">
                
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-8 right-8 w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400 hover:text-[#1D1D1F] dark:hover:text-white transition-all z-20"
                >
                    <X size={20} />
                </button>

                {/* Left Panel: Configuration */}
                <div className="w-full md:w-2/5 p-8 sm:p-12 border-b md:border-b-0 md:border-r border-gray-100 dark:border-white/5 space-y-10">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[#007AFF] font-bold uppercase tracking-[0.2em] text-[10px]">
                            <TrendingUp size={14} />
                            <span>Projection Mode</span>
                        </div>
                        <h2 className="text-3xl font-black text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight leading-tight">
                            {t('inputs.netWorth.tracker.title')}
                        </h2>
                    </div>

                    <div className="space-y-8">
                        {/* ROI Slider */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{t('inputs.netWorth.tracker.roiLabel')}</label>
                                <span className="text-xl font-black text-[#007AFF]">{roi}%</span>
                            </div>
                            <input 
                                type="range" min="0" max="15" step="0.5" value={roi} 
                                onChange={(e) => setRoi(parseFloat(e.target.value))}
                                className="w-full apple-range"
                            />
                            <p className="text-[10px] text-gray-400 font-medium">Historical S&P 500 average is approx. 7-10%.</p>
                        </div>

                        {/* SWR Slider */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{t('inputs.netWorth.tracker.swrLabel')}</label>
                                <span className="text-xl font-black text-[#007AFF]">{swr}%</span>
                            </div>
                            <input 
                                type="range" min="2" max="6" step="0.1" value={swr} 
                                onChange={(e) => setSwr(parseFloat(e.target.value))}
                                className="w-full apple-range"
                            />
                            <p className="text-[10px] text-gray-400 font-medium">Trinity Study suggests 4% for a 30-year retirement.</p>
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex gap-3 italic">
                        <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-blue-600/80 leading-relaxed">
                            {t('inputs.netWorth.tracker.projectionNote')}
                        </p>
                    </div>
                </div>

                {/* Right Panel: Results */}
                <div className="w-full md:w-3/5 p-8 sm:p-12 bg-gray-50/50 dark:bg-white/[0.01] flex flex-col justify-center">
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
                        <div className="apple-card p-6 bg-white dark:bg-[#2C2C2E] border-0 shadow-sm space-y-1">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('inputs.netWorth.tracker.targetPot')}</p>
                            <h4 className={`text-2xl font-black text-[#1D1D1F] dark:text-[#F5F5F7] ${isPrivacyMode ? 'blur-sm' : ''}`}>
                                {formatAmount(fireNumber)}
                            </h4>
                        </div>
                        <div className="apple-card p-6 bg-white dark:bg-[#2C2C2E] border-0 shadow-sm space-y-1">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('inputs.netWorth.tracker.monthlySurplus')}</p>
                            <h4 className={`text-2xl font-black text-emerald-500 ${isPrivacyMode ? 'blur-sm' : ''}`}>
                                +{formatAmount(monthlySurplus)}
                            </h4>
                        </div>
                    </div>

                    <div className="space-y-6 text-center sm:text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/10 mb-2">
                            <Clock size={14} strokeWidth={3} />
                            <span className="text-[10px] font-black uppercase tracking-widest">{t('inputs.netWorth.tracker.timeToFreedom')}</span>
                        </div>
                        
                        {totalMonths === Infinity ? (
                            <h3 className="text-4xl font-black text-rose-500 dark:text-rose-400">Critical State</h3>
                        ) : totalMonths === 0 ? (
                            <h3 className="text-5xl font-black text-emerald-500">{t('inputs.netWorth.tracker.reached')}</h3>
                        ) : (
                            <div className="flex flex-col sm:flex-row items-baseline gap-2">
                                <span className="text-7xl sm:text-8xl font-black text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tighter">
                                    {years}
                                </span>
                                <span className="text-2xl font-bold text-gray-400 lowercase">{t('inputs.netWorth.tracker.years')}</span>
                                <span className="text-5xl sm:text-6xl font-black text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tighter ml-2 sm:ml-4">
                                    {months}
                                </span>
                                <span className="text-2xl font-bold text-gray-400 lowercase">{t('inputs.netWorth.tracker.months')}</span>
                            </div>
                        )}
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-12 space-y-3">
                        <div className="flex justify-between items-end px-1">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Journey Progress</span>
                            <span className="text-xs font-black text-[#1D1D1F] dark:text-[#F5F5F7]">{progressPercent.toFixed(1)}%</span>
                        </div>
                        <div className="h-4 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden p-1 border border-gray-200 dark:border-white/5">
                            <div 
                                className="h-full bg-gradient-to-r from-[#007AFF] to-[#5856D6] rounded-full transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(0,122,255,0.4)]"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-[10px] font-medium text-gray-400 italic px-1">
                            <span>Today</span>
                            <span>Financial Freedom</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
