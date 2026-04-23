import React, { useState } from 'react';
import { useFinanceStore } from '../../../store/useFinanceStore';
import { useI18n } from '../../../i18n';
import { getCurrencySymbol } from '../../../utils/currencies';
import { Plus, Trash2, Sparkles, ShieldCheck, ChevronDown, Copy, Check, X, MoveHorizontal } from 'lucide-react';

interface NetWorthInputProps {
    type: 'asset' | 'liability';
}

export const NetWorthInput: React.FC<NetWorthInputProps> = ({ type }) => {
    const { assetItems, liabilityItems, addAsset, addLiability, removeAsset, removeLiability, showNotification, currency, duplicateItem, isPrivacyMode, updateItems, removeItems } = useFinanceStore();
    const { t } = useI18n();
    const symbol = getCurrencySymbol(currency);

    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [batchCategory, setBatchCategory] = useState<string>('Other');

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

    const toggleSelection = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    const selectAll = () => {
        if (selectedIds.size === items.length) setSelectedIds(new Set());
        else setSelectedIds(new Set(items.map(i => i.id)));
    };

    const handleBatchCategoryChange = () => {
        updateItems(Array.from(selectedIds), type, { category: batchCategory });
        showNotification(t('batchPaste.success', { count: selectedIds.size }), 'success');
        setSelectedIds(new Set());
    };

    const handleBatchDelete = () => {
        if (window.confirm(t('batch.confirmDelete'))) {
            removeItems(Array.from(selectedIds), type);
            setSelectedIds(new Set());
        }
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
                {items.length > 0 && (
                    <button onClick={selectAll} className="text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-blue-500 transition-colors">
                        {selectedIds.size === items.length ? t('batch.deselectAll') : t('batch.selectAll')}
                    </button>
                )}
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

                <div className="space-y-2">
                    <div className="flex flex-col ml-1">
                        <label className="text-[13px] font-semibold text-gray-400">{t('inputs.labels.bucket')}</label>
                    </div>
                    <div className="relative">
                        <select 
                            value={category} 
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full apple-input appearance-none pr-10"
                        >
                            {type === 'asset' ? (
                                <>
                                    <option value="Cash">{t('inputs.assets.common.Cash')}</option>
                                    <option value="Investments">{t('inputs.assets.common.Investments')}</option>
                                    <option value="Property">{t('inputs.assets.common.Property')}</option>
                                    <option value="Crypto">{t('inputs.assets.common.Crypto')}</option>
                                    <option value="Collectibles">{t('inputs.assets.common.Collectibles')}</option>
                                    <option value="Other">{t('inputs.assets.common.Other')}</option>
                                </>
                            ) : (
                                <>
                                    <option value="Mortgage">{t('inputs.liabilities.common.Mortgage')}</option>
                                    <option value="CreditCard">{t('inputs.liabilities.common.CreditCard')}</option>
                                    <option value="CarLoan">{t('inputs.liabilities.common.CarLoan')}</option>
                                    <option value="StudentLoan">{t('inputs.liabilities.common.StudentLoan')}</option>
                                    <option value="PersonalLoan">{t('inputs.liabilities.common.PersonalLoan')}</option>
                                    <option value="Other">{t('inputs.liabilities.common.Other')}</option>
                                </>
                            )}
                        </select>
                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
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

            <div className="flex-1 overflow-y-auto max-h-[250px] sm:max-h-[350px] space-y-3 scrollbar-hide pr-1 pb-10 relative z-10">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <p className="text-sm font-semibold text-gray-300 dark:text-gray-600">{t('inputs.noItems')}</p>
                    </div>
                ) : (
                    items.map((item) => (
                        <div 
                            key={item.id} 
                            onClick={(e) => toggleSelection(item.id, e)}
                            className={`group flex items-center justify-between p-5 rounded-2xl transition-all duration-300 cursor-pointer ${selectedIds.has(item.id) ? 'bg-blue-500/10 dark:bg-blue-500/20 ring-2 ring-blue-500 shadow-lg' : 'bg-white/50 dark:bg-[#2C2C2E]/50 hover:bg-white dark:hover:bg-[#2C2C2E]/80'}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${selectedIds.has(item.id) ? 'bg-blue-500 text-white' : 'border-2 border-gray-200 dark:border-white/10 text-transparent'}`}>
                                    <Check size={14} strokeWidth={3} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-semibold text-[15px] text-[#1D1D1F] dark:text-[#F5F5F7]">{item.name}</span>
                                    <div className="flex items-center gap-3 mt-1.5">
                                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{symbol}{isPrivacyMode ? '•••••' : item.amount.toLocaleString()}</span>
                                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold border capitalize ${
                                            type === 'asset' 
                                                ? 'bg-emerald-50 text-emerald-500 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20' 
                                                : 'bg-purple-50 text-purple-500 border-purple-100 dark:bg-purple-500/10 dark:border-purple-500/20'
                                        }`}>
                                            {item.category}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={(e) => { e.stopPropagation(); duplicateItem(item.id, type); }}
                                    className="p-2 text-gray-300 hover:text-blue-500 transition-colors"
                                    title={t('inputs.duplicate') || 'Duplicate'}
                                >
                                    <Copy size={16} />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onRemove(item.id); }}
                                    className="p-2 text-gray-300 hover:text-rose-500 transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Batch Toolbar */}
            {selectedIds.size > 0 && (
                <div className="absolute bottom-6 left-6 right-6 z-[100] animate-in slide-in-from-bottom-10 fade-in duration-500">
                    <div className="p-4 bg-[#1D1D1F]/90 dark:bg-white/95 backdrop-blur-2xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center justify-between">
                        <div className="flex items-center gap-4 ml-2">
                            <button onClick={() => setSelectedIds(new Set())} className="text-white dark:text-[#1D1D1F] hover:opacity-70">
                                <X size={20} />
                            </button>
                            <span className="text-white dark:text-[#1D1D1F] font-bold text-sm">
                                {t('batch.selected', { count: selectedIds.size })}
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative group">
                                <select 
                                    value={batchCategory} 
                                    onChange={(e) => setBatchCategory(e.target.value)}
                                    className="bg-white/10 dark:bg-black/10 text-white dark:text-black text-xs font-bold py-2.5 pl-4 pr-10 rounded-2xl border-none appearance-none cursor-pointer focus:ring-0"
                                >
                                    {type === 'asset' ? (
                                        <>
                                            <option value="Cash">{t('inputs.assets.common.Cash')}</option>
                                            <option value="Investments">{t('inputs.assets.common.Investments')}</option>
                                            <option value="Property">{t('inputs.assets.common.Property')}</option>
                                            <option value="Crypto">{t('inputs.assets.common.Crypto')}</option>
                                            <option value="Collectibles">{t('inputs.assets.common.Collectibles')}</option>
                                            <option value="Other">{t('inputs.assets.common.Other')}</option>
                                        </>
                                    ) : (
                                        <>
                                            <option value="Mortgage">{t('inputs.liabilities.common.Mortgage')}</option>
                                            <option value="CreditCard">{t('inputs.liabilities.common.CreditCard')}</option>
                                            <option value="CarLoan">{t('inputs.liabilities.common.CarLoan')}</option>
                                            <option value="StudentLoan">{t('inputs.liabilities.common.StudentLoan')}</option>
                                            <option value="PersonalLoan">{t('inputs.liabilities.common.PersonalLoan')}</option>
                                            <option value="Other">{t('inputs.liabilities.common.Other')}</option>
                                        </>
                                    )}
                                </select>
                                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-white dark:text-black pointer-events-none" />
                            </div>
                            <button 
                                onClick={handleBatchCategoryChange}
                                className="bg-emerald-500 text-white text-xs font-black px-6 py-2.5 rounded-2xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-500/25"
                            >
                                <MoveHorizontal size={14} />
                                {t('batch.moveTo')}
                            </button>
                            <button 
                                onClick={handleBatchDelete}
                                className="bg-rose-500 text-white p-2.5 rounded-2xl hover:scale-105 active:scale-95 transition-all"
                                title={t('batch.delete')}
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
