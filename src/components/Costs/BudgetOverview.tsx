import React from 'react';
import { Card, Progress, Table, Typography } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface Phase {
    id: string;
    name: string;
    estimatedCost: number;
    actualCost: number;
    completion: number;
}

export interface ProjectData {
    name: string;
    budget: number;
    actualSpent: number;
    phases: Phase[];
}

interface BudgetOverviewProps {
    project: ProjectData;
}

export const BudgetOverview: React.FC<BudgetOverviewProps> = ({ project }) => {
    const { budget, actualSpent, phases } = project;
    const remaining = budget - actualSpent;
    const usagePercentage = (actualSpent / budget) * 100;
    const isOverBudget = actualSpent > budget;

    const columns = [
        {
            title: 'Phase',
            dataIndex: 'name',
            key: 'name',
            render: (text: string) => <strong>{text}</strong>,
        },
        {
            title: 'Budget alloué',
            dataIndex: 'estimatedCost',
            key: 'estimatedCost',
            render: (value: number) => (
                <Text>{value.toLocaleString('fr-FR')} FCFA</Text>
            ),
        },
        {
            title: 'Dépensé',
            dataIndex: 'actualCost',
            key: 'actualCost',
            render: (value: number) => (
                <Text>{value.toLocaleString('fr-FR')} FCFA</Text>
            ),
        },
        {
            title: 'Reste',
            key: 'remaining',
            render: (_: unknown, record: Phase) => {
                const remaining = record.estimatedCost - record.actualCost;
                return (
                    <Text type={remaining < 0 ? 'danger' : 'success'}>
                        {remaining.toLocaleString('fr-FR')} FCFA
                        {remaining < 0 && (
                            <ArrowUpOutlined style={{ color: '#ff4d4f', marginLeft: 8 }} />
                        )}
                        {remaining > 0 && (
                            <ArrowDownOutlined style={{ color: '#52c41a', marginLeft: 8 }} />
                        )}
                    </Text>
                );
            },
        },
        {
            title: 'Avancement',
            key: 'progress',
            render: (_: unknown, record: Phase) => (
                <Progress
                    percent={record.completion}
                    status={record.actualCost > record.estimatedCost ? 'exception' : 'active'}
                    size="small"
                />
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <Card>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                        <Text type="secondary">Budget total</Text>
                        <Title level={3} className="mt-1">
                            {budget.toLocaleString('fr-FR')} FCFA
                        </Title>
                    </div>
                    <div className="text-center">
                        <Text type="secondary">Dépensé</Text>
                        <Title level={3} className="mt-1" type={isOverBudget ? 'danger' : 'success'}>
                            {actualSpent.toLocaleString('fr-FR')} FCFA
                            {isOverBudget ? (
                                <ArrowUpOutlined style={{ color: '#ff4d4f', marginLeft: 8 }} />
                            ) : (
                                <ArrowDownOutlined style={{ color: '#52c41a', marginLeft: 8 }} />
                            )}
                        </Title>
                    </div>
                    <div className="text-center">
                        <Text type="secondary">Reste</Text>
                        <Title level={3} className="mt-1" type={remaining < 0 ? 'danger' : 'success'}>
                            {Math.abs(remaining).toLocaleString('fr-FR')} FCFA
                            <span className="ml-2">
                                {remaining < 0 ? '(Dépassement)' : '(Disponible)'}
                            </span>
                        </Title>
                    </div>
                </div>

                <div className="mt-6">
                    <div className="flex justify-between mb-2">
                        <Text>Utilisation du budget</Text>
                        <Text strong>{usagePercentage.toFixed(1)}%</Text>
                    </div>
                    <Progress
                        percent={Math.min(usagePercentage, 100)}
                        status={isOverBudget ? 'exception' : 'active'}
                        strokeColor={isOverBudget ? '#ff4d4f' : '#1890ff'}
                    />
                </div>
            </Card>

            <Card title="Détail par phase" className="mt-6">
                <Table
                    columns={columns}
                    dataSource={phases}
                    rowKey="id"
                    pagination={false}
                    size="small"
                />
            </Card>
        </div>
    );
};
