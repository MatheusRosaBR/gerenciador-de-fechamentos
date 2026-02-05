import React from 'react';
import { Contract, ReceiptStatus } from '../types';
import { formatCurrencyBRL } from '../utils/formatters';
import { TargetIcon, CheckCircleIcon, CurrencyDollarIcon, CollectionIcon, ChartPieIcon, CogIcon, InformationCircleIcon, BanknotesIcon } from './IconComponents';

interface KPIsProps {
  contracts: Contract[];
  goal: number;
  goalPeriod: string;
  onOpenGoalSettings: () => void;
  onOpenCommissionDetails: () => void;
}

const KPICard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subValue?: string;
  color?: string;
  onClick?: () => void;
  actionIcon?: React.ReactNode
}> = ({ icon, label, value, subValue, color = 'text-[var(--color-text-primary)]', onClick, actionIcon }) => (
  <div className="glass-card p-5 rounded-lg flex items-start gap-4">
    <div className={`p-3 rounded-lg ${color.replace('text-', 'bg-').split('-')[0] + '-' + color.replace('text-', 'bg-').split('-')[1] + '/10'}`}>
      {React.cloneElement(icon as React.ReactElement, { className: `w-6 h-6 ${color}` })}
    </div>
    <div className="flex-1">
      <div className="flex justify-between items-start">
        <p className="text-sm text-[var(--color-text-secondary)] font-medium">{label}</p>
        {onClick && (
          <button onClick={onClick} className="text-[var(--color-text-secondary)] hover:text-brand-accent transition-colors">
            {actionIcon || <InformationCircleIcon className="w-4 h-4" />}
          </button>
        )}
      </div>
      <p className="text-2xl font-bold mt-1 text-[var(--color-text-primary)]">{value}</p>
      {subValue && <p className="text-xs text-[var(--color-text-secondary)] mt-1">{subValue}</p>}
    </div>
  </div>
);

const ProgressCard: React.FC<{ meta: number; realizado: number; progress: number; period: string; onOpenSettings: () => void }> = ({ meta, realizado, progress, period, onOpenSettings }) => (
  <div className="glass-card p-5 rounded-lg flex flex-col justify-between h-full relative overflow-hidden">
    <div className="absolute top-0 right-0 p-3 opacity-10">
      <TargetIcon className="w-24 h-24 rotate-12" />
    </div>
    <div className="relative z-10">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium text-[var(--color-text-secondary)]">Meta {period && `(${period})`}</h3>
        <button onClick={onOpenSettings} className="text-[var(--color-text-secondary)] hover:text-brand-accent transition-colors">
          <CogIcon className="w-4 h-4" />
        </button>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-[var(--color-text-primary)]">{realizado}</span>
        <span className="text-xs text-[var(--color-text-secondary)]">/ {meta}</span>
      </div>
      <div className="mt-3 w-full bg-[var(--color-bg-muted)] rounded-full h-2">
        <div className="bg-brand-accent h-2 rounded-full transition-all duration-500" style={{ width: `${Math.min(progress, 100)}%` }}></div>
      </div>
      <p className="text-xs text-right mt-1 text-brand-accent font-semibold">{progress.toFixed(0)}%</p>
    </div>
  </div>
);


const KPIs: React.FC<KPIsProps> = ({ contracts, goal, goalPeriod, onOpenGoalSettings, onOpenCommissionDetails }) => {
  const realizado = contracts.length;
  const progresso = goal > 0 ? (realizado / goal) * 100 : 0;
  const vglTotal = contracts.reduce((sum, c) => sum + c.valorLocacao, 0);
  const comissaoTotal = contracts.reduce((sum, c) => sum + (c.comissaoLiquida || (c.comissao * (1 - ((c.aliquotaImposto || 0) / 100)))), 0);
  const comissaoRecebida = contracts
    .filter(c => c.statusRecebimento === ReceiptStatus.Sim)
    .reduce((sum, c) => sum + (c.comissaoLiquida || (c.comissao * (1 - ((c.aliquotaImposto || 0) / 100)))), 0);
  const comissaoMediaPercentual = vglTotal > 0 ? (comissaoTotal / vglTotal) * 100 : 0;

  // Taxa efetiva calculation
  const totalComissaoBruta = contracts.reduce((sum, c) => sum + c.comissao, 0);
  const totalImposto = contracts.reduce((sum, c) => sum + (c.comissao - (c.comissaoLiquida || (c.comissao * (1 - ((c.aliquotaImposto || 0) / 100))))), 0);
  const taxaEfetiva = totalComissaoBruta > 0 ? (totalImposto / totalComissaoBruta) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* 1. Meta / Progresso */}
      <ProgressCard
        meta={goal}
        realizado={realizado}
        progress={progresso}
        period={goalPeriod}
        onOpenSettings={onOpenGoalSettings}
      />

      {/* 2. VGL Total */}
      <KPICard
        icon={<CollectionIcon />}
        label="VGL Total"
        value={formatCurrencyBRL(vglTotal)}
        subValue={`${contracts.length} contratos ativos`}
        color="text-blue-500"
      />

      {/* 3. Comissão Recebida */}
      <KPICard
        icon={<CheckCircleIcon />}
        label="Receita Líquida"
        value={formatCurrencyBRL(comissaoRecebida)}
        subValue={`Previsto: ${formatCurrencyBRL(comissaoTotal)}`}
        color="text-emerald-500"
        onClick={onOpenCommissionDetails}
      />

      {/* 4. Eficiência / Retorno */}
      <div className="glass-card p-5 rounded-xl flex flex-col justify-between">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <ChartPieIcon className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-sm font-medium text-[var(--color-text-secondary)]">Retorno Médio</p>
        </div>
        <p className="text-2xl font-bold text-[var(--color-text-primary)]">{comissaoMediaPercentual.toFixed(1)}%</p>

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-[var(--color-border)]">
          <span className="text-xs text-[var(--color-text-secondary)]">Taxa Efetiva (Imp.)</span>
          <span className="text-xs font-semibold text-orange-500">{taxaEfetiva.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
};

export default KPIs;