import React from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { useFinanceStore } from '../../store/useFinanceStore';
import { useI18n } from '../../i18n';
import { getCurrencySymbol } from '../../utils/currencies';

export const TrendChart: React.FC = () => {
    const { history, currency, darkMode } = useFinanceStore();
    const { t } = useI18n();
    const sym = getCurrencySymbol(currency);

    if (!history || history.length < 2) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center text-gray-400 dark:text-gray-600 bg-gray-50 dark:bg-white/5 rounded-[2rem] border border-dashed border-gray-200 dark:border-white/10">
                <p className="text-sm font-bold uppercase tracking-widest">{t('chart.notEnoughData')}</p>
                <p className="text-xs mt-2 opacity-60">{t('chart.trendHint')}</p>
            </div>
        );
    }


    const textColor = darkMode ? '#8E8E93' : '#1D1D1F';
    const gridColor = darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

    return (
        <div className="w-full h-80 sm:h-96">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#007AFF" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#007AFF" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                    <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: textColor, fontSize: 11, fontWeight: 600 }}
                        dy={10}
                        tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    />
                    <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: textColor, fontSize: 11, fontWeight: 600 }}
                        tickFormatter={(val) => `${sym}${val > 1000 ? (val/1000).toFixed(1) + 'k' : val}`}
                    />
                    <Tooltip 
                        contentStyle={{ 
                            backgroundColor: darkMode ? '#1C1C1E' : '#ffffff', 
                            border: 'none', 
                            borderRadius: '16px', 
                            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                            color: darkMode ? '#F5F5F7' : '#1D1D1F'
                        }}
                        itemStyle={{ fontWeight: 'bold', color: '#007AFF' }}
                        formatter={(val) => [`${sym}${Number(val ?? 0).toLocaleString()}`, t('inputs.netWorth.currentNetWorth')]}

                        labelFormatter={(label) => new Date(label).toLocaleDateString(undefined, { dateStyle: 'long' })}

                    />
                    <Area 
                        type="monotone" 
                        dataKey="netWorth" 
                        stroke="#007AFF" 
                        strokeWidth={4}
                        fillOpacity={1} 
                        fill="url(#colorNetWorth)" 
                        animationDuration={1500}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};
