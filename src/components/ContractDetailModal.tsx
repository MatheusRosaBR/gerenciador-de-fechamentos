import React from 'react';
import { Contract, ReceiptStatus } from '../types';
import { formatCurrencyBRL, formatDateForGoogleCalendar } from '../utils/formatters';
import { XIcon, HomeIcon, UserIcon, CalendarIcon, CurrencyDollarIcon, CollectionIcon, ChartPieIcon, DocumentTextIcon, PhoneIcon, MailIcon, CalendarPlusIcon, BellIcon } from './IconComponents';

interface ContractDetailModalProps {
  contract: Contract;
  onClose: () => void;
  onUpdateStatus: (contractId: string, newStatus: ReceiptStatus) => void;
  onToggleReminder: (contractId: string) => void;
}

const DetailItem: React.FC<{ icon: React.ReactNode, label: string, value: string | number, children?: React.ReactNode }> = ({ icon, label, value, children }) => (
    <div className="flex items-start gap-3">
        <div className="text-brand-accent mt-1">{icon}</div>
        <div className="flex-1">
            <p className="text-sm text-[var(--color-text-secondary)]">{label}</p>
            <div className="flex items-center justify-between gap-2">
                <p className="font-semibold text-[var(--color-text-primary)] break-words">{value}</p>
                {children}
            </div>
        </div>
    </div>
);

const ContractDetailModal: React.FC<ContractDetailModalProps> = ({ contract, onClose, onUpdateStatus, onToggleReminder }) => {
  const handleStatusChange = (newStatus: ReceiptStatus) => {
    onUpdateStatus(contract.id, newStatus);
  };
  
  const handleAddToCalendar = (e: React.MouseEvent, dateStr: string, title: string, details: string) => {
    e.stopPropagation();
    const formattedDate = formatDateForGoogleCalendar(dateStr);
    if (!formattedDate) {
      alert("Data inválida para adicionar ao calendário.");
      return;
    }
    const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${formattedDate}/${formattedDate}&details=${encodeURIComponent(details)}&sf=true&output=xml`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div 
      className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm flex justify-center items-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-[var(--color-bg-surface)] rounded-xl shadow-2xl w-full max-w-lg relative transform transition-all duration-300 scale-95 animate-modal-enter border border-[var(--color-border)]"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-[var(--color-border)] flex justify-between items-center">
          <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Detalhes do Contrato</h2>
          <button onClick={onClose} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <DetailItem icon={<UserIcon className="w-5 h-5"/>} label="Cliente" value={contract.cliente} />
            <DetailItem icon={<HomeIcon className="w-5 h-5"/>} label="Imóvel" value={contract.imovel} />
            <DetailItem icon={<PhoneIcon className="w-5 h-5"/>} label="Telefone" value={contract.telefone || 'Não informado'} />
            <DetailItem icon={<MailIcon className="w-5 h-5"/>} label="Email" value={contract.email || 'Não informado'} />
            <DetailItem icon={<CurrencyDollarIcon className="w-5 h-5"/>} label="Valor da Locação" value={formatCurrencyBRL(contract.valorLocacao)} />
            <DetailItem icon={<CollectionIcon className="w-5 h-5"/>} label="Comissão" value={formatCurrencyBRL(contract.comissao)} />
            <DetailItem icon={<ChartPieIcon className="w-5 h-5"/>} label="% Comissão" value={`${(contract.percentualComissao * 100).toFixed(1)}%`} />
            <DetailItem icon={<DocumentTextIcon className="w-5 h-5"/>} label="Status do Contrato" value={contract.statusContrato} />
            <DetailItem icon={<CalendarIcon className="w-5 h-5"/>} label="Data Formalização" value={contract.formalizacao || 'Pendente'}>
                {contract.formalizacao && (
                    <button
                        onClick={(e) => handleAddToCalendar(e, contract.formalizacao, `Formalização Contrato: ${contract.cliente} - Imóvel ${contract.imovel}`, `Formalização do contrato de locação para o imóvel ${contract.imovel} com o cliente ${contract.cliente}.\nValor: ${formatCurrencyBRL(contract.valorLocacao)}`)}
                        className="text-[var(--color-text-secondary)]/60 hover:text-brand-accent transition-colors p-1 rounded-full"
                        title="Adicionar ao Google Calendar"
                    >
                        <CalendarPlusIcon className="w-5 h-5" />
                    </button>
                )}
            </DetailItem>
            <DetailItem icon={<CalendarIcon className="w-5 h-5"/>} label="Previsão Recebimento" value={contract.dataRecebimento || 'Pendente'}>
                 {contract.dataRecebimento && (
                    <button
                        onClick={(e) => handleAddToCalendar(e, contract.dataRecebimento, `Recebimento Comissão: ${contract.cliente} - Imóvel ${contract.imovel}`, `Recebimento da comissão (${formatCurrencyBRL(contract.comissao)}) referente ao contrato de locação para o imóvel ${contract.imovel} com o cliente ${contract.cliente}.`)}
                        className="text-[var(--color-text-secondary)]/60 hover:text-brand-accent transition-colors p-1 rounded-full"
                        title="Adicionar ao Google Calendar"
                    >
                        <CalendarPlusIcon className="w-5 h-5" />
                    </button>
                )}
            </DetailItem>
        </div>

        <div className="p-6 bg-[var(--color-bg-muted)]/50 rounded-b-xl flex flex-col gap-4">
          <div>
            <h3 className="text-sm font-medium text-[var(--color-text-secondary)] mb-3">Status de Pagamento</h3>
            <div className="flex gap-4">
              <button
                onClick={() => handleStatusChange(ReceiptStatus.Sim)}
                className={`flex-1 py-3 px-4 text-sm font-bold rounded-md transition-all duration-200 border-2 ${
                  contract.statusRecebimento === ReceiptStatus.Sim
                    ? 'bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/20'
                    : 'bg-transparent border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-green-500/20 hover:border-green-500'
                }`}
              >
                Recebido
              </button>
              <button
                onClick={() => handleStatusChange(ReceiptStatus.Nao)}
                className={`flex-1 py-3 px-4 text-sm font-bold rounded-md transition-all duration-200 border-2 ${
                  contract.statusRecebimento === ReceiptStatus.Nao
                    ? 'bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/20'
                    : 'bg-transparent border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-red-500/20 hover:border-red-500'
                }`}
              >
                Pendente
              </button>
            </div>
          </div>
           {contract.statusRecebimento === ReceiptStatus.Nao && (
            <div>
                <h3 className="text-sm font-medium text-[var(--color-text-secondary)] mb-2">Lembrete de Vencimento</h3>
                <button
                onClick={() => onToggleReminder(contract.id)}
                className={`w-full py-3 px-4 text-sm font-bold rounded-md transition-all duration-200 border-2 flex items-center justify-center gap-2 ${
                    contract.lembreteAtivo
                    ? 'bg-sky-500 border-sky-500 text-white shadow-lg shadow-sky-500/20'
                    : 'bg-transparent border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-sky-500/20 hover:border-sky-500'
                }`}
                >
                <BellIcon className="w-5 h-5" />
                {contract.lembreteAtivo ? 'Lembrete Ativado' : 'Ativar Lembrete'}
                </button>
            </div>
            )}
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

export default ContractDetailModal;