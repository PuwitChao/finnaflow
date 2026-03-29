import React, { useState } from 'react';
import { useFinanceStore, NetWorthItem as INetWorthItem } from '../../store/useFinanceStore';
import { useI18n } from '../../i18n';
import { getCurrencySymbol } from '../../utils/currencies';
import { Trash2, Copy, Edit2, Check, X } from 'lucide-react';

interface NetWorthItemProps {
    item: INetWorthItem;
    type: 'asset' | 'liability';
}

export const NetWorthItem: React.FC<NetWorthItemProps> = ({ item, type }) => {
    const { removeAsset, removeLiability, duplicateItem, currency, isPrivacyMode, showNotification } = useFinanceStore();
    const { t } = useI18n();
    const sym = getCurrencySymbol(currency);
    const [isEditing, setIsEditing] = useState(false);
    const [editAmount, setEditAmount] = useState(item.amount.toString());

    const handleRemove = () => {
        if (type === 'asset') removeAsset(item.id);
        else removeLiability(item.id);
        showNotification(t('inputs.itemDeleted') || 'Item deleted', 'info');
    };

    const handleDuplicate = () => {
        duplicateItem(item.id, type);
        showNotification(t('inputs.itemDuplicated') || 'Item duplicated', 'success');
    };

    const formatAmount = (val: number) => {
        if (isPrivacyMode) return '••••••';
        return `${sym}${val.toLocaleString()}`;
    };

    return (
        <div className="group flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-white/50 dark:bg-white/[0.03] hover:bg-white dark:hover:bg-white/[0.08] transition-all duration-300 border border-transparent hover:border-gray-100 dark:hover:border-white/10 shadow-sm hover:shadow-md">
            <div className="flex flex-col gap-1">
                <span className="font-bold text-[14px] sm:text-[15px] text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">{item.name}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{item.category}</span>
            </div>

            <div className="flex items-center gap-4">
                <div className="text-right">
                    <span className={`text-[15px] sm:text-[16px] font-black tracking-tight transition-all duration-500 ${type === 'asset' ? 'text-emerald-600' : 'text-rose-600'} ${isPrivacyMode ? 'blur-sm' : ''}`}>
                        {formatAmount(item.amount)}
                    </span>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                    <button 
                        onClick={handleDuplicate}
                        className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all"
                        title="Duplicate"
                    >
                        <Copy size={16} />
                    </button>
                    <button 
                        onClick={handleRemove}
                        className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all"
                        title="Delete"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};
