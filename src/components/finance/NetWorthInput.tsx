import React, { useState } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { useI18n } from '../../i18n';
import { getCurrencySymbol } from '../../utils/currencies';
import { Plus, Trash2, Sparkles, ShieldCheck, ChevronDown, Copy } from 'lucide-react';

interface NetWorthInputProps {
    type: 'asset' | 'liability';
}

export const NetWorthInput: React.FC<NetWorthInputProps> = ({ type }) => {
    const { assetItems, liabilityItems, addAsset, addLiability, removeAsset, removeLiability, showNotification, currency, duplicateItem, isPrivacyMode } = useFinanceStore();
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
                                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{symbol}{isPrivacyMode ? '•••••' : item.amount.toLocaleString()}</span>
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
