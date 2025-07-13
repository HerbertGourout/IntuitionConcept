import React from 'react';
import { Card } from 'antd';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ProjectBudgetChartProps {
  budget: number;
  spent: number;
}

const COLORS = ['#1890ff', '#ff4d4f'];

export const ProjectBudgetChart: React.FC<ProjectBudgetChartProps> = ({ budget, spent }) => {
  const remaining = Math.max(budget - spent, 0);
  const over = spent > budget ? spent - budget : 0;
  const data = [
    { name: 'Dépensé', value: spent > budget ? budget : spent },
    { name: 'Restant', value: remaining },
    ...(over > 0 ? [{ name: 'Dépassement', value: over }] : [])
  ];
  const chartColors = over > 0 ? [...COLORS, '#ffa940'] : COLORS;

  return (
    <Card title="Répartition du budget (projet)">
      <div style={{ width: '100%', height: 280 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) =>
  `${name}: ${percent !== undefined ? (percent * 100).toFixed(0) + '%' : '-'}`
}
              outerRadius={90}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => `${value.toLocaleString('fr-FR')} FCFA`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default ProjectBudgetChart;
