import React from 'react';
import { Contract, ReceiptStatus, ContractStatus } from '../types';
import { formatCurrencyBRL, formatDateFromISO } from '../utils/formatters';
import { PDFReportGenerator } from '../utils/PDFReportGenerator';
import { HomeIcon, UserIcon, PencilIcon, TrashIcon, ArrowDownTrayIcon } from './IconComponents';
import Pagination from './Pagination';

interface ContractListProps {
  contracts: Contract[];
  onSelectContract: (contract: Contract) => void;
  filter: ReceiptStatus | 'Todos';
  setFilter: (filter: ReceiptStatus | 'Todos') => void;
  isEditMode: boolean;
  onToggleEditMode: () => void;
  onUpdateContract: (contract: Contract) => void;
  onDeleteContract: (contractId: string) => void;
  totalItems: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  itemsPerPage: number;
  setItemsPerPage: (size: number) => void;
}

const ContractList: React.FC<ContractListProps> = ({
  contracts, onSelectContract, filter, setFilter, isEditMode, onToggleEditMode, onUpdateContract, onDeleteContract,
  totalItems, currentPage, setCurrentPage, itemsPerPage, setItemsPerPage
}) => {
  const handleExportPDF = () => {
    const generator = new PDFReportGenerator();
    generator.generateContractReport(contracts, {
      title: 'Relatório de Locações',
      filtroPeriodo: filter !== 'Todos' ? `Status: ${filter === ReceiptStatus.Sim ? 'Recebidos' : 'Pendentes'}` : 'Todos',
      userName: 'Corretor Pro' // Idealmente pegar do profileData se possível, mas hardcoded ok por agora ou passar via props
    });
  };

  const FilterButton: React.FC<{ value: ReceiptStatus | 'Todos', label: string }> = ({ value, label }) => (
    <button
      onClick={() => setFilter(value)}
      className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${filter === value
        ? 'bg-brand-accent text-[var(--color-text-accent)] shadow-md'
        : 'bg-[var(--color-bg-surface)]/40 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface)]/60'
        }`}
    >
      {label}
    </button>
  );

  const getStatusContratoClass = (status: ContractStatus) => {
    switch (status) {
      case ContractStatus.Assinado:
        return 'bg-green-500/20 text-green-800 dark:text-green-300';
      case ContractStatus.Contrato:
        return 'bg-purple-500/20 text-purple-800 dark:text-purple-300';
      case ContractStatus.Analise:
        return 'bg-yellow-500/20 text-yellow-800 dark:text-yellow-300';
      case ContractStatus.Documentacao:
        return 'bg-blue-500/20 text-blue-800 dark:text-blue-300';
      default:
        return 'bg-gray-500/20 text-gray-800 dark:text-gray-300';
    }
  };

  const handleStatusContratoChange = (e: React.ChangeEvent<HTMLSelectElement>, contract: Contract) => {
    e.stopPropagation();
    const newStatus = e.target.value as ContractStatus;
    onUpdateContract({ ...contract, statusContrato: newStatus });
  };

  const handleDeleteClick = (e: React.MouseEvent, contractId: string) => {
    e.stopPropagation();
    if (window.confirm("Tem certeza que deseja excluir este contrato?")) {
      onDeleteContract(contractId);
    }
  };

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="p-4 md:p-6 border-b border-[var(--color-border)]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Lista de Fechamentos</h2>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleExportPDF}
              className="p-2 text-sm font-medium rounded-md transition-colors duration-200 bg-[var(--color-bg-surface)]/40 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface)]/60 hover:text-brand-accent"
              title="Exportar PDF"
            >
              <ArrowDownTrayIcon className="w-5 h-5" />
            </button>
            <div className="w-px h-6 bg-[var(--color-border)] mx-1"></div>
            <FilterButton value="Todos" label="Todos" />
            <FilterButton value={ReceiptStatus.Sim} label="Recebidos" />
            <FilterButton value={ReceiptStatus.Nao} label="Pendentes" />
            <button
              onClick={onToggleEditMode}
              title={isEditMode ? "Sair do modo edição" : "Entrar no modo edição"}
              className={`p-2 text-sm font-medium rounded-md transition-colors duration-200 ${isEditMode
                ? 'bg-brand-accent text-[var(--color-text-accent)] shadow-md'
                : 'bg-[var(--color-bg-surface)]/40 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface)]/60'
                }`}
            >
              <PencilIcon className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <label htmlFor="items-per-page-contract" className="text-sm font-medium text-[var(--color-text-secondary)]">Exibir:</label>
              <select
                id="items-per-page-contract"
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-md p-1.5 text-sm text-[var(--color-text-primary)] focus:ring-brand-accent focus:border-brand-accent"
              >
                <option value={20}>20</option>
                <option value={30}>30</option>
                <option value={40}>40</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="text-xs text-[var(--color-text-secondary)] uppercase">
            <tr>
              <th scope="col" className="px-5 py-3">Cliente</th>
              <th scope="col" className="px-5 py-3 hidden sm:table-cell">Imóvel</th>
              <th scope="col" className="px-5 py-3 hidden md:table-cell">Valor Locação</th>
              <th scope="col" className="px-5 py-3 hidden lg:table-cell">Comissão</th>
              <th scope="col" className="px-5 py-3 hidden md:table-cell">Status Contrato</th>
              <th scope="col" className="px-5 py-3">Status Pag.</th>
              <th scope="col" className="px-5 py-3 hidden lg:table-cell">Data Formalização</th>
              <th scope="col" className="px-5 py-3 hidden lg:table-cell">Data Recebimento</th>
              {isEditMode && <th scope="col" className="px-5 py-3">Ações</th>}
            </tr>
          </thead>
          <tbody>
            {contracts.map(contract => (
              <tr
                key={contract.id}
                onClick={() => !isEditMode && onSelectContract(contract)}
                className={`border-b border-[var(--color-border)] transition-colors duration-150 ${!isEditMode ? 'hover:bg-black/5 cursor-pointer' : ''}`}
              >
                <td className="px-5 py-3 text-sm font-medium text-[var(--color-text-primary)] whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <UserIcon className="w-5 h-5 text-[var(--color-text-secondary)]/70" />
                    {contract.cliente}
                  </div>
                </td>
                <td className="px-5 py-3 text-sm hidden sm:table-cell">
                  <div className="flex items-center gap-3">
                    <HomeIcon className="w-5 h-5 text-[var(--color-text-secondary)]/70" />
                    {contract.imovel}
                  </div>
                </td>
                <td className="px-5 py-3 text-sm text-[var(--color-text-secondary)] hidden md:table-cell whitespace-nowrap">{formatCurrencyBRL(contract.valorLocacao)}</td>
                <td className="px-5 py-3 text-sm text-[var(--color-text-secondary)] hidden lg:table-cell whitespace-nowrap">{formatCurrencyBRL(contract.comissaoLiquida || contract.comissao)}</td>
                <td className="px-5 py-3 text-sm hidden md:table-cell">
                  {isEditMode ? (
                    <select
                      value={contract.statusContrato}
                      onChange={(e) => handleStatusContratoChange(e, contract)}
                      onClick={(e) => e.stopPropagation()}
                      className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-md p-1 text-[var(--color-text-primary)] text-xs focus:ring-brand-accent focus:border-brand-accent w-full"
                    >
                      {Object.values(ContractStatus).map(status => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusContratoClass(contract.statusContrato)}`}>
                      {contract.statusContrato}
                    </span>
                  )}
                </td>
                <td className="px-5 py-3 text-sm">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${contract.statusRecebimento === ReceiptStatus.Sim
                    ? 'bg-green-500/20 text-green-800 dark:text-green-300'
                    : 'bg-red-500/20 text-red-800 dark:text-red-300'
                    }`}>
                    {contract.statusRecebimento === ReceiptStatus.Sim ? 'Recebido' : 'Pendente'}
                  </span>
                </td>
                <td className="px-5 py-3 text-sm text-[var(--color-text-secondary)] hidden lg:table-cell whitespace-nowrap">{formatDateFromISO(contract.formalizacao) || 'N/A'}</td>
                <td className="px-5 py-3 text-sm text-[var(--color-text-secondary)] hidden lg:table-cell whitespace-nowrap">{formatDateFromISO(contract.dataRecebimento) || 'N/A'}</td>
                {isEditMode && (
                  <td className="px-5 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectContract(contract);
                        }}
                        className="text-brand-accent hover:text-violet-700 p-1 rounded-full hover:bg-black/5"
                        title={`Editar ${contract.cliente}`}
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteClick(e, contract.id)}
                        className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-black/5"
                        title={`Excluir ${contract.cliente}`}
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {contracts.length === 0 && (
          <div className="text-center p-8 text-[var(--color-text-secondary)]">
            Nenhum contrato encontrado para este filtro.
          </div>
        )}
      </div>
      {totalItems > 0 && (
        <div className="p-4 border-t border-[var(--color-border)]">
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(totalItems / itemsPerPage)}
            onPageChange={setCurrentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
          />
        </div>
      )}
    </div>
  );
};

export default ContractList;