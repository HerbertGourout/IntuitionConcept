import React from 'react';
import { Card } from 'antd';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface PhaseBudgetChartProps {
  phases: { id: string; name: string; budget: number; spent: number }[];
}

import { useFormatCurrency } from '../../utils/currency';

export const PhaseBudgetChart: React.FC<PhaseBudgetChartProps> = ({ phases }) => {
  const formatCurrency = useFormatCurrency();
  return (
    <Card title="Dépenses par phase">
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={phases} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Legend />
            <Bar dataKey="budget" name="Budget" fill="#1890ff" />
            <Bar dataKey="spent" name="Dépensé" fill="#ff4d4f" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default PhaseBudgetChart;
