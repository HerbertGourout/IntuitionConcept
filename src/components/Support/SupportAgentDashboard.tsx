import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Space, Avatar, Statistic, Row, Col, Select, Input, Modal, Form, Rate, Badge } from 'antd';
import {
    CustomerServiceOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined,
    MessageOutlined,
    SearchOutlined,
    FilterOutlined,
    ReloadOutlined
} from '@ant-design/icons';
import { supportService, SupportTicket, SupportAgent } from '../../services/supportService';

const { Option } = Select;
const { TextArea } = Input;

interface SupportResponseFormValues {
    response: string;
    internal?: boolean;
    closeTicket?: boolean;
}

const SupportAgentDashboard: React.FC = () => {
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [agents, setAgents] = useState<SupportAgent[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const [responseModalVisible, setResponseModalVisible] = useState(false);
    const [filters, setFilters] = useState({
        status: 'all',
        priority: 'all',
        assignedTo: 'all'
    });
    const [form] = Form.useForm();

    useEffect(() => {
        loadData();
    }, [filters]);

    const loadData = async () => {
        setLoading(true);
        try {
            // Charger tous les tickets avec filtres
            const allTickets = await supportService.getTickets({
                ...(filters.status !== 'all' && { status: filters.status as SupportTicket['status'] }),
                ...(filters.priority !== 'all' && { priority: filters.priority as SupportTicket['priority'] }),
                ...(filters.assignedTo !== 'all' && { assignedTo: filters.assignedTo }),
                limit: 50
            });
            setTickets(allTickets);

            // Charger les agents
            const agentList = await supportService.getAvailableAgents();
            setAgents(agentList);
        } catch (error) {
            console.error('Erreur chargement données:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (ticketId: string, newStatus: SupportTicket['status']) => {
        try {
            await supportService.updateTicket(ticketId, { status: newStatus });
            await loadData();
        } catch (error) {
            console.error('Erreur mise à jour statut:', error);
        }
    };

    const handleAssignTicket = async (ticketId: string, agentId: string) => {
        try {
            await supportService.updateTicket(ticketId, {
                assignedTo: agentId,
                status: 'in_progress'
            });
            await loadData();
        } catch (error) {
            console.error('Erreur assignation:', error);
        }
    };

    const handleSendResponse = async (values: SupportResponseFormValues) => {
        if (!selectedTicket) return;

        try {
            await supportService.addMessage({
                ticketId: selectedTicket.id!,
                authorId: 'current_agent',
                authorName: 'Agent Support',
                authorType: 'agent',
                content: values.response,
                isInternal: values.internal || false
            });

            if (values.closeTicket) {
                await supportService.updateTicket(selectedTicket.id!, {
                    status: 'resolved'
                });
            }

            setResponseModalVisible(false);
            form.resetFields();
            await loadData();
        } catch (error) {
            console.error('Erreur envoi réponse:', error);
        }
    };

    const getPriorityColor = (priority: SupportTicket['priority']) => {
        const colors = {
            low: 'green',
            medium: 'orange',
            high: 'red',
            urgent: 'purple'
        };
        return colors[priority];
    };

    const getResponseTime = (createdAt: Date, firstResponseAt?: Date) => {
        if (!firstResponseAt) return 'Pas de réponse';

        const diffMs = firstResponseAt.getTime() - createdAt.getTime();
        const diffHours = Math.round(diffMs / (1000 * 60 * 60) * 10) / 10;

        return `${diffHours}h`;
    };

    // Données de démonstration pour les tickets
    const mockTickets: SupportTicket[] = [
        {
            id: 'ticket_1',
            ticketNumber: 'IC-ABC123',
            userId: 'user_1',
            userEmail: 'jean.dupont@example.com',
            userName: 'Jean Dupont',
            subject: 'Problème de synchronisation des données',
            description: 'Les données ne se synchronisent pas correctement entre les appareils',
            category: 'technical',
            priority: 'high',
            status: 'in_progress',
            assignedTo: 'agent_1',
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
            firstResponseAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000)
        },
        {
            id: 'ticket_2',
            ticketNumber: 'IC-DEF456',
            userId: 'user_2',
            userEmail: 'marie.martin@example.com',
            userName: 'Marie Martin',
            subject: 'Erreur lors de la génération de devis',
            description: 'J\'obtiens une erreur 500 quand j\'essaie de générer un devis',
            category: 'bug_report',
            priority: 'urgent',
            status: 'open',
            createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
            updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000)
        },
        {
            id: 'ticket_3',
            ticketNumber: 'IC-GHI789',
            userId: 'user_3',
            userEmail: 'paul.bernard@example.com',
            userName: 'Paul Bernard',
            subject: 'Demande de formation sur les signatures électroniques',
            description: 'J\'aimerais une formation sur l\'utilisation du module de signature électronique',
            category: 'training',
            priority: 'medium',
            status: 'waiting_user',
            assignedTo: 'agent_2',
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            firstResponseAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
        },
        {
            id: 'ticket_4',
            ticketNumber: 'IC-JKL012',
            userId: 'user_4',
            userEmail: 'sophie.durand@example.com',
            userName: 'Sophie Durand',
            subject: 'Question sur la facturation',
            description: 'Je ne comprends pas ma dernière facture, pouvez-vous m\'expliquer ?',
            category: 'billing',
            priority: 'low',
            status: 'resolved',
            assignedTo: 'agent_1',
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
            resolvedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
            firstResponseAt: new Date(Date.now() - 6.5 * 24 * 60 * 60 * 1000),
            satisfaction: {
                rating: 5,
                feedback: 'Très bon support, merci !',
                submittedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
            }
        }
    ];

    const columns = [
        {
            title: 'Ticket',
            dataIndex: 'ticketNumber',
            key: 'ticketNumber',
            width: 120,
            render: (text: string, record: SupportTicket) => (
                <div>
                    <div style={{ fontWeight: 500 }}>{text}</div>
                    <div style={{ fontSize: '11px', color: '#666' }}>
                        {record.createdAt.toLocaleDateString('fr-FR')}
                    </div>
                </div>
            )
        },
        {
            title: 'Client',
            dataIndex: 'userName',
            key: 'userName',
            width: 150,
            render: (text: string, record: SupportTicket) => (
                <div>
                    <div style={{ fontWeight: 500 }}>{text}</div>
                    <div style={{ fontSize: '11px', color: '#666' }}>
                        {record.userEmail}
                    </div>
                </div>
            )
        },
        {
            title: 'Sujet',
            dataIndex: 'subject',
            key: 'subject',
            ellipsis: true,
            render: (text: string, record: SupportTicket) => (
                <div>
                    <div style={{ fontWeight: 500, marginBottom: 4 }}>{text}</div>
                    <Space size="small">
                        <Tag>{record.category}</Tag>
                        <Tag color={getPriorityColor(record.priority)}>
                            {record.priority.toUpperCase()}
                        </Tag>
                    </Space>
                </div>
            )
        },
        {
            title: 'Statut',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status: SupportTicket['status'], record: SupportTicket) => (
                <Select
                    value={status}
                    size="small"
                    style={{ width: '100%' }}
                    onChange={(value) => handleStatusChange(record.id!, value)}
                >
                    <Option value="open">
                        <Tag color="orange">Ouvert</Tag>
                    </Option>
                    <Option value="in_progress">
                        <Tag color="blue">En cours</Tag>
                    </Option>
                    <Option value="waiting_user">
                        <Tag color="purple">En attente</Tag>
                    </Option>
                    <Option value="resolved">
                        <Tag color="green">Résolu</Tag>
                    </Option>
                    <Option value="closed">
                        <Tag color="gray">Fermé</Tag>
                    </Option>
                </Select>
            )
        },
        {
            title: 'Assigné à',
            dataIndex: 'assignedTo',
            key: 'assignedTo',
            width: 150,
            render: (assignedTo: string, record: SupportTicket) => {
                return (
                    <Select
                        value={assignedTo || 'unassigned'}
                        size="small"
                        style={{ width: '100%' }}
                        onChange={(value) => handleAssignTicket(record.id!, value)}
                        placeholder="Non assigné"
                    >
                        <Option value="unassigned">Non assigné</Option>
                        {agents.map(agent => (
                            <Option key={agent.id} value={agent.id}>
                                <Space>
                                    <Avatar size="small" src={agent.avatar}>
                                        {agent.name.charAt(0)}
                                    </Avatar>
                                    {agent.name}
                                    <Badge
                                        status={agent.isOnline ? 'success' : 'default'}
                                    />
                                </Space>
                            </Option>
                        ))}
                    </Select>
                );
            }
        },
        {
            title: 'Temps de Réponse',
            key: 'responseTime',
            width: 120,
            render: (_: unknown, record: SupportTicket) => (
                <div style={{ textAlign: 'center' }}>
                    <div>{getResponseTime(record.createdAt, record.firstResponseAt)}</div>
                    {record.satisfaction && (
                        <Rate
                            disabled
                            value={record.satisfaction.rating}
                            style={{ fontSize: '12px' }}
                        />
                    )}
                </div>
            )
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 120,
            render: (_: unknown, record: SupportTicket) => (
                <Space size="small">
                    <Button
                        size="small"
                        icon={<MessageOutlined />}
                        onClick={() => {
                            setSelectedTicket(record);
                            setResponseModalVisible(true);
                        }}
                    >
                        Répondre
                    </Button>
                </Space>
            )
        }
    ];

    const statsSource = tickets.length ? tickets : mockTickets;
    const stats = {
        totalTickets: statsSource.length,
        openTickets: statsSource.filter(t => t.status === 'open').length,
        inProgressTickets: statsSource.filter(t => t.status === 'in_progress').length,
        avgSatisfaction: 4.2
    };

    return (
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
            {/* Statistiques */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Total Tickets"
                            value={stats.totalTickets}
                            prefix={<CustomerServiceOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Tickets Ouverts"
                            value={stats.openTickets}
                            prefix={<ExclamationCircleOutlined />}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="En Cours"
                            value={stats.inProgressTickets}
                            prefix={<ClockCircleOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Satisfaction Moyenne"
                            value={stats.avgSatisfaction}
                            suffix="/ 5"
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#722ed1' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Filtres et Actions */}
            <Card style={{ marginBottom: 16 }}>
                <Row gutter={16} align="middle">
                    <Col span={4}>
                        <Select
                            placeholder="Statut"
                            value={filters.status}
                            onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                            style={{ width: '100%' }}
                        >
                            <Option value="all">Tous les statuts</Option>
                            <Option value="open">Ouvert</Option>
                            <Option value="in_progress">En cours</Option>
                            <Option value="waiting_user">En attente</Option>
                            <Option value="resolved">Résolu</Option>
                            <Option value="closed">Fermé</Option>
                        </Select>
                    </Col>
                    <Col span={4}>
                        <Select
                            placeholder="Priorité"
                            value={filters.priority}
                            onChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}
                            style={{ width: '100%' }}
                        >
                            <Option value="all">Toutes priorités</Option>
                            <Option value="low">Basse</Option>
                            <Option value="medium">Moyenne</Option>
                            <Option value="high">Haute</Option>
                            <Option value="urgent">Urgente</Option>
                        </Select>
                    </Col>
                    <Col span={4}>
                        <Select
                            placeholder="Agent"
                            value={filters.assignedTo}
                            onChange={(value) => setFilters(prev => ({ ...prev, assignedTo: value }))}
                            style={{ width: '100%' }}
                        >
                            <Option value="all">Tous les agents</Option>
                            {agents.map(agent => (
                                <Option key={agent.id} value={agent.id}>
                                    {agent.name}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                    <Col span={8}>
                        <Input.Search
                            placeholder="Rechercher par sujet, client..."
                            allowClear
                            enterButton={<SearchOutlined />}
                        />
                    </Col>
                    <Col span={4}>
                        <Space>
                            <Button icon={<FilterOutlined />}>
                                Filtres Avancés
                            </Button>
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={loadData}
                                loading={loading}
                            >
                                Actualiser
                            </Button>
                        </Space>
                    </Col>
                </Row>
            </Card>

            {/* Table des Tickets */}
            <Card title="Tickets de Support">
                <Table
                    columns={columns}
                    dataSource={tickets.length ? tickets : mockTickets}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        pageSize: 20,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} sur ${total} tickets`
                    }}
                    scroll={{ x: 1200 }}
                />
            </Card>

            {/* Modal Réponse */}
            <Modal
                title={`Répondre au Ticket ${selectedTicket?.ticketNumber}`}
                open={responseModalVisible}
                onCancel={() => setResponseModalVisible(false)}
                footer={null}
                width={700}
            >
                {selectedTicket && (
                    <div>
                        <Card size="small" style={{ marginBottom: 16 }}>
                            <div><strong>Client:</strong> {selectedTicket.userName}</div>
                            <div><strong>Sujet:</strong> {selectedTicket.subject}</div>
                            <div><strong>Description:</strong> {selectedTicket.description}</div>
                        </Card>

                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={handleSendResponse}
                        >
                            <Form.Item
                                name="response"
                                label="Votre Réponse"
                                rules={[{ required: true, message: 'Réponse requise' }]}
                            >
                                <TextArea
                                    rows={6}
                                    placeholder="Tapez votre réponse au client..."
                                />
                            </Form.Item>

                            <Form.Item name="internal" valuePropName="checked">
                                <input type="checkbox" /> Note interne (non visible par le client)
                            </Form.Item>

                            <Form.Item name="closeTicket" valuePropName="checked">
                                <input type="checkbox" /> Marquer comme résolu après envoi
                            </Form.Item>

                            <Form.Item>
                                <Space>
                                    <Button type="primary" htmlType="submit">
                                        Envoyer Réponse
                                    </Button>
                                    <Button onClick={() => setResponseModalVisible(false)}>
                                        Annuler
                                    </Button>
                                </Space>
                            </Form.Item>
                        </Form>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default SupportAgentDashboard;
