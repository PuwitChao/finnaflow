import React, { useState } from 'react';
import { useFinanceStore, FinanceItem, Frequency, NetWorthItem } from '../../../store/useFinanceStore';
import { useI18n } from '../../../i18n';
import { X, Table, ArrowRight, CheckCircle2, AlertCircle, FileSpreadsheet } from 'lucide-react';

export const CSVMapperModal: React.FC = () => {
    const { csvDataToMap, setCSVDataToMap, closeModal, addIncome, addExpense, addAsset, addLiability, showNotification } = useFinanceStore();
    const { t } = useI18n();

    const [mappings, setMappings] = useState({
        name: -1,
        amount: -1,
        category: -1,
        type: -1,
        frequency: -1
    });

    const [importMode, setImportMode] = useState<'income' | 'expense' | 'asset' | 'liability' | 'auto'>('auto');
    const [appendMode, setAppendMode] = useState(true);

    if (!csvDataToMap) return null;

    const { headers, rows } = csvDataToMap;

    const handleImport = () => {
        if (mappings.name === -1 || mappings.amount === -1) {
            showNotification(t('file.mapperIncomplete') || 'Please map at least Name and Amount', 'error');
            return;
        }

        let count = 0;
        rows.forEach(row => {
            const name = row[mappings.name] || 'Unnamed';
            const amount = parseFloat(row[mappings.amount].replace(/[^\d.-]/g, '')) || 0;
            const category = mappings.category !== -1 ? row[mappings.category] : 'Uncategorized';
            const frequency = (mappings.frequency !== -1 ? row[mappings.frequency] : 'Monthly') as Frequency;
            
            let type = importMode;
            if (importMode === 'auto' && mappings.type !== -1) {
                const rawType = row[mappings.type].toLowerCase();
                if (rawType.includes('income')) type = 'income';
                else if (rawType.includes('asset')) type = 'asset';
                else if (rawType.includes('liability') || rawType.includes('debt')) type = 'liability';
                else type = 'expense';
            } else if (importMode === 'auto') {
                type = 'expense'; // Default fallback
            }

            const id = crypto.randomUUID();
            if (type === 'income') addIncome({ id, name, amount, frequency, category });
            else if (type === 'expense') addExpense({ id, name, amount, frequency, category });
            else if (type === 'asset') addAsset({ id, name, amount, category });
            else if (type === 'liability') addLiability({ id, name, amount, category });
            
            count++;
        });

        showNotification(`${t('file.importSuccess')} (${count} items)`, 'success');
        setCSVDataToMap(null);
        closeModal();
    };

    return (
        <div className="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
            <div className="apple-card w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col rounded-[2.5rem] shadow-[0_32px_64px_rgba(0,0,0,0.4)]">
                {/* Header */}
                <div className="p-8 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#34C759]/10 text-[#34C759] flex items-center justify-center">
                            <FileSpreadsheet size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">{t('file.mapperTitle') || 'Map CSV Columns'}</h2>
                            <p className="text-sm text-gray-500">{headers.length} columns detected • {rows.length} rows</p>
                        </div>
                    </div>
                    <button onClick={closeModal} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-10 scrollbar-hide">
                    {/* Preview Section */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                            <Table size={14} /> {t('file.preview') || 'Data Preview'}
                        </h3>
                        <div className="overflow-x-auto rounded-2xl border border-gray-100 dark:border-white/5">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-gray-50 dark:bg-white/5">
                                    <tr>
                                        {headers.map((h, i) => (
                                            <th key={i} className="px-4 py-3 font-bold border-r border-gray-100 dark:border-white/5 last:border-none whitespace-nowrap">
                                                Col {i}: {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.slice(0, 3).map((row, ri) => (
                                        <tr key={ri} className="border-t border-gray-100 dark:border-white/5">
                                            {row.map((cell, ci) => (
                                                <td key={ci} className="px-4 py-3 text-gray-500 dark:text-gray-400 border-r border-gray-100 dark:border-white/5 last:border-none truncate max-w-[150px]">
                                                    {cell}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Mapping Configuration */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-6">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">{t('file.columnMapping') || 'Column Mapping'}</h3>
                            <div className="space-y-4">
                                {[
                                    { label: 'Name / Description', key: 'name', required: true },
                                    { label: 'Amount', key: 'amount', required: true },
                                    { label: 'Category', key: 'category', required: false },
                                    { label: 'Type (Income/Expense/Asset)', key: 'type', required: false },
                                    { label: 'Frequency', key: 'frequency', required: false },
                                ].map((field) => (
                                    <div key={field.key} className="flex items-center justify-between gap-4">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {field.label} {field.required && <span className="text-red-500">*</span>}
                                        </label>
                                        <select 
                                            value={mappings[field.key as keyof typeof mappings]} 
                                            onChange={(e) => setMappings({ ...mappings, [field.key]: parseInt(e.target.value) })}
                                            className="apple-input py-2 text-xs min-w-[160px]"
                                        >
                                            <option value={-1}>-- {t('file.selectColumn') || 'Select Column'} --</option>
                                            {headers.map((h, i) => (
                                                <option key={i} value={i}>{h}</option>
                                            ))}
                                        </select>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">{t('file.importSettings') || 'Import Settings'}</h3>
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('file.targetType') || 'Treat all items as:'}</label>
                                    <div className="flex flex-wrap gap-2">
                                        {[
                                            { id: 'auto', label: 'Auto (from column)' },
                                            { id: 'income', label: 'Income' },
                                            { id: 'expense', label: 'Expense' },
                                            { id: 'asset', label: 'Asset' },
                                            { id: 'liability', label: 'Liability' },
                                        ].map(mode => (
                                            <button 
                                                key={mode.id}
                                                onClick={() => setImportMode(mode.id as any)}
                                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${importMode === mode.id ? 'bg-[#007AFF] text-white shadow-lg shadow-[#007AFF]/20' : 'bg-gray-100 dark:bg-white/5 text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                                            >
                                                {mode.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex items-start gap-3">
                                    <AlertCircle size={16} className="text-blue-500 shrink-0 mt-0.5" />
                                    <p className="text-[11px] text-blue-600 dark:text-blue-400 leading-relaxed">
                                        {t('file.mapperHint') || 'The mapper will clean currency symbols and commas automatically. If a row fails to parse the amount, it will be ignored.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-gray-100 dark:border-white/5 flex items-center justify-end gap-4 bg-gray-50/50 dark:bg-white/[0.01]">
                    <button onClick={closeModal} className="px-8 py-3 rounded-full text-sm font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all">
                        {t('common.cancel') || 'Cancel'}
                    </button>
                    <button 
                        onClick={handleImport}
                        className="apple-button-primary px-10 py-3 shadow-xl shadow-[#007AFF]/30"
                    >
                        <CheckCircle2 size={18} />
                        {t('file.startImport') || 'Start Import'}
                    </button>
                </div>
            </div>
        </div>
    );
};
