declare module 'react-plotly.js/factory' {
    import { PlotlyEditorProps } from 'react-plotly.js';
    import { ComponentType } from 'react';
    export default function createPlotlyComponent(plotly: any): ComponentType<any>;
}

declare module 'plotly.js/lib/core' {
    const Plotly: any;
    export default Plotly;
}


declare module 'plotly.js/lib/sankey' {
    const sankey: any;
    export default sankey;
}
