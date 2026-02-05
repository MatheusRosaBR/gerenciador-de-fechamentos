import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { SaleContract, SaleStatus } from '../types';

interface SaleStatusChartProps {
  sales: SaleContract[];
}

const COLORS = {
  [SaleStatus.Vendido]: '#22c55e',      // green-500
  [SaleStatus.Escritura]: '#a855f7',   // purple-500
  [SaleStatus.Financiamento]: '#3b82f6',// blue-500
  [SaleStatus.Proposta]: '#eab308',     // yellow-500
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-[var(--color-bg-surface)] p-3 rounded-lg shadow-lg border border-[var(--color-border)]">
        <p className="font-bold text-[var(--color-text-primary)] mb-1">{data.name}</p>
        <p className="text-sm" style={{ color: data.fill }}>
          {`${data.value} Vendas`}
        </p>
      </div>
    );
  }
  return null;
};

const SaleStatusChart: React.FC<SaleStatusChartProps> = ({ sales }) => {
  const [pieRadius, setPieRadius] = useState(80);

  useEffect(() => {
    const handleResize = () => {
      // Tailwind's md breakpoint is 768px
      setPieRadius(window.innerWidth < 768 ? 60 : 80);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const statusCounts = sales.reduce((acc, sale) => {
    acc[sale.statusVenda] = (acc[sale.statusVenda] || 0) + 1;
    return acc;
  }, {} as Record<SaleStatus, number>);

  const data = Object.entries(statusCounts).map(([name, value]) => ({
    name: name as SaleStatus,
    value,
  }));

  if (data.length === 0) {
    return (
      <div className="bg-[var(--color-bg-surface)] p-4 md:p-6 rounded-xl shadow-lg border border-[var(--color-border)] h-80 md:h-96 flex items-center justify-center">
        <p className="text-[var(--color-text-secondary)]">Nenhum dado de status de venda disponível.</p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-bg-surface)] p-4 md:p-6 rounded-xl shadow-lg border border-[var(--color-border)] h-80 md:h-96 flex flex-col">
      <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2 text-center">Status das Vendas</h3>
      <div className="w-full flex-grow">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              labelLine={false}
              outerRadius={pieRadius}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ cx, cy, midAngle, innerRadius, outerRadius, value, index }) => {
                const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                return (
                  <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="font-bold">
                    {`${value}`}
                  </text>
                );
              }}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: 'var(--color-text-secondary)' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SaleStatusChart;