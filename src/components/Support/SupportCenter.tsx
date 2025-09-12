import React, { useState, useEffect } from 'react';
import { Card, Tabs, Button, Space, Input, Select, Form, List, Tag, Rate, Modal, Alert } from 'antd';
import { 
  CustomerServiceOutlined, 
  PlusOutlined, 
  SearchOutlined,
  MessageOutlined,
  BookOutlined,
  BarChartOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { supportService, SupportTicket, KnowledgeBaseArticle } from '../../services/supportService';

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;

interface SupportTicketFormValues {
  subject: string;
  description: string;
  category: SupportTicket['category'];
  priority?: SupportTicket['priority'];
}

const SupportCenter: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBaseArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [newTicketVisible, setNewTicketVisible] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [ticketDetailVisible, setTicketDetailVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Charger les tickets de l'utilisateur
      const userTickets = await supportService.getTickets({ 
        userId: 'current_user', // À remplacer par l'ID utilisateur réel
        limit: 20 
      });
      setTickets(userTickets);

      // Charger les articles populaires de la base de connaissances
      const articles = await supportService.searchKnowledgeBase('');
      setKnowledgeBase(articles.slice(0, 10));
    } catch (error) {
      console.error('Erreur chargement données support:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (values: SupportTicketFormValues) => {
    try {
      setLoading(true);
      await supportService.createTicket({
        userId: 'current_user',
        userEmail: 'user@example.com',
        userName: 'Utilisateur Test',
        subject: values.subject,
        description: values.description,
        category: values.category,
        priority: values.priority || 'medium'
      });

      setNewTicketVisible(false);
      form.resetFields();
      await loadData();
    } catch (error) {
      console.error('Erreur création ticket:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: SupportTicket['status']) => {
    const colors = {
      open: 'orange',
      in_progress: 'blue',
      waiting_user: 'purple',
      resolved: 'green',
      closed: 'gray'
    };
    return colors[status];
  };

  const getStatusText = (status: SupportTicket['status']) => {
    const texts = {
      open: 'Ouvert',
      in_progress: 'En cours',
      waiting_user: 'En attente',
      resolved: 'Résolu',
      closed: 'Fermé'
    };
    return texts[status];
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

  const categoryLabels: Record<SupportTicket['category'], string> = {
    technical: 'Technique',
    billing: 'Facturation',
    training: 'Formation',
    feature_request: 'Demandes',
    bug_report: 'Bugs',
    general: 'Général'
  };

  const getCategoryIcon = (category: SupportTicket['category']) => {
    const icons: Record<SupportTicket['category'], string> = {
      technical: '🔧',
      billing: '💰',
      feature_request: '💡',
      bug_report: '🐛',
      general: '❓',
      training: '📚'
    };
    return icons[category];
  };

  // Données de démonstration pour les tickets
  const mockTickets: SupportTicket[] = [
    {
      id: 'ticket_1',
      ticketNumber: 'IC-ABC123',
      userId: 'current_user',
      userEmail: 'user@example.com',
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
      userId: 'current_user',
      userEmail: 'user@example.com',
      userName: 'Jean Dupont',
      subject: 'Demande de formation sur les devis',
      description: 'J\'aimerais une formation sur l\'utilisation du module de devis',
      category: 'training',
      priority: 'medium',
      status: 'resolved',
      assignedTo: 'agent_2',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      resolvedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      satisfaction: {
        rating: 5,
        feedback: 'Excellent support, très réactif !',
        submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      }
    },
    {
      id: 'ticket_3',
      ticketNumber: 'IC-GHI789',
      userId: 'current_user',
      userEmail: 'user@example.com',
      userName: 'Jean Dupont',
      subject: 'Suggestion d\'amélioration du planning',
      description: 'Il serait bien d\'avoir une vue calendrier pour le planning',
      category: 'feature_request',
      priority: 'low',
      status: 'open',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    }
  ];

  const ticketsSource = tickets.length ? tickets : mockTickets;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <Card
        title={
          <Space>
            <CustomerServiceOutlined />
            Centre de Support
          </Space>
        }
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => setNewTicketVisible(true)}
          >
            Nouveau Ticket
          </Button>
        }
      >
        <Tabs defaultActiveKey="tickets">
          {/* Mes Tickets */}
          <TabPane 
            tab={
              <span>
                <MessageOutlined />
                Mes Tickets ({ticketsSource.length})
              </span>
            } 
            key="tickets"
          >
            <List
              dataSource={ticketsSource}
              renderItem={(ticket) => (
                <List.Item
                  actions={[
                    <Button 
                      type="link" 
                      onClick={() => {
                        setSelectedTicket(ticket);
                        setTicketDetailVisible(true);
                      }}
                    >
                      Voir détails
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '20px' }}>
                          {getCategoryIcon(ticket.category)}
                        </div>
                        <div style={{ fontSize: '10px', color: '#666' }}>
                          {ticket.ticketNumber}
                        </div>
                      </div>
                    }
                    title={
                      <Space>
                        <span style={{ fontWeight: 500 }}>{ticket.subject}</span>
                        <Tag color={getStatusColor(ticket.status)}>
                          {getStatusText(ticket.status)}
                        </Tag>
                        <Tag color={getPriorityColor(ticket.priority)}>
                          {ticket.priority.toUpperCase()}
                        </Tag>
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size="small">
                        <div>{ticket.description}</div>
                        <Space size="small">
                          <span style={{ fontSize: '12px', color: '#666' }}>
                            <ClockCircleOutlined /> Créé le {ticket.createdAt.toLocaleDateString('fr-FR')}
                          </span>
                          {ticket.firstResponseAt && (
                            <span style={{ fontSize: '12px', color: '#52c41a' }}>
                              <CheckCircleOutlined /> Première réponse reçue
                            </span>
                          )}
                          {ticket.satisfaction && (
                            <Rate 
                              disabled 
                              value={ticket.satisfaction.rating} 
                              style={{ fontSize: '12px' }}
                            />
                          )}
                        </Space>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </TabPane>

          {/* Base de Connaissances */}
          <TabPane 
            tab={
              <span>
                <BookOutlined />
                Base de Connaissances
              </span>
            } 
            key="knowledge"
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Input.Search
                placeholder="Rechercher dans la base de connaissances..."
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                onSearch={(value) => {
                  // Implémenter la recherche
                  console.log('Recherche:', value);
                }}
              />

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
                {knowledgeBase.map(article => (
                  <Card
                    key={article.id}
                    size="small"
                    hoverable
                    title={article.title}
                    extra={
                      <Space>
                        <span style={{ fontSize: '12px', color: '#666' }}>
                          👁️ {article.views}
                        </span>
                        <span style={{ fontSize: '12px', color: '#52c41a' }}>
                          👍 {article.helpful}
                        </span>
                      </Space>
                    }
                  >
                    <div style={{ marginBottom: 8 }}>
                      {article.content.substring(0, 100)}...
                    </div>
                    <Space wrap>
                      {article.tags.map(tag => (
                        <Tag key={tag}>{tag}</Tag>
                      ))}
                    </Space>
                  </Card>
                ))}
              </div>
            </Space>
          </TabPane>

          {/* Statistiques */}
          <TabPane 
            tab={
              <span>
                <BarChartOutlined />
                Statistiques
              </span>
            } 
            key="stats"
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <Card>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1890ff' }}>
                    {mockTickets.length}
                  </div>
                  <div>Tickets Total</div>
                </div>
              </Card>
              
              <Card>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#52c41a' }}>
                    {mockTickets.filter(t => t.status === 'resolved').length}
                  </div>
                  <div>Tickets Résolus</div>
                </div>
              </Card>
              
              <Card>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#faad14' }}>
                    2.5h
                  </div>
                  <div>Temps de Réponse Moyen</div>
                </div>
              </Card>
              
              <Card>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#722ed1' }}>
                    4.8/5
                  </div>
                  <div>Satisfaction Moyenne</div>
                </div>
              </Card>
            </div>

            <Card title="Répartition par Catégorie" style={{ marginTop: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                {Object.entries(categoryLabels).map(([key, label]) => {
                  const category = key as SupportTicket['category'];
                  const count = mockTickets.filter(t => t.category === category).length;
                  return (
                    <div key={category} style={{ textAlign: 'center', padding: 16, border: '1px solid #d9d9d9', borderRadius: 8 }}>
                      <div style={{ fontSize: '24px', marginBottom: 8 }}>
                        {getCategoryIcon(category)}
                      </div>
                      <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{count}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>{label}</div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </TabPane>
        </Tabs>
      </Card>

      {/* Modal Nouveau Ticket */}
      <Modal
        title="Créer un Nouveau Ticket"
        open={newTicketVisible}
        onCancel={() => setNewTicketVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateTicket}
        >
          <Form.Item
            name="subject"
            label="Sujet"
            rules={[{ required: true, message: 'Sujet requis' }]}
          >
            <Input placeholder="Décrivez brièvement votre problème..." />
          </Form.Item>

          <Form.Item
            name="category"
            label="Catégorie"
            rules={[{ required: true, message: 'Catégorie requise' }]}
          >
            <Select placeholder="Sélectionnez une catégorie">
              <Option value="technical">🔧 Problème Technique</Option>
              <Option value="billing">💰 Facturation</Option>
              <Option value="feature_request">💡 Demande de Fonctionnalité</Option>
              <Option value="bug_report">🐛 Signaler un Bug</Option>
              <Option value="training">📚 Formation/Aide</Option>
              <Option value="general">❓ Question Générale</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="priority"
            label="Priorité"
          >
            <Select defaultValue="medium">
              <Option value="low">🟢 Basse</Option>
              <Option value="medium">🟡 Moyenne</Option>
              <Option value="high">🟠 Haute</Option>
              <Option value="urgent">🔴 Urgente</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="Description Détaillée"
            rules={[{ required: true, message: 'Description requise' }]}
          >
            <TextArea 
              rows={6} 
              placeholder="Décrivez votre problème en détail. Plus vous donnez d'informations, plus nous pourrons vous aider rapidement..."
            />
          </Form.Item>

          <Alert
            message="Avant de créer un ticket"
            description="Avez-vous consulté notre base de connaissances ? Vous pourriez y trouver une solution immédiate à votre problème."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Créer le Ticket
              </Button>
              <Button onClick={() => setNewTicketVisible(false)}>
                Annuler
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Détails Ticket */}
      <Modal
        title={`Ticket ${selectedTicket?.ticketNumber}`}
        open={ticketDetailVisible}
        onCancel={() => setTicketDetailVisible(false)}
        footer={null}
        width={800}
      >
        {selectedTicket && (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Card size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <strong>Sujet:</strong> {selectedTicket.subject}
                </div>
                <div>
                  <strong>Description:</strong> {selectedTicket.description}
                </div>
                <Space wrap>
                  <Tag color={getStatusColor(selectedTicket.status)}>
                    {getStatusText(selectedTicket.status)}
                  </Tag>
                  <Tag color={getPriorityColor(selectedTicket.priority)}>
                    {selectedTicket.priority.toUpperCase()}
                  </Tag>
                  <Tag>
                    {getCategoryIcon(selectedTicket.category)} {selectedTicket.category}
                  </Tag>
                </Space>
              </Space>
            </Card>

            {selectedTicket.satisfaction && (
              <Card size="small" title="Votre Évaluation">
                <Space direction="vertical">
                  <Rate disabled value={selectedTicket.satisfaction.rating} />
                  {selectedTicket.satisfaction.feedback && (
                    <div style={{ fontStyle: 'italic' }}>
                      "{selectedTicket.satisfaction.feedback}"
                    </div>
                  )}
                </Space>
              </Card>
            )}

            <div style={{ textAlign: 'center' }}>
              <Space>
                <Button type="primary">
                  Ajouter un Message
                </Button>
                {selectedTicket.status === 'resolved' && !selectedTicket.satisfaction && (
                  <Button>
                    Évaluer le Support
                  </Button>
                )}
              </Space>
            </div>
          </Space>
        )}
      </Modal>
    </div>
  );
};

export default SupportCenter;
