import React from 'react';
import Plotly from 'react-plotly.js';
import { useFinanceStore } from '../../store/useFinanceStore';
import { useI18n } from '../../i18n';

export const AssetDistributionChart: React.FC = () => {
    const { assetItems, darkMode, isPrivacyMode } = useFinanceStore();
    const { t } = useI18n();

    // Group assets by category
    const categoryTotals: Record<string, number> = {};
    assetItems.forEach(item => {
        categoryTotals[item.category] = (categoryTotals[item.category] || 0) + item.amount;
    });

    const categories = Object.keys(categoryTotals);
    const values = Object.values(categoryTotals);

    if (categories.length === 0) return null;

    return (
        <div className="apple-card p-8 rounded-[2rem] bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden h-full flex flex-col">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                Asset Allocation
                <span className="text-[10px] bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full uppercase tracking-widest font-black">Holdings</span>
            </h3>
            
            <div className="flex-1 min-h-[300px] flex items-center justify-center relative">
                {isPrivacyMode && (
                    <div className="absolute inset-0 z-20 backdrop-blur-3xl bg-white/10 dark:bg-black/10 rounded-3xl flex items-center justify-center border border-white/20">
                         <div className="text-center space-y-2">
                             <p className="font-black text-xs uppercase tracking-[0.3em] opacity-40 italic">Allocation Redacted</p>
                             <p className="text-[10px] font-bold text-blue-500/60 uppercase">Privacy Mode Active</p>
                         </div>
                    </div>
                )}
                
                <Plotly
                    data={[{
                        values: values,
                        labels: categories,
                        type: 'pie',
                        hole: 0.7,
                        marker: {
                            colors: [
                                '#007AFF', // Blue
                                '#34C759', // Green
                                '#AF52DE', // Purple
                                '#FF9500', // Orange
                                '#FF3B30', // Red
                                '#5856D6', // Indigo
                            ]
                        },
                        textinfo: 'label+percent',
                        hoverinfo: 'label+value+percent',
                        textposition: 'outside',
                        automargin: true,
                        insidetextorientation: 'radial'
                    }]}
                    layout={{
                        autosize: true,
                        showlegend: false,
                        paper_bgcolor: 'rgba(0,0,0,0)',
                        plot_bgcolor: 'rgba(0,0,0,0)',
                        margin: { t: 0, b: 0, l: 0, r: 0 },
                        font: {
                            family: 'SF Pro Display, system-ui, sans-serif',
                            color: darkMode ? '#8E8E93' : '#1D1D1F',
                            size: 11
                        }
                    }}
                    config={{ displayModeBar: false, responsive: true }}
                    style={{ width: '100%', height: '100%' }}
                />
            </div>
            
            <div className="mt-8 grid grid-cols-2 gap-3">
                {categories.map((cat, idx) => {
                    const colors = ['#007AFF', '#34C759', '#AF52DE', '#FF9500', '#FF3B30', '#5856D6'];
                    const color = colors[idx % colors.length];
                    const percentage = (categoryTotals[cat] / values.reduce((a, b) => a + b, 0)) * 100;
                    
                    return (
                        <div key={cat} className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-transparent hover:border-gray-100 dark:hover:border-white/10 transition-all">
                             <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                             <div className="flex flex-col">
                                 <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider leading-none mb-1">{cat}</span>
                                 <span className="text-sm font-black text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">{percentage.toFixed(0)}%</span>
                             </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
