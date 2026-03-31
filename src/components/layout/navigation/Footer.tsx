import React from 'react';
import { useFinanceStore } from '../../../store/useFinanceStore';
import { useI18n } from '../../../i18n';
import { PieChart, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
    const { t, language } = useI18n();
    const { lastUpdated } = useFinanceStore();

    return (
        <footer className="max-w-7xl mx-auto py-16 sm:py-32 border-t border-gray-200 dark:border-white/5 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 sm:gap-24">
                <div className="space-y-6">
                    <div className="flex items-center gap-4 text-[#007AFF]">
                        <PieChart size={24} strokeWidth={2.5} />
                        <h2 className="text-xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">{t('footer.budgeting.title')}</h2>
                    </div>
                    <p className="text-[15px] leading-relaxed text-slate-500 dark:text-slate-400 font-medium">
                        {t('footer.budgeting.description')}
                    </p>
                </div>
                <div className="space-y-6">
                    <div className="flex items-center gap-4 text-[#34C759]">
                        <ShieldCheck size={24} strokeWidth={2.5} />
                        <h2 className="text-xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">{t('footer.privacy.title')}</h2>
                    </div>
                    <p className="text-[15px] leading-relaxed text-slate-500 dark:text-slate-400 font-medium">
                        {t('footer.privacy.description')}
                    </p>
                </div>
                <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#007AFF]/10 to-[#AF52DE]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 rounded-[2rem] sm:rounded-[2.5rem] blur-xl" />
                    <div className="relative flex flex-col items-center justify-center p-8 sm:p-12 apple-card rounded-[1.5rem] sm:rounded-[2.5rem] border border-gray-100 dark:border-white/5">
                        <div className="w-16 h-16 bg-white dark:bg-white/10 rounded-2xl flex items-center justify-center text-[#1D1D1F] dark:text-white font-black italic text-2xl shadow-sm mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                            FF
                        </div>
                        <p className="text-[14px] font-bold text-[#1D1D1F] dark:text-[#F5F5F7] text-center mb-1 tracking-tight">FinnaFlow</p>
                        <p className="text-[12px] font-medium text-slate-400 text-center">{t('footer.tagline')}</p>
                    </div>
                </div>
            </div>
            <div className="mt-20 sm:mt-32 pt-12 border-t border-gray-200 dark:border-white/5">
                <div className="flex flex-col items-center gap-8">
                    <div className="flex flex-col items-center gap-2">
                        <p className="text-[13px] font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">{t('footer.copyright')}</p>
                        <div className="flex items-center gap-3">
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t('footer.version')}</p>
                            {lastUpdated && (
                                <>
                                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                                        {t('inputs.lastUpdated')}: {new Date(lastUpdated).toLocaleTimeString(language === 'th' ? 'th-TH' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </>
                            )}
                        </div>
                    </div>

                    <p className="text-[11px] leading-relaxed text-slate-400 dark:text-slate-500 font-medium max-w-3xl mx-auto text-center px-6">
                        {t('footer.disclaimer')}
                    </p>
                </div>
            </div>
        </footer>
    );
};
