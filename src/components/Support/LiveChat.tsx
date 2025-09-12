import React, { useState, useEffect, useRef } from 'react';
import { Card, Input, Button, Avatar, Space, Typography, Badge, Drawer, List, Tag } from 'antd';
import { 
  MessageOutlined, 
  SendOutlined, 
  CustomerServiceOutlined,
  CloseOutlined,
  SmileOutlined,
  PaperClipOutlined,
  PhoneOutlined
} from '@ant-design/icons';
import { supportService, SupportMessage, SupportAgent } from '../../services/supportService';

const { Text } = Typography;
const { TextArea } = Input;

interface LiveChatProps {
  ticketId?: string;
  onClose?: () => void;
}

const LiveChat: React.FC<LiveChatProps> = ({ ticketId, onClose }) => {
  const [visible, setVisible] = useState(false);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [agent, setAgent] = useState<SupportAgent | null>(null);
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (visible && ticketId) {
      loadMessages();
      loadAgent();
    }
  }, [visible, ticketId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    if (!ticketId) return;
    
    try {
      const ticketMessages = await supportService.getTicketMessages(ticketId);
      setMessages(ticketMessages);
    } catch (error) {
      console.error('Erreur chargement messages:', error);
    }
  };

  const loadAgent = async () => {
    try {
      const agents = await supportService.getAvailableAgents();
      const onlineAgent = agents.find(a => a.isOnline);
      setAgent(onlineAgent || agents[0]);
    } catch (error) {
      console.error('Erreur chargement agent:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !ticketId) return;

    try {
      setLoading(true);
      
      const message: Omit<SupportMessage, 'id' | 'timestamp'> = {
        ticketId,
        authorId: 'current_user',
        authorName: 'Vous',
        authorType: 'user',
        content: newMessage.trim()
      };

      await supportService.addMessage(message);
      
      // Ajouter le message localement
      setMessages(prev => [...prev, {
        ...message,
        id: Date.now().toString(),
        timestamp: new Date()
      }]);

      setNewMessage('');
      
      // Simuler une réponse de l'agent après un délai
      setTimeout(() => {
        simulateAgentResponse();
      }, 2000);
      
    } catch (error) {
      console.error('Erreur envoi message:', error);
    } finally {
      setLoading(false);
    }
  };

  const simulateAgentResponse = () => {
    if (!agent || !ticketId) return;

    setTyping(true);
    
    setTimeout(() => {
      const responses = [
        "Merci pour votre message. Je regarde votre problème immédiatement.",
        "Je comprends votre situation. Laissez-moi vérifier quelques éléments.",
        "Pouvez-vous me donner plus de détails sur ce point spécifique ?",
        "Je vais escalader votre demande à notre équipe technique.",
        "Voici une solution que vous pouvez essayer..."
      ];

      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const agentMessage: SupportMessage = {
        id: Date.now().toString(),
        ticketId,
        authorId: agent.id,
        authorName: agent.name,
        authorType: 'agent',
        content: randomResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, agentMessage]);
      setTyping(false);
    }, 1500);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Messages de démonstration
  const mockMessages: SupportMessage[] = [
    {
      id: '1',
      ticketId: 'ticket_1',
      authorId: 'agent_1',
      authorName: 'Sophie Martin',
      authorType: 'agent',
      content: 'Bonjour ! Je suis Sophie, votre agent de support. Comment puis-je vous aider aujourd\'hui ?',
      timestamp: new Date(Date.now() - 10 * 60 * 1000)
    },
    {
      id: '2',
      ticketId: 'ticket_1',
      authorId: 'current_user',
      authorName: 'Vous',
      authorType: 'user',
      content: 'Bonjour Sophie, j\'ai un problème avec la synchronisation de mes données entre mes appareils.',
      timestamp: new Date(Date.now() - 8 * 60 * 1000)
    },
    {
      id: '3',
      ticketId: 'ticket_1',
      authorId: 'agent_1',
      authorName: 'Sophie Martin',
      authorType: 'agent',
      content: 'Je comprends votre problème. Pouvez-vous me dire quels appareils vous utilisez et depuis quand vous rencontrez ce problème ?',
      timestamp: new Date(Date.now() - 7 * 60 * 1000)
    },
    {
      id: '4',
      ticketId: 'ticket_1',
      authorId: 'current_user',
      authorName: 'Vous',
      authorType: 'user',
      content: 'J\'utilise un PC Windows et une tablette Android. Le problème a commencé il y a 2 jours.',
      timestamp: new Date(Date.now() - 5 * 60 * 1000)
    },
    {
      id: '5',
      ticketId: 'ticket_1',
      authorId: 'agent_1',
      authorName: 'Sophie Martin',
      authorType: 'agent',
      content: 'Parfait, merci pour ces informations. Je vais vérifier votre compte et voir s\'il y a des problèmes de synchronisation. Un instant s\'il vous plaît...',
      timestamp: new Date(Date.now() - 3 * 60 * 1000)
    }
  ];

  const displayMessages = messages.length > 0 ? messages : mockMessages;

  return (
    <>
      {/* Bouton Chat Flottant */}
      <div
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 1000
        }}
      >
        <Badge dot={agent?.isOnline}>
          <Button
            type="primary"
            shape="circle"
            size="large"
            icon={<MessageOutlined />}
            onClick={() => setVisible(true)}
            style={{
              width: 60,
              height: 60,
              fontSize: '20px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
          />
        </Badge>
      </div>

      {/* Drawer Chat */}
      <Drawer
        title={
          <Space>
            <CustomerServiceOutlined />
            <span>Support en Direct</span>
            {agent?.isOnline && (
              <Badge status="success" text="En ligne" />
            )}
          </Space>
        }
        placement="right"
        width={400}
        open={visible}
        onClose={() => {
          setVisible(false);
          onClose?.();
        }}
        extra={
          <Space>
            <Button icon={<PhoneOutlined />} size="small">
              Appel
            </Button>
            <Button 
              icon={<CloseOutlined />} 
              size="small"
              onClick={() => setVisible(false)}
            />
          </Space>
        }
      >
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Informations Agent */}
          {agent && (
            <Card size="small" style={{ marginBottom: 16 }}>
              <Space>
                <Avatar src={agent.avatar} size="small">
                  {agent.name.charAt(0)}
                </Avatar>
                <div>
                  <div style={{ fontWeight: 500 }}>{agent.name}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {agent.role} • {agent.languages.join(', ')}
                  </div>
                </div>
                <Badge 
                  status={agent.isOnline ? 'success' : 'default'} 
                  text={agent.isOnline ? 'En ligne' : 'Hors ligne'}
                />
              </Space>
            </Card>
          )}

          {/* Zone Messages */}
          <div 
            style={{ 
              flex: 1, 
              overflowY: 'auto', 
              padding: '0 8px',
              marginBottom: 16
            }}
          >
            <List
              dataSource={displayMessages}
              renderItem={(message) => (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: message.authorType === 'user' ? 'flex-end' : 'flex-start',
                    marginBottom: 12
                  }}
                >
                  <div
                    style={{
                      maxWidth: '80%',
                      padding: '8px 12px',
                      borderRadius: 12,
                      backgroundColor: message.authorType === 'user' ? '#1890ff' : '#f0f0f0',
                      color: message.authorType === 'user' ? 'white' : 'black'
                    }}
                  >
                    {message.authorType === 'agent' && (
                      <div style={{ 
                        fontSize: '11px', 
                        opacity: 0.8, 
                        marginBottom: 4,
                        fontWeight: 500
                      }}>
                        {message.authorName}
                      </div>
                    )}
                    <div>{message.content}</div>
                    <div style={{ 
                      fontSize: '10px', 
                      opacity: 0.7, 
                      marginTop: 4,
                      textAlign: 'right'
                    }}>
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              )}
            />

            {/* Indicateur de frappe */}
            {typing && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'flex-start',
                marginBottom: 12
              }}>
                <div style={{
                  padding: '8px 12px',
                  borderRadius: 12,
                  backgroundColor: '#f0f0f0',
                  fontStyle: 'italic',
                  color: '#666'
                }}>
                  {agent?.name} est en train d'écrire...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Zone de Saisie */}
          <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 12 }}>
            <Space.Compact style={{ width: '100%' }}>
              <TextArea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Tapez votre message..."
                autoSize={{ minRows: 1, maxRows: 3 }}
                onPressEnter={(e) => {
                  if (!e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                style={{ resize: 'none' }}
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSendMessage}
                loading={loading}
                disabled={!newMessage.trim()}
              />
            </Space.Compact>

            <div style={{ 
              marginTop: 8, 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Space size="small">
                <Button size="small" icon={<SmileOutlined />} type="text">
                  😊
                </Button>
                <Button size="small" icon={<PaperClipOutlined />} type="text">
                  Fichier
                </Button>
              </Space>
              
              <Text type="secondary" style={{ fontSize: '11px' }}>
                Entrée pour envoyer, Shift+Entrée pour nouvelle ligne
              </Text>
            </div>
          </div>

          {/* Actions Rapides */}
          <div style={{ 
            marginTop: 12, 
            padding: 8, 
            backgroundColor: '#fafafa', 
            borderRadius: 6 
          }}>
            <Text strong style={{ fontSize: '12px', display: 'block', marginBottom: 8 }}>
              Actions Rapides:
            </Text>
            <Space wrap size="small">
              <Tag 
                style={{ cursor: 'pointer' }}
                onClick={() => setNewMessage('J\'ai besoin d\'aide avec...')}
              >
                Demander de l'aide
              </Tag>
              <Tag 
                style={{ cursor: 'pointer' }}
                onClick={() => setNewMessage('Pouvez-vous m\'expliquer comment...')}
              >
                Explication
              </Tag>
              <Tag 
                style={{ cursor: 'pointer' }}
                onClick={() => setNewMessage('J\'ai un problème technique avec...')}
              >
                Problème technique
              </Tag>
              <Tag 
                style={{ cursor: 'pointer' }}
                onClick={() => setNewMessage('Merci pour votre aide !')}
              >
                Remercier
              </Tag>
            </Space>
          </div>
        </div>
      </Drawer>
    </>
  );
};

export default LiveChat;
