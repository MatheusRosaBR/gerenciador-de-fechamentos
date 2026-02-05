import React from 'react';
import { SaleContract, ReceiptStatus, SaleStatus } from '../types';
import { formatCurrencyBRL } from '../utils/formatters';
import { PDFReportGenerator } from '../utils/PDFReportGenerator';
import { HomeIcon, UserIcon, PencilIcon, TrashIcon, ArrowDownTrayIcon } from './IconComponents';
import Pagination from './Pagination';

interface SalesListProps {
  sales: SaleContract[];
  onSelectSale: (sale: SaleContract) => void;
  filter: ReceiptStatus | 'Todos';
  setFilter: (filter: ReceiptStatus | 'Todos') => void;
  isEditMode: boolean;
  onToggleEditMode: () => void;
  onUpdateSale: (sale: SaleContract) => void;
  onDeleteSale: (saleId: string) => void;
  totalItems: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  itemsPerPage: number;
  setItemsPerPage: (size: number) => void;
}

const SalesList: React.FC<SalesListProps> = ({
  sales, onSelectSale, filter, setFilter, isEditMode, onToggleEditMode, onUpdateSale, onDeleteSale,
  totalItems, currentPage, setCurrentPage, itemsPerPage, setItemsPerPage
}) => {
  const handleExportPDF = () => {
    const generator = new PDFReportGenerator();
    generator.generateSaleReport(sales, {
      title: 'Relatório de Vendas',
      filtroPeriodo: filter !== 'Todos' ? `Status: ${filter === ReceiptStatus.Sim ? 'Recebidos' : 'Pendentes'}` : 'Todos',
      userName: 'Corretor Pro'
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

  const getStatusVendaClass = (status: SaleStatus) => {
    switch (status) {
      case SaleStatus.Vendido:
        return 'bg-green-500/20 text-green-800 dark:text-green-300';
      case SaleStatus.Escritura:
        return 'bg-purple-500/20 text-purple-800 dark:text-purple-300';
      case SaleStatus.Financiamento:
        return 'bg-blue-500/20 text-blue-800 dark:text-blue-300';
      case SaleStatus.Proposta:
        return 'bg-yellow-500/20 text-yellow-800 dark:text-yellow-300';
      default:
        return 'bg-gray-500/20 text-gray-800 dark:text-gray-300';
    }
  };

  const handleStatusVendaChange = (e: React.ChangeEvent<HTMLSelectElement>, sale: SaleContract) => {
    e.stopPropagation();
    const newStatus = e.target.value as SaleStatus;
    onUpdateSale({ ...sale, statusVenda: newStatus });
  };

  const handleDeleteClick = (e: React.MouseEvent, saleId: string) => {
    e.stopPropagation();
    if (window.confirm("Tem certeza que deseja excluir esta venda?")) {
      onDeleteSale(saleId);
    }
  };

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="p-4 md:p-6 border-b border-[var(--color-border)]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Lista de Vendas</h2>
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
              <label htmlFor="items-per-page-sale" className="text-sm font-medium text-[var(--color-text-secondary)]">Exibir:</label>
              <select
                id="items-per-page-sale"
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
              <th scope="col" className="px-5 py-3 hidden md:table-cell">Valor Venda</th>
              <th scope="col" className="px-5 py-3 hidden lg:table-cell">Comissão</th>
              <th scope="col" className="px-5 py-3 hidden md:table-cell">Status Venda</th>
              <th scope="col" className="px-5 py-3">Status Pag.</th>
              <th scope="col" className="px-5 py-3 hidden lg:table-cell">Data da Venda</th>
              {isEditMode && <th scope="col" className="px-5 py-3">Ações</th>}
            </tr>
          </thead>
          <tbody>
            {sales.map(sale => (
              <tr
                key={sale.id}
                onClick={() => !isEditMode && onSelectSale(sale)}
                className={`border-b border-[var(--color-border)] transition-colors duration-150 ${!isEditMode ? 'hover:bg-black/5 cursor-pointer' : ''}`}
              >
                <td className="px-5 py-3 text-sm font-medium text-[var(--color-text-primary)] whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <UserIcon className="w-5 h-5 text-[var(--color-text-secondary)]/70" />
                    {sale.cliente}
                  </div>
                </td>
                <td className="px-5 py-3 text-sm hidden sm:table-cell">
                  <div className="flex items-center gap-3">
                    <HomeIcon className="w-5 h-5 text-[var(--color-text-secondary)]/70" />
                    {sale.imovel}
                  </div>
                </td>
                <td className="px-5 py-3 text-sm text-[var(--color-text-secondary)] hidden md:table-cell whitespace-nowrap">{formatCurrencyBRL(sale.valorVenda)}</td>
                <td className="px-5 py-3 text-sm text-[var(--color-text-secondary)] hidden lg:table-cell whitespace-nowrap">{formatCurrencyBRL(sale.comissaoLiquida || sale.comissao)}</td>
                <td className="px-5 py-3 text-sm hidden md:table-cell">
                  {isEditMode ? (
                    <select
                      value={sale.statusVenda}
                      onChange={(e) => handleStatusVendaChange(e, sale)}
                      onClick={(e) => e.stopPropagation()}
                      className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-md p-1 text-[var(--color-text-primary)] text-xs focus:ring-brand-accent focus:border-brand-accent w-full"
                    >
                      {Object.values(SaleStatus).map(status => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusVendaClass(sale.statusVenda)}`}>
                      {sale.statusVenda}
                    </span>
                  )}
                </td>
                <td className="px-5 py-3 text-sm">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${sale.statusRecebimento === ReceiptStatus.Sim
                    ? 'bg-green-500/20 text-green-800 dark:text-green-300'
                    : 'bg-red-500/20 text-red-800 dark:text-red-300'
                    }`}>
                    {sale.statusRecebimento === ReceiptStatus.Sim ? 'Recebido' : 'Pendente'}
                  </span>
                </td>
                <td className="px-5 py-3 text-sm text-[var(--color-text-secondary)] hidden lg:table-cell whitespace-nowrap">{sale.dataVenda || 'N/A'}</td>
                {isEditMode && (
                  <td className="px-5 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectSale(sale);
                        }}
                        className="text-brand-accent hover:text-violet-700 p-1 rounded-full hover:bg-black/5"
                        title={`Editar ${sale.cliente}`}
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteClick(e, sale.id)}
                        className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-black/5"
                        title={`Excluir ${sale.cliente}`}
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
        {sales.length === 0 && (
          <div className="text-center p-8 text-[var(--color-text-secondary)]">
            Nenhuma venda encontrada para este filtro.
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

export default SalesList;