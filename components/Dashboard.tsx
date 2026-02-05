

import React from 'react';
import { Contract } from '../types';
import KPIs from './KPIs';
import ClosingsByMonthChart from './ClosingsByMonthChart';
import ReceiptStatusChart from './ReceiptStatusChart';
import ContractStatusChart from './ContractStatusChart';
import UpcomingPayments from './UpcomingPayments';

interface DashboardProps {
  contracts: Contract[];
  goal: number;
  goalPeriod: string;
  onOpenGoalSettings: () => void;
  onOpenCommissionDetails: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ contracts, goal, goalPeriod, onOpenGoalSettings, onOpenCommissionDetails }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <KPIs
          contracts={contracts}
          goal={goal}
          goalPeriod={goalPeriod}
          onOpenGoalSettings={onOpenGoalSettings}
          onOpenCommissionDetails={onOpenCommissionDetails}
        />
        <div className="space-y-6">
          <UpcomingPayments items={contracts} title="Próximos Recebimentos (Locação)" />
          <ClosingsByMonthChart items={contracts} />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReceiptStatusChart items={contracts} />
        <ContractStatusChart contracts={contracts} />
      </div>
    </div>
  );
};

export default Dashboard;