import { useMemo } from 'react';
import './ProfitLocationChart.css';

type ProfitPerLocationRow = {
  LocationName: string;
  TotalOrders: number | string;
  TotalSales: number | string;
  TotalCost: number | string;
  TotalProfit: number | string;
  ProfitMarginPct: number | string;
};

type MetricKey = 'TotalProfit' | 'TotalSales' | 'TotalCost' | 'TotalOrders' | 'ProfitMarginPct';

interface ProfitLocationChartProps {
  data: ProfitPerLocationRow[];
  metric?: MetricKey;
}

const metricConfig: Record<MetricKey, { title: string; color: string; format: (n: number) => string }> = {
  TotalProfit: {
    title: 'Total Profit by Location',
    color: '#10b981',
    format: (n) => {
      if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
      if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`;
      return `$${n.toFixed(0)}`;
    }
  },
  TotalSales: {
    title: 'Revenue Share by Location',
    color: '#3b82f6',
    format: (n) => `${n.toFixed(1)}%`
  },
  TotalCost: {
    title: 'Total Cost by Location',
    color: '#ef4444',
    format: (n) => {
      if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
      if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`;
      return `$${n.toFixed(0)}`;
    }
  },
  TotalOrders: {
    title: 'Total Orders by Location',
    color: '#8b5cf6',
    format: (n) => n.toFixed(0)
  },
  ProfitMarginPct: {
    title: 'Profit Margin by Location',
    color: '#f59e0b',
    format: (n) => `${n.toFixed(1)}%`
  }
};

export default function ProfitLocationChart({ data, metric = 'TotalProfit' }: ProfitLocationChartProps) {
  // Safety check: ensure metric is valid for this chart type
  const validMetric = (metric as string) in metricConfig ? metric : 'TotalProfit';
  const config = metricConfig[validMetric];
  
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Validate metric exists in data
    const hasValidMetric = data.some(d => d[validMetric] !== undefined && d[validMetric] !== null);
    if (!hasValidMetric) return [];
    
    // Skip locations without a name to prevent crashes
    const validData = data.filter(item => item.LocationName && item.LocationName.trim() !== '');
    if (validData.length === 0) return [];
    
    // Get max value for scaling based on the selected metric
    const maxValue = Math.max(...validData.map(d => Number(d[validMetric] || 0)), 0.01);
    
    return validData.map(item => ({
      name: item.LocationName || 'Unknown',
      value: Number(item[validMetric] || 0),
      profit: Number(item.TotalProfit || 0),
      sales: Number(item.TotalSales || 0),
      cost: Number(item.TotalCost || 0),
      orders: Number(item.TotalOrders || 0),
      margin: Number(item.ProfitMarginPct || 0),
      // Calculate bar height as percentage of max
      heightPercent: maxValue > 0 ? (Number(item[validMetric] || 0) / maxValue) * 100 : 0
    }));
  }, [data, validMetric]);

  if (chartData.length === 0) {
    return (
      <div className="location-chart-container">
        <div className="location-chart-empty">No data to display</div>
      </div>
    );
  }

  const maxProfit = Math.max(...chartData.map(d => d.value));
  const chartHeight = 300;
  const chartWidth = Math.max(600, chartData.length * 100);
  const barWidth = 60;
  const barGap = 40;
  const padding = { top: 20, right: 40, bottom: 80, left: 60 };

  // Pie chart specific calculations
  const isPieChart = validMetric === 'TotalSales';
  const pieRadius = 120;
  const pieCenterX = 200;
  const pieCenterY = 160;
  
  if (isPieChart) {
    // Calculate total sales for percentage calculation
    const totalSales = chartData.reduce((sum, d) => sum + d.sales, 0);
    let currentAngle = -90; // Start from top
    
    return (
      <div className="location-chart-container">
        <h3 className="location-chart-title">{config.title}</h3>
        <div className="location-chart-wrapper">
          <svg 
            width="100%" 
            height="400"
            viewBox="0 0 800 400"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Pie slices */}
            {chartData.map((item, index) => {
              const percentage = (item.sales / totalSales) * 100;
              const sliceAngle = (percentage / 100) * 360;
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
                    fill={config.color}
                    opacity={1 - (index * 0.15)}
                    stroke="white"
                    strokeWidth="2"
                    className="location-chart-bar"
                  >
                    <title>{item.name}: {config.format(item.value)}</title>
                  </path>
                  {percentage > 5 && (
                    <text
                      x={labelX}
                      y={labelY}
                      textAnchor="middle"
                      fontSize="12"
                      fill="white"
                      fontWeight="600"
                    >
                      {percentage.toFixed(1)}%
                    </text>
                  )}
                </g>
              );
            })}
            
            {/* Legend */}
            <g transform="translate(450, 50)">
              {chartData.map((item, index) => (
                <g key={index} transform={`translate(0, ${index * 25})`}>
                  <rect
                    x="0"
                    y="0"
                    width="20"
                    height="20"
                    fill={config.color}
                    opacity={1 - (index * 0.15)}
                    rx="3"
                  />
                  <text
                    x="30"
                    y="15"
                    fontSize="13"
                    fill="#374151"
                  >
                    {item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name}
                    {' '}({((item.sales / totalSales) * 100).toFixed(1)}%)
                  </text>
                </g>
              ))}
            </g>
          </svg>
        </div>
      </div>
    );
  }

  // Bar chart (original code)

  return (
    <div className="location-chart-container">
      <h3 className="location-chart-title">{config.title}</h3>
      <div className="location-chart-wrapper">
        <svg 
          width="100%" 
          height={chartHeight + padding.top + padding.bottom}
          viewBox={`0 0 ${chartWidth + padding.left + padding.right} ${chartHeight + padding.top + padding.bottom}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Y-axis labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((tick, i) => {
            const y = padding.top + chartHeight - (tick * chartHeight);
            const value = maxProfit * tick;
            return (
              <g key={i}>
                {/* Grid line */}
                <line
                  x1={padding.left}
                  y1={y}
                  x2={chartWidth + padding.left}
                  y2={y}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
                {/* Y-axis label */}
                <text
                  x={padding.left - 10}
                  y={y + 5}
                  textAnchor="end"
                  fontSize="12"
                  fill="#6b7280"
                >
                  {`$${value.toFixed(0)}`}
                </text>
              </g>
            );
          })}

          {/* Bars */}
          {chartData.map((item, index) => {
            const x = padding.left + (index * (barWidth + barGap));
            const barHeight = (item.value / maxProfit) * chartHeight;
            const y = padding.top + chartHeight - barHeight;

            return (
              <g key={index}>
                {/* Bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={config.color}
                  className="location-chart-bar"
                  data-location={item.name}
                  data-value={item.value}
                >
                  <title>
                    {item.name}: {config.format(item.value)}
                  </title>
                </rect>

                {/* Value label on top of bar */}
                <text
                  x={x + barWidth / 2}
                  y={y - 5}
                  textAnchor="middle"
                  fontSize="11"
                  fill="#374151"
                  fontWeight="600"
                >
                  {config.format(item.value)}
                </text>

                {/* X-axis label (location name) */}
                <text
                  x={x + barWidth / 2}
                  y={padding.top + chartHeight + 15}
                  textAnchor="end"
                  fontSize="12"
                  fill="#374151"
                  transform={`rotate(-45 ${x + barWidth / 2} ${padding.top + chartHeight + 15})`}
                >
                  {item.name}
                </text>
              </g>
            );
          })}

          {/* X-axis line */}
          <line
            x1={padding.left}
            y1={padding.top + chartHeight}
            x2={chartWidth + padding.left}
            y2={padding.top + chartHeight}
            stroke="#374151"
            strokeWidth="2"
          />

          {/* Y-axis line */}
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={padding.top + chartHeight}
            stroke="#374151"
            strokeWidth="2"
          />
        </svg>
      </div>
    </div>
  );
}
