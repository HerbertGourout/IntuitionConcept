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
      {/* Résumé */}
      <Card className="glass-card">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">{tender.title}</h2>
            <Space size="middle">
              <Tag color="blue" icon={<FileTextOutlined />}>
                {tender.reference}
              </Tag>
              <Tag color={getComplexityColor(tender.complexity)}>
                {tender.complexity === 'simple' && 'Simple'}
                {tender.complexity === 'medium' && 'Moyen'}
                {tender.complexity === 'complex' && 'Complexe'}
              </Tag>
            </Space>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">
              {tender.budget?.toLocaleString() || 'N/A'} {tender.currency}
            </div>
            <div className="text-sm text-gray-600">Budget estimé</div>
          </div>
        </div>

        <Descriptions column={2} bordered>
          <Descriptions.Item label={<><FileTextOutlined /> Client</>}>
            <strong>{tender.client}</strong>
          </Descriptions.Item>
          <Descriptions.Item label={<><CalendarOutlined /> Date limite</>}>
            <strong>{new Date(tender.deadline).toLocaleDateString('fr-FR')}</strong>
          </Descriptions.Item>
          <Descriptions.Item label={<><EnvironmentOutlined /> Localisation</>}>
            {tender.location}
          </Descriptions.Item>
          <Descriptions.Item label={<><CalendarOutlined /> Durée</>}>
            {tender.duration ? `${tender.duration} jours` : 'Non spécifiée'}
          </Descriptions.Item>
        </Descriptions>

        <div className="mt-4">
          <h4 className="font-semibold mb-2">Description</h4>
          <p className="text-gray-700">{tender.description}</p>
        </div>
      </Card>

      {/* Exigences */}
      <Card 
        className="glass-card"
        title={
          <Space>
            <CheckCircleOutlined />
            <span>Exigences Identifiées ({tender.requirements.length})</span>
          </Space>
        }
      >
        {/* Exigences obligatoires */}
        <div className="mb-6">
          <h4 className="font-semibold mb-3 flex items-center">
            <ExclamationCircleOutlined className="text-red-500 mr-2" />
            Obligatoires ({mandatoryRequirements.length})
          </h4>
          <List
            dataSource={mandatoryRequirements}
            renderItem={(req) => (
              <List.Item>
                <div className="w-full">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Tag color={getRequirementTypeColor(req.type)} className="mb-2">
                        {req.type}
                      </Tag>
                      <p className="text-sm">{req.description}</p>
                    </div>
                    <Tag color="red">OBLIGATOIRE</Tag>
                  </div>
                </div>
              </List.Item>
            )}
          />
        </div>

        {/* Exigences optionnelles */}
        {optionalRequirements.length > 0 && (
          <div>
            <h4 className="font-semibold mb-3">
              Optionnelles ({optionalRequirements.length})
            </h4>
            <List
              dataSource={optionalRequirements}
              renderItem={(req) => (
                <List.Item>
                  <div className="w-full">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Tag color={getRequirementTypeColor(req.type)} className="mb-2">
                          {req.type}
                        </Tag>
                        <p className="text-sm">{req.description}</p>
                      </div>
                      <Tag>OPTIONNEL</Tag>
                    </div>
                  </div>
                </List.Item>
              )}
            />
          </div>
        )}
      </Card>

      {/* Critères d'évaluation */}
      <Card 
        className="glass-card"
        title={
          <Space>
            <DollarOutlined />
            <span>Critères d'Évaluation</span>
          </Space>
        }
      >
        <List
          dataSource={tender.evaluationCriteria}
          renderItem={(criteria) => (
            <List.Item>
              <div className="w-full">
                <div className="flex items-center justify-between mb-2">
                  <strong>{criteria.name}</strong>
                  <Tag color="blue">{criteria.weight}%</Tag>
                </div>
                <Progress 
                  percent={criteria.weight} 
                  showInfo={false}
                  strokeColor="#1890ff"
                />
                <p className="text-sm text-gray-600 mt-2">{criteria.description}</p>
              </div>
            </List.Item>
          )}
        />
      </Card>

      {/* Alerte */}
      <Alert
        message="Analyse Terminée"
        description="L'IA a analysé votre appel d'offres. Vérifiez les informations ci-dessus avant de continuer."
        type="success"
        showIcon
      />

      {/* Actions */}
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
