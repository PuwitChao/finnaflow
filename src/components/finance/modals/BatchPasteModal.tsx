import React, { useState, useEffect } from 'react';
import { useFinanceStore, FinanceItem, Category } from '../../../store/useFinanceStore';
import { useI18n } from '../../../i18n';
import { parseStatement, ParsedTransaction } from '../../../utils/statementParser';
import { Sparkles, X, Check, AlertCircle, Wand2, Info } from 'lucide-react';

interface BatchPasteModalProps {
    onClose: () => void;
}

export const BatchPasteModal: React.FC<BatchPasteModalProps> = ({ onClose }) => {
    const { t } = useI18n();
    const { addIncome, addExpense, showNotification } = useFinanceStore();
    
    const [inputText, setInputText] = useState('');
    const [parsedData, setParsedData] = useState<ParsedTransaction[]>([]);
    const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());

    useEffect(() => {
        if (inputText.trim()) {
            const results = parseStatement(inputText);
            setParsedData(results);
            // Auto-select all by default
            setSelectedItems(new Set(results.map((_, i) => i)));
        } else {
            setParsedData([]);
            setSelectedItems(new Set());
        }
    }, [inputText]);

    const toggleItem = (index: number) => {
        const newSelected = new Set(selectedItems);
        if (newSelected.has(index)) newSelected.delete(index);
        else newSelected.add(index);
        setSelectedItems(newSelected);
    };

    const toggleItemType = (index: number) => {
        const newData = [...parsedData];
        newData[index] = {
            ...newData[index],
            type: newData[index].type === 'income' ? 'expense' : 'income'
        };
        setParsedData(newData);
    };

    const flipAllTypes = () => {
        setParsedData(parsedData.map(item => ({
            ...item,
            type: item.type === 'income' ? 'expense' : 'income'
        })));
    };

    const handleImport = () => {
        const itemsToImport = parsedData.filter((_, i) => selectedItems.has(i));
        
        if (itemsToImport.length === 0) {
            showNotification(t('batchPaste.noSelected') || 'No items selected', 'error');
            return;
        }

        itemsToImport.forEach(item => {
            const newItem: FinanceItem = {
                id: crypto.randomUUID(),
                name: item.description,
                amount: item.amount,
                frequency: 'Monthly',
                category: item.category as Category,
                description: item.longDescription
            };

            if (item.type === 'income') {
                addIncome(newItem);
            } else {
                addExpense(newItem);
            }
        });

        showNotification(
            t('batchPaste.success', { count: itemsToImport.length }) || `Successfully imported ${itemsToImport.length} items`, 
            'success'
        );
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 sm:p-10 bg-white/60 dark:bg-black/60 backdrop-blur-2xl animate-in fade-in duration-300">
            <div className="max-w-5xl w-full h-full max-h-[90vh] apple-card flex flex-col rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-white/10 relative overflow-hidden bg-white dark:bg-[#1C1C1E]">
                {/* Header */}
                <div className="p-8 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                            <Wand2 size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black tracking-tight text-[#1D1D1F] dark:text-white">
                                {t('batchPaste.title') || 'Intelligent Ingestion'}
                            </h2>
                            <p className="text-sm text-gray-500 font-medium">
                                {t('batchPaste.subtitle') || 'Extract transactions from raw statement text.'}
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-white transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
                    {/* Left Panel: Input */}
                    <div className="flex-1 p-8 border-r border-gray-100 dark:border-white/5 flex flex-col space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                                {t('batchPaste.pasteLabel') || 'Raw Statement Text'}
                            </label>
                            <span className="text-[10px] font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full uppercase">
                                Local Only
                            </span>
                        </div>
                        <textarea 
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            className="flex-1 w-full apple-input resize-none p-6 text-sm font-mono leading-relaxed"
                            placeholder={t('batchPaste.placeholder') || "Paste transaction text from bank app..."}
                        />
                        <div className="flex items-center gap-3 p-4 bg-blue-500/5 rounded-2xl text-[11px] text-blue-600 dark:text-blue-400 font-medium leading-relaxed">
                            <Info size={16} className="shrink-0" />
                            <p>{t('batchPaste.privacyNotice') || "Heuristics run locally in your browser. No sensitive data leaves your device."}</p>
                        </div>
                    </div>

                    {/* Right Panel: Preview */}
                    <div className="flex-1 p-8 bg-gray-50/50 dark:bg-black/20 overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                                {t('batchPaste.previewLabel') || 'Extraction Preview'}
                            </label>
                            <div className="flex items-center gap-4">
                                <button 
                                    onClick={flipAllTypes}
                                    className="text-[10px] font-bold text-blue-500 hover:opacity-70 transition-opacity uppercase tracking-widest flex items-center gap-1"
                                    title="Swap Income/Expense for all"
                                >
                                    <Sparkles size={12} />
                                    {t('batch.flipAll') || 'Flip All'}
                                </button>
                                <div className="text-[11px] font-bold text-gray-400">
                                    {selectedItems.size} / {parsedData.length} Selected
                                </div>
                            </div>
                        </div>

                        {parsedData.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-20">
                                <Sparkles size={48} className="mb-4 text-gray-300" />
                                <p className="font-bold text-gray-400 uppercase tracking-widest text-[10px]">
                                    {inputText ? (t('batchPaste.noFound') || 'No transactions detected') : (t('batchPaste.waiting') || 'Waiting for input')}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {parsedData.map((item, index) => (
                                    <div 
                                        key={index}
                                        onClick={() => toggleItem(index)}
                                        className={`apple-card p-4 flex items-center gap-4 cursor-pointer transition-all border ${selectedItems.has(index) ? 'border-blue-500 ring-1 ring-blue-500/20 bg-blue-50 dark:bg-blue-500/5' : 'border-transparent hover:border-gray-200 dark:hover:border-white/10'}`}
                                    >
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${selectedItems.has(index) ? 'bg-blue-500 text-white' : 'border-2 border-gray-200 dark:border-white/10 text-transparent'}`}>
                                            <Check size={14} strokeWidth={3} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-[9px] font-black uppercase tracking-tighter text-gray-400">{item.date}</span>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); toggleItemType(index); }}
                                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-transform hover:scale-105 active:scale-95 ${item.type === 'income' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}
                                                    title="Click to flip type"
                                                >
                                                    {item.type === 'income' ? t('batchPaste.type.income') || 'Income' : t('batchPaste.type.expense') || 'Expense'}
                                                </button>
                                            </div>
                                            <p className="text-sm font-bold text-[#1D1D1F] dark:text-white truncate uppercase tracking-tight">
                                                {item.description}
                                            </p>
                                            <p className="text-[10px] text-gray-400 truncate mt-0.5 opacity-60 italic">
                                                {item.longDescription}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] font-bold bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded-md text-gray-500 dark:text-gray-400">
                                                    {item.category}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-lg font-black tracking-tight ${item.type === 'income' ? 'text-emerald-500' : 'text-[#1D1D1F] dark:text-white'}`}>
                                                {item.type === 'income' ? '+' : ''}{item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-8 border-t border-gray-100 dark:border-white/5 bg-white dark:bg-[#1C1C1E] flex items-center justify-between">
                    <button 
                        onClick={() => setSelectedItems(selectedItems.size === parsedData.length ? new Set() : new Set(parsedData.map((_, i) => i)))}
                        className="text-[11px] font-bold text-gray-400 hover:text-blue-500 transition-colors uppercase tracking-widest"
                    >
                        {selectedItems.size === parsedData.length ? t('batch.deselectAll') || 'Deselect All' : t('batch.selectAll') || 'Select All'}
                    </button>
                    
                    <div className="flex gap-4">
                        <button 
                            onClick={onClose}
                            className="px-8 py-4 rounded-2xl bg-gray-100 dark:bg-white/5 text-gray-500 text-sm font-bold hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
                        >
                            {t('inputs.labels.cancel')}
                        </button>
                        <button 
                            onClick={handleImport}
                            disabled={selectedItems.size === 0}
                            className="px-10 py-4 rounded-2xl bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1C1C1E] text-sm font-black shadow-xl shadow-black/10 disabled:opacity-30 disabled:grayscale transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
                        >
                            <Check size={18} strokeWidth={2.5} />
                            {t('batchPaste.import') || 'Import Selected'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
