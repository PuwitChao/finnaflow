import React from 'react';

interface SankeyErrorBoundaryState {
    hasError: boolean;
}

/**
 * Error boundary wrapping the Plotly Sankey chart.
 * Prevents a Plotly render error from unmounting the entire dashboard.
 */
export class SankeyErrorBoundary extends React.Component<React.PropsWithChildren, SankeyErrorBoundaryState> {
    constructor(props: React.PropsWithChildren) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(): SankeyErrorBoundaryState {
        return { hasError: true };
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center h-full p-12 text-center text-slate-400 dark:text-slate-600 gap-4">
                    <p className="font-bold uppercase tracking-widest text-sm">Chart unavailable</p>
                    <button
                        onClick={() => this.setState({ hasError: false })}
                        className="text-xs font-bold text-blue-500 hover:opacity-70 transition-opacity uppercase tracking-widest"
                    >
                        Retry
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}
