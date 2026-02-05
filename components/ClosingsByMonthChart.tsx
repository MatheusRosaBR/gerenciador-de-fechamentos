import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { parseDateString } from '../utils/formatters';

interface ChartItem {
  formalizacao?: string; // For rentals
  dataVenda?: string;    // For sales
}

interface ClosingsByMonthChartProps {
  items: ChartItem[];
}

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[var(--color-bg-surface)] p-3 rounded-lg shadow-lg border border-[var(--color-border)]">
        <p className="font-bold text-[var(--color-text-primary)]">{`${label}`}</p>
        <p className="text-sm text-brand-accent">{`Fechamentos: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};


const ClosingsByMonthChart: React.FC<ClosingsByMonthChartProps> = ({ items }) => {
  const monthMap: { [key: string]: number } = {
    'Jan': 0, 'Fev': 1, 'Mar': 2, 'Abr': 3, 'Mai': 4, 'Jun': 5,
    'Jul': 6, 'Ago': 7, 'Set': 8, 'Out': 9, 'Nov': 10, 'Dez': 11,
  };

  const parseMonthYear = (monthYear: string): Date | null => {
    const parts = monthYear.split('/');
    if (parts.length !== 2) return null;
    const monthStr = parts[0];
    const year = parseInt(parts[1], 10);
    const month = monthMap[monthStr];

    if (isNaN(year) || month === undefined) return null;
    return new Date(year, month);
  };

  const formatDateToMonthYear = (date: Date): string => {
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${month}/${year}`;
  };

  const data = items.reduce((acc, item) => {
    const dateString = item.formalizacao || item.dataVenda;
    if (!dateString) return acc;

    const date = parseDateString(dateString);
    if (!date) return acc;

    const monthYear = formatDateToMonthYear(date);
    const existing = acc.find(d => d.name === monthYear);

    if (existing) {
      existing.fechamentos++;
    } else {
      acc.push({ name: monthYear, fechamentos: 1 });
    }
    return acc;
  }, [] as { name: string; fechamentos: number }[]);


  // Sort data chronologically
  data.sort((a, b) => {
    const dateA = parseMonthYear(a.name);
    const dateB = parseMonthYear(b.name);
    if (dateA && dateB) {
      return dateA.getTime() - dateB.getTime();
    }
    return 0;
  });

  if (items.length === 0) {
    return (
      <div className="bg-[var(--color-bg-surface)] p-4 md:p-6 rounded-xl shadow-lg border border-[var(--color-border)] h-80 flex flex-col items-center justify-center">
        <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">Tendência de Fechamentos</h3>
        <p className="text-[var(--color-text-secondary)]">Nenhum fechamento registrado ainda.</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-4 md:p-6 rounded-xl flex flex-col h-80">
      <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4 text-center">Tendência de Fechamentos</h3>
      <div className="flex-grow">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 20, left: -25, bottom: 5 }}>
            <defs>
              <linearGradient id="colorFechamentosArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-brand-accent)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="var(--color-brand-accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
            <XAxis
              dataKey="name"
              stroke="var(--color-text-secondary)"
              tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              allowDecimals={false}
              stroke="var(--color-text-secondary)"
              tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              width={25}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: 'var(--color-brand-accent)', strokeWidth: 1, strokeDasharray: '3 3' }}
            />
            <Area
              type="monotone"
              dataKey="fechamentos"
              stroke="var(--color-brand-accent)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorFechamentosArea)"
              dot={{ stroke: 'var(--color-brand-accent)', strokeWidth: 1, r: 3, fill: 'var(--color-bg-surface)' }}
              activeDot={{ r: 6, stroke: 'var(--color-bg-surface)', strokeWidth: 2, fill: 'var(--color-brand-accent)' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ClosingsByMonthChart;