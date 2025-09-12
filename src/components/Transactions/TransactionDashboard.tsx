import React, { useState } from 'react';
import { Card, Table, Tag, Button, Space, Statistic, Row, Col, Alert } from 'antd';
import { 
  DollarOutlined, 
  RiseOutlined,
  FallOutlined,
  PlusOutlined
} from '@ant-design/icons';
import type { Transaction } from '../../types';
import { useResponsive } from '../../hooks/useResponsive';

const TransactionDashboard: React.FC = () => {
  const { isMobile } = useResponsive();
  
  // Sample data for demonstration
  const sampleTransactions: Transaction[] = [
    {
      id: '1',
      type: 'expense',
      status: 'completed',
      amount: 150000,
      currency: 'FCFA',
      description: 'Achat de ciment',
      category: 'Matériaux',
      date: '2024-03-15',
      projectId: 'proj-1',
      createdAt: '2024-03-15T10:00:00Z',
      updatedAt: '2024-03-15T10:00:00Z'
    },
    {
      id: '2',
      type: 'income',
      status: 'pending',
      amount: 500000,
      currency: 'FCFA',
      description: 'Paiement client Villa Moderne',
      category: 'Revenus',
      date: '2024-03-16',
      projectId: 'proj-2',
      createdAt: '2024-03-16T14:30:00Z',
      updatedAt: '2024-03-16T14:30:00Z'
    }
  ];

  const [transactions] = useState<Transaction[]>(sampleTransactions);
  const [loading] = useState(false);

  const getTypeColor = (type: Transaction['type']) => {
    switch (type) {
      case 'income': return 'green';
      case 'expense': return 'red';
      case 'transfer': return 'blue';
      default: return 'default';
    }
  };

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'completed': return 'green';
      case 'pending': return 'orange';
      case 'cancelled': return 'red';
      case 'failed': return 'red';
      default: return 'default';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => new Date(date).toLocaleDateString('fr-FR')
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: Transaction['type']) => (
        <Tag color={getTypeColor(type)}>
          {type === 'income' ? 'Recette' : type === 'expense' ? 'Dépense' : 'Virement'}
        </Tag>
      )
    },
    {
      title: 'Statut',
      dataIndex: 'status',
      key: 'status',
      render: (status: Transaction['status']) => (
        <Tag color={getStatusColor(status)}>
          {status === 'completed' ? 'Terminé' : 
           status === 'pending' ? 'En attente' : 
           status === 'cancelled' ? 'Annulé' : 'Échoué'}
        </Tag>
      )
    },
    {
      title: 'Montant',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => formatCurrency(amount)
    },
    {
      title: 'Catégorie',
      dataIndex: 'category',
      key: 'category'
    }
  ];

  const totalIncome = transactions
    .filter(t => t.type === 'income' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
            Tableau de Bord des Transactions
          </h1>
          <p style={{ margin: '8px 0 0 0', color: '#666' }}>
            Gestion et suivi des transactions financières
          </p>
        </div>

        {/* Statistics - Mobile Responsive */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={12} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="Recettes"
                value={totalIncome}
                formatter={(value) => formatCurrency(Number(value))}
                prefix={<RiseOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a', fontSize: isMobile ? '16px' : '24px' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="Dépenses"
                value={totalExpenses}
                formatter={(value) => formatCurrency(Number(value))}
                prefix={<FallOutlined style={{ color: '#ff4d4f' }} />}
                valueStyle={{ color: '#ff4d4f', fontSize: isMobile ? '16px' : '24px' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="Solde"
                value={balance}
                formatter={(value) => formatCurrency(Number(value))}
                prefix={<DollarOutlined />}
                valueStyle={{ 
                  color: balance >= 0 ? '#52c41a' : '#ff4d4f',
                  fontSize: isMobile ? '16px' : '24px'
                }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="Transactions"
                value={transactions.length}
                suffix="total"
                valueStyle={{ fontSize: isMobile ? '16px' : '24px' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Actions - Mobile Responsive */}
        <div style={{ marginBottom: '16px' }}>
          <Space direction={isMobile ? 'vertical' : 'horizontal'} style={{ width: '100%' }}>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              size={window.innerWidth < 768 ? 'large' : 'middle'}
              style={{ width: window.innerWidth < 768 ? '100%' : 'auto', minHeight: '44px' }}
            >
              Nouvelle Transaction
            </Button>
            <Button 
              size={window.innerWidth < 768 ? 'large' : 'middle'}
              style={{ width: window.innerWidth < 768 ? '100%' : 'auto', minHeight: '44px' }}
            >
              Exporter
            </Button>
          </Space>
        </div>

        {/* Alert for demo */}
        <Alert
          message="Version de démonstration"
          description="Cette interface présente des données d'exemple. L'intégration complète avec le service de transactions sera finalisée prochainement."
          type="info"
          showIcon
          style={{ marginBottom: '16px' }}
        />

        {/* Transactions Table - Mobile Responsive */}
        <Table
          columns={columns}
          dataSource={transactions}
          rowKey="id"
          loading={loading}
          scroll={{ x: 800 }}
          size={isMobile ? 'small' : 'middle'}
          pagination={{
            pageSize: isMobile ? 5 : 10,
            showSizeChanger: !isMobile,
            showQuickJumper: !isMobile,
            simple: isMobile,
            showTotal: (total, range) => 
              isMobile 
                ? `${range[0]}-${range[1]}/${total}`
                : `${range[0]}-${range[1]} sur ${total} transactions`
          }}
        />
      </Card>
    </div>
  );
};

export default TransactionDashboard;
