// src/utils/plotly-custom.ts
import Plotly from 'plotly.js/lib/core';
import sankey from 'plotly.js/lib/sankey';
import pie from 'plotly.js/lib/pie';

// Register specific traces to keep bundle size small
Plotly.register([sankey, pie]);

export default Plotly;
