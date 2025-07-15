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
            <div className="glass-card flex flex-col md:flex-row md:items-center md:justify-between p-6 bg-gradient-to-r from-blue-50/90 to-purple-50/90 shadow-lg">
                <h2 className="text-xl font-semibold text-blue-900">Vue d'ensemble des projets</h2>
                <Space>
                    <Select
                        value={selectedPeriod}
                        onChange={setSelectedPeriod}
                        style={{ width: 120 }}
                        className="glass-card bg-white/60 backdrop-blur border-2 border-blue-100"
                    >
                        <Option value="week">Semaine</Option>
                        <Option value="month">Mois</Option>
                        <Option value="quarter">Trimestre</Option>
                        <Option value="year">Année</Option>
                    </Select>
                    <RangePicker className="glass-card bg-white/60 backdrop-blur border-2 border-blue-100" />
                    <Button
                        type="primary"
                        className="btn-glass bg-gradient-to-r from-blue-600 to-purple-600 hover:scale-105 transition px-6 py-2 rounded-full text-white font-semibold shadow-xl"
                        icon={<DownloadOutlined />}
                        onClick={() => generateReport('overview')}
                    >
                        Exporter PDF
                    </Button>
                </Space>
            </div>

            <div className="glass-card p-0 shadow-xl overflow-hidden">
                <Table
                    columns={columns}
                    dataSource={reportData}
                    rowKey="id"
                    pagination={false}
                    className="glass-table bg-white/60 backdrop-blur-md rounded-2xl"
                    locale={{ emptyText: <div className="flex flex-col items-center py-12"><FileTextOutlined className="text-blue-400 text-5xl mb-2" /><div className="text-blue-900 font-semibold mb-2">Aucun projet trouvé</div></div> }}
                />
            </div>

            <Row gutter={16}>
                <Col span={6}>
                    <div className="glass-card p-6 shadow-lg">
                        <Statistic
                            title="Projets actifs"
                            value={projects.filter(p => p.status === 'in_progress').length}
                            prefix={<TeamOutlined />}
                        />
                    </div>
                </Col>
                <Col span={6}>
                    <div className="glass-card p-6 shadow-lg">
                        <Statistic
                            title="Budget total"
                            value={projects.reduce((acc, p) => acc + p.budget, 0)}
                            suffix="FCFA"
                            precision={0}
                        />
                    </div>
                </Col>
                <Col span={6}>
                    <div className="glass-card p-6 shadow-lg">
                        <Statistic
                            title="Dépenses totales"
                            value={projects.reduce((acc, p) => acc + (p.spent || 0), 0)}
                            suffix="FCFA"
                            precision={0}
                        />
                    </div>
                </Col>
                <Col span={6}>
                    <div className="glass-card p-6 shadow-lg">
                        <Statistic
                            title="Progression moyenne"
                            value={Math.round(reportData.reduce((acc, p) => acc + p.progress, 0) / reportData.length)}
                            suffix="%"
                        />
                    </div>
                </Col>
            </Row>
        </div>
    );

    const financialTab = (
        <div className="space-y-6">
            <div className="glass-card flex flex-col items-center justify-center p-8 shadow-lg bg-gradient-to-br from-blue-50/90 to-purple-50/90">
                <PieChartOutlined style={{ fontSize: 48, marginBottom: 16, color: '#6366f1', filter: 'drop-shadow(0 2px 8px #a5b4fc)' }} />
                <p className="text-blue-900 font-semibold mb-2">Graphiques financiers détaillés à venir</p>
                <p className="text-sm text-gray-600">Intégration avec Chart.js ou Recharts prévue</p>
            </div>

            <Row gutter={16}>
                <Col span={8}>
                    <div className="glass-card p-6 shadow-lg">
                        <Statistic
                            title="Revenus totaux"
                            value={projects.reduce((acc, p) => acc + p.budget, 0)}
                            suffix="FCFA"
                            precision={0}
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </div>
                </Col>
                <Col span={8}>
                    <div className="glass-card p-6 shadow-lg">
                        <Statistic
                            title="Dépenses totales"
                            value={projects.reduce((acc, p) => acc + (p.spent || 0), 0)}
                            suffix="FCFA"
                            precision={0}
                            valueStyle={{ color: '#cf1322' }}
                        />
                    </div>
                </Col>
                <Col span={8}>
                    <div className="glass-card p-6 shadow-lg">
                        <Statistic
                            title="Profit estimé"
                            value={projects.reduce((acc, p) => acc + p.budget - (p.spent || 0), 0)}
                            suffix="FCFA"
                            precision={0}
                            valueStyle={{ color: projects.reduce((acc, p) => acc + p.budget - (p.spent || 0), 0) > 0 ? '#3f8600' : '#cf1322' }}
                        />
                    </div>
                </Col>
            </Row>
        </div>
    );

    const performanceTab = (
        <div className="space-y-6">
            <div className="glass-card flex flex-col md:flex-row md:items-center md:justify-between p-6 bg-gradient-to-r from-blue-50/90 to-purple-50/90 shadow-lg">
                <h2 className="text-xl font-semibold text-blue-900">Rapport de performance</h2>
                <Button
                    type="primary"
                    className="btn-glass bg-gradient-to-r from-blue-600 to-purple-600 hover:scale-105 transition px-6 py-2 rounded-full text-white font-semibold shadow-xl"
                    icon={<DownloadOutlined />}
                    onClick={() => generateReport('performance')}
                >
                    Exporter PDF
                </Button>
            </div>

            <Row gutter={16}>
                <Col span={12}>
                    <div className="glass-card p-6 shadow-xl h-full flex flex-col items-center justify-center">
                        <BarChartOutlined style={{ fontSize: 48, marginBottom: 16, color: '#6366f1', filter: 'drop-shadow(0 2px 8px #a5b4fc)' }} />
                        <p className="text-blue-900 font-semibold mb-2">Métriques de performance à venir</p>
                        <p className="text-sm text-gray-600">Analyse des délais, qualité, productivité</p>
                    </div>
                </Col>
                <Col span={12}>
                    <div className="glass-card p-6 shadow-xl h-full flex flex-col items-center justify-center">
                        <CalendarOutlined style={{ fontSize: 48, marginBottom: 16, color: '#6366f1', filter: 'drop-shadow(0 2px 8px #a5b4fc)' }} />
                        <p className="text-blue-900 font-semibold mb-2">Analyse temporelle à venir</p>
                        <p className="text-sm text-gray-600">Suivi des échéances et retards</p>
                    </div>
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
        <div className="p-6 space-y-8">
            {/* Header glassmorphism */}
            <div className="glass-card flex flex-col md:flex-row md:items-center md:justify-between mb-6 p-6 bg-gradient-to-r from-blue-50/90 to-purple-50/90 shadow-xl">
                <div className="flex items-center gap-3">
                    <BarChartOutlined style={{ fontSize: 36, color: '#6366f1', filter: 'drop-shadow(0 2px 8px #a5b4fc)' }} />
                    <div>
                        <h1 className="text-2xl font-bold text-blue-900 tracking-tight">Rapports & Analytics</h1>
                        <p className="text-gray-600">Générez et consultez des rapports détaillés sur vos projets</p>
                    </div>
                </div>
                <Button
                    type="primary"
                    className="btn-glass bg-gradient-to-r from-blue-600 to-purple-600 hover:scale-105 transition px-6 py-2 rounded-full text-white font-semibold shadow-xl mt-4 md:mt-0"
                    icon={<DownloadOutlined />}
                    onClick={() => generateReport('global')}
                >
                    Exporter tout (PDF)
                </Button>
            </div>

            {/* Onglets et contenu dans glass-card */}
            <div className="glass-card p-6 shadow-xl">
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    items={items}
                    type="card"
                    className="custom-glass-tabs"
                />
            </div>
        </div>
    );
};

export default Reports;
