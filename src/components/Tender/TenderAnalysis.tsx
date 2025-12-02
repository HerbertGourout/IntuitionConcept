// Composant d'affichage et de validation de l'analyse

import React from 'react';
import { Card, Button, Space, Tag, Descriptions, List, Progress, Alert } from 'antd';
import { 
  CheckCircleOutlined, 
  ExclamationCircleOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  FileTextOutlined,
  DollarOutlined,
  CalendarOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';
import { Tender } from '../../types/tender';

interface TenderAnalysisProps {
  tender: Tender;
  onValidated: () => void;
  onBack: () => void;
}

const TenderAnalysis: React.FC<TenderAnalysisProps> = ({ tender, onValidated, onBack }) => {
  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'green';
      case 'medium': return 'orange';
      case 'complex': return 'red';
      default: return 'blue';
    }
  };

  const getRequirementTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      technical: 'blue',
      financial: 'green',
      legal: 'purple',
      experience: 'orange',
      administrative: 'cyan'
    };
    return colors[type] || 'default';
  };

  const mandatoryRequirements = tender.requirements.filter(r => r.mandatory);
  const optionalRequirements = tender.requirements.filter(r => !r.mandatory);

  return (
    <div className="space-y-6">
      {}
      <div className="flex justify-between">
        <Button 
          icon={<ArrowLeftOutlined />}
          onClick={onBack}
          size="large"
        >
          Retour
        </Button>
        
        <Button 
          type="primary"
          icon={<ArrowRightOutlined />}
          onClick={onValidated}
          size="large"
        >
          Continuer vers la génération
        </Button>
      </div>
    </div>
  );
};

export default TenderAnalysis;
