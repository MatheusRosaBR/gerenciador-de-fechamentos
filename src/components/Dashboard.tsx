

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
    <div className="space-y-6 animate-fade-in">
      {/* 1. Header KPIs Row - Full Width */}
      <div className="w-full">
        <KPIs
          contracts={contracts}
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
          <ClosingsByMonthChart items={contracts} />

          {/* Actionable List */}
          <UpcomingPayments items={contracts} title="Próximos Recebimentos" />
        </div>

        <div className="lg:col-span-4 space-y-6">
          {/* Secondary Charts */}
          <ContractStatusChart contracts={contracts} />
          <ReceiptStatusChart items={contracts} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;