import { useMemo } from 'react';
import './EmployeePerformanceChart.css';

type EmployeePerfRow = {
  EmployeeName: string;
  Role: string;
  TotalOrdersHandled: number | string;
  TotalSales: number | string;
  TotalHoursWorked: number | string;
  SalesPerHour?: number;
};

type MetricKey = 'TotalOrdersHandled' | 'TotalSales' | 'TotalHoursWorked' | 'SalesPerHour';

interface EmployeePerformanceChartProps {
  data: EmployeePerfRow[];
  metric?: MetricKey;
}

const metricConfig: Record<MetricKey, { title: string; format: (n: number) => string }> = {
  SalesPerHour: {
    title: 'Sales per Hour by Employee',
    format: (n) => {
      if (n >= 1000) return `$${(n / 1000).toFixed(1)}k/hr`;
      return `$${n.toFixed(2)}/hr`;
    }
  },
  TotalSales: {
    title: 'Total Sales by Employee',
    format: (n) => {
      if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
      if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`;
      return `$${n.toFixed(0)}`;
    }
  },
  TotalOrdersHandled: {
    title: 'Orders Handled by Employee',
    format: (n) => n.toFixed(0)
  },
  TotalHoursWorked: {
    title: 'Hours Worked by Employee',
    format: (n) => `${n.toFixed(1)}h`
  }
};

// Vibrant colors for employees
const employeeColors = [
  '#3b82f6', // Blue
  '#10b981', // Green
  '#f59e0b', // Orange
  '#8b5cf6', // Purple
  '#ef4444', // Red
  '#06b6d4', // Cyan
  '#ec4899', // Pink
  '#84cc16', // Lime
  '#f97316', // Orange-red
  '#14b8a6', // Teal
  '#6366f1', // Indigo
  '#a855f7', // Violet
  '#d946ef', // Fuchsia
  '#f43f5e', // Rose
  '#fb923c', // Light orange
  '#fbbf24', // Amber
  '#a3e635', // Light lime
  '#4ade80', // Light green
  '#2dd4bf', // Light teal
  '#22d3ee', // Light cyan
];

export default function EmployeePerformanceChart({ data, metric = 'SalesPerHour' }: EmployeePerformanceChartProps) {
  // Safety check: ensure metric is valid for this chart type
  const validMetric = (metric as string) in metricConfig ? metric : 'SalesPerHour';
  const config = metricConfig[validMetric];
  
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Validate metric exists in data
    const hasValidMetric = data.some(d => {
      const value = d[validMetric];
      return value !== undefined && value !== null && !isNaN(Number(value));
    });
    if (!hasValidMetric) return [];
    
    // Skip employees without a name to prevent crashes
    const validData = data.filter(item => 
      item.EmployeeName && 
      item.EmployeeName.trim() !== '' &&
      item.EmployeeName.toLowerCase() !== 'unknown'
    );
    if (validData.length === 0) return [];
    
    // Get max value for scaling
    const maxValue = Math.max(...validData.map(d => Number(d[validMetric] || 0)), 0.01);
    
    return validData.map((item, index) => ({
      name: item.EmployeeName || 'Unknown',
      role: item.Role || 'N/A',
      color: employeeColors[index % employeeColors.length],
      value: Number(item[validMetric] || 0),
      orders: Number(item.TotalOrdersHandled || 0),
      sales: Number(item.TotalSales || 0),
      hours: Number(item.TotalHoursWorked || 0),
      salesPerHour: Number(item.SalesPerHour || 0),
      // Calculate bar width as percentage of max
      widthPercent: maxValue > 0 ? (Number(item[validMetric] || 0) / maxValue) * 100 : 0
    }));
  }, [data, validMetric]);

  if (chartData.length === 0) {
    return (
      <div className="employee-chart-container">
        <div className="employee-chart-empty">No data to display</div>
      </div>
    );
  }

  const maxValue = Math.max(...chartData.map(d => d.value), 0.01);
  const chartWidth = 700;
  const barHeight = 35;
  const barGap = 15;
  const chartHeight = chartData.length * (barHeight + barGap);
  const padding = { top: 20, right: 100, bottom: 40, left: 180 };

  return (
    <div className="employee-chart-container">
      <h3 className="employee-chart-title">{config.title}</h3>
      <div className="employee-chart-wrapper">
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
                  {validMetric === 'TotalOrdersHandled'
                    ? value.toFixed(0)
                    : validMetric === 'TotalHoursWorked'
                    ? `${value.toFixed(0)}h`
                    : validMetric === 'SalesPerHour'
                    ? value >= 1000
                      ? `$${(value / 1000).toFixed(0)}k`
                      : `$${value.toFixed(0)}`
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
              <g key={`${item.name}-${index}`}>
                {/* Bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={item.color}
                  className="employee-chart-bar"
                  data-employee={item.name}
                  data-value={item.value}
                >
                  <title>
                    {item.name} ({item.role}): {config.format(item.value)}
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

                {/* Y-axis label (employee name) */}
                <text
                  x={x - 10}
                  y={y + barHeight / 2 + 5}
                  textAnchor="end"
                  fontSize="12"
                  fill="#374151"
                  className="employee-name-label"
                >
                  {item.name.length > 22 ? item.name.substring(0, 22) + '...' : item.name}
                </text>

                {/* Role label (small, to the left) */}
                <text
                  x={x - 10}
                  y={y + barHeight / 2 + 18}
                  textAnchor="end"
                  fontSize="9"
                  fill="#9ca3af"
                >
                  {item.role}
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
    </div>
  );
}
