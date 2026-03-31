import React from 'react';
import { useI18n } from '../../../i18n';
import { 
    ArrowLeft, 
    Sparkles, 
    Zap, 
    Rocket, 
    ShieldCheck, 
    ChevronRight, 
    Book, 
    MousePointer2, 
    Fingerprint 
} from 'lucide-react';

interface UserGuideViewProps {
    onBack: () => void;
}

export const UserGuideView: React.FC<UserGuideViewProps> = ({ onBack }) => {
    const { t } = useI18n();

    const sections = [
        {
            id: 'ingestion',
            title: 'Intelligent Ingestion',
            icon: <Sparkles className="text-blue-500" size={24} />,
            subtitle: 'Stop Manual Entry. Start Pasting.',
            content: "FinnaFlow's 'Batch Paste' feature uses a locally-run heuristic engine to extract merchant names, dates, and amounts from your bank statements automatically.",
            steps: [
                'Copy transaction history from your bank app (K PLUS, SCB, GrabPay).',
                'Open Batch Paste in the header and paste the text.',
                'Wait for the engine to simplify titles (e.g., removing reference codes).',
                'Review detected types (Income vs Expense) and import instantly.'
            ]
        },
        {
            id: 'batch',
            title: 'High-Efficiency Batch Editing',
            icon: <Zap className="text-amber-500" size={24} />,
            subtitle: 'Mass Management Engine',
            content: 'Categorize hundreds of transactions in seconds using the dynamic multi-selection toolbar.',
            steps: [
                'Select items by clicking them in the Dashboard list.',
                'Use "Select All" for rapid list moves.',
                'Use the Floating Toolbar to change categories or delete multiple items securely.'
            ]
        },
        {
            id: 'fire',
            title: 'Financial Freedom Roadmap',
            icon: <Rocket className="text-purple-500" size={24} />,
            subtitle: 'The 4% Rule & Projections',
            content: 'Calculate your retirement velocity using live data from your dashboard assets and monthly surplus.',
            steps: [
                'Set your expected market ROI (e.g., 7%).',
                'Track your "Freedom Number" calculated from current expenses.',
                'Simulate economic shocks in Projection Mode to test your resilience.'
            ]
        }
    ];

    return (
        <div className="max-w-5xl mx-auto py-8 sm:py-16 px-4 sm:px-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Header Navigation */}
            <nav className="flex items-center justify-between mb-16 sm:mb-24 sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-xl py-4 z-50 rounded-2xl border border-white/20">
                <button
                    onClick={onBack}
                    className="flex items-center gap-3 text-[#007AFF] hover:opacity-70 transition-all font-semibold px-4"
                >
                    <ArrowLeft size={20} strokeWidth={2.5} />
                    <span>{t('wiki.back')}</span>
                </button>
                <div className="flex items-center gap-2 pr-4">
                    <Book size={18} className="text-gray-400" />
                    <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">User Guide</span>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="text-center mb-24 sm:mb-32">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 text-blue-500 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8">
                    <Fingerprint size={12} />
                    Version 2.2.0-Alpha
                </div>
                <h1 className="text-5xl sm:text-7xl font-black tracking-tighter text-[#1D1D1F] dark:text-[#F5F5F7] mb-8 leading-[0.9]">
                    Master Your <br />
                    <span className="text-blue-500">Financial Flow.</span>
                </h1>
                <p className="text-xl sm:text-2xl text-gray-500 dark:text-gray-400 font-medium max-w-3xl mx-auto leading-relaxed">
                    A professional-grade guide to Intelligent Ingestion, Batch Management, and Financial Freedom with FinnaFlow.
                </p>
            </header>

            {/* Main Content Sections */}
            <div className="space-y-24 sm:space-y-32">
                {sections.map((section) => (
                    <section key={section.id} id={section.id} className="scroll-mt-32 group">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-12 h-12 bg-white dark:bg-white/5 rounded-2xl shadow-xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500">
                                {section.icon}
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">{section.title}</h2>
                                <p className="text-sm font-bold text-blue-500 uppercase tracking-widest mt-0.5">{section.subtitle}</p>
                            </div>
                        </div>

                        <div className="apple-card rounded-[2.5rem] p-8 sm:p-14 space-y-10 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-16 opacity-[0.03] text-gray-900 dark:text-white pointer-events-none group-hover:rotate-12 transition-transform duration-1000">
                                {section.icon}
                            </div>
                            
                            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 font-medium leading-relaxed max-w-2xl">
                                {section.content}
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <ul className="space-y-6">
                                    {section.steps.map((step, i) => (
                                        <li key={i} className="flex items-start gap-4 animate-in fade-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                                            <div className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 mt-0.5">
                                                <ChevronRight size={14} strokeWidth={3} />
                                            </div>
                                            <span className="text-[16px] font-semibold text-gray-500 dark:text-gray-400">{step}</span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="hidden md:flex items-center justify-center p-8 bg-gray-50 dark:bg-white/5 rounded-[2rem] border border-dashed border-gray-200 dark:border-white/10">
                                    <div className="text-center space-y-3 opacity-40">
                                        <MousePointer2 className="mx-auto" size={32} />
                                        <p className="text-[10px] font-black uppercase tracking-widest">Interactive Tutorial Coming Soon</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                ))}

                {/* Privacy Section */}
                <section id="privacy" className="scroll-mt-32">
                    <div className="bg-[#1D1D1F] dark:bg-[#1C1C1E] text-white rounded-[3rem] p-10 sm:p-20 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-20 opacity-5 scale-125 transition-transform duration-1000 group-hover:rotate-12">
                            <ShieldCheck size={260} />
                        </div>
                        <div className="relative z-10 max-w-2xl">
                            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-10 border border-white/10">
                                <ShieldCheck size={32} className="text-blue-400" />
                            </div>
                            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-8">Zero-Server, <br />Local-First.</h2>
                            <p className="text-xl font-medium leading-relaxed mb-12 text-gray-400">
                                Your financial data is yours. FinnaFlow performs all calculations and storage within your local browser's memory and storage. No data is ever sent to a server.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                {['Local Heuristic Processing', 'No Tracking', 'Offline JSON/CSV Backups'].map((badge, i) => (
                                    <div key={i} className="px-6 py-3 bg-white/5 rounded-full text-xs font-bold border border-white/10 hover:bg-white/10 transition-colors">
                                        {badge}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Footer */}
            <footer className="mt-32 sm:mt-48 pt-16 border-t border-[#F5F5F7] dark:border-white/5 text-center space-y-6">
                <div className="w-12 h-12 bg-[#F5F5F7] dark:bg-[#1C1C1E] rounded-2xl flex items-center justify-center text-gray-300 font-bold italic mx-auto">FF</div>
                <p className="text-[18px] font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                    Mastering the complexity of modern finance.
                </p>
                <div className="space-y-1">
                    <p className="text-[12px] font-medium text-gray-400 uppercase tracking-widest">© 2026 FinnaFlow • Professional Financial Privacy</p>
                    <p className="text-[11px] text-gray-500/60 font-medium">Apple-Style Guidelines / Professional Visual Visualization</p>
                </div>
            </footer>
        </div>
    );
};
