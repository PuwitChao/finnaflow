// src/utils/plotly-custom.ts
import Plotly from 'plotly.js/lib/core';
import sankey from 'plotly.js/lib/sankey';

// Register only the Sankey trace
Plotly.register([sankey]);

export default Plotly;
