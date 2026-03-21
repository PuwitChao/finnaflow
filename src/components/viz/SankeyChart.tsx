import React from 'react';
import Plot from 'react-plotly.js';
import { useFinanceStore } from '../../store/useFinanceStore';
import { useI18n } from '../../i18n';
import { generateSankeyConfig } from '../../utils/financeEngine';
import { DrillDownModal } from './DrillDownModal';

/**
 * Interactive Sankey Diagram component powered by react-plotly.js.
 * Visualizes the flow from income sources through hubs to specific expenses or surplus.
 */
export const SankeyChart: React.FC = () => {
    const { incomeItems, expenseItems, darkMode, isProjectionMode, isPrivacyMode, categoryMultipliers, macroConfig } = useFinanceStore();
    const { t } = useI18n();
    const [selectedNodeIndex, setSelectedNodeIndex] = React.useState<number | null>(null);

    const config = generateSankeyConfig(
        incomeItems,
        expenseItems,
        isProjectionMode ? categoryMultipliers : {},
        isProjectionMode ? macroConfig : { inflation: 0, marketShock: 0 },
        t,
        isPrivacyMode
    );

    if (config.links.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-12 text-center text-slate-400 dark:text-slate-600">
                <p className="font-bold uppercase tracking-widest text-sm">{t('chart.emptyState')}</p>
            </div>
        );
    }    // Clean text color - no effects
    const textColor = darkMode ? '#f8fafc' : '#0f172a';
    const linkColor = darkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(15, 23, 42, 0.1)';

    return (
        <div className="w-full h-full sankey-wrapper">
            <Plot
                data={[
                    {
                        type: 'sankey',
                        orientation: 'h',
                        node: {
                            pad: 80,
                            thickness: 24,
                            line: { color: 'rgba(255,255,255,0.1)', width: 1 },
                            label: config.nodes,
                            hoverinfo: 'all',
                            font: {
                                color: textColor,
                                size: 12,
                                family: 'Inter, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
                            },
                            color: config.nodeColors
                        },
                        link: {
                            source: config.links.map(l => l.source),
                            target: config.links.map(l => l.target),
                            value: config.links.map(l => l.value),
                            label: config.links.map(l => l.label),
                            color: config.links.map(l => l.color || linkColor),
                            hoverlabel: {
                                font: {
                                    size: 13,
                                    family: 'Inter, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
                                }
                            }
                        },
                    },
                ]}
                layout={{
                    autosize: true,
                    margin: { l: 60, r: 60, t: 60, b: 60 },
                    paper_bgcolor: 'rgba(0,0,0,0)',
                    plot_bgcolor: 'rgba(0,0,0,0)',
                    hovermode: 'closest',
                    transition: {
                        duration: 800,
                        easing: 'cubic-in-out'
                    },
                    font: {
                        family: 'Inter, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                        color: textColor
                    },
                    hoverlabel: {
                        bgcolor: darkMode ? '#1C1C1E' : '#ffffff',
                        bordercolor: darkMode ? '#2C2C2E' : '#E5E5E7',
                        font: {
                            family: 'Inter, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                            size: 13,
                            color: darkMode ? '#F5F5F7' : '#1D1D1F'
                        },
                        align: 'left'
                    }
                }}
                config={{ displayModeBar: false }}
                onClick={(data: any) => {
                    const point = data?.points?.[0];
                    if (point && typeof point.pointNumber === 'number') {
                        setSelectedNodeIndex(point.pointNumber);
                    }
                }}
                useResizeHandler={true}
                className="w-full h-full cursor-pointer"
            />
            {selectedNodeIndex !== null && config.nodeMetadata[selectedNodeIndex] && (
                <DrillDownModal 
                    node={{
                        ...config.nodeMetadata[selectedNodeIndex],
                        label: config.nodes[selectedNodeIndex]
                    }}
                    onClose={() => setSelectedNodeIndex(null)}
                />
            )}
        </div>
    );
};
