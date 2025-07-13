import React, { useState } from 'react';
import { Card, Tabs, Button, DatePicker, Select, Space, Table, Progress, Statistic, Row, Col } from 'antd';
import {
    FileTextOutlined,
    DownloadOutlined,
    BarChartOutlined,
    PieChartOutlined,
    CalendarOutlined,
    TeamOutlined
} from '@ant-design/icons';
import { useProjectContext } from '../../contexts/ProjectContext';
import type { ColumnsType } from 'antd/es/table';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface ReportData {
    id: string;
    name: string;
    type: string;
    progress: number;
    budget: number;
    spent: number;
    tasks: number;
    completedTasks: number;
}

const Reports: React.FC = () => {
    const { projects } = useProjectContext();
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedPeriod, setSelectedPeriod] = useState<string>('month');

    // Données de démonstration pour les rapports
    const reportData: ReportData[] = projects.map(project => ({
        id: project.id,
        name: project.name,
        type: 'Construction', // Valeur par défaut car la propriété type n'existe pas dans Project
        progress: Math.round((project.phases?.reduce((acc, phase) => {
            const totalTasks = phase.tasks?.length || 0;
            const completedTasks = phase.tasks?.filter(task => task.status === 'done').length || 0;
            const phaseCompletion = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
            return acc + phaseCompletion;
        }, 0) || 0) / (project.phases?.length || 1)),
        budget: project.budget,
        spent: project.spent || 0,
        tasks: project.phases?.reduce((acc, phase) => acc + (phase.tasks?.length || 0), 0) || 0,
        completedTasks: project.phases?.reduce((acc, phase) =>
            acc + (phase.tasks?.filter(task => task.status === 'done').length || 0), 0) || 0,
    }));

    const columns: ColumnsType<ReportData> = [
        {
            title: 'Projet',
            dataIndex: 'name',
            key: 'name',
            render: (text: string) => <strong>{text}</strong>,
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
        },
        {
            title: 'Progression',
            dataIndex: 'progress',
            key: 'progress',
            render: (progress: number) => (
                <Progress percent={progress} size="small" />
            ),
        },
        {
            title: 'Budget',
            dataIndex: 'budget',
            key: 'budget',
            render: (budget: number) => `${budget.toLocaleString()} FCFA`,
        },
        {
            title: 'Dépensé',
            dataIndex: 'spent',
            key: 'spent',
            render: (spent: number) => `${spent.toLocaleString()} FCFA`,
        },
        {
            title: 'Tâches',
            dataIndex: 'tasks',
            key: 'tasks',
            render: (tasks: number, record: ReportData) =>
                `${record.completedTasks}/${tasks}`,
        },
    ];

    const generateReport = (type: string) => {
        console.log(`Génération du rapport: ${type}`);
        // Ici, vous ajouteriez la logique de génération de rapport PDF
    };

    const overviewTab = (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Vue d'ensemble des projets</h2>
                <Space>
                    <Select
                        value={selectedPeriod}
                        onChange={setSelectedPeriod}
                        style={{ width: 120 }}
                    >
                        <Option value="week">Semaine</Option>
                        <Option value="month">Mois</Option>
                        <Option value="quarter">Trimestre</Option>
                        <Option value="year">Année</Option>
                    </Select>
                    <RangePicker />
                    <Button
                        type="primary"
                        icon={<DownloadOutlined />}
                        onClick={() => generateReport('overview')}
                    >
                        Exporter PDF
                    </Button>
                </Space>
            </div>

            <Row gutter={16}>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Projets actifs"
                            value={projects.filter(p => p.status === 'in_progress').length}
                            prefix={<TeamOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Budget total"
                            value={projects.reduce((acc, p) => acc + p.budget, 0)}
                            suffix="FCFA"
                            precision={0}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Dépenses totales"
                            value={projects.reduce((acc, p) => acc + (p.spent || 0), 0)}
                            suffix="FCFA"
                            precision={0}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Progression moyenne"
                            value={Math.round(reportData.reduce((acc, p) => acc + p.progress, 0) / reportData.length)}
                            suffix="%"
                        />
                    </Card>
                </Col>
            </Row>

            <Card title="Détail des projets">
                <Table
                    columns={columns}
                    dataSource={reportData}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                />
            </Card>
        </div>
    );

    const financialTab = (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Rapport financier</h2>
                <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    onClick={() => generateReport('financial')}
                >
                    Exporter PDF
                </Button>
            </div>

            <Row gutter={16}>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="Revenus totaux"
                            value={projects.reduce((acc, p) => acc + p.budget, 0)}
                            suffix="FCFA"
                            precision={0}
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="Dépenses totales"
                            value={projects.reduce((acc, p) => acc + (p.spent || 0), 0)}
                            suffix="FCFA"
                            precision={0}
                            valueStyle={{ color: '#cf1322' }}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="Profit estimé"
                            value={projects.reduce((acc, p) => acc + p.budget - (p.spent || 0), 0)}
                            suffix="FCFA"
                            precision={0}
                            valueStyle={{ color: projects.reduce((acc, p) => acc + p.budget - (p.spent || 0), 0) > 0 ? '#3f8600' : '#cf1322' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Card title="Analyse par projet">
                <div className="text-center text-gray-500 py-8">
                    <PieChartOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                    <p>Graphiques financiers détaillés à venir</p>
                    <p className="text-sm">Intégration avec Chart.js ou Recharts prévue</p>
                </div>
            </Card>
        </div>
    );

    const performanceTab = (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Rapport de performance</h2>
                <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    onClick={() => generateReport('performance')}
                >
                    Exporter PDF
                </Button>
            </div>

            <Row gutter={16}>
                <Col span={12}>
                    <Card title="Efficacité des équipes">
                        <div className="text-center text-gray-500 py-8">
                            <BarChartOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                            <p>Métriques de performance à venir</p>
                            <p className="text-sm">Analyse des délais, qualité, productivité</p>
                        </div>
                    </Card>
                </Col>
                <Col span={12}>
                    <Card title="Respect des délais">
                        <div className="text-center text-gray-500 py-8">
                            <CalendarOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                            <p>Analyse temporelle à venir</p>
                            <p className="text-sm">Suivi des échéances et retards</p>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );

    const items = [
        {
            key: 'overview',
            label: 'Vue d\'ensemble',
            children: overviewTab,
            icon: <FileTextOutlined />,
        },
        {
            key: 'financial',
            label: 'Financier',
            children: financialTab,
            icon: <PieChartOutlined />,
        },
        {
            key: 'performance',
            label: 'Performance',
            children: performanceTab,
            icon: <BarChartOutlined />,
        },
    ];

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Rapports et Analytics</h1>
                <p className="text-gray-600">Générez et consultez des rapports détaillés sur vos projets</p>
            </div>

            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={items}
                type="card"
            />
        </div>
    );
};

export default Reports;
