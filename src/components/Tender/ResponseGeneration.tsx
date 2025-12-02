

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
    aiModel: 'Modèle-haiku',
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

      console.log(' Génération de la réponse avec IA...');
      
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

  const estimatedCost = config.aiModel === 'Modèle-haiku' ? 50 : 200;
  const estimatedTime = config.aiModel === 'Modèle-haiku' ? '2-3 min' : '3-5 min';

  return (
    <div className="space-y-6">
      {}
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
