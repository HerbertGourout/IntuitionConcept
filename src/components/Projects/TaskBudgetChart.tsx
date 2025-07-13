import React from 'react';
import { Card } from 'antd';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface TaskBudgetChartProps {
  tasks: { id: string; name: string; budget: number; spent: number; phaseName?: string }[];
}

const TaskBudgetChart: React.FC<TaskBudgetChartProps> = ({ tasks }) => {
  return (
    <Card title="Dépenses par tâche (toutes phases)">
      <div style={{ width: '100%', height: 350 }}>
        <ResponsiveContainer>
          <BarChart data={tasks} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-20} textAnchor="end" />
            <YAxis />
            <Tooltip formatter={(value: number) => `${value.toLocaleString('fr-FR')} FCFA`} />
            <Legend />
            <Bar dataKey="budget" name="Budget" fill="#1890ff" />
            <Bar dataKey="spent" name="Dépensé" fill="#ff4d4f" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default TaskBudgetChart;
