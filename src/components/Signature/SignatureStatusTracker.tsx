import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Space, Tooltip, message, Modal } from 'antd';
import { 
  FileTextOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  ExclamationCircleOutlined,
  EyeOutlined,
  DeleteOutlined,
  SendOutlined
} from '@ant-design/icons';
import { signatureService, SignatureRequest } from '../../services/signatureService';

const SignatureStatusTracker: React.FC = () => {
  const [requests, setRequests] = useState<SignatureRequest[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSignatureRequests();
  }, []);

  const loadSignatureRequests = async () => {
    setLoading(true);
    try {
      const data = await signatureService.getSignatureRequests();
      setRequests(data);
    } catch (error) {
      console.error('Erreur chargement demandes:', error);
      message.error('Erreur lors du chargement des demandes de signature');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (requestId: string) => {
    Modal.confirm({
      title: 'Annuler la demande de signature',
      content: 'Êtes-vous sûr de vouloir annuler cette demande ?',
      okText: 'Oui, annuler',
      cancelText: 'Non',
      onOk: async () => {
        try {
          await signatureService.cancelSignatureRequest(requestId, 'Annulée par l\'utilisateur');
          message.success('Demande annulée avec succès');
          loadSignatureRequests();
        } catch (error) {
          console.error('Erreur lors de l\'annulation:', error);
          message.error('Erreur lors de l\'annulation');
        }
      }
    });
  };

  const getStatusTag = (status: SignatureRequest['status']) => {
    const statusConfig = {
      pending: { color: 'orange', icon: <ClockCircleOutlined />, text: 'En attente' },
      sent: { color: 'blue', icon: <SendOutlined />, text: 'Envoyée' },
      signed: { color: 'green', icon: <CheckCircleOutlined />, text: 'Signée' },
      declined: { color: 'red', icon: <ExclamationCircleOutlined />, text: 'Refusée' },
      expired: { color: 'gray', icon: <ExclamationCircleOutlined />, text: 'Expirée' }
    };

    const config = statusConfig[status];
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  const getDocumentTypeTag = (type: SignatureRequest['documentType']) => {
    const typeConfig = {
      quote: { color: 'blue', text: 'Devis' },
      contract: { color: 'purple', text: 'Contrat' },
      invoice: { color: 'green', text: 'Facture' },
      purchase_order: { color: 'orange', text: 'Bon de commande' }
    };

    const config = typeConfig[type];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const columns = [
    {
      title: 'Document',
      dataIndex: 'documentTitle',
      key: 'documentTitle',
      render: (title: string, record: SignatureRequest) => (
        <Space direction="vertical" size="small">
          <span style={{ fontWeight: 500 }}>{title}</span>
          {getDocumentTypeTag(record.documentType)}
        </Space>
      )
    },
    {
      title: 'Signataire',
      key: 'signer',
      render: (record: SignatureRequest) => (
        <Space direction="vertical" size="small">
          <span>{record.signerName}</span>
          <span style={{ color: '#666', fontSize: '12px' }}>{record.signerEmail}</span>
          {record.companyName && (
            <span style={{ color: '#999', fontSize: '11px' }}>{record.companyName}</span>
          )}
        </Space>
      )
    },
    {
      title: 'Statut',
      dataIndex: 'status',
      key: 'status',
      render: (status: SignatureRequest['status']) => getStatusTag(status)
    },
    {
      title: 'Dates',
      key: 'dates',
      render: (record: SignatureRequest) => (
        <Space direction="vertical" size="small">
          <div style={{ fontSize: '12px' }}>
            <span style={{ color: '#666' }}>Créée: </span>
            {new Date(record.createdAt).toLocaleDateString('fr-FR')}
          </div>
          {record.sentAt && (
            <div style={{ fontSize: '12px' }}>
              <span style={{ color: '#666' }}>Envoyée: </span>
              {new Date(record.sentAt).toLocaleDateString('fr-FR')}
            </div>
          )}
          {record.signedAt && (
            <div style={{ fontSize: '12px' }}>
              <span style={{ color: '#666' }}>Signée: </span>
              {new Date(record.signedAt).toLocaleDateString('fr-FR')}
            </div>
          )}
          <div style={{ fontSize: '12px' }}>
            <span style={{ color: '#666' }}>Expire: </span>
            {new Date(record.expiresAt).toLocaleDateString('fr-FR')}
          </div>
        </Space>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: SignatureRequest) => (
        <Space>
          <Tooltip title="Voir le document">
            <Button 
              icon={<EyeOutlined />} 
              size="small"
              onClick={() => window.open(record.documentUrl, '_blank')}
            />
          </Tooltip>
          
          {record.status === 'signed' && record.signatureUrl && (
            <Tooltip title="Voir la signature">
              <Button 
                icon={<CheckCircleOutlined />} 
                size="small"
                type="primary"
                onClick={() => window.open(record.signatureUrl, '_blank')}
              />
            </Tooltip>
          )}
          
          {['pending', 'sent'].includes(record.status) && (
            <Tooltip title="Annuler la demande">
              <Button 
                icon={<DeleteOutlined />} 
                size="small"
                danger
                onClick={() => handleCancel(record.id!)}
              />
            </Tooltip>
          )}
        </Space>
      )
    }
  ];

  const getStatusStats = () => {
    const stats = requests.reduce((acc, req) => {
      acc[req.status] = (acc[req.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return [
      { label: 'En attente', value: stats.pending || 0, color: '#faad14' },
      { label: 'Envoyées', value: stats.sent || 0, color: '#1890ff' },
      { label: 'Signées', value: stats.signed || 0, color: '#52c41a' },
      { label: 'Refusées', value: stats.declined || 0, color: '#ff4d4f' }
    ];
  };

  return (
    <div>
      {/* Statistiques */}
      <div style={{ marginBottom: 16 }}>
        <Space size="large">
          {getStatusStats().map(stat => (
            <Card key={stat.label} size="small" style={{ minWidth: 120 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: stat.color }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {stat.label}
                </div>
              </div>
            </Card>
          ))}
        </Space>
      </div>

      {/* Tableau des demandes */}
      <Card 
        title={
          <Space>
            <FileTextOutlined />
            Demandes de Signature
          </Space>
        }
        extra={
          <Button onClick={loadSignatureRequests} loading={loading}>
            Actualiser
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={requests}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Total: ${total} demandes`
          }}
          locale={{
            emptyText: 'Aucune demande de signature'
          }}
        />
      </Card>
    </div>
  );
};

export default SignatureStatusTracker;
