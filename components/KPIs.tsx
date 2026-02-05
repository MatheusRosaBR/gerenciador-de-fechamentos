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

const ProgressKpiCard: React.FC<{ meta: number; realizado: number; progress: number; period: string; onOpenSettings: () => void; }> = ({ meta, realizado, progress, period, onOpenSettings }) => (
  <div className="glass-card p-6 rounded-xl flex flex-col justify-between text-[var(--color-text-primary)]">
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-[var(--color-text-secondary)]">
          Progresso da Meta {period && <span className="text-xs">({period})</span>}
        </h3>
        <button onClick={onOpenSettings} className="text-[var(--color-text-secondary)] hover:text-brand-accent transition-colors" title="Definir meta">
          <CogIcon className="w-5 h-5" />
        </button>
      </div>
      <div className="flex justify-between items-baseline">
        <div className="text-left">
          <p className="text-2xl md:text-3xl font-bold">{realizado}</p>
          <p className="text-xs text-[var(--color-text-secondary)]">Realizados</p>
        </div>
        <div className="text-right">
          <p className="text-2xl md:text-3xl font-bold">{meta}</p>
          <p className="text-xs text-[var(--color-text-secondary)]">Meta</p>
        </div>
      </div>
    </div>
    <div className="mt-4">
      <div className="w-full bg-[var(--color-bg-muted)] rounded-full h-2.5 overflow-hidden">
        <div className="bg-brand-accent h-2.5 rounded-full" style={{ width: `${progress > 100 ? 100 : progress}%` }}></div>
      </div>
      <p className="text-right text-xs text-[var(--color-text-secondary)] mt-1">{progress.toFixed(0)}% Atingido</p>
    </div>
  </div>
);

const MetricItem: React.FC<{ icon: React.ReactNode, label: string, value: string, color?: string }> = ({ icon, label, value, color = 'text-[var(--color-text-primary)]' }) => (
  <div>
    <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
      {icon}
      <span>{label}</span>
    </div>
    <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
  </div>
);

const AggregatedMetricsCard: React.FC<{
  vglTotal: number;
  comissaoTotal: number;
  comissaoRecebida: number;
  comissaoLiquidaPendente: number;
  mediaPercentual: string;
  onOpenCommissionDetails: () => void;
}> = ({ vglTotal, comissaoTotal, comissaoRecebida, comissaoLiquidaPendente, mediaPercentual, onOpenCommissionDetails }) => (
  <div className="glass-card p-8 rounded-2xl flex flex-col justify-center min-h-[200px]">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-8">
      <MetricItem
        icon={<CollectionIcon className="w-5 h-5" />}
        label="VGL Total"
        value={formatCurrencyBRL(vglTotal)}
      />
      <MetricItem
        icon={<CurrencyDollarIcon className="w-5 h-5" />}
        label="Comissão Total"
        value={formatCurrencyBRL(comissaoTotal)}
      />
      <div>
        <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
          <CheckCircleIcon className="w-5 h-5" />
          <span>Comissão Recebida</span>
          <button onClick={onOpenCommissionDetails} className="text-[var(--color-text-secondary)]/60 hover:text-brand-accent transition-colors" title="Ver detalhes">
            <InformationCircleIcon className="w-5 h-5" />
          </button>
        </div>
        <p className="text-2xl font-bold mt-1 text-green-600">{formatCurrencyBRL(comissaoRecebida)}</p>
      </div>
      <MetricItem
        icon={<ChartPieIcon className="w-5 h-5" />}
        label="Percentual de Retorno"
        value={mediaPercentual}
      />
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
  const comissaoLiquidaPendente = contracts
    .filter(c => c.statusRecebimento === ReceiptStatus.Nao)
    .reduce((sum, c) => sum + (c.comissaoLiquida || (c.comissao * (1 - ((c.aliquotaImposto || 0) / 100)))), 0);
  const comissaoMediaPercentual = vglTotal > 0 ? (comissaoTotal / vglTotal) * 100 : 0;

  return (
    <div className="flex flex-col h-full gap-6">
      <ProgressKpiCard
        meta={goal}
        realizado={realizado}
        progress={progresso}
        period={goalPeriod}
        onOpenSettings={onOpenGoalSettings}
      />
      <AggregatedMetricsCard
        vglTotal={vglTotal}
        comissaoTotal={comissaoTotal}
        comissaoRecebida={comissaoRecebida}
        comissaoLiquidaPendente={comissaoLiquidaPendente}
        mediaPercentual={`${comissaoMediaPercentual.toFixed(1)}%`}
        onOpenCommissionDetails={onOpenCommissionDetails}
      />

      <div className="glass-card p-4 rounded-xl flex items-center justify-between border-l-4 border-l-orange-500/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <BanknotesIcon className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <p className="text-sm text-[var(--color-text-secondary)]">Total Impostos</p>
            <p className="font-semibold text-[var(--color-text-primary)]">{formatCurrencyBRL(contracts.reduce((sum, c) => sum + (c.comissao - (c.comissaoLiquida || (c.comissao * (1 - ((c.aliquotaImposto || 0) / 100))))), 0))}</p>
          </div>
        </div>
        <div className="h-8 w-px bg-[var(--color-border)] mx-4"></div>
        <div className="text-right">
          <p className="text-sm text-[var(--color-text-secondary)]">Taxa Efetiva</p>
          <p className="font-semibold text-[var(--color-text-primary)]">
            {(() => {
              const totalComissao = contracts.reduce((sum, c) => sum + c.comissao, 0);
              const totalImposto = contracts.reduce((sum, c) => sum + (c.comissao - (c.comissaoLiquida || (c.comissao * (1 - ((c.aliquotaImposto || 0) / 100))))), 0);
              return totalComissao > 0 ? ((totalImposto / totalComissao) * 100).toFixed(1) + '%' : '0.0%';
            })()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default KPIs;