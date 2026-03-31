import React, { useState } from 'react';
import { useFinanceStore, NetWorthItem as INetWorthItem } from '../../../store/useFinanceStore';
import { useI18n } from '../../../i18n';
import { NetWorthItem } from './NetWorthItem';
import { Plus, X, ChevronRight, LayoutGrid, List } from 'lucide-react';

interface NetWorthGroupProps {
    type: 'asset' | 'liability';
}

export const NetWorthGroup: React.FC<NetWorthGroupProps> = ({ type }) => {
    const { assetItems, liabilityItems, addAsset, addLiability, showNotification } = useFinanceStore();
    const { t } = useI18n();
    const items = type === 'asset' ? assetItems : liabilityItems;
    const [isAdding, setIsAdding] = useState(false);
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('Other');

    const handleAdd = () => {
        if (!name || !amount) {
            showNotification(t('inputs.fillAllFields') || 'Please fill all fields', 'error');
            return;
        }

        const onAdd = type === 'asset' ? addAsset : addLiability;
        onAdd({
            id: crypto.randomUUID(),
            name,
            amount: parseFloat(amount),
            category
        });

        setName('');
        setAmount('');
        setIsAdding(false);
        showNotification(t('inputs.itemAdded') || 'Item added successfully', 'success');
    };

    const categories = type === 'asset' 
        ? ['Cash', 'Stocks', 'Crypto', 'Real Estate', 'Other']
        : ['Mortgage', 'Credit Card', 'Car Loan', 'Student Loan', 'Other'];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-black text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
                        {type === 'asset' ? t('inputs.assets.title') : t('inputs.liabilities.title')}
                    </h3>
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest ${type === 'asset' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
                        {items.length} {items.length === 1 ? t('inputs.defaultItem') : t('inputs.labels.items') || 'Items'}
                    </span>
                </div>
                
                <button 
                    onClick={() => setIsAdding(!isAdding)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isAdding ? 'bg-gray-100 dark:bg-white/10 text-gray-500 rotate-45' : 'bg-[#007AFF] text-white shadow-lg shadow-blue-500/20 hover:scale-110 active:scale-95'}`}
                >
                    <Plus size={20} strokeWidth={2.5} />
                </button>
            </div>

            {/* Quick Add Form */}
            {isAdding && (
                <div className="apple-card p-6 bg-[#F5F5F7] dark:bg-white/[0.03] rounded-3xl space-y-4 animate-in zoom-in-95 duration-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-gray-400 uppercase ml-1">{t('inputs.labels.label')}</label>
                            <input 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full apple-input-compact" 
                                placeholder={t('inputs.assets.placeholder')} 
                                autoFocus
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-gray-400 uppercase ml-1">{t('inputs.labels.value')}</label>
                            <input 
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full apple-input-compact" 
                                placeholder="0.00" 
                            />
                        </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                        {categories.map(cat => (
                            <button 
                                key={cat} 
                                onClick={() => setCategory(cat)}
                                className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${category === cat ? 'bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F]' : 'bg-gray-100 dark:bg-white/5 text-gray-500 hover:text-[#1D1D1F] dark:hover:text-white'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-2 pt-2">
                        <button onClick={handleAdd} className="apple-button-primary flex-1 py-3 text-xs">
                            {type === 'asset' ? t('inputs.assets.addButton') : t('inputs.liabilities.addButton')}
                        </button>
                        <button onClick={() => setIsAdding(false)} className="px-5 py-3 rounded-2xl bg-gray-200 dark:bg-white/10 text-gray-500 text-xs font-bold hover:bg-gray-300 dark:hover:bg-white/20 transition-all">
                            {t('inputs.labels.cancel') || 'Cancel'}
                        </button>
                    </div>
                </div>
            )}

            {/* Items List */}
            <div className="space-y-3 min-h-[300px]">
                {items.length === 0 ? (
                    <div className="apple-card bg-gray-50/50 dark:bg-white/5 border-dashed border-2 py-20 flex flex-col items-center justify-center text-center opacity-40">
                         <div className="w-12 h-12 rounded-2xl bg-gray-200 dark:bg-white/10 flex items-center justify-center mb-4">
                            {type === 'asset' ? <LayoutGrid size={24} /> : <List size={24} />}
                         </div>
                         <p className="font-bold text-gray-400 uppercase tracking-widest text-[10px]">
                            {t('inputs.noItems')}
                         </p>
                    </div>
                ) : (
                    items.map(item => (
                        <NetWorthItem key={item.id} item={item} type={type} />
                    ))
                )}
            </div>
        </div>
    );
};
