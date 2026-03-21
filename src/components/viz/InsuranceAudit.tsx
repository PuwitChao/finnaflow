import React from 'react';
import { useFinanceStore, InsuranceItem } from '../../store/useFinanceStore';
import { useI18n } from '../../i18n';
import { Shield, Plus, Trash2, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { getCurrencySymbol } from '../../utils/currencies';

export const InsuranceAudit: React.FC = () => {
    const { insuranceItems, addInsurance, removeInsurance, currency, isPrivacyMode } = useFinanceStore();
    const { t } = useI18n();
    const symbol = getCurrencySymbol(currency);

    const [name, setName] = React.useState('');
    const [type, setType] = React.useState<InsuranceItem['type']>('Life');
    const [premium, setPremium] = React.useState('');
    const [coverage, setCoverage] = React.useState('');
    const [frequency, setFrequency] = React.useState<InsuranceItem['frequency']>('Monthly');

    const handleAdd = () => {
        if (!name || !premium || !coverage) return;
        addInsurance({
            id: crypto.randomUUID(),
            name,
            type,
            premium: parseFloat(premium),
            coverage: parseFloat(coverage),
            frequency
        });
        setName('');
        setPremium('');
        setCoverage('');
    };

    const essentialTypes: InsuranceItem['type'][] = ['Life', 'Health', 'Auto', 'Home'];
    const coveredTypes = new Set(insuranceItems.map(i => i.type));

    const getCoverageHealth = () => {
        const missing = essentialTypes.filter(t => !coveredTypes.has(t));
        if (missing.length === 0) return { label: 'Fully Protected', color: 'text-emerald-500', icon: <CheckCircle2 size={16} /> };
        if (missing.length <= 2) return { label: 'Partially Protected', color: 'text-amber-500', icon: <Info size={16} /> };
        return { label: 'Unprotected', color: 'text-rose-500', icon: <AlertCircle size={16} /> };
    };

    const health = getCoverageHealth();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <Shield size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">Insurance Audit</h3>
                        <p className="text-xs text-gray-500">Verify your financial safety net</p>
                    </div>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 ${health.color}`}>
                    {health.icon}
                    <span className="text-xs font-bold uppercase tracking-tighter">{health.label}</span>
                </div>
            </div>

            <div className="apple-card p-6 bg-slate-50/50 dark:bg-white/5 border-dashed border-2 border-slate-200 dark:border-white/10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold uppercase text-gray-400">Policy Name</label>
                        <input 
                            value={name} onChange={e => setName(e.target.value)}
                            placeholder="e.g. Term Life"
                            className="w-full bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold uppercase text-gray-400">Type</label>
                        <select 
                            value={type} onChange={e => setType(e.target.value as any)}
                            className="w-full bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm"
                        >
                            {essentialTypes.map(t => <option key={t} value={t}>{t}</option>)}
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold uppercase text-gray-400">Premium ({symbol})</label>
                        <div className="flex gap-2">
                            <input 
                                type="number" value={premium} onChange={e => setPremium(e.target.value)}
                                placeholder="0"
                                className="w-full bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm"
                            />
                            <select 
                                value={frequency} onChange={e => setFrequency(e.target.value as any)}
                                className="bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/10 rounded-xl px-2 py-2.5 text-xs font-bold"
                            >
                                <option value="Monthly">Mo</option>
                                <option value="Yearly">Yr</option>
                            </select>
                        </div>
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                        <label className="text-[11px] font-bold uppercase text-gray-400">Coverage Amount ({symbol})</label>
                        <input 
                            type="number" value={coverage} onChange={e => setCoverage(e.target.value)}
                            placeholder="e.g. 500,000"
                            className="w-full bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm font-bold"
                        />
                    </div>
                    <div className="flex items-end">
                        <button 
                            onClick={handleAdd}
                            className="w-full apple-button-primary py-2.5 rounded-xl flex items-center justify-center gap-2"
                        >
                            <Plus size={18} />
                            <span>Add Policy</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                {insuranceItems.length === 0 ? (
                    <div className="py-12 text-center text-gray-400 bg-slate-50/30 dark:bg-white/5 rounded-3xl border border-dashed border-slate-200 dark:border-white/10">
                        <p className="text-sm font-medium">No policies added yet</p>
                    </div>
                ) : (
                    insuranceItems.map(item => (
                        <div key={item.id} className="group apple-card p-4 hover:border-blue-500/30 transition-all flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                    item.type === 'Life' ? 'bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400' :
                                    item.type === 'Health' ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400' :
                                    item.type === 'Auto' ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' :
                                    'bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
                                }`}>
                                    <Shield size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm">{item.name}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 font-bold uppercase tracking-tighter text-gray-500">{item.type}</span>
                                        <span className="text-[11px] text-gray-400 font-medium">Premium: {symbol}{isPrivacyMode ? '••••' : item.premium.toLocaleString()} / {item.frequency === 'Monthly' ? 'mo' : 'yr'}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Coverage</p>
                                    <p className="text-sm font-black text-gray-900 dark:text-white">{symbol}{isPrivacyMode ? '••••••••' : item.coverage.toLocaleString()}</p>
                                </div>
                                <button 
                                    onClick={() => removeInsurance(item.id)}
                                    className="opacity-0 group-hover:opacity-100 p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
