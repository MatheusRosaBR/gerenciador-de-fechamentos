

import React from 'react';
import { SaleContract } from '../types';
import SalesKPIs from './SalesKPIs';
import ClosingsByMonthChart from './ClosingsByMonthChart';
import ReceiptStatusChart from './ReceiptStatusChart';
import SaleStatusChart from './SaleStatusChart';
import UpcomingPayments from './UpcomingPayments';

interface SalesDashboardProps {
  sales: SaleContract[];
  goal: number;
  goalPeriod: string;
  onOpenGoalSettings: () => void;
  onOpenCommissionDetails: () => void;
}

const SalesDashboard: React.FC<SalesDashboardProps> = ({ sales, goal, goalPeriod, onOpenGoalSettings, onOpenCommissionDetails }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Header KPIs Row - Full Width */}
      <div className="w-full">
        <SalesKPIs
          sales={sales}
          goal={goal}
          goalPeriod={goalPeriod}
          onOpenGoalSettings={onOpenGoalSettings}
          onOpenCommissionDetails={onOpenCommissionDetails}
        />
      </div>

      {/* 2. Main Analytics Row - Asymmetric Split (8/4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          {/* Primary Chart */}
          <ClosingsByMonthChart items={sales} />

          {/* Actionable List */}
          <UpcomingPayments items={sales} title="Próximos Recebimentos" />
        </div>

        <div className="lg:col-span-4 space-y-6">
          {/* Secondary Charts */}
          <SaleStatusChart sales={sales} />
          <ReceiptStatusChart items={sales} />
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;