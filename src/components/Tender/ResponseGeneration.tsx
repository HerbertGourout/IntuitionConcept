// Composant de génération de réponse avec IA

import React, { useState } from 'react';
import { Card, Button, Space, Switch, Select, Alert, Spin, Progress, Radio, Tag } from 'antd';
import { 
  RobotOutlined,
  ArrowLeftOutlined,
  ThunderboltOutlined,
  DollarOutlined
} from '@ant-design/icons';
import { Tender, TenderResponse, ResponseGenerationConfig, CompanyProfile } from '../../types/tender';
import { tenderResponseGenerator } from '../../services/ai/tenderResponseGenerator';

interface ResponseGenerationProps {
  tender: Tender;
  onResponseGenerated: (response: TenderResponse) => void;
  onBack: () => void;
}

const ResponseGeneration: React.FC<ResponseGenerationProps> = ({ 
  tender, 
  onResponseGenerated, 
  onBack 
}) => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [config, setConfig] = useState<ResponseGenerationConfig>({
    useAI: true,
    aiModel: 'claude-haiku',
    tone: 'professional',
    language: 'fr',
    includeInnovations: true,
    emphasizeExperience: true,
    competitivePricing: true
  });

  // Profil d'entreprise fictif pour le MVP
  // TODO: Récupérer depuis la base de données
  const companyProfile: CompanyProfile = {
    id: 'company-1',
    name: 'ENTREPRISE BTP SARL',
    legalForm: 'SARL',
    registrationNumber: 'RC123456',
    taxNumber: 'NIF987654321',
    address: '123 Avenue de la Paix, Dakar',
    phone: '+221 33 123 45 67',
    email: 'contact@entreprise-btp.sn',
    website: 'www.entreprise-btp.sn',
    
    yearFounded: 2010,
    employeeCount: 45,
    annualRevenue: 500000000,
    certifications: ['ISO 9001', 'ISO 14001', 'OHSAS 18001'],
    specializations: ['Construction', 'Rénovation', 'Génie Civil'],
    
    equipment: [
      { name: 'Pelleteuse', quantity: 3, condition: 'excellent' },
      { name: 'Camion benne', quantity: 5, condition: 'good' },
      { name: 'Bétonnière', quantity: 4, condition: 'excellent' }
    ],
    
    completedProjects: 127,
    totalProjectValue: 5000000000,
    
    standardDocuments: []
  };

  const handleGenerate = async () => {
    setLoading(true);
    setProgress(0);

    try {
      // Simulation de progression
      const progressSteps = [
        { percent: 20, message: '📝 Génération de la lettre de motivation...' },
        { percent: 35, message: '🏢 Rédaction de la présentation entreprise...' },
        { percent: 50, message: '🔧 Élaboration de la proposition technique...' },
        { percent: 65, message: '💰 Calcul de la proposition financière...' },
        { percent: 80, message: '📅 Création du planning...' },
        { percent: 90, message: '👥 Composition de l\'équipe...' },
        { percent: 95, message: '✅ Finalisation...' }
      ];

      let currentStep = 0;
      const progressInterval = setInterval(() => {
        if (currentStep < progressSteps.length) {
          setProgress(progressSteps[currentStep].percent);
          currentStep++;
        }
      }, 1000);

      console.log('🤖 Génération de la réponse avec IA...');
      
      const result = await tenderResponseGenerator.generateResponse(
        tender,
        companyProfile,
        config
      );
      
      clearInterval(progressInterval);
      setProgress(100);
      
      console.log('✅ Réponse générée:', result);
      
      // Petit délai pour montrer 100%
      setTimeout(() => {
        onResponseGenerated(result.response);
      }, 500);
      
    } catch (err) {
      console.error('❌ Erreur génération:', err);
      alert('Erreur lors de la génération de la réponse');
    } finally {
      setLoading(false);
    }
  };

  const estimatedCost = config.aiModel === 'claude-haiku' ? 50 : 200;
  const estimatedTime = config.aiModel === 'claude-haiku' ? '2-3 min' : '3-5 min';

  return (
    <div className="space-y-6">
      {/* Configuration */}
      <Card 
        className="glass-card"
        title={
          <Space>
            <RobotOutlined />
            <span>Configuration de la Génération IA</span>
          </Space>
        }
      >
        <div className="space-y-6">
          {/* Modèle IA */}
          <div>
            <label className="block font-semibold mb-3">Modèle d'IA</label>
            <Radio.Group 
              value={config.aiModel}
              onChange={(e) => setConfig({ ...config, aiModel: e.target.value })}
              className="w-full"
            >
              <Space direction="vertical" className="w-full">
                <Card 
                  className={`cursor-pointer ${config.aiModel === 'claude-haiku' ? 'border-blue-500 border-2' : ''}`}
                  onClick={() => setConfig({ ...config, aiModel: 'claude-haiku' })}
                >
                  <Radio value="claude-haiku">
                    <div className="ml-2">
                      <div className="flex items-center justify-between">
                        <strong>Claude Haiku (Recommandé)</strong>
                        <Space>
                          <Tag color="green">~50 FCFA</Tag>
                          <Tag color="blue">Rapide</Tag>
                        </Space>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Génération rapide et économique. Idéal pour la plupart des appels d'offres.
                      </p>
                    </div>
                  </Radio>
                </Card>

                <Card 
                  className={`cursor-pointer ${config.aiModel === 'claude-sonnet' ? 'border-blue-500 border-2' : ''}`}
                  onClick={() => setConfig({ ...config, aiModel: 'claude-sonnet' })}
                >
                  <Radio value="claude-sonnet">
                    <div className="ml-2">
                      <div className="flex items-center justify-between">
                        <strong>Claude Sonnet (Premium)</strong>
                        <Space>
                          <Tag color="orange">~200 FCFA</Tag>
                          <Tag color="purple">Qualité maximale</Tag>
                        </Space>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Analyse approfondie et rédaction de très haute qualité. Pour les appels d'offres complexes.
                      </p>
                    </div>
                  </Radio>
                </Card>
              </Space>
            </Radio.Group>
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-2">Ton</label>
              <Select
                value={config.tone}
                onChange={(value) => setConfig({ ...config, tone: value })}
                className="w-full"
              >
                <Select.Option value="formal">Très formel</Select.Option>
                <Select.Option value="professional">Professionnel</Select.Option>
                <Select.Option value="friendly">Accessible</Select.Option>
              </Select>
            </div>

            <div>
              <label className="block font-semibold mb-2">Langue</label>
              <Select
                value={config.language}
                onChange={(value) => setConfig({ ...config, language: value })}
                className="w-full"
              >
                <Select.Option value="fr">Français</Select.Option>
                <Select.Option value="en">Anglais</Select.Option>
              </Select>
            </div>
          </div>

          {/* Switches */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div>
                <strong>Inclure des innovations</strong>
                <p className="text-sm text-gray-600">Proposer des solutions innovantes</p>
              </div>
              <Switch
                checked={config.includeInnovations}
                onChange={(checked) => setConfig({ ...config, includeInnovations: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div>
                <strong>Mettre en avant l'expérience</strong>
                <p className="text-sm text-gray-600">Souligner nos réalisations passées</p>
              </div>
              <Switch
                checked={config.emphasizeExperience}
                onChange={(checked) => setConfig({ ...config, emphasizeExperience: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div>
                <strong>Prix compétitif</strong>
                <p className="text-sm text-gray-600">Optimiser les prix pour être compétitif</p>
              </div>
              <Switch
                checked={config.competitivePricing}
                onChange={(checked) => setConfig({ ...config, competitivePricing: checked })}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Estimation */}
      <Card className="glass-card bg-blue-50 border-blue-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">
              <DollarOutlined /> {estimatedCost} FCFA
            </div>
            <div className="text-sm text-gray-600">Coût estimé</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              <ThunderboltOutlined /> {estimatedTime}
            </div>
            <div className="text-sm text-gray-600">Temps estimé</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              📄 8-12 pages
            </div>
            <div className="text-sm text-gray-600">Document généré</div>
          </div>
        </div>
      </Card>

      {/* Génération en cours */}
      {loading && (
        <Card className="glass-card">
          <div className="text-center py-8">
            <Spin size="large" />
            <h3 className="text-lg font-semibold mt-4 mb-4">
              Génération en cours...
            </h3>
            <Progress 
              percent={progress} 
              status="active"
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
            />
            <p className="text-sm text-gray-600 mt-4">
              {progress < 20 && '📝 Génération de la lettre de motivation...'}
              {progress >= 20 && progress < 35 && '🏢 Rédaction de la présentation entreprise...'}
              {progress >= 35 && progress < 50 && '🔧 Élaboration de la proposition technique...'}
              {progress >= 50 && progress < 65 && '💰 Calcul de la proposition financière...'}
              {progress >= 65 && progress < 80 && '📅 Création du planning...'}
              {progress >= 80 && progress < 90 && '👥 Composition de l\'équipe...'}
              {progress >= 90 && '✅ Finalisation...'}
            </p>
          </div>
        </Card>
      )}

      {/* Info */}
      {!loading && (
        <Alert
          message="Prêt à générer"
          description="L'IA va générer une réponse complète incluant : lettre de motivation, présentation entreprise, proposition technique et financière, planning, équipe et références."
          type="info"
          showIcon
        />
      )}

      {/* Actions */}
      <div className="flex justify-between">
        <Button 
          icon={<ArrowLeftOutlined />}
          onClick={onBack}
          size="large"
          disabled={loading}
        >
          Retour
        </Button>
        
        <Button 
          type="primary"
          icon={<RobotOutlined />}
          onClick={handleGenerate}
          size="large"
          loading={loading}
        >
          Générer la réponse avec IA
        </Button>
      </div>
    </div>
  );
};

export default ResponseGeneration;
