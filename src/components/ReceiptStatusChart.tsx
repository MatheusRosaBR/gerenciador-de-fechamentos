import React from 'react';
import { ReceiptStatus } from '../types';

interface ChartItem {
  statusRecebimento: ReceiptStatus;
}

interface ReceiptStatusChartProps {
  items: ChartItem[];
}

const ReceiptStatusChart: React.FC<ReceiptStatusChartProps> = ({ items }) => {
  if (items.length === 0) {
    return (
      <div className="glass-card p-4 md:p-6 rounded-xl flex items-center justify-center h-80 md:h-96">
        <p className="text-[var(--color-text-secondary)]">Nenhum dado de recebimento disponível.</p>
      </div>
    );
  }

  const received = items.filter(c => c.statusRecebimento === ReceiptStatus.Sim).length;
  const pending = items.filter(c => c.statusRecebimento === ReceiptStatus.Nao).length;

  return (
    <div className="glass-card p-4 md:p-6 rounded-xl flex flex-col h-80 md:h-96">
      <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2 text-center">Status de Recebimento</h3>
      <div className="flex-grow flex flex-col md:flex-row items-center justify-center gap-2 md:gap-8">

        <div className="flex flex-col items-center justify-center text-center p-2 md:p-4">
          <p className="text-5xl md:text-6xl font-bold text-green-500" style={{ textShadow: '0 2px 10px rgba(34, 197, 94, 0.2)' }}>{received}</p>
          <p className="text-base font-medium text-[var(--color-text-secondary)] mt-2">Contratos Recebidos</p>
        </div>

        <div className="w-full md:w-px h-px md:h-2/3 bg-[var(--color-border)]"></div>

        <div className="flex flex-col items-center justify-center text-center p-2 md:p-4">
          <p className="text-5xl md:text-6xl font-bold text-red-500" style={{ textShadow: '0 2px 10px rgba(239, 68, 68, 0.2)' }}>{pending}</p>
          <p className="text-base font-medium text-[var(--color-text-secondary)] mt-2">Contratos a Receber</p>
        </div>

      </div>
    </div>
  );
};

export default ReceiptStatusChart;