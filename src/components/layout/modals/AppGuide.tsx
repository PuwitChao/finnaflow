import React from 'react';
import { useI18n } from '../../../i18n';
import { Info, BookOpen, Target } from 'lucide-react';

export const AppGuide: React.FC = () => {
    const { t } = useI18n();

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8 mb-10 sm:mb-20">
            <div className="apple-card p-6 sm:p-10 rounded-[1.5rem] sm:rounded-[2.5rem] group hover:scale-[1.02] transition-all duration-500">
                <div className="w-12 h-12 bg-[#007AFF] text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-blue-500/20">
                    <Info size={24} strokeWidth={2.5} />
                </div>
                <h3 className="text-xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] mb-4 tracking-tight">{t('guide.howItWorks.title')}</h3>
                <p className="text-[15px] text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                    {t('guide.howItWorks.description')}
                </p>
            </div>

            <div className="apple-card p-6 sm:p-10 rounded-[1.5rem] sm:rounded-[2.5rem] group hover:scale-[1.02] transition-all duration-500">
                <div className="w-12 h-12 bg-[#FF9500] text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-orange-500/20">
                    <BookOpen size={24} strokeWidth={2.5} />
                </div>
                <h3 className="text-xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] mb-4 tracking-tight">{t('guide.fillingInputs.title')}</h3>
                <p className="text-[15px] text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                    {t('guide.fillingInputs.description')}
                </p>
            </div>

            <div className="apple-card p-6 sm:p-10 rounded-[1.5rem] sm:rounded-[2.5rem] group hover:scale-[1.02] transition-all duration-500">
                <div className="w-12 h-12 bg-[#34C759] text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-green-500/20">
                    <Target size={24} strokeWidth={2.5} />
                </div>
                <h3 className="text-xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] mb-4 tracking-tight">{t('guide.smartAnalysis.title')}</h3>
                <p className="text-[15px] text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                    {t('guide.smartAnalysis.description')}
                </p>
            </div>
        </div>
    );
};
