import React, { useState } from 'react';
import { useFinanceStore, Frequency, Category } from '../../store/useFinanceStore';
import { useI18n } from '../../i18n';
import { getCurrencySymbol } from '../../utils/currencies';
import { Plus, Trash2, Wallet, Activity, ChevronDown, Copy } from 'lucide-react';

interface FinanceInputProps {
    type: 'income' | 'expense';
}

export const FinanceInput: React.FC<FinanceInputProps> = ({ type }) => {
    const { incomeItems, expenseItems, addIncome, addExpense, removeIncome, removeExpense, showNotification, currency, duplicateItem, isPrivacyMode } = useFinanceStore();
    const { t } = useI18n();
    const symbol = getCurrencySymbol(currency);

    const formatAmount = (val: number) => {
        if (isPrivacyMode) return '•••••';
        return val.toLocaleString();
    };

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
                                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{symbol}{formatAmount(item.amount)} / {t(`frequency.${item.frequency}`)}</span>
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
