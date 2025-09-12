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
      {/* Interface principale */}
      <Card
        title={
          <Space>
            <RobotOutlined />
            Copilot Vocal IA
            {isListening && <Badge status="processing" text="En écoute" />}
          </Space>
        }
        style={{ marginBottom: 16 }}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          {/* Contrôles vocaux */}
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

          {/* Transcript en cours */}
          {currentTranscript && (
            <Alert
              message="Transcription en cours"
              description={currentTranscript}
              type="info"
              showIcon
              icon={<SoundOutlined />}
            />
          )}

          {/* Dernière réponse */}
          {lastResponse && (
            <Alert
              message="Réponse du Copilot"
              description={lastResponse}
              type="success"
              showIcon
              icon={<MessageOutlined />}
            />
          )}

          {/* Commandes de test */}
          <div>
            <Title level={5}>Commandes de test :</Title>
            <Space wrap>
              <Button 
                size="small" 
                onClick={() => handleTestCommand('Créer un devis pour Marie Martin')}
              >
                "Créer un devis pour Marie Martin"
              </Button>
              <Button 
                size="small" 
                onClick={() => handleTestCommand('Prix du carrelage')}
              >
                "Prix du carrelage"
              </Button>
              <Button 
                size="small" 
                onClick={() => handleTestCommand('Nouveau projet Villa ABC')}
              >
                "Nouveau projet Villa ABC"
              </Button>
              <Button 
                size="small" 
                onClick={() => handleTestCommand('Combien j\'ai dépensé')}
              >
                "Combien j'ai dépensé"
              </Button>
            </Space>
          </div>

          {/* Guide d'utilisation */}
          <div style={{ backgroundColor: '#f6ffed', padding: 12, borderRadius: 6, border: '1px solid #b7eb8f' }}>
            <Title level={5} style={{ margin: 0, marginBottom: 8, color: '#52c41a' }}>
              💡 Comment utiliser le Copilot Vocal :
            </Title>
            <Paragraph style={{ margin: 0, fontSize: '13px' }}>
              • <strong>"Créer un devis pour [client]"</strong> - Démarre la création d'un devis<br/>
              • <strong>"Prix du [matériau]"</strong> - Recherche dans la bibliothèque de prix<br/>
              • <strong>"Nouveau projet [nom]"</strong> - Crée un nouveau projet<br/>
              • <strong>"Ajouter une tâche [nom]"</strong> - Ajoute une tâche au projet<br/>
              • <strong>"Quel est mon budget"</strong> - Affiche l'état financier<br/>
              • <strong>"Générer un plan pour [description]"</strong> - Génère un plan IA<br/>
              • <strong>"Aide"</strong> - Liste toutes les commandes disponibles
            </Paragraph>
          </div>
        </Space>
      </Card>

      {/* Historique des commandes */}
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
                        🤖 {command.response}
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
