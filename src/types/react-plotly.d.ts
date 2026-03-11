declare module 'react-plotly.js' {
    import { Component } from 'react';

    interface PlotlyComponentProps {
        data: Record<string, unknown>[];
        layout?: Record<string, unknown>;
        frames?: Record<string, unknown>[];
        config?: Record<string, unknown>;
        onInitialized?: (figure: unknown, graphDiv: HTMLElement) => void;
        onUpdate?: (figure: unknown, graphDiv: HTMLElement) => void;
        onPurge?: (figure: unknown, graphDiv: HTMLElement) => void;
        onError?: (err: unknown) => void;
        onClick?: (event: Readonly<unknown>) => void;
        onHover?: (event: Readonly<unknown>) => void;
        style?: React.CSSProperties;
        className?: string;
        useResizeHandler?: boolean;
        debug?: boolean;
    }

    export default class Plot extends Component<PlotlyComponentProps> { }
}
