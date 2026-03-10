import React, { useState, useEffect, useRef } from 'react';
import { useFinanceStore, FinanceItem, Frequency, Category } from './store/useFinanceStore';
import { useI18n, Language } from './i18n';
import { SankeyChart } from './components/viz/SankeyChart';
import { ProjectorPanel } from './components/viz/ProjectorPanel';
import { AppGuide } from './components/layout/AppGuide';
import { WikiPage } from './components/layout/WikiPage';
import { exportToCSV, parseCSV } from './utils/csvProcessor';
import { getCurrencySymbol, SUPPORTED_CURRENCIES } from './utils/currencies';
import { Plus, Trash2, Wallet, PieChart, Activity, Sun, Moon, RefreshCw, LogOut, Globe, Download, Upload, FileText, HelpCircle, Coins, Sparkles, ChevronDown, ShieldCheck, Copy, Calendar } from 'lucide-react';

const FinanceInput = ({ type }: { type: 'income' | 'expense' }) => {
    const { incomeItems, expenseItems, addIncome, addExpense, removeIncome, removeExpense, showNotification, currency, duplicateItem } = useFinanceStore();
    const { t } = useI18n();
    const symbol = getCurrencySymbol(currency);

    const items = type === 'income' ? incomeItems : expenseItems;
    const onAdd = type === 'income' ? addIncome : addExpense;
    const onRemove = type === 'income' ? removeIncome : removeExpense;

    const [name, setName] = useState('');
    const [customName, setCustomName] = useState('');
    const [isCustomLabelMode, setIsCustomLabelMode] = useState(false);
    const [amount, setAmount] = useState('');
    const [frequency, setFrequency] = useState<Frequency>('Monthly');
    const [category, setCategory] = useState<Category>('Needs');
    const [customCategory, setCustomCategory] = useState('');
    const [isCustomMode, setIsCustomMode] = useState(false);
    const [endDate, setEndDate] = useState('');

    const handleAdd = () => {
        const finalName = isCustomLabelMode ? (customName || t('inputs.labels.defaultItem')) : (name || t('inputs.labels.defaultItem'));
        if (!amount) return;
        const finalCategory = isCustomMode ? (customCategory || t('inputs.labels.defaultCategory')) : category;
        onAdd({
            id: crypto.randomUUID(),
            name: finalName,
            amount: parseFloat(amount),
            frequency,
            category: finalCategory,
            startDate: new Date().toISOString().split('T')[0],
            endDate: endDate || undefined
        });
        showNotification(t('inputs.itemAdded'), 'success');
        setName('');
        setCustomName('');
        setIsCustomLabelMode(false);
        setAmount('');
        setEndDate('');
        if (isCustomMode) {
            setCustomCategory('');
            setIsCustomMode(false);
            setCategory('Needs');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleAdd();
    };

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        if (val === 'Custom') setIsCustomMode(true);
        else { setCategory(val); setIsCustomMode(false); }
    };

    const title = type === 'income' ? t('inputs.income.title') : t('inputs.expense.title');
    const placeholder = type === 'income' ? t('inputs.income.placeholder') : t('inputs.expense.placeholder');
    const addButton = type === 'income' ? t('inputs.income.addButton') : t('inputs.expense.addButton');

    return (
        <div className="apple-card p-6 sm:p-10 rounded-[1.5rem] sm:rounded-[2.5rem] flex flex-col h-full transition-all duration-500 overflow-hidden relative group/card">
            <div className="flex items-center justify-between mb-6 sm:mb-10">
                <div className="flex items-center gap-4">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${type === 'income' ? 'bg-blue-500 text-white' : 'bg-rose-500 text-white'}`}>
                        {type === 'income' ? <Wallet size={22} strokeWidth={2} /> : <Activity size={22} strokeWidth={2} />}
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">{title}</h2>
                </div>
            </div>

            <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-10 relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    <div className="space-y-2">
                        <div className="flex flex-col ml-1">
                            <label className="text-[13px] font-semibold text-gray-400">{t('inputs.labels.label')}</label>
                            <span className="text-[10px] text-gray-300 dark:text-gray-500 mb-1">{t('inputs.hints.label')}</span>
                        </div>
                        <div className="relative group/label">
                            {isCustomLabelMode ? (
                                <input autoFocus type="text" placeholder={placeholder} value={customName} onChange={(e) => setCustomName(e.target.value)} onKeyDown={handleKeyDown} onBlur={() => { if (!customName) setIsCustomLabelMode(false); }} className="w-full apple-input" />
                            ) : (
                                <div className="relative">
                                    <select value={name} onChange={(e) => { if (e.target.value === 'Custom') setIsCustomLabelMode(true); else setName(e.target.value); }} className="w-full apple-input appearance-none cursor-pointer pr-10">
                                        <option value="">{t('inputs.labels.label')}...</option>
                                        {type === 'income' ? (
                                            <>
                                                <option value={t('inputs.income.common.Salary')}>{t('inputs.income.common.Salary')}</option>
                                                <option value={t('inputs.income.common.Freelance')}>{t('inputs.income.common.Freelance')}</option>
                                                <option value={t('inputs.income.common.Dividends')}>{t('inputs.income.common.Dividends')}</option>
                                                <option value={t('inputs.income.common.Gift')}>{t('inputs.income.common.Gift')}</option>
                                                <option value={t('inputs.income.common.Business')}>{t('inputs.income.common.Business')}</option>
                                            </>
                                        ) : (
                                            <>
                                                <option value={t('inputs.expense.common.Rent')}>{t('inputs.expense.common.Rent')}</option>
                                                <option value={t('inputs.expense.common.Groceries')}>{t('inputs.expense.common.Groceries')}</option>
                                                <option value={t('inputs.expense.common.Utilities')}>{t('inputs.expense.common.Utilities')}</option>
                                                <option value={t('inputs.expense.common.Transport')}>{t('inputs.expense.common.Transport')}</option>
                                                <option value={t('inputs.expense.common.Health')}>{t('inputs.expense.common.Health')}</option>
                                                <option value={t('inputs.expense.common.Fun')}>{t('inputs.expense.common.Fun')}</option>
                                                <option value={t('inputs.expense.common.Subscription')}>{t('inputs.expense.common.Subscription')}</option>
                                                <option value={t('inputs.expense.common.Shopping')}>{t('inputs.expense.common.Shopping')}</option>
                                            </>
                                        )}
                                        <option value="Custom">{t('inputs.income.common.Custom')}</option>
                                    </select>
                                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex flex-col ml-1">
                            <label className="text-[13px] font-semibold text-gray-400">{t('inputs.labels.value')}</label>
                            <span className="text-[10px] text-gray-300 dark:text-gray-500 mb-1">{t('inputs.hints.amount')}</span>
                        </div>
                        <input type="number" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} onKeyDown={handleKeyDown} className="w-full apple-input" />
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    <div className="space-y-2">
                        <div className="flex flex-col ml-1">
                            <label className="text-[13px] font-semibold text-gray-400">{t('inputs.labels.frequency')}</label>
                        </div>
                        <select value={frequency} onChange={(e) => setFrequency(e.target.value as Frequency)} className="w-full apple-input pr-10">
                            <option value="Weekly">{t('frequency.Weekly')}</option>
                            <option value="Monthly">{t('frequency.Monthly')}</option>
                            <option value="Yearly">{t('frequency.Yearly')}</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <div className="flex flex-col ml-1">
                            <label className="text-[13px] font-semibold text-gray-400">{t('inputs.labels.bucket')}</label>
                        </div>
                        {isCustomMode ? (
                            <input autoFocus type="text" placeholder="..." value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} onKeyDown={handleKeyDown} onBlur={() => { if (!customCategory) setIsCustomMode(false); }} className="w-full apple-input" />
                        ) : (
                            <select value={category} onChange={handleCategoryChange} className="w-full apple-input appearance-none pr-10">
                                <option value="Needs">{t('category.Needs')}</option>
                                <option value="Wants">{t('category.Wants')}</option>
                                <option value="Savings">{t('category.Savings')}</option>
                                <option value="Investments">{t('category.Investments')}</option>
                                <option value="Debt">{t('category.Debt')}</option>
                                <option value="Custom">{t('category.Custom')}</option>
                            </select>
                        )}
                    </div>
                </div>
                <button onClick={handleAdd} className="apple-button-primary w-full py-4 mt-2">
                    <Plus size={18} strokeWidth={2.5} />
                    {addButton}
                </button>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[250px] sm:max-h-[350px] space-y-3 scrollbar-hide pr-1 pb-4 relative z-10">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <p className="text-sm font-semibold text-gray-300 dark:text-gray-600">{t('inputs.noItems')}</p>
                    </div>
                ) : (
                    items.map((item) => (
                        <div key={item.id} className="group flex items-center justify-between p-5 rounded-2xl bg-white/50 dark:bg-[#2C2C2E]/50 hover:bg-white transition-all duration-300">
                            <div className="flex flex-col">
                                <span className="font-semibold text-[15px] text-[#1D1D1F] dark:text-[#F5F5F7]">{item.name}</span>
                                <div className="flex items-center gap-3 mt-1.5">
                                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{symbol}{item.amount.toLocaleString()} / {t(`frequency.${item.frequency}`)}</span>
                                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold border ${item.category === 'Needs' ? 'bg-blue-50 text-blue-500 border-blue-100 dark:bg-blue-500/10 dark:border-blue-500/20' :
                                        item.category === 'Wants' ? 'bg-rose-50 text-rose-500 border-rose-100 dark:bg-rose-500/10 dark:border-rose-500/20' :
                                            item.category === 'Savings' ? 'bg-emerald-50 text-emerald-500 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20' :
                                                'bg-purple-50 text-purple-500 border-purple-100 dark:bg-purple-500/10 dark:border-purple-500/20'
                                        }`}>
                                        {t(`category.${item.category}`)}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                                <button onClick={() => duplicateItem(item.id, type)} className="p-2 text-gray-300 hover:text-blue-500"><Copy size={16} /></button>
                                <button onClick={() => onRemove(item.id)} className="p-2 text-gray-300 hover:text-rose-500"><Trash2 size={18} /></button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

const NetWorthInput = ({ type }: { type: 'asset' | 'liability' }) => {
    const { assetItems, liabilityItems, addAsset, addLiability, removeAsset, removeLiability, showNotification, currency, duplicateItem } = useFinanceStore();
    const { t } = useI18n();
    const symbol = getCurrencySymbol(currency);

    const items = type === 'asset' ? assetItems : liabilityItems;
    const onAdd = type === 'asset' ? addAsset : addLiability;
    const onRemove = type === 'asset' ? removeAsset : removeLiability;

    const [name, setName] = useState('');
    const [customName, setCustomName] = useState('');
    const [isCustomLabelMode, setIsCustomLabelMode] = useState(false);
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState<string>('Other');

    const handleAdd = () => {
        const finalName = isCustomLabelMode ? (customName || t('inputs.labels.defaultItem')) : (name || t('inputs.labels.defaultItem'));
        if (!amount) return;
        onAdd({
            id: crypto.randomUUID(),
            name: finalName,
            amount: parseFloat(amount),
            category,
        });
        showNotification(t('inputs.itemAdded'), 'success');
        setName('');
        setCustomName('');
        setIsCustomLabelMode(false);
        setAmount('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleAdd();
    };

    const title = type === 'asset' ? t('inputs.assets.title') : t('inputs.liabilities.title');
    const placeholder = type === 'asset' ? t('inputs.assets.placeholder') : t('inputs.liabilities.placeholder');
    const addButton = type === 'asset' ? t('inputs.assets.addButton') : t('inputs.liabilities.addButton');

    return (
        <div className="apple-card p-6 sm:p-10 rounded-[1.5rem] sm:rounded-[2.5rem] flex flex-col h-full transition-all duration-500 overflow-hidden relative group/card">
            <div className="flex items-center justify-between mb-6 sm:mb-10">
                <div className="flex items-center gap-4">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${type === 'asset' ? 'bg-emerald-500 text-white' : 'bg-purple-600 text-white'}`}>
                        {type === 'asset' ? <Sparkles size={22} strokeWidth={2} /> : <ShieldCheck size={22} strokeWidth={2} />}
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">{title}</h2>
                </div>
            </div>

            <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-10 relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    <div className="space-y-2">
                        <div className="flex flex-col ml-1">
                            <label className="text-[13px] font-semibold text-gray-400">{t('inputs.labels.label')}</label>
                        </div>
                        <div className="relative group/label">
                            {isCustomLabelMode ? (
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder={placeholder}
                                    value={customName}
                                    onChange={(e) => setCustomName(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    onBlur={() => { if (!customName) setIsCustomLabelMode(false); }}
                                    className="w-full apple-input"
                                />
                            ) : (
                                <div className="relative">
                                    <select
                                        value={name}
                                        onChange={(e) => {
                                            if (e.target.value === 'Custom') setIsCustomLabelMode(true);
                                            else setName(e.target.value);
                                        }}
                                        className="w-full apple-input appearance-none cursor-pointer pr-10"
                                    >
                                        <option value="">{t('inputs.labels.label')}...</option>
                                        {type === 'asset' ? (
                                            <>
                                                <option value={t('inputs.assets.common.Cash')}>{t('inputs.assets.common.Cash')}</option>
                                                <option value={t('inputs.assets.common.Investments')}>{t('inputs.assets.common.Investments')}</option>
                                                <option value={t('inputs.assets.common.Property')}>{t('inputs.assets.common.Property')}</option>
                                                <option value={t('inputs.assets.common.Crypto')}>{t('inputs.assets.common.Crypto')}</option>
                                                <option value={t('inputs.assets.common.Collectibles')}>{t('inputs.assets.common.Collectibles')}</option>
                                            </>
                                        ) : (
                                            <>
                                                <option value={t('inputs.liabilities.common.Mortgage')}>{t('inputs.liabilities.common.Mortgage')}</option>
                                                <option value={t('inputs.liabilities.common.CreditCard')}>{t('inputs.liabilities.common.CreditCard')}</option>
                                                <option value={t('inputs.liabilities.common.CarLoan')}>{t('inputs.liabilities.common.CarLoan')}</option>
                                                <option value={t('inputs.liabilities.common.StudentLoan')}>{t('inputs.liabilities.common.StudentLoan')}</option>
                                                <option value={t('inputs.liabilities.common.PersonalLoan')}>{t('inputs.liabilities.common.PersonalLoan')}</option>
                                            </>
                                        )}
                                        <option value="Custom">{t('inputs.income.common.Custom')}</option>
                                    </select>
                                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex flex-col ml-1">
                            <label className="text-[13px] font-semibold text-gray-400">{t('inputs.labels.value')}</label>
                        </div>
                        <input
                            type="number"
                            placeholder="0"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-full apple-input"
                        />
                    </div>
                </div>
                <button
                    onClick={handleAdd}
                    className={`apple-button-primary w-full py-4 mt-2 !bg-opacity-90 ${type === 'asset' ? 'hover:!bg-emerald-600' : 'hover:!bg-purple-700'}`}
                >
                    <Plus size={18} strokeWidth={2.5} />
                    {addButton}
                </button>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[250px] sm:max-h-[350px] space-y-3 scrollbar-hide pr-1 pb-4 relative z-10">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <p className="text-sm font-semibold text-gray-300 dark:text-gray-600">{t('inputs.noItems')}</p>
                    </div>
                ) : (
                    items.map((item) => (
                        <div
                            key={item.id}
                            className="group flex items-center justify-between p-5 rounded-2xl bg-white/50 dark:bg-[#2C2C2E]/50 hover:bg-white dark:hover:bg-[#2C2C2E] transition-all duration-300 border border-transparent hover:border-gray-100 dark:hover:border-white/5"
                        >
                            <div className="flex flex-col">
                                <span className="font-semibold text-[15px] text-[#1D1D1F] dark:text-[#F5F5F7]">{item.name}</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{symbol}{item.amount.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => duplicateItem(item.id, type)}
                                    className="p-2 text-gray-300 hover:text-blue-500 transition-colors"
                                    title={t('inputs.duplicate') || 'Duplicate'}
                                >
                                    <Copy size={16} />
                                </button>
                                <button
                                    onClick={() => onRemove(item.id)}
                                    className="p-2 text-gray-300 hover:text-rose-500 transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

const NetWorthCard = () => {
    const { assetItems, liabilityItems, currency } = useFinanceStore();
    const { t } = useI18n();
    const symbol = getCurrencySymbol(currency);

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
                        <h2 className={`text-4xl sm:text-6xl font-black transition-colors ${netWorth >= 0 ? 'text-white' : 'text-rose-500'}`}>
                            {symbol}{netWorth.toLocaleString()}
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
                        <p className="text-2xl font-bold text-white">{symbol}{totalAssets.toLocaleString()}</p>
                        <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden mt-3">
                            <div className="h-full bg-emerald-500" style={{ width: '100%' }} />
                        </div>
                    </div>
                    <div className="apple-card !bg-white/5 !border-white/5 p-6 rounded-3xl space-y-2 text-center sm:text-left min-w-[160px]">
                        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-tighter">{t('inputs.netWorth.totalLiabilities')}</p>
                        <p className="text-2xl font-bold text-rose-500">{symbol}{totalLiabilities.toLocaleString()}</p>
                        <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden mt-3">
                            <div className="h-full bg-rose-500" style={{ width: `${Math.min((totalLiabilities / Math.max(totalAssets, 1)) * 100, 100)}%` }} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const OnboardingOverlay = () => {
    const { t, language, setLanguage } = useI18n();
    const { currency, setCurrency, setPreferencesSet } = useFinanceStore();

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-white/80 dark:bg-black/80 backdrop-blur-3xl animate-in fade-in duration-700">
            <div className="max-w-2xl w-full apple-card p-10 sm:p-16 rounded-[3rem] shadow-2xl border border-gray-100 dark:border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -ml-32 -mb-32" />

                <div className="relative z-10 text-center space-y-8">
                    <div className="space-y-4">
                        <div className="w-20 h-20 bg-blue-500 rounded-[2rem] mx-auto flex items-center justify-center text-white shadow-xl shadow-blue-500/20 mb-8">
                            <Sparkles size={40} strokeWidth={2.5} />
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
                            {t('onboarding.title')}
                        </h1>
                        <p className="text-lg text-gray-500 dark:text-gray-400 font-medium max-w-md mx-auto leading-relaxed">
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
                                    className={`flex-1 py-4 rounded-2xl font-bold transition-all ${language === 'en' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20 scale-105' : 'bg-gray-100 dark:bg-white/5 text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'}`}
                                >
                                    English
                                </button>
                                <button
                                    onClick={() => setLanguage('th')}
                                    className={`flex-1 py-4 rounded-2xl font-bold transition-all ${language === 'th' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20 scale-105' : 'bg-gray-100 dark:bg-white/5 text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'}`}
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
                                    className="w-full apple-input !bg-gray-100 dark:!bg-white/5 !border-none py-4 appearance-none cursor-pointer pr-10 font-bold text-lg"
                                >
                                    {SUPPORTED_CURRENCIES.map((curr) => (
                                        <option key={curr.code} value={curr.code}>{curr.code} - {curr.name}</option>
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

function App() {
    const store = useFinanceStore();
    const { incomeItems, expenseItems, assetItems, liabilityItems, isUnlocked, darkMode, toggleTheme, clearSession, hasSetPreferences, lastUpdated } = store;
    const { t, language, setLanguage } = useI18n();

    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showLangMenu, setShowLangMenu] = useState(false);
    const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);
    const [showTemplateMenu, setShowTemplateMenu] = useState(false);
    const [view, setView] = useState<'dashboard' | 'wiki'>('dashboard');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const csvInputRef = useRef<HTMLInputElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);

    // Close dropdown menus when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
                setShowLangMenu(false);
                setShowCurrencyMenu(false);
                setShowTemplateMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    if (!hasSetPreferences) {
        return <OnboardingOverlay />;
    }

    const handleRecalculate = () => {
        setIsRefreshing(true);
        setTimeout(() => setIsRefreshing(false), 800);
    };

    const handleNewSession = () => {
        const confirmMsg = language === 'th' ? 'คุณแน่ใจหรือไม่? ข้อมูลทั้งหมดจะถูกลบ' : 'Are you sure? This will delete all your current financial data.';
        if (window.confirm(confirmMsg)) {
            clearSession();
            store.showNotification(t('header.newSession') || 'Session cleared', 'info');
        }
    };

    const handleLanguageChange = (lang: Language) => {
        setLanguage(lang);
        setShowLangMenu(false);
    };

    // Save session to JSON file
    const handleSave = () => {
        const data = { version: '1.0', incomeItems, expenseItems, isUnlocked, darkMode, language };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `finnaflow-session-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleLoad = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target?.result as string);
                if (data.incomeItems && data.expenseItems) {
                    clearSession();
                    data.incomeItems.forEach((item: FinanceItem) => store.addIncome(item));
                    data.expenseItems.forEach((item: FinanceItem) => store.addExpense(item));
                    if (data.assetItems) data.assetItems.forEach((item: any) => store.addAsset(item));
                    if (data.liabilityItems) data.liabilityItems.forEach((item: any) => store.addLiability(item));
                    store.showNotification(t('file.importSuccess'), 'success');
                }
            } catch { store.showNotification(t('file.importError'), 'error'); }
        };
        reader.readAsText(file);
    };

    const handleCSVExport = () => {
        const csv = exportToCSV(incomeItems, expenseItems, assetItems, liabilityItems);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `finnaflow-data-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleCSVImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const { income, expenses, assets, liabilities } = parseCSV(e.target?.result as string);
                if (income.length > 0 || expenses.length > 0 || assets.length > 0 || liabilities.length > 0) {
                    clearSession();
                    income.forEach(item => store.addIncome(item));
                    expenses.forEach(item => store.addExpense(item));
                    assets.forEach(item => store.addAsset(item));
                    liabilities.forEach(item => store.addLiability(item));
                    store.showNotification(t('file.importSuccess'), 'success');
                }
            } catch { store.showNotification(t('file.importError'), 'error'); }
        };
        reader.readAsText(file);
        event.target.value = '';
    };

    const handleLoadTemplate = (type: 'income15000' | 'income30000') => {
        let income: FinanceItem[];
        let expenses: FinanceItem[];
        let assets: any[] = [];
        let liabilities: any[] = [];

        if (type === 'income15000') {
            income = [
                { id: crypto.randomUUID(), name: t('inputs.income.common.Salary'), amount: 15000, frequency: 'Monthly', category: 'Needs' }
            ];
            expenses = [
                { id: crypto.randomUUID(), name: t('inputs.expense.common.Rent'), amount: 4500, frequency: 'Monthly', category: 'Needs' },
                { id: crypto.randomUUID(), name: t('inputs.expense.common.Groceries'), amount: 3500, frequency: 'Monthly', category: 'Needs' },
                { id: crypto.randomUUID(), name: t('inputs.expense.common.Fun'), amount: 1500, frequency: 'Monthly', category: 'Wants' },
                { id: crypto.randomUUID(), name: t('file.templateItems.emergencyFund'), amount: 1000, frequency: 'Monthly', category: 'Savings' }
            ];
            assets = [
                { id: crypto.randomUUID(), name: t('inputs.assets.common.Cash'), amount: 25000, category: 'Cash' }
            ];
        } else {
            income = [
                { id: crypto.randomUUID(), name: t('inputs.income.common.Salary'), amount: 30000, frequency: 'Monthly', category: 'Needs' },
                { id: crypto.randomUUID(), name: t('inputs.income.common.Dividends'), amount: 2500, frequency: 'Monthly', category: 'Investments' }
            ];
            expenses = [
                { id: crypto.randomUUID(), name: t('inputs.expense.common.Rent'), amount: 8000, frequency: 'Monthly', category: 'Needs' },
                { id: crypto.randomUUID(), name: t('inputs.expense.common.Groceries'), amount: 5000, frequency: 'Monthly', category: 'Needs' },
                { id: crypto.randomUUID(), name: t('inputs.expense.common.Transport'), amount: 2000, frequency: 'Monthly', category: 'Needs' },
                { id: crypto.randomUUID(), name: t('inputs.expense.common.Shopping'), amount: 3000, frequency: 'Monthly', category: 'Wants' },
                { id: crypto.randomUUID(), name: t('file.templateItems.etfPortfolio'), amount: 4000, frequency: 'Monthly', category: 'Investments' },
                { id: crypto.randomUUID(), name: t('file.templateItems.retirementFund'), amount: 2500, frequency: 'Monthly', category: 'Savings' },
                { id: crypto.randomUUID(), name: t('file.templateItems.creditCardPayoff'), amount: 1500, frequency: 'Monthly', category: 'Debt' }
            ];
            assets = [
                { id: crypto.randomUUID(), name: t('inputs.assets.common.Cash'), amount: 50000, category: 'Cash' },
                { id: crypto.randomUUID(), name: t('inputs.assets.common.Investments'), amount: 120000, category: 'Investments' }
            ];
            liabilities = [
                { id: crypto.randomUUID(), name: t('inputs.liabilities.common.CarLoan'), amount: 250000, category: 'CarLoan' }
            ];
        }
        store.loadExampleTemplate({ income, expenses, assets, liabilities });
        store.showNotification(t('file.templateSuccess'), 'success');
        setShowTemplateMenu(false);
    };

    return (
        <div className="min-h-screen p-4 sm:p-6 md:p-14 transition-all duration-500 selection:bg-[#007AFF]/20 selection:text-[#007AFF]">
            <header ref={headerRef} className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-6 sm:gap-10 mb-10 sm:mb-20 relative z-50">
                <div className="flex items-center gap-4 sm:gap-6 group cursor-pointer" onClick={() => setView('dashboard')}>
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#1D1D1F] dark:bg-white rounded-[1.1rem] sm:rounded-[1.4rem] flex items-center justify-center shadow-2xl transition-all group-hover:scale-105 active:scale-95">
                        <PieChart className="text-white dark:text-[#1D1D1F] w-7 h-7 sm:w-9 sm:h-9" strokeWidth={2} />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] leading-none mb-1">{t('app.name')}</h1>
                        <p className="text-[12px] sm:text-[14px] text-gray-500 dark:text-gray-400 font-medium tracking-tight">{t('app.tagline')}</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                    <div className="flex items-center gap-1 p-1 bg-white/40 dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-white/5">
                        <button onClick={handleSave} className="apple-icon-btn" title={t('inputs.hints.save')}><Download size={19} /></button>
                        <button onClick={() => fileInputRef.current?.click()} className="apple-icon-btn" title={t('inputs.hints.load')}><Upload size={19} /></button>
                        <input ref={fileInputRef} type="file" accept=".json" onChange={handleLoad} className="hidden" />
                        <div className="w-[1px] h-6 bg-gray-200 dark:bg-white/10 mx-1" />
                        <button onClick={handleNewSession} className="apple-icon-btn hover:text-[#FF3B30]" title={t('inputs.hints.reset')}><LogOut size={19} /></button>
                        <div className="w-[1px] h-6 bg-gray-200 dark:bg-white/10 mx-1" />
                        <button onClick={handleCSVExport} className="apple-icon-btn" title={t('inputs.hints.csvExport')}><FileText size={19} /></button>
                        <button onClick={() => csvInputRef.current?.click()} className="apple-icon-btn" title={t('inputs.hints.csvImport')}><div className="relative"><FileText size={19} /><div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#FF9500] rounded-full border-2 border-[#F5F5F7] dark:border-[#000000]" /></div></button>
                        <input ref={csvInputRef} type="file" accept=".csv" onChange={handleCSVImport} className="hidden" />
                    </div>

                    <div className="flex items-center gap-1 p-1 bg-white/40 dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-white/5">
                        <button onClick={() => setView('wiki')} className="apple-icon-btn" title={t('inputs.hints.wiki')}><HelpCircle size={19} /></button>
                        <div className="w-[1px] h-6 bg-gray-200 dark:bg-white/10 mx-1" />
                        <div className="relative">
                            <button onClick={() => { setShowCurrencyMenu(!showCurrencyMenu); setShowLangMenu(false); setShowTemplateMenu(false); }} className={`px-4 py-2 rounded-xl transition-all text-[13px] font-semibold flex items-center gap-2 ${showCurrencyMenu ? 'bg-[#007AFF] text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10'}`} title={t('inputs.hints.currency')}>
                                <Coins size={16} /><span className="uppercase">{store.currency}</span>
                            </button>
                            {showCurrencyMenu && (
                                <div className="absolute right-0 top-full mt-3 apple-card rounded-[1.8rem] overflow-hidden z-[100] w-64 p-2 grid grid-cols-2 gap-1.5 animate-in fade-in zoom-in-95 duration-200">
                                    {SUPPORTED_CURRENCIES.map(curr => (
                                        <button key={curr.code} onClick={() => { store.setCurrency(curr.code); setShowCurrencyMenu(false); }} className={`px-4 py-2.5 text-left rounded-xl transition-all text-xs font-semibold ${store.currency === curr.code ? 'bg-[#007AFF] text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10'}`}>
                                            <div className="flex flex-col"><span className="opacity-60 text-[10px]">{curr.symbol}</span><span>{curr.code}</span></div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="relative">
                            <button onClick={() => { setShowLangMenu(!showLangMenu); setShowCurrencyMenu(false); setShowTemplateMenu(false); }} className={`px-4 py-2 rounded-xl transition-all text-[13px] font-semibold flex items-center gap-2 ${showLangMenu ? 'bg-[#007AFF] text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10'}`} title={t('inputs.hints.language')}>
                                <Globe size={16} /><span className="uppercase">{language}</span>
                            </button>
                            {showLangMenu && (
                                <div className="absolute right-0 top-full mt-3 apple-card rounded-2xl overflow-hidden z-[100] w-44 p-2 flex flex-col gap-1 animate-in fade-in zoom-in-95 duration-200">
                                    <button onClick={() => handleLanguageChange('en')} className={`w-full px-4 py-2 text-left rounded-xl transition-all flex items-center gap-3 text-sm font-semibold ${language === 'en' ? 'bg-[#007AFF] text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10'}`}><span>🇺🇸</span><span>English</span></button>
                                    <button onClick={() => handleLanguageChange('th')} className={`w-full px-4 py-2 text-left rounded-xl transition-all flex items-center gap-3 text-sm font-semibold ${language === 'th' ? 'bg-[#007AFF] text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10'}`}><span>🇹🇭</span><span>ไทย</span></button>
                                </div>
                            )}
                        </div>
                        <button onClick={toggleTheme} className="apple-icon-btn" title={t('inputs.hints.theme')}>{darkMode ? <Sun size={19} /> : <Moon size={19} />}</button>
                    </div>

                    <div className="relative">
                        <button onClick={() => { setShowTemplateMenu(!showTemplateMenu); setShowLangMenu(false); setShowCurrencyMenu(false); }} className={`px-7 py-3 rounded-full transition-all text-[14px] font-semibold flex items-center gap-2.5 shadow-sm active:scale-95 ${showTemplateMenu ? 'bg-[#34C759] text-white' : 'bg-[#34C759] text-white hover:bg-[#30B752]'}`} title={t('inputs.hints.templates')}>
                            <Sparkles size={17} strokeWidth={2.5} className={showTemplateMenu ? '' : 'animate-pulse'} />
                            <span>{t('header.exampleTemplate')}</span>
                        </button>
                        {showTemplateMenu && (
                            <div className="absolute right-0 top-full mt-4 apple-card rounded-[2rem] overflow-hidden z-[100] w-64 p-3 flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                <button onClick={() => handleLoadTemplate('income15000')} className="w-full p-4 text-left rounded-2xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white"><Wallet size={20} /></div>
                                    <div className="flex flex-col"><span className="text-[10px] font-bold text-[#FF9500] uppercase tracking-wide">{t('file.templates.beginner')}</span><span className="text-sm font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">{t('file.templates.income15000')}</span></div>
                                </button>
                                <button onClick={() => handleLoadTemplate('income30000')} className="w-full p-4 text-left rounded-2xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-[#AF52DE] flex items-center justify-center text-white"><Sparkles size={20} /></div>
                                    <div className="flex flex-col"><span className="text-[10px] font-bold text-[#34C759] uppercase tracking-wide">{t('file.templates.standard')}</span><span className="text-sm font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">{t('file.templates.income30000')}</span></div>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {view === 'wiki' ? (
                <WikiPage onBack={() => setView('dashboard')} />
            ) : (
                <main className="max-w-7xl mx-auto space-y-12 sm:space-y-24 pb-16 sm:pb-32">
                    <AppGuide />
                    <article className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
                        <FinanceInput type="income" />
                        <FinanceInput type="expense" />
                    </article>

                    <section className="space-y-10 pt-10 border-t border-gray-100 dark:border-white/5 animate-in fade-in slide-in-from-bottom-5 duration-1000">
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                            <div className="space-y-2">
                                <span className="text-blue-500 font-bold uppercase tracking-widest text-xs ml-1">{t('inputs.netWorth.subtitle') || 'Wealth & Assets'}</span>
                                <h2 className="text-3xl sm:text-4xl font-black text-[#1D1D1F] dark:text-[#F5F5F7]">
                                    {t('inputs.netWorth.title') || 'Net Worth Explorer'}
                                </h2>
                            </div>
                        </div>

                        <NetWorthCard />

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
                            <NetWorthInput type="asset" />
                            <NetWorthInput type="liability" />
                        </div>
                    </section>
                    <section className="apple-card p-6 sm:p-12 md:p-20 rounded-[1.5rem] sm:rounded-[3rem] overflow-hidden transition-all duration-700 relative">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 sm:gap-10 mb-10 sm:mb-20 relative z-10">
                            <div className="flex items-center gap-4 sm:gap-6">
                                <div className="w-2 sm:w-2.5 h-10 sm:h-12 bg-[#007AFF] rounded-full" />
                                <div>
                                    <h2 className="text-2xl sm:text-4xl font-bold tracking-tight mb-1 sm:mb-2">{t('chart.title')}</h2>
                                    <p className="text-[12px] sm:text-[14px] text-gray-500 dark:text-gray-400 font-medium">{t('chart.recalculate')}</p>
                                </div>
                            </div>
                            <button onClick={handleRecalculate} disabled={isRefreshing} className={`apple-button-secondary px-9 py-4 text-sm ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                <RefreshCw size={18} strokeWidth={2.5} className={isRefreshing ? 'animate-spin' : ''} />
                                {isRefreshing ? t('chart.recalculating') : t('chart.recalculate')}
                            </button>
                        </div>
                        <div className={`transition-all duration-700 relative z-10 ${isRefreshing ? 'opacity-20 blur-2xl scale-[0.98]' : 'opacity-100 blur-0 scale-100'}`}>
                            <div className="min-h-[350px] sm:min-h-[500px] md:min-h-[600px] relative"><SankeyChart /></div>
                        </div>
                    </section>
                </main>
            )}

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
                <div className="mt-20 sm:mt-32 pt-12 border-t border-gray-100 dark:border-white/5">
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

            {store.notification && (
                <div className={`fixed bottom-12 left-1/2 -translate-x-1/2 z-[1000] px-8 py-5 rounded-full shadow-[0_12px_44px_rgba(0,0,0,0.15)] flex items-center gap-4 animate-in slide-in-from-bottom-10 duration-500 backdrop-blur-3xl border border-white/20 ${store.notification.type === 'success' ? 'bg-[#34C759]/90 text-white' :
                    store.notification.type === 'error' ? 'bg-[#FF3B30]/90 text-white' :
                        'bg-[#1D1D1F]/90 text-white dark:bg-white/95 dark:text-[#1D1D1F]'
                    }`}>
                    <span className="text-sm font-bold">{store.notification.message}</span>
                </div>
            )}
            <ProjectorPanel />
        </div>
    );
}

export default App;
