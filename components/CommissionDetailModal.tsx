import React, { useMemo } from 'react';
import { Contract, SaleContract, ReceiptStatus } from '../types';
import { formatCurrencyBRL, parseDateString } from '../utils/formatters';
import { XIcon } from './IconComponents';

type Item = Pick<Contract | SaleContract, 'statusRecebimento' | 'dataRecebimento' | 'comissao'>;

interface CommissionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: Item[];
  title: string;
}

const monthNameToNumber: { [key: string]: number } = {
  'janeiro': 0, 'fevereiro': 1, 'março': 2, 'abril': 3, 'maio': 4, 'junho': 5,
  'julho': 6, 'agosto': 7, 'setembro': 8, 'outubro': 9, 'novembro': 10, 'dezembro': 11
};

const parseMonthYearString = (str: string): Date => {
  const [monthName, , yearStr] = str.toLowerCase().split(' ');
  const month = monthNameToNumber[monthName];
  const year = parseInt(yearStr, 10);
  return new Date(year, month);
};


const CommissionDetailModal: React.FC<CommissionDetailModalProps> = ({ isOpen, onClose, items, title }) => {
  const processedData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const received: { [key: string]: number } = {};
    const projected: { [key: string]: number } = {};

    items.forEach(item => {
      const date = parseDateString(item.dataRecebimento);
      if (!date) return;
      
      // Capitalize the first letter of the month
      const monthYear = date.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
      const capitalizedMonthYear = monthYear.charAt(0).toUpperCase() + monthYear.slice(1);

      if (item.statusRecebimento === ReceiptStatus.Sim) {
        received[capitalizedMonthYear] = (received[capitalizedMonthYear] || 0) + item.comissao;
      } else if (item.statusRecebimento === ReceiptStatus.Nao && date >= today) {
        projected[capitalizedMonthYear] = (projected[capitalizedMonthYear] || 0) + item.comissao;
      }
    });

    const sortData = (data: { [key: string]: number }) => {
        return Object.entries(data).sort(([monthA], [monthB]) => {
            return parseMonthYearString(monthA).getTime() - parseMonthYearString(monthB).getTime();
        });
    };

    return {
      received: sortData(received),
      projected: sortData(projected),
    };
  }, [items]);
  
  if (!isOpen) {
    return null;
  }

  const DataSection: React.FC<{title: string, data: [string, number][]}> = ({ title, data }) => (
    <div>
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-3">{title}</h3>
        {data.length > 0 ? (
            <ul className="space-y-2">
            {data.map(([month, total]) => (
                <li key={month} className="flex justify-between items-center p-3 bg-black/5 rounded-md">
                <span className="font-medium text-[var(--color-text-secondary)]">{month}</span>
                <span className="font-bold text-green-600">{formatCurrencyBRL(total)}</span>
                </li>
            ))}
            </ul>
        ) : (
            <p className="text-sm text-[var(--color-text-secondary)] text-center py-4">Nenhum dado encontrado.</p>
        )}
    </div>
  );


  return (
    <div
      className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm flex justify-center items-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="commission-detail-title"
    >
      <div
        className="bg-[var(--color-bg-surface)] rounded-xl shadow-2xl w-full max-w-lg relative transform transition-all duration-300 scale-95 animate-modal-enter border border-[var(--color-border)]"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-[var(--color-border)] flex justify-between items-center">
          <h2 id="commission-detail-title" className="text-xl font-bold text-[var(--color-text-primary)]">{title}</h2>
          <button onClick={onClose} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors" aria-label="Fechar modal">
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            <DataSection title="Comissões Recebidas" data={processedData.received} />
            <DataSection title="Projeção de Recebimento" data={processedData.projected} />
        </div>
      </div>
       <style>{`
        @keyframes modal-enter {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-modal-enter {
          animation: modal-enter 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default CommissionDetailModal;