import { useMemo } from 'react';
import './PopularItemChart.css';

type PopularItemRow = {
  ItemName: string;
  Category: string;
  TotalQuantity: number | string;
  TotalSales: number | string;
  AvgPricePerItem: number | string;
  SalesSharePct: number | string;
};

type MetricKey = 'TotalQuantity' | 'TotalSales' | 'AvgPricePerItem' | 'SalesSharePct';

interface PopularItemChartProps {
  data: PopularItemRow[];
  metric?: MetricKey;
}

const metricConfig: Record<MetricKey, { title: string; color: string; format: (n: number) => string }> = {
  TotalQuantity: {
    title: 'Quantity Sold by Item',
    color: '#8b5cf6',
    format: (n) => n.toFixed(0)
  },
  TotalSales: {
    title: 'Total Sales by Item',
    color: '#3b82f6',
    format: (n) => {
      if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
      if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`;
      return `$${n.toFixed(0)}`;
    }
  },
  AvgPricePerItem: {
    title: 'Average Price by Item',
    color: '#10b981',
    format: (n) => `$${n.toFixed(2)}`
  },
  SalesSharePct: {
    title: 'Sales Share (%) by Item',
    color: '#f59e0b',
    format: (n) => `${n.toFixed(1)}%`
  }
};

// Category colors for visual distinction
const categoryColors: Record<string, string> = {
  'appetizer': '#ef4444',     // Red
  'entree': '#3b82f6',        // Blue
  'dessert': '#f59e0b',       // Orange
  'beverage': '#8b5cf6',      // Purple
  'side': '#10b981',          // Green
  'drink': '#06b6d4',         // Cyan
  'salad': '#84cc16',         // Lime
  'sandwich': '#ec4899',      // Pink
  'pasta': '#f97316',         // Orange-red
  'seafood': '#14b8a6',       // Teal
};

// Fallback colors for new categories
const fallbackColors = [
  '#6366f1', '#a855f7', '#d946ef', '#f43f5e', '#fb923c',
  '#fbbf24', '#a3e635', '#4ade80', '#2dd4bf', '#22d3ee'
];

const getCategoryColor = (category: string, usedColors: Set<string>): string => {
  const normalizedCategory = category.toLowerCase().trim();
  
  // Check if category is missing/empty - use gray as indicator
  if (!category || normalizedCategory === '' || normalizedCategory === 'undefined' || normalizedCategory === 'null') {
    return '#9ca3af'; // Gray - indicates missing category
  }
  
  // Check if we have a predefined color
  if (categoryColors[normalizedCategory]) {
    return categoryColors[normalizedCategory];
  }
  
  // Find a fallback color that hasn't been used yet
  const availableColor = fallbackColors.find(color => !usedColors.has(color));
  if (availableColor) {
    // Add to our mapping for consistency
    categoryColors[normalizedCategory] = availableColor;
    return availableColor;
  }
  
  // If all colors are used, generate a random color
  const randomColor = `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`;
  categoryColors[normalizedCategory] = randomColor;
  return randomColor;
};

export default function PopularItemChart({ data, metric = 'TotalSales' }: PopularItemChartProps) {
  // Safety check: ensure metric is valid for this chart type
  const validMetric = (metric as string) in metricConfig ? metric : 'TotalSales';
  const config = metricConfig[validMetric];
  
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Validate metric exists in data
    const hasValidMetric = data.some(d => d[validMetric] !== undefined && d[validMetric] !== null);
    if (!hasValidMetric) return [];
    
    // Get max value for scaling based on the selected metric
    const maxValue = Math.max(...data.map(d => Number(d[validMetric] || 0)));
    
    // Build color mapping for categories
    const usedColors = new Set<string>();
    const categoryColorMap = new Map<string, string>();
    
    data.forEach(item => {
      if (!item.Category) return; // Skip items without category
      const normalizedCategory = item.Category.toLowerCase().trim();
      if (!categoryColorMap.has(normalizedCategory)) {
        const color = getCategoryColor(item.Category, usedColors);
        categoryColorMap.set(normalizedCategory, color);
        usedColors.add(color);
      }
    });
    
    return data.map(item => {
      const displayCategory = item.Category && item.Category.trim() !== '' ? item.Category : 'No Category';
      return {
        name: item.ItemName || 'Unknown',
        category: displayCategory,
        color: categoryColorMap.get((item.Category || '').toLowerCase().trim()) || '#9ca3af',
        value: Number(item[validMetric] || 0),
        quantity: Number(item.TotalQuantity || 0),
        sales: Number(item.TotalSales || 0),
        avgPrice: Number(item.AvgPricePerItem || 0),
        sharePercent: Number(item.SalesSharePct || 0),
        // Calculate bar width as percentage of max
        widthPercent: maxValue > 0 ? (Number(item[validMetric] || 0) / maxValue) * 100 : 0
      };
    });
  }, [data, validMetric]);

  if (chartData.length === 0) {
    return (
      <div className="item-chart-container">
        <div className="item-chart-empty">No data to display</div>
      </div>
    );
  }

  const maxValue = Math.max(...chartData.map(d => d.value), 0.01); // Ensure we never have 0
  const chartWidth = 700;
  const barHeight = 35;
  const barGap = 15;
  const chartHeight = chartData.length * (barHeight + barGap);
  const padding = { top: 20, right: 100, bottom: 40, left: 200 };

  // Pie chart specific calculations
  const isPieChart = validMetric === 'SalesSharePct';
  const pieRadius = 140;
  const pieCenterX = 220;
  const pieCenterY = 180;
  
  if (isPieChart) {
    let currentAngle = -90; // Start from top
    
    return (
      <div className="item-chart-container">
        <h3 className="item-chart-title">{config.title}</h3>
        <div className="item-chart-wrapper">
          <svg 
            width="100%" 
            height="450"
            viewBox="0 0 900 450"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Pie slices */}
            {chartData.map((item, index) => {
              const sliceAngle = (item.value / 100) * 360; // value is already a percentage
              const startAngle = currentAngle;
              const endAngle = currentAngle + sliceAngle;
              
              // Calculate path for pie slice
              const startRad = (startAngle * Math.PI) / 180;
              const endRad = (endAngle * Math.PI) / 180;
              
              const x1 = pieCenterX + pieRadius * Math.cos(startRad);
              const y1 = pieCenterY + pieRadius * Math.sin(startRad);
              const x2 = pieCenterX + pieRadius * Math.cos(endRad);
              const y2 = pieCenterY + pieRadius * Math.sin(endRad);
              
              const largeArc = sliceAngle > 180 ? 1 : 0;
              
              const pathData = [
                `M ${pieCenterX} ${pieCenterY}`,
                `L ${x1} ${y1}`,
                `A ${pieRadius} ${pieRadius} 0 ${largeArc} 1 ${x2} ${y2}`,
                'Z'
              ].join(' ');
              
              // Calculate label position (middle of slice)
              const labelAngle = startAngle + sliceAngle / 2;
              const labelRad = (labelAngle * Math.PI) / 180;
              const labelDistance = pieRadius * 0.7;
              const labelX = pieCenterX + labelDistance * Math.cos(labelRad);
              const labelY = pieCenterY + labelDistance * Math.sin(labelRad);
              
              currentAngle = endAngle;
              
              return (
                <g key={index}>
                  <path
                    d={pathData}
                    fill={item.color}
                    stroke="white"
                    strokeWidth="2"
                    className="item-chart-bar"
                  >
                    <title>{item.name} ({item.category}): {config.format(item.value)}</title>
                  </path>
                  {item.value > 3 && (
                    <text
                      x={labelX}
                      y={labelY}
                      textAnchor="middle"
                      fontSize="12"
                      fill="white"
                      fontWeight="600"
                    >
                      {item.value.toFixed(1)}%
                    </text>
                  )}
                </g>
              );
            })}
            
            {/* Legend */}
            <g transform="translate(500, 30)">
              {chartData.slice(0, 15).map((item, index) => (
                <g key={index} transform={`translate(0, ${index * 25})`}>
                  <rect
                    x="0"
                    y="0"
                    width="20"
                    height="20"
                    fill={item.color}
                    rx="3"
                  />
                  <text
                    x="30"
                    y="15"
                    fontSize="12"
                    fill="#374151"
                  >
                    {item.name.length > 18 ? item.name.substring(0, 18) + '...' : item.name}
                    {' '}({item.value.toFixed(1)}%)
                  </text>
                </g>
              ))}
              {chartData.length > 15 && (
                <text x="30" y={(15 * 25) + 15} fontSize="11" fill="#9ca3af">
                  + {chartData.length - 15} more items
                </text>
              )}
            </g>
          </svg>
        </div>
        
        {/* Category Legend */}
        <div className="item-chart-legend">
          {Array.from(new Set(chartData.map(d => d.category))).map(category => {
            const categoryItem = chartData.find(d => d.category === category);
            return (
              <div key={category} className="item-legend-item">
                <div 
                  className="item-legend-color" 
                  style={{ backgroundColor: categoryItem?.color || '#6b7280' }}
                ></div>
                <span>{category}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Bar chart (original code)

  return (
    <div className="item-chart-container">
      <h3 className="item-chart-title">{config.title}</h3>
      <div className="item-chart-wrapper">
        <svg 
          width="100%" 
          height={chartHeight + padding.top + padding.bottom}
          viewBox={`0 0 ${chartWidth + padding.left + padding.right} ${chartHeight + padding.top + padding.bottom}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* X-axis labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((tick, i) => {
            const x = padding.left + (tick * chartWidth);
            const value = maxValue * tick;
            return (
              <g key={i}>
                {/* Grid line */}
                <line
                  x1={x}
                  y1={padding.top}
                  x2={x}
                  y2={padding.top + chartHeight}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
                {/* X-axis label */}
                <text
                  x={x}
                  y={padding.top + chartHeight + 25}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#6b7280"
                >
                  {metric === 'SalesSharePct' || metric === 'TotalQuantity' 
                    ? value.toFixed(0) 
                    : metric === 'AvgPricePerItem'
                    ? `$${value.toFixed(0)}`
                    : value >= 1000000
                    ? `$${(value / 1000000).toFixed(0)}M`
                    : value >= 1000
                    ? `$${(value / 1000).toFixed(0)}k`
                    : `$${value.toFixed(0)}`}
                </text>
              </g>
            );
          })}

          {/* Bars */}
          {chartData.map((item, index) => {
            const y = padding.top + (index * (barHeight + barGap));
            const barWidth = (item.value / maxValue) * chartWidth;
            const x = padding.left;

            return (
              <g key={index}>
                {/* Bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={item.color}
                  className="item-chart-bar"
                  data-item={item.name}
                  data-value={item.value}
                >
                  <title>
                    {item.name} ({item.category}): {config.format(item.value)}
                  </title>
                </rect>

                {/* Value label at end of bar */}
                <text
                  x={x + barWidth + 5}
                  y={y + barHeight / 2 + 5}
                  fontSize="11"
                  fill="#374151"
                  fontWeight="600"
                >
                  {config.format(item.value)}
                </text>

                {/* Y-axis label (item name) */}
                <text
                  x={x - 10}
                  y={y + barHeight / 2 + 5}
                  textAnchor="end"
                  fontSize="12"
                  fill="#374151"
                  className="item-name-label"
                >
                  {item.name.length > 25 ? item.name.substring(0, 25) + '...' : item.name}
                </text>

                {/* Category label (small, to the left) */}
                <text
                  x={x - 10}
                  y={y + barHeight / 2 + 18}
                  textAnchor="end"
                  fontSize="9"
                  fill="#9ca3af"
                >
                  {item.category}
                </text>
              </g>
            );
          })}

          {/* Y-axis line */}
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={padding.top + chartHeight}
            stroke="#374151"
            strokeWidth="2"
          />

          {/* X-axis line */}
          <line
            x1={padding.left}
            y1={padding.top + chartHeight}
            x2={padding.left + chartWidth}
            y2={padding.top + chartHeight}
            stroke="#374151"
            strokeWidth="2"
          />
        </svg>
      </div>

      {/* Legend */}
      <div className="item-chart-legend">
        {Array.from(new Set(chartData.map(d => d.category))).map(category => {
          const categoryItem = chartData.find(d => d.category === category);
          return (
            <div key={category} className="item-legend-item">
              <div 
                className="item-legend-color" 
                style={{ backgroundColor: categoryItem?.color || '#6b7280' }}
              ></div>
              <span>{category}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
