

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
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesKPIs
          sales={sales}
          goal={goal}
          goalPeriod={goalPeriod}
          onOpenGoalSettings={onOpenGoalSettings}
          onOpenCommissionDetails={onOpenCommissionDetails}
        />
        <div className="space-y-6">
          <UpcomingPayments items={sales} title="Próximos Recebimentos (Vendas)" />
          <ClosingsByMonthChart items={sales} />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReceiptStatusChart items={sales} />
        <SaleStatusChart sales={sales} />
      </div>
    </div>
  );
};

export default SalesDashboard;