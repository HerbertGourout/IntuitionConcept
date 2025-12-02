import React, { useState, useEffect } from 'react';
import { Card, Button, Space, Typography, Alert, Badge, List, Tag } from 'antd';
import { 
  AudioOutlined, 
  AudioMutedOutlined, 
  MessageOutlined,
  RobotOutlined,
  SoundOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import { vocalCopilotService, VoiceCommand, VocalCopilotService } from '../../services/ai/vocalCopilotService';

const { Title, Text, Paragraph } = Typography;

const VocalCopilot: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [commands, setCommands] = useState<VoiceCommand[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [lastResponse, setLastResponse] = useState('');

  useEffect(() => {
    setIsSupported(VocalCopilotService.isSupported());
    
    // Simuler des commandes pour la démo
    const mockCommands: VoiceCommand[] = [
      {
        id: 'cmd_1',
        transcript: 'Créer un devis pour Jean Dupont',
        intent: 'create_quote',
        entities: { client: 'Jean Dupont' },
        confidence: 0.9,
        timestamp: new Date(Date.now() - 300000),
        response: 'D\'accord, je vais créer un nouveau devis pour Jean Dupont.'
      },
      {
        id: 'cmd_2',
        transcript: 'Prix du béton',
        intent: 'search_price',
        entities: { item: 'béton' },
        confidence: 0.85,
        timestamp: new Date(Date.now() - 180000),
        response: 'J\'ai trouvé "Béton dosé à 350kg/m³" à 85 000 XOF par m³ dans la région Dakar.'
      },
      {
        id: 'cmd_3',
        transcript: 'Quel est mon budget',
        intent: 'check_budget',
        entities: {},
        confidence: 0.8,
        timestamp: new Date(Date.now() - 60000),
        response: 'Vous avez dépensé 1 250 000 francs CFA sur un budget de 2 000 000, soit 63%. Il vous reste 750 000 francs CFA.'
      }
    ];
    setCommands(mockCommands);
  }, []);

  const handleStartListening = async () => {
    try {
      await vocalCopilotService.startListening();
      setIsListening(true);
      setCurrentTranscript('🎤 Écoute en cours...');
    } catch (error) {
      console.error('Erreur démarrage écoute:', error);
    }
  };

  const handleStopListening = () => {
    vocalCopilotService.stopListening();
    setIsListening(false);
    setCurrentTranscript('');
  };

  const handleTestCommand = async (command: string) => {
    setCurrentTranscript(command);
    
    // Simuler le traitement de la commande
    setTimeout(() => {
      const mockCommand: VoiceCommand = {
        id: `cmd_${Date.now()}`,
        transcript: command,
        intent: 'test',
        entities: {},
        confidence: 0.9,
        timestamp: new Date(),
        response: `Commande de test traitée: "${command}"`
      };
      
      setCommands(prev => [mockCommand, ...prev]);
      setLastResponse(mockCommand.response!);
      setCurrentTranscript('');
    }, 1500);
  };

  const getIntentColor = (intent: string) => {
    const colors: Record<string, string> = {
      'create_quote': 'blue',
      'search_price': 'green',
      'create_project': 'purple',
      'add_task': 'orange',
      'check_budget': 'gold',
      'generate_plan': 'cyan',
      'help': 'gray',
      'test': 'magenta'
    };
    return colors[intent] || 'default';
  };

  const getIntentLabel = (intent: string) => {
    const labels: Record<string, string> = {
      'create_quote': 'Créer Devis',
      'search_price': 'Recherche Prix',
      'create_project': 'Créer Projet',
      'add_task': 'Ajouter Tâche',
      'check_budget': 'Vérifier Budget',
      'generate_plan': 'Générer Plan',
      'help': 'Aide',
      'test': 'Test'
    };
    return labels[intent] || intent;
  };

  if (!isSupported) {
    return (
      <Card>
        <Alert
          message="Copilot Vocal Non Supporté"
          description="Votre navigateur ne supporte pas la reconnaissance vocale. Veuillez utiliser Chrome, Edge ou Safari récent."
          type="warning"
          showIcon
        />
      </Card>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      {}
          <div style={{ textAlign: 'center' }}>
            <Space size="large">
              <Button
                type={isListening ? "default" : "primary"}
                size="large"
                icon={isListening ? <AudioMutedOutlined /> : <AudioOutlined />}
                onClick={isListening ? handleStopListening : handleStartListening}
                style={{
                  height: 60,
                  fontSize: '16px',
                  backgroundColor: isListening ? '#ff4d4f' : '#1890ff',
                  borderColor: isListening ? '#ff4d4f' : '#1890ff',
                  color: 'white'
                }}
              >
                {isListening ? 'Arrêter l\'écoute' : 'Commencer à parler'}
              </Button>
            </Space>
          </div>

          {}
      <Card
        title={
          <Space>
            <HistoryOutlined />
            Historique des Commandes
          </Space>
        }
      >
        <List
          dataSource={commands}
          renderItem={(command) => (
            <List.Item>
              <List.Item.Meta
                title={
                  <Space>
                    <Text strong>{command.transcript}</Text>
                    <Tag color={getIntentColor(command.intent)}>
                      {getIntentLabel(command.intent)}
                    </Tag>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Confiance: {Math.round(command.confidence * 100)}%
                    </Text>
                  </Space>
                }
                description={
                  <Space direction="vertical" size="small">
                    {command.response && (
                      <Text style={{ color: '#52c41a' }}>
                         {command.response}
                      </Text>
                    )}
                    <Text type="secondary" style={{ fontSize: '11px' }}>
                      {command.timestamp.toLocaleString('fr-FR')}
                    </Text>
                  </Space>
                }
              />
            </List.Item>
          )}
          locale={{ emptyText: 'Aucune commande vocale encore' }}
        />
      </Card>
    </div>
  );
};

export default VocalCopilot;
