// Page principale de réponse aux appels d'offres

import React, { useState } from 'react';
import { Steps, Card } from 'antd';
import { 
  FileTextOutlined, 
  SearchOutlined, 
  EditOutlined, 
  CheckCircleOutlined 
} from '@ant-design/icons';
import PageContainer from '../components/Layout/PageContainer';
import SectionHeader from '../components/UI/SectionHeader';
import TenderUpload from '../components/Tender/TenderUpload';
import TenderAnalysis from '../components/Tender/TenderAnalysis';
import ResponseGeneration from '../components/Tender/ResponseGeneration';
import ResponseReview from '../components/Tender/ResponseReview';
import { Tender, TenderResponse } from '../types/tender';

const { Step } = Steps;

const TenderResponsePage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [tender, setTender] = useState<Tender | null>(null);
  const [response, setResponse] = useState<TenderResponse | null>(null);

  const steps = [
    {
      title: 'Upload',
      icon: <FileTextOutlined />,
      description: 'Charger l\'appel d\'offres'
    },
    {
      title: 'Analyse',
      icon: <SearchOutlined />,
      description: 'Analyser les exigences'
    },
    {
      title: 'Génération',
      icon: <EditOutlined />,
      description: 'Générer la réponse'
    },
    {
      title: 'Révision',
      icon: <CheckCircleOutlined />,
      description: 'Réviser et exporter'
    }
  ];

  const handleTenderAnalyzed = (analyzedTender: Tender) => {
    setTender(analyzedTender);
    setCurrentStep(1);
  };

  const handleAnalysisValidated = () => {
    setCurrentStep(2);
  };

  const handleResponseGenerated = (generatedResponse: TenderResponse) => {
    setResponse(generatedResponse);
    setCurrentStep(3);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setTender(null);
    setResponse(null);
  };

  return (
    <PageContainer className="space-y-6">
      {}
      <Card className="glass-card">
        <Steps current={currentStep} className="mb-8">
          {steps.map((step, index) => (
            <Step
              key={index}
              title={step.title}
              description={step.description}
              icon={step.icon}
            />
          ))}
        </Steps>

        {/* Step Content */}
        <div className="mt-8">
          {currentStep === 0 && (
            <TenderUpload onTenderAnalyzed={handleTenderAnalyzed} />
          )}

          {currentStep === 1 && tender && (
            <TenderAnalysis 
              tender={tender}
              onValidated={handleAnalysisValidated}
              onBack={() => setCurrentStep(0)}
            />
          )}

          {currentStep === 2 && tender && (
            <ResponseGeneration
              tender={tender}
              onResponseGenerated={handleResponseGenerated}
              onBack={() => setCurrentStep(1)}
            />
          )}

          {currentStep === 3 && response && tender && (
            <ResponseReview
              response={response}
              tender={tender}
              onBack={() => setCurrentStep(2)}
              onReset={handleReset}
            />
          )}
        </div>
      </Card>

      {/* Info Card */}
      <Card className="glass-card bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-4">
          <div className="text-4xl"></div>
          <div>
            <h3 className="font-semibold text-lg mb-2">Comment ça marche ?</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
              <li><strong>Uploadez</strong> votre appel d'offres (PDF ou image)</li>
              <li><strong>Analyse en cours</strong> automatiquement les exigences et critères</li>
              <li><strong>Générez</strong> une réponse complète en quelques clics</li>
              <li><strong>Révisez</strong> et exportez votre proposition professionnelle</li>
            </ol>
            <div className="mt-4 p-3 bg-white rounded-lg border border-blue-300">
              <p className="text-sm font-medium text-blue-800">
                 Gain de temps : <span className="text-blue-600">80%</span> | 
                💰 Coût IA : <span className="text-green-600">~50 FCFA</span> par réponse
              </p>
            </div>
          </div>
        </div>
      </Card>
    </PageContainer>
  );
};

export default TenderResponsePage;
