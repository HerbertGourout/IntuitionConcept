import React, { useState } from 'react';
import { Card, Row, Col, Tabs, Tag, Progress, Button, Modal, Table, Space, Statistic } from 'antd';
import { 
  TrophyOutlined, 
  GlobalOutlined, 
  DollarOutlined, 
  UserOutlined,
  RiseOutlined,
  BarChartOutlined,
  EyeOutlined,
  StarOutlined
} from '@ant-design/icons';
import { useResponsive } from '../../hooks/useResponsive';

const { TabPane } = Tabs;

interface Competitor {
  id: string;
  name: string;
  region: 'Africa' | 'Europe' | 'Global';
  marketShare: number;
  revenue: string;
  employees: string;
  strengths: string[];
  weaknesses: string[];
  pricing: string;
  targetMarket: string;
  keyFeatures: string[];
  threat: 'High' | 'Medium' | 'Low';
}

const CompetitiveAnalysis: React.FC = () => {
  const { isMobile } = useResponsive();
  const [selectedCompetitor, setSelectedCompetitor] = useState<Competitor | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const africanCompetitors: Competitor[] = [
    {
      id: 'orascom',
      name: 'Orascom Construction',
      region: 'Africa',
      marketShare: 15,
      revenue: '3.2B USD',
      employees: '45,000+',
      strengths: ['Leader historique', 'Présence pan-africaine', 'Projets d\'infrastructure majeurs'],
      weaknesses: ['Digitalisation limitée', 'Coûts élevés', 'Processus traditionnels'],
      pricing: 'Premium',
      targetMarket: 'Grands projets gouvernementaux',
      keyFeatures: ['Gestion de projets complexes', 'Expertise technique', 'Réseau établi'],
      threat: 'Medium'
    },
    {
      id: 'dangote',
      name: 'Dangote Group (Construction)',
      region: 'Africa',
      marketShare: 12,
      revenue: '2.8B USD',
      employees: '30,000+',
      strengths: ['Intégration verticale', 'Matériaux de construction', 'Présence Nigeria'],
      weaknesses: ['Focus géographique limité', 'Outils de gestion basiques'],
      pricing: 'Compétitif',
      targetMarket: 'Projets industriels et résidentiels',
      keyFeatures: ['Production de matériaux', 'Logistique intégrée'],
      threat: 'Low'
    },
    {
      id: 'tgcc',
      name: 'TGCC (Travaux Généraux de Construction du Cameroun)',
      region: 'Africa',
      marketShare: 8,
      revenue: '1.5B USD',
      employees: '15,000+',
      strengths: ['Expertise Afrique Centrale', 'Projets routiers', 'Partenariats chinois'],
      weaknesses: ['Technologie obsolète', 'Gestion manuelle'],
      pricing: 'Moyen',
      targetMarket: 'Infrastructure publique',
      keyFeatures: ['Routes et ponts', 'Travaux publics'],
      threat: 'Low'
    }
  ];

  const europeanCompetitors: Competitor[] = [
    {
      id: 'sage',
      name: 'Sage Batigest',
      region: 'Europe',
      marketShare: 25,
      revenue: '500M EUR',
      employees: '2,000+',
      strengths: ['Leader français', 'Suite complète', 'Intégrations comptables'],
      weaknesses: ['Interface vieillissante', 'Coût élevé', 'Complexité'],
      pricing: '30-100€/mois/utilisateur',
      targetMarket: 'PME et grandes entreprises BTP',
      keyFeatures: ['Devis/Factures', 'Comptabilité', 'Paie', 'Gestion chantier'],
      threat: 'High'
    },
    {
      id: 'graneet',
      name: 'Graneet',
      region: 'Europe',
      marketShare: 15,
      revenue: '50M EUR',
      employees: '200+',
      strengths: ['Interface moderne', 'Mobile-first', 'Collaboration équipes'],
      weaknesses: ['Fonctionnalités limitées', 'Marché français uniquement'],
      pricing: 'Sur demande',
      targetMarket: 'Entreprises moyennes BTP',
      keyFeatures: ['Planning collaboratif', 'Suivi chantier', 'Reporting'],
      threat: 'Medium'
    },
    {
      id: 'costructor',
      name: 'Costructor',
      region: 'Europe',
      marketShare: 8,
      revenue: '20M EUR',
      employees: '100+',
      strengths: ['Solution récente', 'UX moderne', 'Prix attractif'],
      weaknesses: ['Nouveau sur le marché', 'Fonctionnalités en développement'],
      pricing: '12.50€/mois/utilisateur',
      targetMarket: 'Petites et moyennes entreprises',
      keyFeatures: ['Gestion projet', 'Devis', 'Planning'],
      threat: 'Medium'
    },
    {
      id: 'autodesk',
      name: 'Autodesk Construction Cloud',
      region: 'Global',
      marketShare: 20,
      revenue: '1.2B USD',
      employees: '12,000+',
      strengths: ['Leader mondial', 'Écosystème CAO', 'Innovation continue'],
      weaknesses: ['Complexité', 'Coût très élevé', 'Courbe d\'apprentissage'],
      pricing: '100-300€/mois/utilisateur',
      targetMarket: 'Grandes entreprises internationales',
      keyFeatures: ['BIM', 'Collaboration 3D', 'Gestion documentaire'],
      threat: 'High'
    }
  ];

  // const allCompetitors = [...africanCompetitors, ...europeanCompetitors];

  const marketData = {
    africa: {
      size: '74.81B USD d\'ici 2029',
      growth: '5.07% TCAC',
      projects: '570+ projets actifs',
      value: '450B USD de projets'
    },
    europe: {
      size: '2.1T EUR',
      growth: '3.2% TCAC',
      digitalization: '35% des entreprises',
      software: '15B EUR marché logiciels'
    }
  };

  const opportunitiesData = [
    {
      key: '1',
      opportunity: 'Digitalisation Afrique',
      market: 'Africain',
      potential: 'Très élevé',
      description: 'Marché sous-digitalisé avec forte croissance',
      action: 'Développer version adaptée aux besoins locaux'
    },
    {
      key: '2',
      opportunity: 'Mobile Money Integration',
      market: 'Africain',
      potential: 'Élevé',
      description: 'Paiements mobiles très répandus en Afrique',
      action: 'Intégrer Flutterwave et solutions locales'
    },
    {
      key: '3',
      opportunity: 'PME Européennes',
      market: 'Européen',
      potential: 'Élevé',
      description: 'Solutions actuelles trop complexes/chères',
      action: 'Positionnement prix/simplicité'
    },
    {
      key: '4',
      opportunity: 'IA et Automatisation',
      market: 'Global',
      potential: 'Très élevé',
      description: 'Peu de solutions avec IA avancée',
      action: 'Développer fonctionnalités IA prédictives'
    }
  ];

  const showCompetitorDetails = (competitor: Competitor) => {
    setSelectedCompetitor(competitor);
    setModalVisible(true);
  };

  const getThreatColor = (threat: string) => {
    switch (threat) {
      case 'High': return 'red';
      case 'Medium': return 'orange';
      case 'Low': return 'green';
      default: return 'blue';
    }
  };

  const CompetitorCard = ({ competitor }: { competitor: Competitor }) => (
    <Card
      hoverable
      className="mb-4"
      actions={[
        <Button 
          key="view" 
          type="link" 
          icon={<EyeOutlined />}
          onClick={() => showCompetitorDetails(competitor)}
        >
          Détails
        </Button>
      ]}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold mb-1">{competitor.name}</h3>
          <Tag color={competitor.region === 'Africa' ? 'orange' : competitor.region === 'Europe' ? 'blue' : 'purple'}>
            {competitor.region}
          </Tag>
          <Tag color={getThreatColor(competitor.threat)}>
            Menace: {competitor.threat}
          </Tag>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Part de marché</div>
          <div className="text-xl font-bold">{competitor.marketShare}%</div>
        </div>
      </div>

      <Row gutter={16} className="mb-3">
        <Col span={12}>
          <Statistic 
            title="Revenus" 
            value={competitor.revenue} 
            prefix={<DollarOutlined />}
            valueStyle={{ fontSize: '14px' }}
          />
        </Col>
        <Col span={12}>
          <Statistic 
            title="Employés" 
            value={competitor.employees} 
            prefix={<UserOutlined />}
            valueStyle={{ fontSize: '14px' }}
          />
        </Col>
      </Row>

      <div className="mb-2">
        <div className="text-sm font-medium mb-1">Forces principales:</div>
        <div className="flex flex-wrap gap-1">
          {competitor.strengths.slice(0, 2).map((strength, index) => (
            <Tag key={index} color="green" className="text-xs">
              {strength}
            </Tag>
          ))}
          {competitor.strengths.length > 2 && (
            <Tag className="text-xs">+{competitor.strengths.length - 2}</Tag>
          )}
        </div>
      </div>

      <Progress 
        percent={competitor.marketShare * 4} 
        size="small" 
        status="active"
        format={() => `${competitor.marketShare}% du marché`}
      />
    </Card>
  );

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center">
          <TrophyOutlined className="mr-3 text-orange-500" />
          Analyse Concurrentielle BTP
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Analyse des marchés africain et européen pour les logiciels de gestion BTP
        </p>
      </div>

      {/* Market Overview */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} md={12}>
          <Card className="h-full">
            <div className="flex items-center mb-4">
              <GlobalOutlined className="text-orange-500 text-xl mr-2" />
              <h3 className="text-lg font-semibold">Marché Africain</h3>
            </div>
            <Row gutter={16}>
              <Col span={12}>
                <Statistic 
                  title="Taille du marché" 
                  value={marketData.africa.size}
                  valueStyle={{ fontSize: isMobile ? '16px' : '20px' }}
                />
              </Col>
              <Col span={12}>
                <Statistic 
                  title="Croissance" 
                  value={marketData.africa.growth}
                  prefix={<RiseOutlined />}
                  valueStyle={{ fontSize: isMobile ? '16px' : '20px', color: '#52c41a' }}
                />
              </Col>
            </Row>
            <div className="mt-4 text-sm text-gray-600">
              <div>• {marketData.africa.projects}</div>
              <div>• {marketData.africa.value}</div>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card className="h-full">
            <div className="flex items-center mb-4">
              <BarChartOutlined className="text-blue-500 text-xl mr-2" />
              <h3 className="text-lg font-semibold">Marché Européen</h3>
            </div>
            <Row gutter={16}>
              <Col span={12}>
                <Statistic 
                  title="Taille du marché" 
                  value={marketData.europe.size}
                  valueStyle={{ fontSize: isMobile ? '16px' : '20px' }}
                />
              </Col>
              <Col span={12}>
                <Statistic 
                  title="Croissance" 
                  value={marketData.europe.growth}
                  prefix={<RiseOutlined />}
                  valueStyle={{ fontSize: isMobile ? '16px' : '20px', color: '#1890ff' }}
                />
              </Col>
            </Row>
            <div className="mt-4 text-sm text-gray-600">
              <div>• {marketData.europe.digitalization}</div>
              <div>• {marketData.europe.software}</div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Competitors Analysis */}
      <Card className="mb-6">
        <Tabs defaultActiveKey="africa" size={isMobile ? 'small' : 'large'}>
          <TabPane tab="Concurrents Africains" key="africa">
            <Row gutter={[16, 16]}>
              {africanCompetitors.map(competitor => (
                <Col xs={24} md={12} lg={8} key={competitor.id}>
                  <CompetitorCard competitor={competitor} />
                </Col>
              ))}
            </Row>
          </TabPane>

          <TabPane tab="Concurrents Européens" key="europe">
            <Row gutter={[16, 16]}>
              {europeanCompetitors.map(competitor => (
                <Col xs={24} md={12} lg={8} key={competitor.id}>
                  <CompetitorCard competitor={competitor} />
                </Col>
              ))}
            </Row>
          </TabPane>

          <TabPane tab="Opportunités" key="opportunities">
            <Table
              dataSource={opportunitiesData}
              scroll={{ x: 800 }}
              pagination={false}
              size="small"
              columns={[
                {
                  title: 'Opportunité',
                  dataIndex: 'opportunity',
                  key: 'opportunity',
                  render: (text) => <span className="font-medium">{text}</span>
                },
                {
                  title: 'Marché',
                  dataIndex: 'market',
                  key: 'market',
                  render: (text) => (
                    <Tag color={text === 'Africain' ? 'orange' : text === 'Européen' ? 'blue' : 'purple'}>
                      {text}
                    </Tag>
                  )
                },
                {
                  title: 'Potentiel',
                  dataIndex: 'potential',
                  key: 'potential',
                  render: (text) => (
                    <Tag color={text === 'Très élevé' ? 'red' : text === 'Élevé' ? 'orange' : 'green'}>
                      <StarOutlined /> {text}
                    </Tag>
                  )
                },
                {
                  title: 'Description',
                  dataIndex: 'description',
                  key: 'description',
                  responsive: ['md']
                },
                {
                  title: 'Action recommandée',
                  dataIndex: 'action',
                  key: 'action',
                  responsive: ['lg']
                }
              ]}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* Competitive Advantages */}
      <Card title="Avantages Concurrentiels d'IntuitionConcept">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <GlobalOutlined className="text-3xl text-green-500 mb-2" />
              <h4 className="font-semibold mb-2">Approche Bi-Continentale</h4>
              <p className="text-sm text-gray-600">
                Seule solution conçue spécifiquement pour les marchés africain et européen
              </p>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <DollarOutlined className="text-3xl text-blue-500 mb-2" />
              <h4 className="font-semibold mb-2">Mobile Money Intégré</h4>
              <p className="text-sm text-gray-600">
                Paiements mobiles natifs avec Flutterwave et solutions locales
              </p>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <RiseOutlined className="text-3xl text-purple-500 mb-2" />
              <h4 className="font-semibold mb-2">IA & Automatisation</h4>
              <p className="text-sm text-gray-600">
                Fonctionnalités d'IA prédictive pour optimiser les projets BTP
              </p>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Competitor Details Modal */}
      <Modal
        title={selectedCompetitor?.name}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={isMobile ? '95%' : 800}
      >
        {selectedCompetitor && (
          <div>
            <Row gutter={[16, 16]} className="mb-4">
              <Col span={12}>
                <Statistic title="Revenus" value={selectedCompetitor.revenue} />
              </Col>
              <Col span={12}>
                <Statistic title="Employés" value={selectedCompetitor.employees} />
              </Col>
            </Row>

            <div className="mb-4">
              <h4 className="font-semibold mb-2">Forces:</h4>
              <Space wrap>
                {selectedCompetitor.strengths.map((strength, index) => (
                  <Tag key={index} color="green">{strength}</Tag>
                ))}
              </Space>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold mb-2">Faiblesses:</h4>
              <Space wrap>
                {selectedCompetitor.weaknesses.map((weakness, index) => (
                  <Tag key={index} color="red">{weakness}</Tag>
                ))}
              </Space>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold mb-2">Fonctionnalités clés:</h4>
              <Space wrap>
                {selectedCompetitor.keyFeatures.map((feature, index) => (
                  <Tag key={index} color="blue">{feature}</Tag>
                ))}
              </Space>
            </div>

            <Row gutter={16}>
              <Col span={12}>
                <div>
                  <strong>Prix:</strong> {selectedCompetitor.pricing}
                </div>
              </Col>
              <Col span={12}>
                <div>
                  <strong>Marché cible:</strong> {selectedCompetitor.targetMarket}
                </div>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CompetitiveAnalysis;
