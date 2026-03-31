import React from 'react';
import { useFinanceStore } from '../../../store/useFinanceStore';
import { useI18n } from '../../../i18n';
import { getCurrencySymbol } from '../../../utils/currencies';
import { Sparkles, ShieldCheck } from 'lucide-react';

export const NetWorthCard: React.FC = () => {
    const { assetItems, liabilityItems, currency, isPrivacyMode } = useFinanceStore();
    const { t } = useI18n();
    const symbol = getCurrencySymbol(currency);

    const formatValue = (val: number) => isPrivacyMode ? '•••••' : val.toLocaleString();

    const totalAssets = assetItems.reduce((acc, i) => acc + i.amount, 0);
    const totalLiabilities = liabilityItems.reduce((acc, i) => acc + i.amount, 0);
    const netWorth = totalAssets - totalLiabilities;
    const equityRatio = totalAssets > 0 ? (netWorth / totalAssets) * 100 : 0;

    let statusKey = 'Stable';
    if (equityRatio > 70) statusKey = 'Wealthy';
    else if (equityRatio < 30) statusKey = 'Strained';

    return (
        <div className="apple-card p-10 rounded-[3rem] bg-gradient-to-br from-[#1D1D1F] to-[#2C2C2E] dark:from-[#0A0A0B] dark:to-[#1D1D1F] overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32 opacity-50 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-10">
                <div className="space-y-4 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-3">
                        <Sparkles className="text-emerald-400" size={20} />
                        <h3 className="text-gray-400 font-bold uppercase tracking-widest text-xs">{t('inputs.netWorth.title')}</h3>
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm font-semibold mb-2">{t('inputs.netWorth.currentNetWorth')}</p>
                        <h2 className={`text-4xl sm:text-6xl font-black transition-all ${isPrivacyMode ? 'blur-sm' : ''} ${netWorth >= 0 ? 'text-white' : 'text-rose-500'}`}>
                            {symbol}{formatValue(netWorth)}
                        </h2>
                    </div>
                    <div className="flex gap-4 pt-2">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5 backdrop-blur-md">
                            <ShieldCheck className="text-emerald-500" size={16} />
                            <span className="text-xs font-bold text-emerald-500">{t(`inputs.netWorth.status.${statusKey}`)}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 w-full sm:w-auto">
                    <div className="apple-card !bg-white/5 !border-white/5 p-6 rounded-3xl space-y-2 text-center sm:text-left min-w-[160px]">
                        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-tighter">{t('inputs.netWorth.totalAssets')}</p>
                        <p className="text-2xl font-bold text-white">{symbol}{formatValue(totalAssets)}</p>
                        <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden mt-3">
                            <div className="h-full bg-emerald-500" style={{ width: '100%' }} />
                        </div>
                    </div>
                    <div className="apple-card !bg-white/5 !border-white/5 p-6 rounded-3xl space-y-2 text-center sm:text-left min-w-[160px]">
                        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-tighter">{t('inputs.netWorth.totalLiabilities')}</p>
                        <p className="text-2xl font-bold text-rose-500">{symbol}{formatValue(totalLiabilities)}</p>
                        <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden mt-3">
                            <div className="h-full bg-rose-500" style={{ width: `${Math.min((totalLiabilities / Math.max(totalAssets, 1)) * 100, 100)}%` }} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
