import React, { useState } from 'react';
import { Contract, ReceiptStatus, ContractStatus } from '../types';
import { formatDateToISO, formatDateFromISO, maskCurrency, parseCurrency, maskPhone } from '../utils/formatters';
import { useLockBodyScroll } from '../utils/useLockBodyScroll';
import { XIcon, PlusIcon, CalendarIcon } from './IconComponents';
import DatePicker from './DatePicker';
import ConfirmationModal from './ConfirmationModal';

interface AddContractModalProps {
  onClose: () => void;
  onAddContract: (contract: Omit<Contract, 'id' | 'percentualComissao'>) => void;
}

const InputField: React.FC<{
  label: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}> = ({ label, name, value, onChange, error, type = 'text', placeholder, required }) => (
  <div className="relative">
    <label htmlFor={name} className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full bg-[var(--color-bg-surface)] border rounded-md p-2 text-[var(--color-text-primary)] focus:ring-brand-accent focus:border-brand-accent transition-colors ${error ? 'border-red-500' : 'border-[var(--color-border)]'
          } ${type === 'date' ? '[&::-webkit-calendar-picker-indicator]:opacity-0' : ''}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
      />
      {type === 'date' && (
        <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-accent pointer-events-none" />
      )}
    </div>
    {error && <p id={`${name}-error`} className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);


const AddContractModal: React.FC<AddContractModalProps> = ({ onClose, onAddContract }) => {
  useLockBodyScroll();
  const initialFormData = {
    cliente: '',
    imovel: '',
    telefone: '',
    email: '',
    valorLocacao: '',
    comissao: '',
    statusRecebimento: ReceiptStatus.Nao,
    statusContrato: ContractStatus.Documentacao,
    formalizacao: '',
    dataRecebimento: '',
    aliquotaImposto: '',
  };
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showConfirmClose, setShowConfirmClose] = useState(false);

  const handleCloseRequest = () => {
    const isDirty = JSON.stringify(formData) !== JSON.stringify(initialFormData);
    if (isDirty) {
      setShowConfirmClose(true);
    } else {
      onClose();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let { name, value } = e.target;

    if (name === 'valorLocacao' || name === 'comissao') {
      value = maskCurrency(value);
    } else if (name === 'telefone') {
      value = maskPhone(value);
    }

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (name: string) => (dateValue: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: dateValue,
    }));
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.cliente.trim()) newErrors.cliente = "Cliente é obrigatório";
    // if (!formData.imovel.trim()) newErrors.imovel = "Imóvel é obrigatório"; // Agora opcional
    const valorLocacaoNum = parseCurrency(formData.valorLocacao);
    if (isNaN(valorLocacaoNum) || valorLocacaoNum <= 0) newErrors.valorLocacao = "Valor deve ser um número maior que zero";
    const comissaoNum = parseCurrency(formData.comissao);
    if (isNaN(comissaoNum) || comissaoNum <= 0) newErrors.comissao = "Comissão deve ser um número maior que zero";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onAddContract({
        ...formData,
        valorLocacao: parseCurrency(formData.valorLocacao),
        comissao: parseCurrency(formData.comissao),
        aliquotaImposto: parseFloat(formData.aliquotaImposto) || 0,
        formalizacao: formatDateToISO(formData.formalizacao),
        dataRecebimento: formatDateToISO(formData.dataRecebimento),
      });
    }
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm flex justify-center items-center z-50 p-4"
      onClick={handleCloseRequest}
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-contract-title"
    >
      <div
        className="bg-[var(--color-bg-surface)] rounded-xl shadow-2xl w-full max-w-lg relative transform transition-all duration-300 scale-95 animate-modal-enter border border-[var(--color-border)]"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-[var(--color-border)] flex justify-between items-center">
          <h2 id="add-contract-title" className="text-xl font-bold text-[var(--color-text-primary)]">Adicionar Novo Contrato</h2>
          <button onClick={handleCloseRequest} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors" aria-label="Fechar modal">
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
            <div className="sm:col-span-2">
              <InputField label="Cliente" name="cliente" value={formData.cliente} onChange={handleChange} error={errors.cliente} placeholder="Nome do locatário" required />
            </div>
            <div className="sm:col-span-2">
              <InputField label="Imóvel (Opcional)" name="imovel" value={formData.imovel} onChange={handleChange} error={errors.imovel} placeholder="Código ou número" />
            </div>
            <InputField label="Telefone (Opcional)" name="telefone" value={formData.telefone} onChange={handleChange} placeholder="(11) 98888-7777" maxLength={15} />
            <InputField label="Email (Opcional)" name="email" value={formData.email} onChange={handleChange} type="email" placeholder="cliente@email.com" />
            <InputField label="Valor da Locação" name="valorLocacao" value={formData.valorLocacao} onChange={handleChange} error={errors.valorLocacao} type="text" placeholder="2.500,00" required />
            <InputField label="Comissão" name="comissao" value={formData.comissao} onChange={handleChange} error={errors.comissao} type="text" placeholder="775,00" required />
            <div>
              <label htmlFor="statusContrato" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Status Contrato</label>
              <select id="statusContrato" name="statusContrato" value={formData.statusContrato} onChange={handleChange} className="w-full bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-md p-2.5 text-[var(--color-text-primary)] focus:ring-brand-accent focus:border-brand-accent">
                {Object.values(ContractStatus).map(status => <option key={status} value={status}>{status}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="statusRecebimento" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Status Pagamento</label>
              <select id="statusRecebimento" name="statusRecebimento" value={formData.statusRecebimento} onChange={handleChange} className="w-full bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-md p-2.5 text-[var(--color-text-primary)] focus:ring-brand-accent focus:border-brand-accent">
                <option value={ReceiptStatus.Nao}>Pendente</option>
                <option value={ReceiptStatus.Sim}>Recebido</option>
              </select>
            </div>
            <DatePicker label="Data Formalização" name="formalizacao" value={formData.formalizacao} onChange={handleDateChange('formalizacao')} placeholder="DD/MM/AAAA" />
            <DatePicker label="Data Recebimento" name="dataRecebimento" value={formData.dataRecebimento} onChange={handleDateChange('dataRecebimento')} placeholder="DD/MM/AAAA" />
            <div className="sm:col-span-2">
              <InputField label="Alíquota de Imposto (%)" name="aliquotaImposto" value={formData.aliquotaImposto} onChange={handleChange} type="number" placeholder="Ex: 6.0" />
            </div>
          </div>
          <div className="p-6 bg-[var(--color-bg-muted)]/50 rounded-b-lg flex justify-end">
            <button type="submit" className="bg-brand-accent hover:bg-opacity-90 text-[var(--color-text-accent)] font-bold py-2 px-6 rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-violet-500/30">
              <PlusIcon className="w-5 h-5" />
              <span>Adicionar</span>
            </button>
          </div>
        </form>
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

      <ConfirmationModal
        isOpen={showConfirmClose}
        onClose={() => setShowConfirmClose(false)}
        onConfirm={onClose}
        title="Descartar alterações?"
        message="Se você sair agora, as informações preenchidas serão perdidas. Deseja sair mesmo assim?"
        confirmText="Sim, sair"
        cancelText="Não, continuar"
      />
    </div>
  );
};

export default AddContractModal;