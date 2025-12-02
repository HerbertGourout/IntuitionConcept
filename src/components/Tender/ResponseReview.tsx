// Composant de révision et export de la réponse

import React, { useState } from 'react';
import { Card, Button, Space, Tabs, Descriptions, List, Tag, Progress, Alert, Modal } from 'antd';
import { 
  FileTextOutlined,
  DownloadOutlined,
  SendOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  TrophyOutlined,
  DollarOutlined,
  TeamOutlined,
  CalendarOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { TenderResponse, Tender } from '../../types/tender';

const { TabPane } = Tabs;

interface ResponseReviewProps {
  response: TenderResponse;
  tender: Tender;
  onBack: () => void;
  onReset: () => void;
}

const ResponseReview: React.FC<ResponseReviewProps> = ({ 
  response, 
  onBack,
  onReset
}) => {
  const [exportModalVisible, setExportModalVisible] = useState(false);

  const handleExportPDF = () => {
    // TODO: Implémenter l'export PDF réel
    alert('Export PDF en cours de développement...');
    setExportModalVisible(false);
  };

  const handleSendEmail = () => {
    // TODO: Implémenter l'envoi par email
    alert('Envoi par email en cours de développement...');
    setExportModalVisible(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'green';
    if (score >= 60) return 'orange';
    return 'red';
  };

  return (
    <div className="space-y-6">
      {/* Scores et résumé */}
      <Card className="glass-card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">Résumé de la réponse</h3>
          <Space>
            <Tag color="green">
              Réponse générée
            </Tag>
          </Space>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Progress 
              type="circle" 
              percent={85} 
              size={80}
              strokeColor="green"
            />
            <p className="mt-2 font-medium">Complétude</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Progress 
              type="circle" 
              percent={75} 
              size={80}
              strokeColor="orange"
            />
            <p className="mt-2 font-medium">Compétitivité</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <Progress 
              type="circle" 
              percent={70} 
              size={80}
              strokeColor="orange"
            />
            <p className="mt-2 font-medium">Probabilité de gain</p>
          </div>
        </div>

        {response.suggestions.length > 0 && (
          <div className="mt-6">
            <h4 className="font-semibold mb-3 flex items-center">
              <TrophyOutlined className="mr-2 text-yellow-500" />
              Suggestions d'amélioration
            </h4>
            <List
              dataSource={response.suggestions}
              renderItem={(suggestion) => (
                <List.Item>
                  <div className="flex items-start">
                    <CheckCircleOutlined className="text-blue-500 mr-2 mt-1" />
                    <span>{suggestion}</span>
                  </div>
                </List.Item>
              )}
            />
          </div>
        )}
      </Card>

      {/* Contenu de la réponse */}
      <Card className="glass-card">
        <Tabs defaultActiveKey="cover">
          {/* Lettre de motivation */}
          <TabPane 
            tab={
              <span>
                <FileTextOutlined />
                Lettre de motivation
              </span>
            } 
            key="cover"
          >
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                {response.coverLetter}
              </pre>
            </div>
          </TabPane>

          {/* Présentation entreprise */}
          <TabPane 
            tab={
              <span>
                <TeamOutlined />
                Présentation
              </span>
            } 
            key="company"
          >
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                {response.companyPresentation}
              </pre>
            </div>
          </TabPane>

          {/* Proposition technique */}
          <TabPane 
            tab={
              <span>
                <FileTextOutlined />
                Technique
              </span>
            } 
            key="technical"
          >
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">Méthodologie</h4>
                <p className="text-sm">{response.technicalProposal.methodology}</p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Approche</h4>
                <p className="text-sm">{response.technicalProposal.approach}</p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Assurance Qualité</h4>
                <p className="text-sm">{response.technicalProposal.qualityAssurance}</p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Gestion des Risques</h4>
                <p className="text-sm">{response.technicalProposal.riskManagement}</p>
              </div>
              
              {response.technicalProposal.innovations.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Innovations</h4>
                  <List
                    dataSource={response.technicalProposal.innovations}
                    renderItem={(innovation) => (
                      <List.Item>
                        <CheckCircleOutlined className="text-green-500 mr-2" />
                        {innovation}
                      </List.Item>
                    )}
                  />
                </div>
              )}
            </div>
          </TabPane>

          {/* Proposition financière */}
          <TabPane 
            tab={
              <span>
                <DollarOutlined />
                Financier
              </span>
            } 
            key="financial"
          >
            <div className="space-y-6">
              <div className="text-center p-6 bg-blue-50 rounded-lg">
                <div className="text-4xl font-bold text-blue-600">
                  {response.financialProposal.totalAmount.toLocaleString()} {response.financialProposal.currency}
                </div>
                <div className="text-sm text-gray-600 mt-2">Montant Total TTC</div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Décomposition</h4>
                <List
                  dataSource={response.financialProposal.breakdown}
                  renderItem={(item) => (
                    <List.Item>
                      <div className="w-full">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <strong>{item.category}</strong>
                            <p className="text-sm text-gray-600">{item.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">
                              {item.totalPrice.toLocaleString()} FCFA
                            </div>
                            <div className="text-xs text-gray-600">
                              {item.quantity} × {item.unitPrice.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </List.Item>
                  )}
                />
              </div>

              <Descriptions bordered column={1}>
                <Descriptions.Item label="Conditions de paiement">
                  {response.financialProposal.paymentTerms}
                </Descriptions.Item>
                <Descriptions.Item label="Validité de l'offre">
                  {response.financialProposal.validityPeriod} jours
                </Descriptions.Item>
                <Descriptions.Item label="Garantie">
                  {response.financialProposal.warranty}
                </Descriptions.Item>
              </Descriptions>
            </div>
          </TabPane>

          {/* Planning */}
          <TabPane 
            tab={
              <span>
                <CalendarOutlined />
                Planning
              </span>
            } 
            key="schedule"
          >
            <div className="space-y-4">
              <Alert
                message={`Durée totale : ${response.schedule.totalDuration} jours`}
                type="info"
                showIcon
              />

              <List
                dataSource={response.schedule.phases}
                renderItem={(phase) => (
                  <List.Item>
                    <div className="w-full">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <strong>{phase.name}</strong>
                          <p className="text-sm text-gray-600">{phase.description}</p>
                        </div>
                        <Tag color="blue">{phase.duration} jours</Tag>
                      </div>
                      <div className="text-xs text-gray-600">
                        Du {new Date(phase.startDate).toLocaleDateString('fr-FR')} 
                        {' au '}
                        {new Date(phase.endDate).toLocaleDateString('fr-FR')}
                      </div>
                      
                      {phase.milestones.length > 0 && (
                        <div className="mt-2 pl-4 border-l-2 border-blue-300">
                          {phase.milestones.map((milestone, idx) => (
                            <div key={idx} className="text-sm">
                              <CheckCircleOutlined className="text-green-500 mr-2" />
                              {milestone.name} - {milestone.deliverable}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </List.Item>
                )}
              />
            </div>
          </TabPane>

          {/* Équipe */}
          <TabPane 
            tab={
              <span>
                <TeamOutlined />
                Équipe ({response.team.length})
              </span>
            } 
            key="team"
          >
            <List
              dataSource={response.team}
              renderItem={(member) => (
                <List.Item>
                  <div className="w-full">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <strong>{member.name}</strong>
                        <p className="text-sm text-gray-600">{member.role}</p>
                      </div>
                      <Space>
                        <Tag color="blue">{member.experience} ans</Tag>
                        <Tag color="green">{member.availability}%</Tag>
                      </Space>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {member.qualifications.map((qual, idx) => (
                        <Tag key={idx} color="purple">{qual}</Tag>
                      ))}
                    </div>
                  </div>
                </List.Item>
              )}
            />
          </TabPane>

          {/* Références */}
          <TabPane 
            tab={
              <span>
                <TrophyOutlined />
                Références ({response.references.length})
              </span>
            } 
            key="references"
          >
            <List
              dataSource={response.references}
              renderItem={(ref) => (
                <List.Item>
                  <div className="w-full">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <strong>{ref.projectName}</strong>
                        <p className="text-sm text-gray-600">{ref.client}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{ref.value.toLocaleString()} FCFA</div>
                        <div className="text-xs text-gray-600">{ref.duration} jours</div>
                      </div>
                    </div>
                    <p className="text-sm">{ref.description}</p>
                    <div className="text-xs text-gray-600 mt-2">
                      Achevé le {new Date(ref.completionDate).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </List.Item>
              )}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* Actions */}
      <div className="flex justify-between">
        <Space>
          <Button 
            icon={<ArrowLeftOutlined />}
            onClick={onBack}
            size="large"
          >
            Retour
          </Button>
          
          <Button 
            icon={<ReloadOutlined />}
            onClick={onReset}
            size="large"
          >
            Nouveau
          </Button>
        </Space>
        
        <Space>
          <Button 
            type="primary"
            icon={<DownloadOutlined />}
            onClick={() => setExportModalVisible(true)}
            size="large"
          >
            Exporter
          </Button>
        </Space>
      </div>

      {/* Modal d'export */}
      <Modal
        title="Exporter la réponse"
        open={exportModalVisible}
        onCancel={() => setExportModalVisible(false)}
        footer={null}
      >
        <div className="space-y-4">
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleExportPDF}
            size="large"
            block
          >
            Télécharger en PDF
          </Button>
          
          <Button
            icon={<SendOutlined />}
            onClick={handleSendEmail}
            size="large"
            block
          >
            Envoyer par email
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default ResponseReview;
