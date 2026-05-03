/**
 * Chart Data to Text Converter (V2)
 * 
 * Converts chart_data JSONB (Recharts-compatible format) into human-readable
 * text that GPT-4o can use as reference when evaluating Task 1 Academic essays.
 * 
 * V2 schema (DB-actual):
 *   bar_chart / line_graph: { type, title, unit, data: [{name, [series]: value}], series: [], x_axis_label, y_axis_label }
 *   pie_chart: { type, title, unit, data: [{name, value}] }
 */

export function chartDataToText(chartData) {
  if (!chartData || typeof chartData !== 'object') {
    return 'No chart data available.';
  }

  const { type } = chartData;

  switch (type) {
    case 'bar_chart':
      return formatBarOrLine(chartData, 'Bar chart');
    case 'line_graph':
      return formatBarOrLine(chartData, 'Line graph');
    case 'pie_chart':
      return formatPieChart(chartData);
    default:
      return `Unknown chart type: ${type}`;
  }
}

/**
 * Format bar chart or line graph (same data structure).
 * Recharts format: data = [{name: "2018", Thailand: 38.2, Malaysia: 25.8, ...}, ...]
 *                  series = ["Thailand", "Malaysia", ...]
 */
function formatBarOrLine(chart, displayType) {
  const { title, unit, data, series, x_axis_label, y_axis_label } = chart;

  const lines = [];
  lines.push('CHART DATA REFERENCE (for accuracy verification):');
  lines.push(`Type: ${displayType}`);
  
  if (title) lines.push(`Title: ${title}`);
  if (unit) lines.push(`Unit of measurement: ${unit}`);
  if (x_axis_label) lines.push(`X-axis: ${x_axis_label}`);
  if (y_axis_label) lines.push(`Y-axis: ${y_axis_label}`);
  lines.push('');

  // Validate data structure
  if (!Array.isArray(data) || data.length === 0) {
    lines.push('(No data points available.)');
    return lines.join('\n');
  }

  // Extract periods (first key of each data row, e.g., "name" → "2018")
  const periods = data.map(row => row.name);

  // Extract series names (use explicit `series` array, fallback to row keys)
  const seriesNames = Array.isArray(series) && series.length > 0
    ? series
    : Object.keys(data[0] || {}).filter(k => k !== 'name');

  lines.push(`Categories/Series: ${seriesNames.join(', ')}`);
  lines.push(`Time periods/X-axis values: ${periods.join(', ')}`);
  lines.push('');

  // Output values per series
  lines.push('Values by series:');
  seriesNames.forEach(seriesName => {
    const valueStr = data.map(row => {
      const val = row[seriesName];
      const valDisplay = val !== undefined && val !== null ? val : 'N/A';
      return `${row.name}: ${valDisplay}${unit ? ` ${unit}` : ''}`;
    }).join(', ');
    lines.push(`- ${seriesName}: ${valueStr}`);
  });

  // Add observations for AI context
  lines.push('');
  lines.push('Key observations:');
  const observations = computeObservations(seriesNames, periods, data);
  observations.forEach(obs => lines.push(`- ${obs}`));

  return lines.join('\n');
}

/**
 * Format pie chart data.
 * Recharts format: data = [{name: "Heating", value: 53}, ...]
 */
function formatPieChart(chart) {
  const { title, unit, data } = chart;

  const lines = [];
  lines.push('CHART DATA REFERENCE (for accuracy verification):');
  lines.push(`Type: Pie chart`);
  
  if (title) lines.push(`Title: ${title}`);
  if (unit) lines.push(`Unit of measurement: ${unit}`);
  lines.push('');

  if (!Array.isArray(data) || data.length === 0) {
    lines.push('(No segments available.)');
    return lines.join('\n');
  }

  // Sort segments by value desc for clarity
  const sorted = [...data].sort((a, b) => (b.value || 0) - (a.value || 0));
  const total = sorted.reduce((sum, s) => sum + (s.value || 0), 0);

  lines.push('Segments (from largest to smallest):');
  sorted.forEach(seg => {
    const percent = total > 0 ? ((seg.value / total) * 100).toFixed(1) : 0;
    lines.push(`- ${seg.name}: ${seg.value}${unit ? ` ${unit}` : ''} (${percent}% of total)`);
  });

  lines.push('');
  lines.push(`Total: ${total}${unit ? ` ${unit}` : ''}`);
  lines.push('');
  lines.push('Key observations:');
  if (sorted.length > 0) {
    lines.push(`- Largest segment: ${sorted[0].name} (${sorted[0].value}${unit ? ` ${unit}` : ''})`);
    lines.push(`- Smallest segment: ${sorted[sorted.length - 1].name} (${sorted[sorted.length - 1].value}${unit ? ` ${unit}` : ''})`);
  }

  return lines.join('\n');
}

// ============================================
// OBSERVATION HELPERS
// ============================================

/**
 * Compute observations for bar chart and line graph.
 * Identifies: peak value, trends per series.
 */
function computeObservations(seriesNames, periods, data) {
  const observations = [];

  // Find global peak value
  let maxValue = -Infinity;
  let maxSeries = '';
  let maxPeriod = '';

  seriesNames.forEach(seriesName => {
    data.forEach(row => {
      const val = row[seriesName];
      if (typeof val === 'number' && val > maxValue) {
        maxValue = val;
        maxSeries = seriesName;
        maxPeriod = row.name;
      }
    });
  });

  if (maxSeries) {
    observations.push(`Highest value overall: ${maxSeries} in ${maxPeriod} (${maxValue})`);
  }

  // Trend per series (first vs last period)
  seriesNames.forEach(seriesName => {
    const values = data.map(row => row[seriesName]).filter(v => typeof v === 'number');
    if (values.length < 2) return;

    const first = values[0];
    const last = values[values.length - 1];
    const peak = Math.max(...values);
    const trough = Math.min(...values);
    const change = last - first;
    const pctChange = first !== 0 ? ((change / first) * 100).toFixed(0) : 0;

    if (Math.abs(change) < Math.abs(first) * 0.05) {
      observations.push(`${seriesName}: relatively stable (${first} → ${last})`);
    } else if (change > 0) {
      observations.push(`${seriesName}: increased from ${first} to ${last} (+${pctChange}%)`);
    } else {
      observations.push(`${seriesName}: decreased from ${first} to ${last} (${pctChange}%)`);
    }

    // Note significant fluctuations (peak between first and last)
    if (peak > Math.max(first, last)) {
      const peakIdx = values.indexOf(peak);
      if (peakIdx > 0 && peakIdx < values.length - 1) {
        observations.push(`${seriesName}: peaked at ${peak} in ${periods[peakIdx]} before changing direction`);
      }
    }

    // Note troughs (dip in middle)
    if (trough < Math.min(first, last)) {
      const troughIdx = values.indexOf(trough);
      if (troughIdx > 0 && troughIdx < values.length - 1) {
        observations.push(`${seriesName}: dipped to ${trough} in ${periods[troughIdx]} before recovering`);
      }
    }
  });

  return observations;
}