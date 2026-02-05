import React from 'react';
import { Contract, SaleContract, ReceiptStatus } from '../types';
import { formatCurrencyBRL, parseDateString } from '../utils/formatters';
import { CalendarIcon } from './IconComponents';

type PaymentItem = Pick<Contract | SaleContract, 'id' | 'cliente' | 'comissao' | 'comissaoLiquida' | 'dataRecebimento' | 'statusRecebimento'>;

interface UpcomingPaymentsProps {
  items: PaymentItem[];
  title: string;
  className?: string;
}

const UpcomingPayments: React.FC<UpcomingPaymentsProps> = ({ items, title, className }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = items
    .filter(item => {
      const dueDate = parseDateString(item.dataRecebimento);
      return (
        item.statusRecebimento === ReceiptStatus.Nao &&
        dueDate &&
        dueDate >= today
      );
    })
    .sort((a, b) => {
      const dateA = parseDateString(a.dataRecebimento);
      const dateB = parseDateString(b.dataRecebimento);
      if (!dateA || !dateB) return 0;
      return dateA.getTime() - dateB.getTime();
    })
    .slice(0, 5); // Show top 5 upcoming payments

  const getDaysUntilDueText = (dueDateStr: string): string => {
    const dueDate = parseDateString(dueDateStr);
    if (!dueDate) return '';
    const timeDiff = dueDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (daysDiff === 0) return 'Vence hoje';
    if (daysDiff === 1) return 'Vence amanhã';
    return `Vence em ${daysDiff} dias`;
  };

  return (
    <div className={`glass-card p-4 md:p-6 rounded-xl flex flex-col ${className}`}>
      <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2 flex-shrink-0">
        <CalendarIcon className="w-6 h-6" />
        {title}
      </h3>
      {upcoming.length > 0 ? (
        <ul className="space-y-3 flex-grow overflow-y-auto">
          {upcoming.map(item => (
            <li key={item.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 p-3 bg-black/5 rounded-lg border border-transparent hover:border-[var(--color-border)] transition-colors">
              <div>
                <p className="font-semibold text-[var(--color-text-primary)]">{item.cliente}</p>
                <p className="text-sm text-green-600 font-medium">{formatCurrencyBRL(item.comissaoLiquida || item.comissao)}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-medium text-[var(--color-text-secondary)]">{item.dataRecebimento}</p>
                <p className="text-xs text-brand-accent font-semibold">{getDaysUntilDueText(item.dataRecebimento)}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center text-[var(--color-text-secondary)] py-8 flex-grow flex items-center justify-center">
          <p>Nenhum recebimento pendente agendado.</p>
        </div>
      )}
    </div>
  );
};

export default UpcomingPayments;