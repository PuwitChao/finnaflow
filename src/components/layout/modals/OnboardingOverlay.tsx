import React from 'react';
import { useFinanceStore } from '../../../store/useFinanceStore';
import { SUPPORTED_CURRENCIES, Currency } from '../../../utils/currencies';
import { useI18n } from '../../../i18n';
import { Sparkles, Globe, Coins, ChevronDown, Activity } from 'lucide-react';

export const OnboardingOverlay: React.FC = () => {
    const { t, language, setLanguage } = useI18n();
    const { currency, setCurrency, setPreferencesSet } = useFinanceStore();

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-white/80 dark:bg-black/80 backdrop-blur-3xl animate-in fade-in duration-700">
            <div className="max-w-2xl w-full apple-card p-10 sm:p-16 rounded-[3rem] shadow-2xl border border-gray-100 dark:border-white/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -ml-32 -mb-32" />

                <div className="relative z-10 text-center space-y-8">
                    <div className="space-y-4">
                        <div className="w-20 h-20 bg-blue-500 rounded-[2rem] mx-auto flex items-center justify-center text-white shadow-xl shadow-blue-500/20 mb-8">
                            <Sparkles size={40} strokeWidth={2.5} />
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-[#1D1D1F] dark:text-white">
                            {t('onboarding.title')}
                        </h1>
                        <p className="text-lg text-gray-500 dark:text-gray-300 font-medium max-w-md mx-auto leading-relaxed">
                            {t('onboarding.subtitle')}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-left mt-12">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-blue-500 font-bold ml-1">
                                <Globe size={20} />
                                <span className="text-sm uppercase tracking-widest">{t('onboarding.language')}</span>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setLanguage('en')}
                                    className={`flex-1 py-4 rounded-2xl font-bold transition-all ${language === 'en' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400'}`}
                                >
                                    English
                                </button>
                                <button
                                    onClick={() => setLanguage('th')}
                                    className={`flex-1 py-4 rounded-2xl font-bold transition-all ${language === 'th' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400'}`}
                                >
                                    ไทย
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-purple-500 font-bold ml-1">
                                <Coins size={20} />
                                <span className="text-sm uppercase tracking-widest">{t('onboarding.currency')}</span>
                            </div>
                            <div className="relative">
                                <select
                                    value={currency}
                                    onChange={(e) => setCurrency(e.target.value)}
                                    className="w-full apple-input !bg-gray-100 dark:!bg-white/10 !border-none py-4 appearance-none cursor-pointer pr-10 font-bold text-lg text-[#1D1D1F] dark:text-white"
                                >
                                    {SUPPORTED_CURRENCIES.map((curr: Currency) => (
                                        <option key={curr.code} value={curr.code} className="bg-white dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-white">{curr.code} - {curr.name}</option>
                                    ))}
                                </select>
                                <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    <div className="pt-10">
                        <button
                            onClick={() => setPreferencesSet(true)}
                            className="w-full py-6 rounded-3xl bg-[#1D1D1F] dark:bg-white text-white dark:text-black font-black text-xl shadow-xl shadow-black/10 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 group"
                        >
                            {t('onboarding.continue')}
                            <Activity size={24} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                        <p className="mt-6 text-xs text-gray-400 font-medium">
                            {t('onboarding.privacyNote')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
