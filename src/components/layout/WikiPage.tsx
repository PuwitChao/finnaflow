import React from 'react';
import { useI18n } from '../../i18n';
import { ArrowLeft, Book, FileText, Globe, ShieldCheck, ChevronRight } from 'lucide-react';

interface WikiPageProps {
    onBack: () => void;
}

export const WikiPage: React.FC<WikiPageProps> = ({ onBack }) => {
    const { t } = useI18n();

    return (
        <div className="max-w-4xl mx-auto py-8 sm:py-16 px-4 sm:px-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <button
                onClick={onBack}
                className="flex items-center gap-3 text-[#007AFF] hover:opacity-70 transition-all mb-16 font-semibold"
            >
                <ArrowLeft size={20} strokeWidth={2.5} />
                <span>{t('wiki.back')}</span>
            </button>

            <header className="mb-20">
                <div className="flex items-center gap-6 mb-4">
                    <div className="w-16 h-16 bg-[#F5F5F7] dark:bg-[#1C1C1E] rounded-2xl flex items-center justify-center text-[#1D1D1F] dark:text-[#F5F5F7]">
                        <Book size={32} strokeWidth={2} />
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">{t('wiki.title')}</h1>
                </div>
                <p className="text-xl text-gray-500 dark:text-gray-400 font-medium max-w-2xl leading-relaxed">
                    {t('wiki.subtitle')}
                </p>
            </header>

            <div className="space-y-16">
                {/* Section 1: CSV Guide */}
                <section>
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-10 h-10 bg-[#FF9500]/10 text-[#FF9500] rounded-xl flex items-center justify-center">
                            <FileText size={22} strokeWidth={2.5} />
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">{t('wiki.csv.title')}</h2>
                    </div>
                    <div className="apple-card rounded-[1.5rem] sm:rounded-[2.5rem] p-6 sm:p-10 space-y-8">
                        <p className="text-[17px] text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                            {t('wiki.csv.description')}
                        </p>

                        <div className="bg-[#1D1D1F] rounded-2xl p-6 overflow-hidden">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-2.5 h-2.5 rounded-full bg-[#FF3B30]/40" />
                                <div className="w-2.5 h-2.5 rounded-full bg-[#FF9500]/40" />
                                <div className="w-2.5 h-2.5 rounded-full bg-[#34C759]/40" />
                            </div>
                            <code className="text-[#34C759] text-[15px] font-mono leading-none">Type,Name,Amount,Frequency,Category</code>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-5">
                                <h4 className="text-[13px] font-bold uppercase tracking-wider text-gray-400">{t('wiki.csv.columns')}</h4>
                                <ul className="space-y-4">
                                    {[t('wiki.csv.col_type'), t('wiki.csv.col_frequency'), t('wiki.csv.col_category')].map((item, i) => (
                                        <li key={i} className="flex items-center gap-4">
                                            <ChevronRight size={14} className="text-[#007AFF]" />
                                            <span className="text-[15px] font-semibold text-gray-600 dark:text-gray-300">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="space-y-5">
                                <h4 className="text-[13px] font-bold uppercase tracking-wider text-gray-400">{t('wiki.csv.practices')}</h4>
                                <ul className="space-y-4">
                                    {[t('wiki.csv.noCurrency'), t('wiki.csv.saveUtf8'), t('wiki.csv.useQuotes')].map((item, i) => (
                                        <li key={i} className="flex items-center gap-4">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#FF9500]" />
                                            <span className="text-[15px] font-medium text-gray-500 dark:text-gray-400">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 2: Resilience Engine */}
                <section>
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-10 h-10 bg-[#34C759]/10 text-[#34C759] rounded-xl flex items-center justify-center">
                            <ShieldCheck size={22} strokeWidth={2.5} />
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">{t('wiki.resilience.title')}</h2>
                    </div>
                    <div className="apple-card rounded-[1.5rem] sm:rounded-[2.5rem] p-6 sm:p-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-4">
                                <h4 className="text-xl font-bold dark:text-white">{t('wiki.resilience.inflation.title')}</h4>
                                <p className="text-[15px] text-gray-500 leading-relaxed font-medium">
                                    {t('wiki.resilience.inflation.description')}
                                </p>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-xl font-bold dark:text-white">{t('wiki.resilience.market.title')}</h4>
                                <p className="text-[15px] text-gray-500 leading-relaxed font-medium">
                                    {t('wiki.resilience.market.description')}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 3: Privacy */}
                <section>
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-10 h-10 bg-[#007AFF]/10 text-[#007AFF] rounded-xl flex items-center justify-center">
                            <Globe size={22} strokeWidth={2.5} />
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">{t('wiki.privacy.title')}</h2>
                    </div>
                    <div className="bg-[#1D1D1F] dark:bg-[#1C1C1E] text-white rounded-[1.5rem] sm:rounded-[2.5rem] p-8 sm:p-12 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-12 opacity-5 scale-125 transition-transform duration-1000 group-hover:rotate-12">
                            <ShieldCheck size={200} />
                        </div>
                        <div className="relative z-10 max-w-xl">
                            <p className="text-lg font-medium leading-relaxed mb-10 text-gray-300">
                                {t('wiki.privacy.description')}
                            </p>
                            <div className="flex gap-4">
                                {[t('wiki.privacy.noTracking'), t('wiki.privacy.noCloud')].map((badge, i) => (
                                    <div key={i} className="px-5 py-2.5 bg-white/10 rounded-full text-xs font-bold border border-white/10">
                                        {badge}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <footer className="mt-16 sm:mt-32 pt-10 sm:pt-16 border-t border-[#F5F5F7] dark:border-white/5 text-center space-y-4">
                <div className="w-11 h-11 bg-[#F5F5F7] dark:bg-[#1C1C1E] rounded-xl flex items-center justify-center text-gray-300 font-bold italic mx-auto">FF</div>
                <p className="text-[15px] font-medium text-gray-400">
                    {t('wiki.footer')}
                </p>
                <p className="text-[11px] text-gray-300 dark:text-gray-600 font-medium leading-relaxed max-w-xl mx-auto">
                    {t('wiki.disclaimer')}
                </p>
                <p className="text-[11px] text-gray-300 dark:text-gray-600 font-medium">
                    {t('footer.copyright')}
                </p>
            </footer>
        </div>
    );
};
